import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { OrderService } from '@/lib/server/order/order.service';
import { logAdminAction } from '@/lib/server/admin/audit.service';

const StatusSchema = z.object({
  status: z.enum(['draft', 'pending_payment', 'paid', 'confirmed', 'shipping', 'delivered', 'cancelled', 'refunded']),
  note: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { user, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, StatusSchema);
  if (validErr) return validErr;

  try {
    const { id } = await params;
    await new OrderService().updateOrderStatus(id, data.status, data.note);
    await logAdminAction({
      actorId: user.id,
      action: 'order.status_update',
      entity: 'orders',
      entityId: id,
      metadata: { status: data.status, note: data.note ?? null },
    });
    return jsonOk({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    return jsonError(msg, msg === 'Order not found' ? 404 : 500);
  }
}
