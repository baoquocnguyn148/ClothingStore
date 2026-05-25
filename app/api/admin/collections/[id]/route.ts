import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { createAdminClient } from '@/lib/supabase/admin';

const UpdateSchema = z
  .object({
    handle: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Handle must be lowercase alphanumeric with dashes').optional(),
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
    sortOrder: z.number().int().min(0).optional(),
    published: z.boolean().optional(),
    products: z
      .array(
        z.object({
          productId: z.string().uuid(),
          sortOrder: z.number().int().min(0),
        })
      )
      .optional(),
  })
  .refine((d) => Object.keys(d).length > 0, 'At least one field required');

// GET /api/admin/collections/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const db = createAdminClient();
    const { data, error } = await db
      .from('collections')
      .select(
        `
        id, handle, title, description, image_url, sort_order, published, created_at, updated_at,
        collection_products (
          product_id, sort_order,
          products ( id, handle, title, product_images ( url, sort_order ) )
        )
      `
      )
      .eq('id', id)
      .single();

    if (error || !data) return jsonError('Collection not found', 404);
    return jsonOk({ collection: data });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

// PATCH /api/admin/collections/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, UpdateSchema);
  if (validErr) return validErr;

  try {
    const { id } = await params;
    const db = createAdminClient();

    const update: Record<string, unknown> = {};
    if (data.handle !== undefined) update.handle = data.handle;
    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.imageUrl !== undefined) update.image_url = data.imageUrl;
    if (data.sortOrder !== undefined) update.sort_order = data.sortOrder;
    if (data.published !== undefined) update.published = data.published;

    if (Object.keys(update).length) {
      const { error } = await db.from('collections').update(update).eq('id', id);
      if (error) throw error;
    }

    if (data.products !== undefined) {
      // replace assignments
      const { error: delErr } = await db.from('collection_products').delete().eq('collection_id', id);
      if (delErr) throw delErr;

      if (data.products.length) {
        const rows = data.products.map((p) => ({
          collection_id: id,
          product_id: p.productId,
          sort_order: p.sortOrder,
        }));
        const { error: insErr } = await db.from('collection_products').insert(rows);
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

// DELETE /api/admin/collections/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const db = createAdminClient();
    const { error } = await db.from('collections').delete().eq('id', id);
    if (error) throw error;
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

