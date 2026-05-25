import { createAdminClient } from '@/lib/supabase/admin';
import { CartService } from '@/lib/server/cart/cart.service';
import { ShippingService } from './shipping.service';
import { PromotionService } from '../promotion/promotion.service';

export interface CreateOrderInput {
  userId: string;
  cartId: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    province?: string;
    email?: string;
  };
  note?: string;
  promotionCode?: string;
}

export class OrderService {
  private db = createAdminClient();
  private cartService = new CartService();
  private shippingService = new ShippingService();
  private promotionService = new PromotionService();

  async createFromCart(input: CreateOrderInput) {
    const items = await this.cartService.getCartItems(input.cartId);
    if (items.length === 0) throw new Error('Cart is empty');

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const itemCount = items.reduce((s, i) => s + i.quantity, 0);
    
    // 1. Calculate shipping fee
    const { fee: shippingFee } = await this.shippingService.calculateFee(input.shippingAddress.province || input.shippingAddress.city, subtotal);

    // 2. Validate and calculate promotion
    let discountAmount = 0;
    let isFreeShipping = false;
    let appliedPromoId = null;

    if (input.promotionCode) {
      const promoResult = await this.promotionService.validateAndCalculate({
        code: input.promotionCode,
        userId: input.userId,
        cartTotal: subtotal,
        itemCount,
      });

      if (!promoResult.ok) {
        throw new Error(`Promotion error: ${promoResult.error}`);
      }

      discountAmount = promoResult.discount ?? 0;
      isFreeShipping = promoResult.isFreeShipping ?? false;
      appliedPromoId = promoResult.promotionId ?? null;
    }

    const finalShippingFee = isFreeShipping ? 0 : shippingFee;
    const total = Math.max(0, subtotal - discountAmount) + finalShippingFee;

    const orderNumber = `BD${Date.now().toString().slice(-10)}`;

    const { data: order, error } = await this.db
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: input.userId,
        status: 'pending_payment',
        subtotal,
        shipping_fee: finalShippingFee,
        discount_amount: discountAmount,
        promotion_id: appliedPromoId,
        promotion_code: input.promotionCode ?? null,
        total,
        shipping_address: input.shippingAddress,
        note: input.note ?? null,
      })
      .select('*')
      .single();

    if (error || !order) throw error ?? new Error('Failed to create order');

    for (const item of items) {
      await this.db.from('order_items').insert({
        order_id: order.id,
        variant_id: item.variantId,
        product_title: item.title,
        variant_size: item.size,
        variant_color: item.color,
        unit_price: item.price,
        quantity: item.quantity,
        image_url: item.image,
      });
    }

    await this.db.from('order_status_logs').insert({
      order_id: order.id,
      from_status: null,
      to_status: 'pending_payment',
      note: 'Order created',
    });

    // Keep cart until payment succeeds (see markOrderPaid).

    for (const item of items) {
      const { data: variant } = await this.db
        .from('product_variants')
        .select('stock_qty, is_active')
        .eq('id', item.variantId)
        .single();
      if (!variant?.is_active || (variant.stock_qty ?? 0) < item.quantity) {
        throw new Error(`Sản phẩm "${item.title}" không đủ tồn kho`);
      }
    }

    return order;
  }

  /**
   * Single path when payment succeeds: status → paid, reserve stock, clear cart, log promo.
   */
  async markOrderPaid(orderId: string, note?: string) {
    const { data: order, error } = await this.db
      .from('orders')
      .select('id, user_id, status, promotion_id, discount_amount')
      .eq('id', orderId)
      .single();

    if (error || !order) throw new Error('Order not found');
    if (order.status === 'paid') return { alreadyPaid: true as const };

    if (order.status !== 'pending_payment') {
      throw new Error(`Cannot mark paid from status ${order.status}`);
    }

    await this.updateOrderStatus(orderId, 'paid', note ?? 'Payment completed');

    await this.finalizePlacedOrder(
      orderId,
      order.user_id,
      order.promotion_id,
      order.discount_amount ?? 0
    );

    return { alreadyPaid: false as const };
  }

  /** COD: xác nhận đơn, trừ kho, thu tiền khi giao hàng. */
  async confirmCodOrder(orderId: string) {
    const { data: order, error } = await this.db
      .from('orders')
      .select('id, user_id, status, order_number, total, promotion_id, discount_amount')
      .eq('id', orderId)
      .single();

    if (error || !order) throw new Error('Order not found');

    if (order.status === 'confirmed' || order.status === 'paid') {
      const { data: existingPayment } = await this.db
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .eq('provider', 'cod')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return { payment: existingPayment, alreadyConfirmed: true as const };
    }

    if (order.status !== 'pending_payment') {
      throw new Error(`Cannot confirm COD from status ${order.status}`);
    }

    const { data: payment, error: payErr } = await this.db
      .from('payments')
      .insert({
        order_id: orderId,
        provider: 'cod',
        status: 'pending',
        amount: order.total,
        transaction_ref: order.order_number,
        payment_url: null,
      })
      .select('*')
      .single();

    if (payErr || !payment) throw payErr ?? new Error('Failed to create COD payment');

    await this.updateOrderStatus(
      orderId,
      'confirmed',
      'COD — thanh toán khi nhận hàng'
    );

    await this.finalizePlacedOrder(orderId, order.user_id, order.promotion_id, order.discount_amount);

    return { payment, alreadyConfirmed: false as const };
  }

  private async finalizePlacedOrder(
    orderId: string,
    userId: string,
    promotionId: string | null,
    discountAmount: number
  ) {
    if (promotionId && discountAmount > 0) {
      try {
        await this.promotionService.logUsage(promotionId, userId, orderId, discountAmount);
      } catch {
        // already logged
      }
    }

    const { data: orderItems } = await this.db
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId);

    const purchasedItems = (orderItems ?? [])
      .filter((item) => item.variant_id)
      .map((item) => ({ variantId: item.variant_id as string, quantity: item.quantity }));

    if (purchasedItems.length > 0) {
      await this.cartService.clearPurchasedItems(userId, purchasedItems);
    }
  }

  async quoteCheckout(input: {
    cartId: string;
    userId: string;
    city: string;
    promotionCode?: string;
  }) {
    const items = await this.cartService.getCartItems(input.cartId);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const itemCount = items.reduce((s, i) => s + i.quantity, 0);

    const { fee: shippingFee, zoneName } = await this.shippingService.calculateFee(
      input.city,
      subtotal
    );

    let discountAmount = 0;
    let isFreeShipping = false;

    if (input.promotionCode) {
      const promoResult = await this.promotionService.validateAndCalculate({
        code: input.promotionCode,
        userId: input.userId,
        cartTotal: subtotal,
        itemCount,
      });
      if (!promoResult.ok) {
        return { ok: false as const, error: promoResult.error ?? 'Invalid promotion' };
      }
      discountAmount = promoResult.discount ?? 0;
      isFreeShipping = promoResult.isFreeShipping ?? false;
    }

    const finalShippingFee = isFreeShipping ? 0 : shippingFee;
    const total = Math.max(0, subtotal - discountAmount) + finalShippingFee;

    return {
      ok: true as const,
      subtotal,
      shippingFee: finalShippingFee,
      discountAmount,
      total,
      zoneName,
      itemCount,
    };
  }

  async listOrdersForAdmin(options: {
    status?: string;
    search?: string;
    offset: number;
    limit: number;
  }) {
    let q = this.db
      .from('orders')
      .select(
        'id, order_number, status, total, created_at, shipping_address, user_id',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(options.offset, options.offset + options.limit - 1);

    if (options.status) q = q.eq('status', options.status);
    if (options.search) {
      const escaped = options.search.replace(/[\\%_]/g, '\\$&');
      const like = `%${escaped}%`;

      const { data: matchedProfiles } = await this.db
        .from('profiles')
        .select('user_id')
        .or(`full_name.ilike.${like},phone.ilike.${like}`);

      const userIds = (matchedProfiles ?? [])
        .map((p: any) => p.user_id)
        .filter(Boolean);

      const orFilters = [`order_number.ilike.${like}`];
      if (userIds.length > 0) {
        const quotedIds = userIds.map((id: string) => `\"${id}\"`).join(',');
        orFilters.push(`user_id.in.(${quotedIds})`);
      }

      q = q.or(orFilters.join(','));
    }

    const { data, error, count } = await q;
    if (error) throw error;

    const orders = data ?? [];
    const userIds = [...new Set(orders.map((o) => o.user_id))];
    const profileMap = new Map<string, { full_name: string; phone: string | null }>();

    if (userIds.length > 0) {
      const { data: profiles } = await this.db
        .from('profiles')
        .select('user_id, full_name, phone')
        .in('user_id', userIds);
      for (const p of profiles ?? []) {
        profileMap.set(p.user_id, { full_name: p.full_name, phone: p.phone });
      }
    }

    return {
      orders: orders.map((o) => {
        const shipping = (o.shipping_address ?? {}) as {
          name?: string;
          phone?: string;
        };
        const profile = profileMap.get(o.user_id);
        return {
          ...o,
          customer_name: shipping.name || profile?.full_name || 'Khách lẻ',
          customer_phone: shipping.phone || profile?.phone || '',
        };
      }),
      total: count ?? 0,
    };
  }

  async getOrdersByUser(userId: string) {
    const { data, error } = await this.db
      .from('orders')
      .select(`*, order_items (*)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async getOrderById(orderId: string, userId?: string) {
    let query = this.db.from('orders').select(`*, order_items (*), payments (*)`).eq('id', orderId);
    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query.single();
    if (error || !data) return null;
    return data;
  }

  async updateOrderStatus(
    orderId: string,
    toStatus: string,
    note?: string
  ) {
    const { data: order } = await this.db
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (!order) throw new Error('Order not found');

    const allowedTransitions: Record<string, string[]> = {
      draft: ['pending_payment'],
      pending_payment: ['paid', 'cancelled', 'confirmed'],
      paid: ['confirmed', 'cancelled', 'refunded'],
      confirmed: ['shipping', 'cancelled', 'refunded'],
      shipping: ['delivered', 'cancelled'],
      delivered: ['refunded'],
      cancelled: [],
      refunded: [],
    };

    if (order.status !== toStatus) {
      const allowed = allowedTransitions[order.status] ?? [];
      if (!allowed.includes(toStatus)) {
        throw new Error(`Invalid status transition from ${order.status} to ${toStatus}`);
      }
    }

    await this.db
      .from('orders')
      .update({ status: toStatus })
      .eq('id', orderId);

    await this.db.from('order_status_logs').insert({
      order_id: orderId,
      from_status: order.status,
      to_status: toStatus,
      note,
    });

    // Reserve stock when order is paid or confirmed
    if (
      (toStatus === 'paid' || toStatus === 'confirmed') &&
      order.status === 'pending_payment'
    ) {
      await this.db.rpc('reserve_order_stock', { p_order_id: orderId });
    }

    // Release stock when order is cancelled (only if it was previously reserved)
    if (
      toStatus === 'cancelled' &&
      ['paid', 'confirmed', 'shipping'].includes(order.status)
    ) {
      await this.db.rpc('release_order_stock', { p_order_id: orderId });
    }
  }
}
