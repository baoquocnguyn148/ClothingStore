import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { ShippingService } from '@/lib/server/order/shipping.service';

const ShippingZoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  provinces: z.array(z.string()),
  fee: z.number().min(0),
  freeAbove: z.number().nullable().optional(),
  published: z.boolean().default(true)
});

// GET /api/admin/shipping-zones
export async function GET(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const service = new ShippingService();
    const zones = await service.getZones();
    return jsonOk(zones);
  } catch (e) {
    return jsonError('Failed to fetch shipping zones', 500);
  }
}

// POST /api/admin/shipping-zones
export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, ShippingZoneSchema);
  if (validErr) return validErr;

  try {
    const service = new ShippingService();
    const created = await service.saveZone(data);
    return jsonOk(created);
  } catch (e) {
    console.error(e);
    return jsonError('Failed to create shipping zone', 500);
  }
}
