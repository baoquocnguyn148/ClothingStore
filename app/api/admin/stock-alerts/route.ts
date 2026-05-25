import { NextRequest } from 'next/server';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { InventoryService } from '@/lib/server/catalog/inventory.service';

export async function GET(_request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const service = new InventoryService();
    const [alerts, globalThreshold] = await Promise.all([
      service.getLowStockVariants(),
      service.getGlobalThreshold(),
    ]);

    const soldOut = alerts.filter((a) => a.isSoldOut);
    const lowStock = alerts.filter((a) => !a.isSoldOut);

    return jsonOk({ soldOut, lowStock, globalThreshold, total: alerts.length });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}
