import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/server/admin/audit.service';

const UpdateTicketSchema = z
  .object({
    status: z.enum(['open', 'pending', 'resolved', 'closed']).optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'At least one field required');

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { user, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, UpdateTicketSchema);
  if (validErr) return validErr;

  const { id } = await params;

  try {
    const db = createAdminClient();
    const { data: ticket, error } = await db
      .from('crm_tickets')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    await logAdminAction({
      actorId: user.id,
      action: 'crm_ticket.update',
      entity: 'crm_tickets',
      entityId: id,
      metadata: data,
    });
    return jsonOk({ ticket });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed to update ticket', 500);
  }
}
