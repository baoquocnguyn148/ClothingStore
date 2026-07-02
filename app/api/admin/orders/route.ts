import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody, validateQuery } from '@/lib/api/validate';
import { OrderService } from '@/lib/server/order/order.service';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/server/admin/audit.service';

const QuerySchema = z.object({
  status: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(), // order_number or user email
});

export async function GET(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data: query, errorResponse: validErr } = validateQuery(request, QuerySchema);
  if (validErr) return validErr;

  try {
    const result = await new OrderService().listOrdersForAdmin({
      status: query.status,
      search: query.search,
      offset: query.offset ?? 0,
      limit: query.limit ?? 20,
    });

    const db = createAdminClient();
    const orderIds = result.orders.map((o) => o.id);
    let ordersWithItems = result.orders;

    if (orderIds.length > 0) {
      const { data: details } = await db
        .from('orders')
        .select(
          `id, subtotal, shipping_fee, total, discount_amount, shipping_address, note, created_at, updated_at,
          order_items ( id, product_title, variant_size, variant_color, quantity, unit_price, image_url )`
        )
        .in('id', orderIds);

      const detailMap = new Map((details ?? []).map((d) => [d.id, d]));
      ordersWithItems = result.orders.map((o) => ({
        ...o,
        ...detailMap.get(o.id),
      }));
    }

    return jsonOk({ orders: ordersWithItems, total: result.total });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

// Create a manual order (admin use)
const CreateOrderSchema = z.object({
  userId: z.string().uuid(),
  cartId: z.string().uuid(),
  shippingAddress: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    email: z.string().optional(),
  }),
  note: z.string().optional(),
  shippingFee: z.number().int().min(0).optional(),
});

export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { user, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, CreateOrderSchema);
  if (validErr) return validErr;

  try {
    const order = await new OrderService().createFromCart(data);
    
    await logAdminAction({
      actorId: user.id,
      action: 'create',
      entity: 'order',
      entityId: order.id,
      metadata: { source: 'admin_manual_create' },
    });

    return jsonOk({ order }, 201);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}
