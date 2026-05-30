import { NextRequest } from 'next/server';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { InventoryService } from '@/lib/server/catalog/inventory.service';

// GET /api/admin/inventory?search=&status=all|in-stock|low-stock|sold-out&page=1&pageSize=50&sortBy=&sortDir=asc
export async function GET(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? undefined;
  const status = (searchParams.get('status') ?? 'all') as 'all' | 'in-stock' | 'low-stock' | 'sold-out';
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '50', 10), 200);
  const sortBy = (searchParams.get('sortBy') ?? 'product_title') as 'stock_qty' | 'sku' | 'product_title' | 'price';
  const sortDir = (searchParams.get('sortDir') ?? 'asc') as 'asc' | 'desc';

  try {
    const service = new InventoryService();
    const result = await service.getAllVariantsStock({ search, status, page, pageSize, sortBy, sortDir });
    return jsonOk(result);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}
