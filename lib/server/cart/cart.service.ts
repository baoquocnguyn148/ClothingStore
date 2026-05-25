import { createAdminClient } from '@/lib/supabase/admin';
import { PRODUCT_SELECT, mapDbProduct } from '@/lib/server/catalog/mapper';

export interface CartItemDto {
  id: string;
  cartItemId: string;
  variantId: string;
  productHandle: string;
  title: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

export class CartService {
  private db = createAdminClient();

  async getOrCreateCart(userId?: string, guestSessionId?: string) {
    if (userId) {
      const { data: existing } = await this.db
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) return existing.id;

      const { data, error } = await this.db
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single();
      if (error) throw error;
      return data.id;
    }

    if (guestSessionId) {
      const { data: existing } = await this.db
        .from('carts')
        .select('id')
        .eq('guest_session_id', guestSessionId)
        .maybeSingle();

      if (existing) return existing.id;

      const { data, error } = await this.db
        .from('carts')
        .insert({ guest_session_id: guestSessionId })
        .select('id')
        .single();
      if (error) throw error;
      return data.id;
    }

    throw new Error('Cart requires userId or guestSessionId');
  }

  async getCartItems(cartId: string): Promise<CartItemDto[]> {
    const { data, error } = await this.db
      .from('cart_items')
      .select(`
        id, variant_id, quantity, unit_price,
        product_variants (
          id, size, color_name, price,
          products ( handle, title, product_images ( url, sort_order ) )
        )
      `)
      .eq('cart_id', cartId);

    if (error) throw error;

    return (data ?? []).map((item) => {
      const rawVariant = item.product_variants;
      const variantRow = Array.isArray(rawVariant) ? rawVariant[0] : rawVariant;
      const v = variantRow as unknown as {
        size: string;
        color_name: string;
        products:
          | {
              handle: string;
              title: string;
              product_images: { url: string; sort_order: number }[];
            }
          | {
              handle: string;
              title: string;
              product_images: { url: string; sort_order: number }[];
            }[];
      } | null;
      const rawProduct = v?.products;
      const product = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct;
      if (!product) {
        throw new Error(`Cart item ${item.id} is missing variant data`);
      }
      const images = product.product_images ?? [];
      const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
      return {
        cartItemId: item.id,
        id: item.id,
        variantId: item.variant_id,
        productHandle: product.handle,
        title: product.title,
        size: v!.size,
        color: v!.color_name,
        price: item.unit_price,
        quantity: item.quantity,
        image: sorted[0]?.url ?? '',
      };
    });
  }

  async addItem(
    cartId: string,
    variantId: string,
    quantity = 1
  ) {
    const { data: variant, error: vErr } = await this.db
      .from('product_variants')
      .select('id, price, stock_qty, is_active')
      .eq('id', variantId)
      .single();

    if (vErr || !variant || !variant.is_active || variant.stock_qty < quantity) {
      throw new Error('Variant unavailable');
    }

    const { data: existing } = await this.db
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('variant_id', variantId)
      .maybeSingle();

    if (existing) {
      await this.db
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      await this.db.from('cart_items').insert({
        cart_id: cartId,
        variant_id: variantId,
        quantity,
        unit_price: variant.price,
      });
    }
  }

  async updateQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      await this.db.from('cart_items').delete().eq('id', cartItemId);
      return;
    }
    await this.db.from('cart_items').update({ quantity }).eq('id', cartItemId);
  }

  async removeItem(cartItemId: string) {
    await this.db.from('cart_items').delete().eq('id', cartItemId);
  }

  async clearCart(cartId: string) {
    await this.db.from('cart_items').delete().eq('cart_id', cartId);
  }

  async getCartIdByUserId(userId: string): Promise<string | null> {
    const { data, error } = await this.db
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.id ?? null;
  }

  async clearPurchasedItems(userId: string, purchasedItems: Array<{ variantId: string; quantity: number }>) {
    const cartId = await this.getCartIdByUserId(userId);
    if (!cartId) return;

    const cartItems = await this.getCartItems(cartId);
    const itemsByVariant = new Map(cartItems.map((item) => [item.variantId, item]));

    for (const purchased of purchasedItems) {
      const cartItem = itemsByVariant.get(purchased.variantId);
      if (!cartItem) continue;

      const remaining = cartItem.quantity - purchased.quantity;
      if (remaining <= 0) {
        await this.db.from('cart_items').delete().eq('id', cartItem.cartItemId);
      } else {
        await this.db
          .from('cart_items')
          .update({ quantity: remaining })
          .eq('id', cartItem.cartItemId);
      }
    }
  }

  async mergeGuestCart(guestSessionId: string, userId: string) {
    const { data: guestCart } = await this.db
      .from('carts')
      .select('id')
      .eq('guest_session_id', guestSessionId)
      .maybeSingle();

    if (!guestCart) return;

    const userCartId = await this.getOrCreateCart(userId);
    const guestItems = await this.getCartItems(guestCart.id);

    for (const item of guestItems) {
      await this.addItem(userCartId, item.variantId, item.quantity);
    }

    await this.db.from('carts').delete().eq('id', guestCart.id);
  }
}
