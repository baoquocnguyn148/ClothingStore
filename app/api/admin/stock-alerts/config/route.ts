import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { InventoryService } from '@/lib/server/catalog/inventory.service';

const ConfigSchema = z.object({
  globalThreshold: z.number().int().min(0).max(10000).optional(),
  variantId: z.string().uuid().optional(),
  variantThreshold: z.number().int().min(0).max(10000).optional(),
});

export async function GET(_request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const threshold = await new InventoryService().getGlobalThreshold();
    return jsonOk({ globalThreshold: threshold });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

export async function PATCH(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, ConfigSchema);
  if (validErr) return validErr;

  try {
    const service = new InventoryService();

    if (data.globalThreshold !== undefined) {
      await service.setGlobalThreshold(data.globalThreshold);
    }

    if (data.variantId && data.variantThreshold !== undefined) {
      await service.setVariantThreshold(data.variantId, data.variantThreshold);
    }

    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}
