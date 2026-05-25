import { NextRequest } from 'next/server';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAuth } from '@/lib/api/auth-helper';
import { CartService } from '@/lib/server/cart/cart.service';
import { getGuestSessionIdFromRequest } from '@/lib/api/guest-session';

/** Merge guest cart into logged-in user cart (call after login). */
export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  try {
    const user = await requireAuth();
    const guestId = await getGuestSessionIdFromRequest(request);
    if (guestId) {
      await new CartService().mergeGuestCart(guestId, user.id);
    }
    const cartId = await new CartService().getOrCreateCart(user.id);
    const items = await new CartService().getCartItems(cartId);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return jsonOk({ cartId, items, subtotal });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    return jsonError(msg, msg === 'Unauthorized' ? 401 : 500);
  }
}
