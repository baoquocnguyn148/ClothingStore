import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/server/admin/audit.service';

const CreateNoteSchema = z.object({
  customerUserId: z.string().uuid(),
  body: z.string().trim().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { user, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, CreateNoteSchema);
  if (validErr) return validErr;

  try {
    const db = createAdminClient();
    const { data: note, error } = await db
      .from('crm_notes')
      .insert({
        customer_user_id: data.customerUserId,
        body: data.body,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (error) throw error;
    await logAdminAction({
      actorId: user.id,
      action: 'crm_note.create',
      entity: 'crm_notes',
      entityId: note.id,
      metadata: { customerUserId: data.customerUserId },
    });
    return jsonOk({ note }, 201);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed to create note', 500);
  }
}
