import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { PromotionService } from '@/lib/server/promotion/promotion.service';

const CreatePromoSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y', 'custom']),
  apply_mode: z.enum(['auto', 'code']).default('code'),
  value: z.number().default(0),
  max_discount: z.number().optional(),
  min_order_value: z.number().default(0),
  min_qty: z.number().default(1),
  custom_rule: z.any().optional(),
  starts_at: z.string().optional(),
  expires_at: z.string().optional(),
  published: z.boolean().default(true)
});

// GET /api/admin/promotions
export async function GET(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const service = new PromotionService();
    const list = await service.getPromotions();
    return jsonOk(list);
  } catch (e) {
    return jsonError('Failed to fetch promotions', 500);
  }
}

// POST /api/admin/promotions
export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, CreatePromoSchema);
  if (validErr) return validErr;

  try {
    const service = new PromotionService();
    const created = await service.createPromotion(data);
    return jsonOk(created);
  } catch (e) {
    console.error(e);
    return jsonError('Failed to create promotion', 500);
  }
}
