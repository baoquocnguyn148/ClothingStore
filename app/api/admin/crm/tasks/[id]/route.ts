import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/server/admin/audit.service';

const UpdateTaskSchema = z
  .object({
    status: z.enum(['open', 'done', 'cancelled']).optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    dueAt: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'At least one field required');

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { user, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, UpdateTaskSchema);
  if (validErr) return validErr;

  const { id } = await params;

  try {
    const update: Record<string, unknown> = {};
    if (data.status !== undefined) update.status = data.status;
    if (data.priority !== undefined) update.priority = data.priority;
    if (data.dueAt !== undefined) update.due_at = data.dueAt || null;

    const db = createAdminClient();
    const { data: task, error } = await db
      .from('crm_tasks')
      .update(update)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    await logAdminAction({
      actorId: user.id,
      action: 'crm_task.update',
      entity: 'crm_tasks',
      entityId: id,
      metadata: update,
    });
    return jsonOk({ task });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed to update task', 500);
  }
}
