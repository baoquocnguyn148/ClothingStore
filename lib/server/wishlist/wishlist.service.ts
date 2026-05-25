import { createAdminClient } from '@/lib/supabase/admin';
import { PRODUCT_SELECT, mapDbProduct } from '@/lib/server/catalog/mapper';

export class WishlistService {
  private db = createAdminClient();

  async getWishlist(userId: string) {
    const { data, error } = await this.db
      .from('wishlist_items')
      .select(`product_id, products (${PRODUCT_SELECT})`)
      .eq('user_id', userId);

    if (error) throw error;
    return (data ?? [])
      .map((row) => row.products)
      .filter(Boolean)
      .map((p) => mapDbProduct(p));
  }

  async toggle(userId: string, productId: string) {
    const { data: existing } = await this.db
      .from('wishlist_items')
      .select('product_id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      await this.db
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      return { added: false };
    }

    await this.db.from('wishlist_items').insert({ user_id: userId, product_id: productId });
    return { added: true };
  }

  async getProductIdByHandle(handle: string) {
    const { data } = await this.db
      .from('products')
      .select('id')
      .eq('handle', handle)
      .single();
    return data?.id ?? null;
  }
}
