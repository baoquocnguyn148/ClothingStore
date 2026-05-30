import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/server/admin/audit.service';

const CreateTicketSchema = z.object({
  customerUserId: z.string().uuid(),
  orderId: z.string().uuid().nullable().optional(),
  subject: z.string().trim().min(1).max(240),
  body: z.string().trim().max(5000).nullable().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { user, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, CreateTicketSchema);
  if (validErr) return validErr;

  try {
    const db = createAdminClient();
    const { data: ticket, error } = await db
      .from('crm_tickets')
      .insert({
        customer_user_id: data.customerUserId,
        order_id: data.orderId || null,
        subject: data.subject,
        body: data.body || null,
        priority: data.priority,
        assigned_to: user.id,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (error) throw error;
    await logAdminAction({
      actorId: user.id,
      action: 'crm_ticket.create',
      entity: 'crm_tickets',
      entityId: ticket.id,
      metadata: { customerUserId: data.customerUserId, orderId: data.orderId ?? null, priority: data.priority },
    });
    return jsonOk({ ticket }, 201);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed to create ticket', 500);
  }
}
