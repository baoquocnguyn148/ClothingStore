import { NextRequest } from 'next/server';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAuth } from '@/lib/api/auth-helper';
import { OrderService } from '@/lib/server/order/order.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  try {
    const user = await requireAuth();
    const { id } = await params;
    const order = await new OrderService().getOrderById(id, user.id);

    if (!order) {
      return jsonError('Order not found', 404);
    }

    return jsonOk({ order });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    return jsonError(msg, msg === 'Unauthorized' ? 401 : 500);
  }
}
