import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { InventoryService } from '@/lib/server/catalog/inventory.service';
import { logAdminAction } from '@/lib/server/admin/audit.service';

const BulkUpdateSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        qty: z.number().int().min(0),
        reason: z.string().optional(),
        note: z.string().optional(),
      })
    )
    .min(1)
    .max(100),
});

// PATCH /api/admin/inventory/bulk
export async function PATCH(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { user, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, BulkUpdateSchema);
  if (validErr) return validErr;

  try {
    const service = new InventoryService();
    const results = await service.bulkUpdateStock(data.items, user.id);

    await logAdminAction({
      actorId: user.id,
      action: 'inventory.bulk_update',
      entity: 'product_variants',
      entityId: 'bulk',
      metadata: {
        count: data.items.length,
        successCount: results.filter((r) => !r.error).length,
      },
    });

    return jsonOk({ results });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}
