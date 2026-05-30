import { NextRequest } from 'next/server';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { InventoryService } from '@/lib/server/catalog/inventory.service';

// GET /api/admin/inventory/movements?variantId=&reason=&dateFrom=&dateTo=&page=1&pageSize=50
export async function GET(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const variantId = searchParams.get('variantId') ?? undefined;
  const reason = searchParams.get('reason') ?? undefined;
  const dateFrom = searchParams.get('dateFrom') ?? undefined;
  const dateTo = searchParams.get('dateTo') ?? undefined;
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '50', 10), 200);

  try {
    const service = new InventoryService();
    const result = await service.getMovementsFiltered({
      variantId,
      reason,
      dateFrom,
      dateTo,
      page,
      pageSize,
    });
    return jsonOk(result);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}
