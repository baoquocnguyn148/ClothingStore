import { NextRequest } from 'next/server';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { CartService } from '@/lib/server/cart/cart.service';
import { getAuthUser } from '@/lib/api/auth-helper';
import { getGuestSessionId, getGuestSessionIdFromRequest } from '@/lib/api/guest-session';

async function resolveCartId(request: NextRequest) {
  const user = await getAuthUser();
  const guestId =
    (await getGuestSessionIdFromRequest(request)) ??
    (!(await getAuthUser()) ? await getGuestSessionId() : undefined);

  const cartService = new CartService();
  return {
    cartId: await cartService.getOrCreateCart(user?.id, guestId),
    userId: user?.id,
  };
}

export async function GET(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);
  try {
    const { cartId } = await resolveCartId(request);
    const items = await new CartService().getCartItems(cartId);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return jsonOk({ cartId, items, subtotal, itemCount: items.reduce((s, i) => s + i.quantity, 0) });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);
  try {
    const body = await request.json();
    const { variantId, quantity = 1 } = body;
    if (!variantId) return jsonError('variantId required');

    const { cartId } = await resolveCartId(request);
    await new CartService().addItem(cartId, variantId, quantity);
    const items = await new CartService().getCartItems(cartId);
    return jsonOk({ cartId, items });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

export async function PATCH(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);
  try {
    const body = await request.json();
    const { cartItemId, quantity } = body;
    if (!cartItemId || quantity == null) return jsonError('cartItemId and quantity required');

    await new CartService().updateQuantity(cartItemId, quantity);
    const { cartId } = await resolveCartId(request);
    const items = await new CartService().getCartItems(cartId);
    return jsonOk({ items });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);
  try {
    const cartItemId = request.nextUrl.searchParams.get('cartItemId');
    if (cartItemId) {
      await new CartService().removeItem(cartItemId);
    } else {
      const { cartId } = await resolveCartId(request);
      await new CartService().clearCart(cartId);
    }
    const { cartId } = await resolveCartId(request);
    const items = await new CartService().getCartItems(cartId);
    return jsonOk({ items });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}
