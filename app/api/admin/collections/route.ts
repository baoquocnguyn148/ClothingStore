import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { createAdminClient } from '@/lib/supabase/admin';

const CollectionSchema = z.object({
  handle: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Handle must be lowercase alphanumeric with dashes'),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  published: z.boolean().default(true),
  products: z
    .array(
      z.object({
        productId: z.string().uuid(),
        sortOrder: z.number().int().min(0),
      })
    )
    .optional(),
});

// GET /api/admin/collections
export async function GET(_request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const db = createAdminClient();
    const { data, error } = await db
      .from('collections')
      .select('id, handle, title, description, image_url, sort_order, published, created_at, updated_at')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return jsonOk({ collections: data ?? [] });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed to fetch collections', 500);
  }
}

// POST /api/admin/collections
export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, CollectionSchema);
  if (validErr) return validErr;

  try {
    const db = createAdminClient();

    const { data: created, error } = await db
      .from('collections')
      .insert({
        handle: data.handle,
        title: data.title,
        description: data.description ?? null,
        image_url: data.imageUrl ?? null,
        sort_order: data.sortOrder,
        published: data.published,
      })
      .select('id')
      .single();

    if (error) throw error;

    if (data.products?.length) {
      const rows = data.products.map((p) => ({
        collection_id: created.id,
        product_id: p.productId,
        sort_order: p.sortOrder,
      }));
      const { error: cpErr } = await db.from('collection_products').insert(rows);
      if (cpErr) throw cpErr;
    }

    return jsonOk({ id: created.id }, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    const status = msg.includes('duplicate') || msg.includes('unique') ? 409 : 500;
    return jsonError(msg, status);
  }
}

