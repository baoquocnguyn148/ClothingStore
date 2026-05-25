import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { createAdminClient } from '@/lib/supabase/admin';

const UpdateSchema = z
  .object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes').optional(),
    title: z.string().min(1).optional(),
    htmlContent: z.string().optional(),
    published: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, 'At least one field required');

// GET /api/admin/cms-pages/[id]
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  try {
    const db = createAdminClient();
    const { data, error } = await db.from('cms_pages').select('*').eq('id', id).single();
    if (error || !data) return jsonError('Page not found', 404);
    return jsonOk({ page: data });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

// PATCH /api/admin/cms-pages/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, UpdateSchema);
  if (validErr) return validErr;

  const { id } = await params;
  try {
    const db = createAdminClient();
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.slug !== undefined) update.slug = data.slug;
    if (data.title !== undefined) update.title = data.title;
    if (data.htmlContent !== undefined) update.html_content = data.htmlContent;
    if (data.published !== undefined) update.published = data.published;

    const { error } = await db.from('cms_pages').update(update).eq('id', id);
    if (error) throw error;
    return jsonOk({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    const status = msg.includes('duplicate') || msg.includes('unique') ? 409 : 500;
    return jsonError(msg, status);
  }
}

// DELETE /api/admin/cms-pages/[id]
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  try {
    const db = createAdminClient();
    const { error } = await db.from('cms_pages').delete().eq('id', id);
    if (error) throw error;
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

