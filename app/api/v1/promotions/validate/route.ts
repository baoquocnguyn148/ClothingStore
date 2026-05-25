import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { PromotionService } from '@/lib/server/promotion/promotion.service';
import { createBrowserClient } from '@supabase/ssr';

const ValidatePromoSchema = z.object({
  code: z.string().min(1, "Mã khuyến mãi không hợp lệ"),
  cartTotal: z.number().min(0),
  itemCount: z.number().min(1),
  productIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
});

// POST /api/v1/promotions/validate
export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { data, errorResponse } = await validateBody(request, ValidatePromoSchema);
  if (errorResponse) return errorResponse;

  // We should ideally extract user_id from auth if logged in
  const authHeader = request.headers.get('Authorization');
  let userId = '00000000-0000-0000-0000-000000000000'; // Guest dummy user for validation if not logged in
  // Try to parse real user
  if (authHeader) {
     // A real auth check here using supabase auth would get the actual user
  }

  try {
    const service = new PromotionService();
    const result = await service.validateAndCalculate({
      code: data.code,
      userId,
      cartTotal: data.cartTotal,
      itemCount: data.itemCount,
      productIds: data.productIds,
      categoryIds: data.categoryIds,
    });

    if (!result.ok) {
      return jsonError(result.error || 'Mã khuyến mãi không hợp lệ', 400);
    }

    return jsonOk({
      discount: result.discount,
      isFreeShipping: result.isFreeShipping,
      type: result.type,
      promotionId: result.promotionId
    });
  } catch (e) {
    console.error(e);
    return jsonError('Lỗi server khi kiểm tra mã khuyến mãi', 500);
  }
}
