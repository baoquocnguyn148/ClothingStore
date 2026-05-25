import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { createAdminClient } from '@/lib/supabase/admin';

const CreateSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  title: z.string().min(1),
  htmlContent: z.string().default(''),
  published: z.boolean().default(true),
});

// GET /api/admin/cms-pages
export async function GET(_request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const db = createAdminClient();
    const { data, error } = await db
      .from('cms_pages')
      .select('id, slug, title, published, updated_at')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return jsonOk({ pages: data ?? [] });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed to fetch pages', 500);
  }
}

// POST /api/admin/cms-pages
export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, CreateSchema);
  if (validErr) return validErr;

  try {
    const db = createAdminClient();
    const { data: created, error } = await db
      .from('cms_pages')
      .insert({
        slug: data.slug,
        title: data.title,
        html_content: data.htmlContent,
        published: data.published,
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error) throw error;
    return jsonOk({ id: created.id }, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    const status = msg.includes('duplicate') || msg.includes('unique') ? 409 : 500;
    return jsonError(msg, status);
  }
}

