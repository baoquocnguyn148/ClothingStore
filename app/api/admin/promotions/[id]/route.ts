import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { PromotionService } from '@/lib/server/promotion/promotion.service';
import { logAdminAction } from '@/lib/server/admin/audit.service';

const UpdatePromoSchema = z.object({
  code: z.string().nullable().optional(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  type: z.enum(['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y', 'custom']),
  apply_mode: z.enum(['auto', 'code']).default('code'),
  value: z.number().default(0),
  max_discount: z.number().nullable().optional(),
  min_order_value: z.number().default(0),
  min_qty: z.number().default(1),
  custom_rule: z.any().optional(),
  starts_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  max_uses: z.number().nullable().optional(),
  published: z.boolean().default(true)
});

// GET /api/admin/promotions/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { user, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const service = new PromotionService();
    const promotion = await service.getPromotionById(id);
    if (!promotion) return jsonError('Promotion not found', 404);
    return jsonOk(promotion);
  } catch (e) {
    return jsonError('Failed to fetch promotion', 500);
  }
}

// PATCH /api/admin/promotions/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { user, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  const { data, errorResponse: validErr } = await validateBody(request, UpdatePromoSchema);
  if (validErr) return validErr;

  try {
    const service = new PromotionService();
    const updated = await service.updatePromotion(id, {
      ...data,
      code: data.code?.trim() || null,
      description: data.description?.trim() || null,
      starts_at: data.starts_at || null,
      expires_at: data.expires_at || null,
    });
    await logAdminAction({
      actorId: user.id,
      action: 'promotion.update',
      entity: 'promotions',
      entityId: id,
      metadata: { code: updated.code, type: updated.type, published: updated.published },
    });
    return jsonOk(updated);
  } catch (e) {
    console.error(e);
    return jsonError('Failed to update promotion', 500);
  }
}

// DELETE /api/admin/promotions/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { user, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const service = new PromotionService();
    await service.deletePromotion(id);
    await logAdminAction({
      actorId: user.id,
      action: 'promotion.delete',
      entity: 'promotions',
      entityId: id,
    });
    return jsonOk({ success: true });
  } catch (e) {
    return jsonError('Failed to delete promotion', 500);
  }
}
