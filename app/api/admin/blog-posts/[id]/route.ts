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
    excerpt: z.string().optional(),
    imageUrl: z.string().min(1).optional(),
    publishedAt: z.string().nullable().optional(),
    published: z.boolean().optional(),
    linkedProducts: z.array(z.string().uuid()).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, 'At least one field required');

// GET /api/admin/blog-posts/[id]
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  try {
    const db = createAdminClient();
    const { data, error } = await db
      .from('blog_posts')
      .select(
        `
        *,
        blog_post_products ( product_id, products ( id, handle, title ) )
      `
      )
      .eq('id', id)
      .single();
    if (error || !data) return jsonError('Post not found', 404);
    return jsonOk({ post: data });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

// PATCH /api/admin/blog-posts/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, UpdateSchema);
  if (validErr) return validErr;

  const { id } = await params;
  try {
    const db = createAdminClient();
    const update: Record<string, unknown> = {};
    if (data.slug !== undefined) update.slug = data.slug;
    if (data.title !== undefined) update.title = data.title;
    if (data.excerpt !== undefined) update.excerpt = data.excerpt;
    if (data.imageUrl !== undefined) update.image_url = data.imageUrl;
    if (data.publishedAt !== undefined) update.published_at = data.publishedAt;
    if (data.published !== undefined) update.published = data.published;

    if (Object.keys(update).length) {
      const { error } = await db.from('blog_posts').update(update).eq('id', id);
      if (error) throw error;
    }

    if (data.linkedProducts !== undefined) {
      const { error: delErr } = await db.from('blog_post_products').delete().eq('blog_post_id', id);
      if (delErr) throw delErr;

      const uniqueIds = Array.from(new Set(data.linkedProducts));
      if (uniqueIds.length) {
        const rows = uniqueIds.map((productId) => ({ blog_post_id: id, product_id: productId }));
        const { error: insErr } = await db.from('blog_post_products').insert(rows);
        if (insErr) throw insErr;
      }
    }

    return jsonOk({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    const status = msg.includes('duplicate') || msg.includes('unique') ? 409 : 500;
    return jsonError(msg, status);
  }
}

// DELETE /api/admin/blog-posts/[id]
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  try {
    const db = createAdminClient();
    const { error } = await db.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

