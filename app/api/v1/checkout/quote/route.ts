import { NextRequest } from 'next/server';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAuth } from '@/lib/api/auth-helper';
import { CartService } from '@/lib/server/cart/cart.service';
import { OrderService } from '@/lib/server/order/order.service';

export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  try {
    const user = await requireAuth();
    const body = await request.json();
    const city = (body.city as string)?.trim();
    if (!city) return jsonError('city is required');

    const cartId = await new CartService().getOrCreateCart(user.id);
    const quote = await new OrderService().quoteCheckout({
      cartId,
      userId: user.id,
      city,
      promotionCode: body.promotionCode,
    });

    if (!quote.ok) {
      return jsonError(quote.error ?? 'Invalid promotion', 400);
    }

    return jsonOk(quote);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    return jsonError(msg, msg === 'Unauthorized' ? 401 : 500);
  }
}
