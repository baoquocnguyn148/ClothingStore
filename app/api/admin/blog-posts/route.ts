import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { createAdminClient } from '@/lib/supabase/admin';

const CreateSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  title: z.string().min(1),
  excerpt: z.string().default(''),
  imageUrl: z.string().min(1),
  publishedAt: z.string().nullable().optional(), // YYYY-MM-DD
  published: z.boolean().default(true),
  linkedProducts: z.array(z.string().uuid()).default([]),
});

// GET /api/admin/blog-posts
export async function GET(_request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const db = createAdminClient();
    const { data, error } = await db
      .from('blog_posts')
      .select('id, slug, title, excerpt, image_url, published_at, published, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return jsonOk({ posts: data ?? [] });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed to fetch posts', 500);
  }
}

// POST /api/admin/blog-posts
export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, CreateSchema);
  if (validErr) return validErr;

  try {
    const db = createAdminClient();
    const { data: created, error } = await db
      .from('blog_posts')
      .insert({
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt ?? '',
        image_url: data.imageUrl,
        published_at: data.publishedAt ?? null,
        published: data.published,
      })
      .select('id')
      .single();
    if (error) throw error;

    if (data.linkedProducts?.length) {
      const rows = Array.from(new Set(data.linkedProducts)).map((productId) => ({
        blog_post_id: created.id,
        product_id: productId,
      }));
      const { error: linkErr } = await db.from('blog_post_products').insert(rows);
      if (linkErr) throw linkErr;
    }

    return jsonOk({ id: created.id }, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    const status = msg.includes('duplicate') || msg.includes('unique') ? 409 : 500;
    return jsonError(msg, status);
  }
}

