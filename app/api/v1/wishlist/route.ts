import { NextRequest } from 'next/server';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAuth } from '@/lib/api/auth-helper';
import { WishlistService } from '@/lib/server/wishlist/wishlist.service';

export async function GET() {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);
  try {
    const user = await requireAuth();
    const products = await new WishlistService().getWishlist(user.id);
    return jsonOk({ products, handles: products.map((p) => p.handle) });
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
    const { productHandle, productId } = body;

    const wishlist = new WishlistService();
    let pid = productId;
    if (!pid && productHandle) {
      pid = await wishlist.getProductIdByHandle(productHandle);
    }
    if (!pid) return jsonError('Product not found');

    const result = await wishlist.toggle(user.id, pid);
    const products = await wishlist.getWishlist(user.id);
    return jsonOk({ ...result, products, handles: products.map((p) => p.handle) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    return jsonError(msg, msg === 'Unauthorized' ? 401 : 500);
  }
}
