import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/server/admin/audit.service';

const CreateTaskSchema = z.object({
  customerUserId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(5000).nullable().optional(),
  dueAt: z.string().nullable().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { user, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, CreateTaskSchema);
  if (validErr) return validErr;

  try {
    const db = createAdminClient();
    const { data: task, error } = await db
      .from('crm_tasks')
      .insert({
        customer_user_id: data.customerUserId,
        title: data.title,
        body: data.body || null,
        due_at: data.dueAt || null,
        priority: data.priority,
        assigned_to: user.id,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (error) throw error;
    await logAdminAction({
      actorId: user.id,
      action: 'crm_task.create',
      entity: 'crm_tasks',
      entityId: task.id,
      metadata: { customerUserId: data.customerUserId, priority: data.priority },
    });
    return jsonOk({ task }, 201);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed to create task', 500);
  }
}
