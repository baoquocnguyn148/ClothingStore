import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAuth } from '@/lib/api/auth-helper';
import { OrderService } from '@/lib/server/order/order.service';
import { PaymentService } from '@/lib/server/payment/payment.service';
import { isPaymentProvider } from '@/lib/server/payment/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const provider = body.provider as string;

    if (!isPaymentProvider(provider)) {
      return jsonError('Invalid payment provider');
    }

    const order = await new OrderService().getOrderById(id, user.id);
    if (!order) {
      return jsonError('Order not found or access denied', 404);
    }
    if (order.status !== 'pending_payment') {
      return jsonError('Order is not pending payment');
    }

    const paymentService = new PaymentService();
    const { payment, paymentUrl } = await paymentService.createPayment(id, provider);

    return jsonOk({ payment, paymentUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    return jsonError(msg, msg === 'Unauthorized' ? 401 : 500);
  }
}
