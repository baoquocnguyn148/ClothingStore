import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { InventoryService } from '@/lib/server/catalog/inventory.service';
import { logAdminAction } from '@/lib/server/admin/audit.service';

const StockSchema = z.object({
  qty: z.number().int().min(0, 'Quantity cannot be negative'),
  reason: z.string().optional(),
  note: z.string().optional(),
});

// PATCH /api/admin/products/variants/[id]/stock — set absolute stock level
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { user, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, StockSchema);
  if (validErr) return validErr;

  try {
    const { id } = await params;
    const service = new InventoryService();
    const result = await service.setStock(id, data.qty, data.reason, data.note, user.id);
    await logAdminAction({
      actorId: user.id,
      action: 'inventory.set_stock',
      entity: 'product_variants',
      entityId: id,
      metadata: { qty: data.qty, newQty: result.newQty, reason: data.reason ?? null, note: data.note ?? null },
    });
    return jsonOk({ newQty: result.newQty });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    return jsonError(msg, msg === 'Variant not found' ? 404 : 500);
  }
}

// GET /api/admin/products/variants/[id]/stock — get current stock + recent movements
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const service = new InventoryService();
    const movements = await service.getMovements(id, 20);
    return jsonOk({ variantId: id, movements });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}
