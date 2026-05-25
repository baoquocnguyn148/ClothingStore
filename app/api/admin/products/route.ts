import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody, validateQuery } from '@/lib/api/validate';
import { createAdminClient } from '@/lib/supabase/admin';
import { InventoryService } from '@/lib/server/catalog/inventory.service';

const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(),
  published: z.enum(['true', 'false', 'all']).default('all'),
  category: z.string().optional(),
});

export async function GET(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data: query, errorResponse: validErr } = validateQuery(request, QuerySchema);
  if (validErr) return validErr;

  try {
    const db = createAdminClient();

    let q = db
      .from('products')
      .select(`
        id, handle, title, description, base_price, compare_at_price,
        category, published, deleted_at, created_at, updated_at,
        product_images ( url, sort_order ),
        product_variants ( id, sku, size, color_name, stock_qty, is_active, price )
      `, { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(query.offset ?? 0, (query.offset ?? 0) + (query.limit ?? 20) - 1);

    if (query.published !== 'all') {
      q = q.eq('published', query.published === 'true');
    }
    if (query.search) {
      q = q.ilike('title', `%${query.search}%`);
    }
    if (query.category) {
      q = q.eq('category', query.category);
    }

    const { data, error, count } = await q;
    if (error) throw error;

    // Add stock summary to each product
    const products = (data ?? []).map((p) => {
      const variants = p.product_variants ?? [];
      const totalStock = variants.reduce((s: number, v: { stock_qty: number }) => s + (v.stock_qty ?? 0), 0);
      const soldOutVariants = variants.filter((v: { stock_qty: number }) => v.stock_qty === 0).length;
      const primaryImage = (p.product_images ?? [])
        .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)[0]?.url ?? null;

      return {
        id: p.id,
        handle: p.handle,
        title: p.title,
        basePrice: p.base_price,
        compareAtPrice: p.compare_at_price,
        category: p.category,
        published: p.published,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        primaryImage,
        variantCount: variants.length,
        totalStock,
        soldOutVariants,
      };
    });

    return jsonOk({ products, total: count ?? 0 });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

const CreateProductSchema = z.object({
  handle: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Handle must be lowercase alphanumeric with dashes'),
  title: z.string().min(1),
  description: z.string().default(''),
  basePrice: z.number().int().min(0),
  compareAtPrice: z.number().int().min(0).nullable().optional(),
  category: z.string().default('general'),
  published: z.boolean().default(false),
  tags: z.array(z.string().min(1)).default([]),
  images: z.array(z.object({
    url: z.string().min(1),
    alt: z.string().optional(),
    sortOrder: z.number().int().min(0),
  })).default([]),
  variants: z.array(z.object({
    sku: z.string().min(1),
    size: z.string().min(1),
    colorName: z.string().min(1),
    colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#000000'),
    price: z.number().int().min(0),
    stockQty: z.number().int().min(0),
    isActive: z.boolean().default(true),
  })).default([]),
});

export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, CreateProductSchema);
  if (validErr) return validErr;

  try {
    const db = createAdminClient();

    const { data: product, error } = await db
      .from('products')
      .insert({
        handle: data.handle,
        title: data.title,
        description: data.description,
        base_price: data.basePrice,
        compare_at_price: data.compareAtPrice ?? null,
        category: data.category,
        published: data.published,
      })
      .select('*')
      .single();

    if (error) throw error;

    const images = data.images ?? [];
    const variantsInput = data.variants ?? [];

    if (images.length) {
      const { error: imageErr } = await db.from('product_images').insert(
        images.map((image) => ({
          product_id: product.id,
          url: image.url,
          alt: image.alt ?? null,
          sort_order: image.sortOrder,
        }))
      );
      if (imageErr) throw imageErr;
    }

    if (variantsInput.length) {
      const { data: variants, error: variantErr } = await db
        .from('product_variants')
        .insert(
          variantsInput.map((variant) => ({
            product_id: product.id,
            sku: variant.sku,
            size: variant.size,
            color_name: variant.colorName,
            color_hex: variant.colorHex,
            price: variant.price,
            stock_qty: variant.stockQty,
            is_active: variant.isActive,
          }))
        )
        .select('id, stock_qty');
      if (variantErr) throw variantErr;

      const movements = (variants ?? [])
        .filter((variant) => variant.stock_qty > 0)
        .map((variant) => ({
          variant_id: variant.id,
          delta: variant.stock_qty,
          reason: 'admin_product_create_variant',
        }));
      if (movements.length) {
        const { error: movementErr } = await db.from('inventory_movements').insert(movements);
        if (movementErr) throw movementErr;
      }
    }

    if (data.tags?.length) {
      const slugs = Array.from(new Set(data.tags));
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
        slugs.map((slug) => ({ product_id: product.id, tag_id: tagMap.get(slug)! }))
      );
      if (assignErr) throw assignErr;
    }

    return jsonOk({ product }, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    const status = msg.includes('duplicate') ? 409 : 500;
    return jsonError(msg, status);
  }
}
