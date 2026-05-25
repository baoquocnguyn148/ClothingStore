import { NextRequest } from 'next/server';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAuth } from '@/lib/api/auth-helper';
import { OrderService } from '@/lib/server/order/order.service';
import { CartService } from '@/lib/server/cart/cart.service';
import { getGuestSessionIdFromRequest } from '@/lib/api/guest-session';

export async function GET() {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);
  try {
    const user = await requireAuth();
    const orders = await new OrderService().getOrdersByUser(user.id);
    return jsonOk({ orders });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    return jsonError(msg, msg === 'Unauthorized' ? 401 : 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);
  try {
    const user = await requireAuth();
    const body = await request.json();
    const guestId = await getGuestSessionIdFromRequest(request);

    const cartService = new CartService();
    if (guestId) await cartService.mergeGuestCart(guestId, user.id);

    const cartId = await cartService.getOrCreateCart(user.id);
    const order = await new OrderService().createFromCart({
      userId: user.id,
      cartId,
      shippingAddress: body.shippingAddress,
      note: body.note,
      promotionCode: body.promotionCode,
    });

    return jsonOk({ order }, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    return jsonError(msg, msg === 'Unauthorized' ? 401 : 500);
  }
}
