import { createAdminClient } from '@/lib/supabase/admin';
import { buildVNPayUrl } from './vnpay.adapter';
import { createMoMoPayment } from './momo.adapter';
import { OrderService } from '@/lib/server/order/order.service';
import type { PaymentProviderType } from './types';

export type { PaymentProviderType } from './types';

export class PaymentService {
  private db = createAdminClient();

  async createPayment(orderId: string, provider: PaymentProviderType) {
    const { data: order, error } = await this.db
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) throw new Error('Order not found');
    if (order.status !== 'pending_payment') {
      throw new Error('Order is not pending payment');
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    if (provider === 'cod') {
      const { payment } = await new OrderService().confirmCodOrder(orderId);
      const paymentUrl = `${baseUrl}/checkout/success?order=${order.id}&provider=cod`;
      return { payment, paymentUrl, cod: true as const };
    }

    const { data: existingPending } = await this.db
      .from('payments')
      .select('id, payment_url, status')
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .eq('provider', provider)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingPending?.payment_url) {
      return { payment: existingPending, paymentUrl: existingPending.payment_url };
    }

    let paymentUrl: string | null = null;
    const transactionRef = order.order_number;

    if (provider === 'vnpay') {
      paymentUrl = buildVNPayUrl({
        amount: order.total,
        orderInfo: `Thanh toan don hang ${order.order_number}`,
        orderId: order.id,
      });
    } else if (provider === 'momo') {
      const result = await createMoMoPayment({
        orderId: order.id,
        amount: order.total,
        orderInfo: `B&D order ${order.order_number}`,
      });
      paymentUrl = result?.payUrl ?? null;
    } else if (provider === 'zalopay') {
      paymentUrl = `${baseUrl}/checkout/success?order=${order.id}&provider=zalopay&demo=1`;
    }

    if (!paymentUrl) {
      throw new Error(`Payment provider ${provider} is not configured`);
    }

    const { data: payment, error: payErr } = await this.db
      .from('payments')
      .insert({
        order_id: orderId,
        provider,
        status: 'pending',
        amount: order.total,
        transaction_ref: transactionRef,
        payment_url: paymentUrl,
      })
      .select('*')
      .single();

    if (payErr) throw payErr;
    return { payment, paymentUrl };
  }

  async processWebhook(
    provider: PaymentProviderType,
    gatewayEventId: string,
    payload: Record<string, unknown>,
    success: boolean
  ) {
    if (provider === 'cod') {
      throw new Error('COD does not use webhooks');
    }

    const { data: existing } = await this.db
      .from('payment_events')
      .select('id')
      .eq('gateway_event_id', gatewayEventId)
      .maybeSingle();

    if (existing) return { duplicate: true };

    const orderId = (payload.orderId ?? payload.vnp_TxnRef) as string;
    const { data: payment } = await this.db
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!payment) throw new Error('Payment not found');

    const { data: event } = await this.db
      .from('payment_events')
      .insert({
        payment_id: payment.id,
        gateway_event_id: gatewayEventId,
        payload,
        processed: false,
      })
      .select('id')
      .single();

    if (success) {
      await this.db
        .from('payments')
        .update({ status: 'completed', transaction_ref: gatewayEventId })
        .eq('id', payment.id);

      await new OrderService().markOrderPaid(
        payment.order_id,
        `Payment completed via ${provider}`
      );
    } else {
      await this.db.from('payments').update({ status: 'failed' }).eq('id', payment.id);
    }

    if (event) {
      await this.db
        .from('payment_events')
        .update({ processed: true })
        .eq('id', event.id);
    }

    return { success };
  }
}
