import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAuth } from '@/lib/api/auth-helper';
import { OrderService } from '@/lib/server/order/order.service';

/** ZaloPay sandbox/demo only — never enable in production without explicit flag. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const allowDemo =
    process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_PAYMENTS === '1';
  if (!allowDemo) {
    return jsonError('Demo payment completion is disabled', 403);
  }

  try {
    const user = await requireAuth();
    const { id } = await params;

    const order = await new OrderService().getOrderById(id, user.id);
    if (!order) {
      return jsonError('Order not found or access denied', 404);
    }
    if (order.status === 'paid') {
      return jsonOk({ ok: true, alreadyPaid: true });
    }
    if (order.status !== 'pending_payment') {
      return jsonError('Order is not pending payment');
    }

    const result = await new OrderService().markOrderPaid(id, 'ZaloPay demo payment');

    return jsonOk({ ok: true, alreadyPaid: result.alreadyPaid });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    return jsonError(msg, msg === 'Unauthorized' ? 401 : 500);
  }
}
