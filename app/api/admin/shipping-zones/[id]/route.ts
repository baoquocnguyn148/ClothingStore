import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { ShippingService } from '@/lib/server/order/shipping.service';

const ShippingZoneSchema = z.object({
  name: z.string().min(1),
  provinces: z.array(z.string()),
  fee: z.number().min(0),
  freeAbove: z.number().nullable().optional(),
  published: z.boolean().default(true)
});

// GET /api/admin/shipping-zones/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const service = new ShippingService();
    const zones = await service.getZones();
    const zone = zones.find(z => z.id === id);
    if (!zone) return jsonError('Shipping zone not found', 404);
    return jsonOk(zone);
  } catch (e) {
    return jsonError('Failed to fetch shipping zone', 500);
  }
}

// PATCH /api/admin/shipping-zones/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  const { data, errorResponse: validErr } = await validateBody(request, ShippingZoneSchema);
  if (validErr) return validErr;

  try {
    const service = new ShippingService();
    const updated = await service.saveZone({ ...data, id });
    return jsonOk(updated);
  } catch (e) {
    console.error(e);
    return jsonError('Failed to update shipping zone', 500);
  }
}

// DELETE /api/admin/shipping-zones/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const service = new ShippingService();
    await service.deleteZone(id);
    return jsonOk({ success: true });
  } catch (e) {
    return jsonError('Failed to delete shipping zone', 500);
  }
}
