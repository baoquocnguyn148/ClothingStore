import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { createAdminClient } from '@/lib/supabase/admin';
import { InventoryService } from '@/lib/server/catalog/inventory.service';

// GET /api/admin/products/[id]
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
      .from('products')
      .select(`
        *,
        product_images ( * ),
        product_variants ( *, stock_alert_config ( low_stock_threshold ) ),
        product_tag_assignments ( tags ( id, slug, label ) ),
        collection_products ( collections ( id, handle, title ) )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) return jsonError('Product not found', 404);

    // Add inventory summary from service
    const inventory = await new InventoryService().getProductInventory(id);

    return jsonOk({ product: data, inventory });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

// PATCH /api/admin/products/[id]
const UpdateProductSchema = z.object({
  handle: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Handle must be lowercase alphanumeric with dashes').optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  basePrice: z.number().int().min(0).optional(),
  compareAtPrice: z.number().int().min(0).nullable().optional(),
  category: z.string().optional(),
  published: z.boolean().optional(),
  tags: z.array(z.string().min(1)).optional(),
  images: z.array(z.object({
    id: z.string().uuid().optional(),
    url: z.string().min(1),
    alt: z.string().optional(),
    sortOrder: z.number().int().min(0),
  })).optional(),
  variants: z.array(z.object({
    id: z.string().uuid().optional(),
    sku: z.string().min(1),
    size: z.string().min(1),
    colorName: z.string().min(1),
    colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#000000'),
    price: z.number().int().min(0),
    stockQty: z.number().int().min(0),
    isActive: z.boolean().default(true),
  })).optional(),
}).refine((d) => Object.keys(d).length > 0, 'At least one field required');

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, UpdateProductSchema);
  if (validErr) return validErr;

  try {
    const { id } = await params;
    const db = createAdminClient();

    // Build update object
    const update: Record<string, unknown> = {};
    if (data.handle !== undefined) update.handle = data.handle;
    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.basePrice !== undefined) update.base_price = data.basePrice;
    if (data.compareAtPrice !== undefined) update.compare_at_price = data.compareAtPrice;
    if (data.category !== undefined) update.category = data.category;
    if (data.published !== undefined) update.published = data.published;

    const productResult = Object.keys(update).length
      ? await db
          .from('products')
          .update(update)
          .eq('id', id)
          .is('deleted_at', null)
          .select('*')
          .single()
      : await db
          .from('products')
          .select('*')
          .eq('id', id)
          .is('deleted_at', null)
          .single();

    const { data: product, error } = productResult;

    if (error || !product) return jsonError('Product not found', 404);

    if (data.images !== undefined) {
      const { error: deleteErr } = await db
        .from('product_images')
        .delete()
        .eq('product_id', id);
      if (deleteErr) throw deleteErr;

      const imageRows = data.images
        .map((image) => ({
          product_id: id,
          url: image.url,
          alt: image.alt ?? null,
          sort_order: image.sortOrder,
        }));
      if (imageRows.length) {
        const { error: insertImageErr } = await db.from('product_images').insert(imageRows);
        if (insertImageErr) throw insertImageErr;
      }
    }

    if (data.variants !== undefined) {
      const submittedIds = data.variants.map((variant) => variant.id).filter(Boolean) as string[];
      if (submittedIds.length) {
        const { error: inactiveErr } = await db
          .from('product_variants')
          .update({ is_active: false })
          .eq('product_id', id)
          .not('id', 'in', `(${submittedIds.join(',')})`);
        if (inactiveErr) throw inactiveErr;
      } else {
        const { error: inactiveErr } = await db
          .from('product_variants')
          .update({ is_active: false })
          .eq('product_id', id);
        if (inactiveErr) throw inactiveErr;
      }

      const inventory = new InventoryService();
      for (const variant of data.variants) {
        if (variant.id) {
          const { error: variantErr } = await db
            .from('product_variants')
            .update({
              sku: variant.sku,
              size: variant.size,
              color_name: variant.colorName,
              color_hex: variant.colorHex,
              price: variant.price,
              is_active: variant.isActive,
            })
            .eq('id', variant.id)
            .eq('product_id', id);
          if (variantErr) throw variantErr;

          await inventory.setStock(variant.id, variant.stockQty, 'admin_product_edit');
        } else {
          const { data: createdVariant, error: insertVariantErr } = await db
            .from('product_variants')
            .insert({
              product_id: id,
              sku: variant.sku,
              size: variant.size,
              color_name: variant.colorName,
              color_hex: variant.colorHex,
              price: variant.price,
              stock_qty: variant.stockQty,
              is_active: variant.isActive,
            })
            .select('id')
            .single();
          if (insertVariantErr) throw insertVariantErr;

          if (createdVariant && variant.stockQty > 0) {
            await db.from('inventory_movements').insert({
              variant_id: createdVariant.id,
              delta: variant.stockQty,
              reason: 'admin_product_create_variant',
            });
          }
        }
      }
    }

    if (data.tags !== undefined) {
      const slugs = Array.from(new Set(data.tags));

      // Remove old assignments
      const { error: delErr } = await db
        .from('product_tag_assignments')
        .delete()
        .eq('product_id', id);
      if (delErr) throw delErr;

      if (slugs.length) {
        const { data: tagRows, error: tagErr } = await db
          .from('tags')
          .select('id, slug')
          .in('slug', slugs);
        if (tagErr) throw tagErr;

        const tagMap = new Map((tagRows ?? []).map((t) => [t.slug, t.id]));
        const missing = slugs.filter((s) => !tagMap.has(s));
        if (missing.length) {
          return jsonError(`Unknown tags: ${missing.join(', ')}`, 422);
        }

        const { error: assignErr } = await db.from('product_tag_assignments').insert(
          slugs.map((slug) => ({ product_id: id, tag_id: tagMap.get(slug)! }))
        );
        if (assignErr) throw assignErr;
      }
    }

    return jsonOk({ product });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    const status = msg.includes('duplicate') || msg.includes('unique') ? 409 : 500;
    return jsonError(msg, status);
  }
}

// DELETE /api/admin/products/[id] — soft delete
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

    const { data: deletedProduct, error } = await db
      .from('products')
      .update({ deleted_at: new Date().toISOString(), published: false })
      .eq('id', id)
      .is('deleted_at', null)
      .select('id')
      .single();

    if (error || !deletedProduct) return jsonError('Product not found', 404);

    const { error: variantErr } = await db
      .from('product_variants')
      .update({ is_active: false })
      .eq('product_id', id);

    if (variantErr) throw variantErr;

    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}
