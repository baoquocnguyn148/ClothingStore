import { createAdminClient } from '@/lib/supabase/admin';

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  orderId: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  images: string[];
  verified: boolean;
  published: boolean;
  createdAt: string;
  user?: { fullName: string };
  product?: { id: string; title: string; handle: string };
}

export interface CreateReviewInput {
  productId: string;
  userId: string;
  orderId?: string;
  rating: number;
  title?: string;
  body?: string;
  images?: string[];
}

export class ReviewService {
  private db = createAdminClient();

  /**
   * Get published reviews for a product (public).
   */
  async getProductReviews(productId: string): Promise<ProductReview[]> {
    const { data, error } = await this.db
      .from('product_reviews')
      .select(`
        id, product_id, user_id, order_id, rating, title, body,
        images, verified, published, created_at,
        profiles ( full_name )
      `)
      .eq('product_id', productId)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapReview);
  }

  /**
   * Get all reviews (admin) with optional filter.
   */
  async getAllReviews(opts?: { published?: boolean; productId?: string; limit?: number; offset?: number }) {
    let query = this.db
      .from('product_reviews')
      .select(`
        id, product_id, user_id, order_id, rating, title, body,
        images, verified, published, created_at,
        profiles ( full_name ),
        products!inner ( id, title, handle )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (opts?.published !== undefined) {
      query = query.eq('published', opts.published);
    }
    if (opts?.productId) {
      query = query.eq('product_id', opts.productId);
    }
    if (opts?.limit) {
      query = query.limit(opts.limit);
    }
    if (opts?.offset) {
      query = query.range(opts.offset, opts.offset + (opts.limit ?? 20) - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { reviews: (data ?? []).map(mapReview), total: count ?? 0 };
  }

  /**
   * Create a new review. Checks that the user has a delivered order for this product.
   */
  async createReview(input: CreateReviewInput): Promise<ProductReview> {
    // Verify purchase: user must have a delivered order containing this product
    let orderId = input.orderId;

    if (!orderId) {
      // Find a qualifying order automatically
      const { data: orderItem } = await this.db
        .from('order_items')
        .select('order_id, orders!inner ( id, user_id, status )')
        .eq('orders.user_id', input.userId)
        .in('orders.status', ['delivered', 'confirmed'])
        .limit(1)
        .single();

      if (orderItem) {
        orderId = orderItem.order_id;
      }
    }

    // Check for duplicate review
    const { data: existing } = await this.db
      .from('product_reviews')
      .select('id')
      .eq('product_id', input.productId)
      .eq('user_id', input.userId)
      .maybeSingle();

    if (existing) throw new Error('Bạn đã viết đánh giá cho sản phẩm này rồi');

    const { data, error } = await this.db
      .from('product_reviews')
      .insert({
        product_id: input.productId,
        user_id: input.userId,
        order_id: orderId ?? null,
        rating: input.rating,
        title: input.title ?? null,
        body: input.body ?? null,
        images: input.images ?? [],
        verified: !!orderId,
        published: false, // Admin must approve
      })
      .select(`
        id, product_id, user_id, order_id, rating, title, body,
        images, verified, published, created_at,
        profiles ( full_name )
      `)
      .single();

    if (error || !data) throw error ?? new Error('Failed to create review');
    return mapReview(data);
  }

  /**
   * Approve or reject a review (admin action).
   */
  async moderateReview(reviewId: string, published: boolean): Promise<void> {
    const { error } = await this.db
      .from('product_reviews')
      .update({ published })
      .eq('id', reviewId);

    if (error) throw error;
  }

  /**
   * Get a single review by ID.
   */
  async getReviewById(reviewId: string): Promise<ProductReview | null> {
    const { data, error } = await this.db
      .from('product_reviews')
      .select(`
        id, product_id, user_id, order_id, rating, title, body,
        images, verified, published, created_at,
        profiles ( full_name )
      `)
      .eq('id', reviewId)
      .single();

    if (error || !data) return null;
    return mapReview(data);
  }

  /**
   * Get aggregate rating stats for a product.
   */
  async getRatingStats(productId: string) {
    const { data, error } = await this.db
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('published', true);

    if (error) throw error;

    const ratings = data ?? [];
    if (ratings.length === 0) return { average: 0, count: 0, distribution: {} };

    const sum = ratings.reduce((s, r) => s + r.rating, 0);
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((r) => { distribution[r.rating] = (distribution[r.rating] ?? 0) + 1; });

    return {
      average: Math.round((sum / ratings.length) * 10) / 10,
      count: ratings.length,
      distribution,
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReview(row: any): ProductReview {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const product = Array.isArray(row.products) ? row.products[0] : row.products;

  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    orderId: row.order_id ?? null,
    rating: row.rating,
    title: row.title ?? null,
    body: row.body ?? null,
    images: row.images ?? [],
    verified: row.verified ?? false,
    published: row.published ?? false,
    createdAt: row.created_at,
    user: profile ? { fullName: profile.full_name ?? '' } : undefined,
    product: product
      ? { id: product.id, title: product.title, handle: product.handle }
      : undefined,
  };
}
