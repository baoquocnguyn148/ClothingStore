import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { createAdminClient } from '@/lib/supabase/admin';

const UpdateCustomerSchema = z
  .object({
    fullName: z.string().min(1).optional(),
    phone: z.string().nullable().optional(),
    membershipTier: z.string().min(1).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, 'At least one field required');

// PATCH /api/admin/customers/[userId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const admin = await requireAdmin();
  if (admin.errorResponse) return admin.errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, UpdateCustomerSchema);
  if (validErr) return validErr;

  const { userId } = await params;

  try {
    const db = createAdminClient();

    const update: Record<string, unknown> = {};
    if (data.fullName !== undefined) update.full_name = data.fullName;
    if (data.phone !== undefined) update.phone = data.phone;
    if (data.membershipTier !== undefined) update.membership_tier = data.membershipTier;

    const { error } = await db
      .from('profiles')
      .update(update)
      .eq('user_id', userId)
      .select('user_id')
      .single();

    if (error) throw error;

    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

