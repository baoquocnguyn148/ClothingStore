import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { createAdminClient } from '@/lib/supabase/admin';

const UpdatePaymentSchema = z.object({
  status: z.enum(['pending', 'completed', 'failed', 'cancelled'])
});

// PATCH /api/admin/orders/[id]/payments/[paymentId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id: orderId, paymentId } = await params;

  const { data, errorResponse: validErr } = await validateBody(request, UpdatePaymentSchema);
  if (validErr) return validErr;

  try {
    const db = createAdminClient();

    // Verify payment belongs to order
    const { data: payment } = await db
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('order_id', orderId)
      .single();

    if (!payment) {
      return jsonError('Payment not found', 404);
    }

    // Update payment status
    const { error } = await db
      .from('payments')
      .update({ status: data.status })
      .eq('id', paymentId);

    if (error) throw error;

    // If marking COD as completed, optionally update order status to delivered
    if (payment.provider === 'cod' && data.status === 'completed') {
      const { data: order } = await db
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (order && order.status === 'shipping') {
        await db
          .from('orders')
          .update({ status: 'delivered' })
          .eq('id', orderId);

        // Log status change
        await db.from('order_status_logs').insert({
          order_id: orderId,
          from_status: 'shipping',
          to_status: 'delivered',
          note: 'COD payment collected',
        });
      }
    }

    return jsonOk({ success: true });
  } catch (e) {
    console.error(e);
    return jsonError('Failed to update payment', 500);
  }
}
