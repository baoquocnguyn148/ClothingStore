import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { ShippingService } from '@/lib/server/order/shipping.service';

const CalculateShippingSchema = z.object({
  province: z.string().min(1, "Tỉnh/Thành phố không được để trống"),
  subtotal: z.number().min(0),
});

// POST /api/v1/shipping/calculate
export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { data, errorResponse } = await validateBody(request, CalculateShippingSchema);
  if (errorResponse) return errorResponse;

  try {
    const service = new ShippingService();
    const result = await service.calculateFee(data.province, data.subtotal);

    return jsonOk(result);
  } catch (e) {
    console.error(e);
    return jsonError('Lỗi khi tính phí vận chuyển', 500);
  }
}
