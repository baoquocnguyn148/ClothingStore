import { createAdminClient } from '@/lib/supabase/admin';
import { FormulaEvaluator, OrderContext } from './formula.evaluator';

export interface ValidatePromoInput {
  code: string;
  userId: string;
  cartTotal: number;
  itemCount: number;
  productIds?: string[];
  categoryIds?: string[];
  membershipTier?: string;
}

export class PromotionService {
  private db = createAdminClient();

  /**
   * Validates a promotion code and calculates the discount amount.
   * Calls the apply_promotion RPC for atomicity. If it returns a custom rule, evaluates it here.
   */
  async validateAndCalculate(input: ValidatePromoInput): Promise<{
    ok: boolean;
    error?: string;
    promotionId?: string;
    discount?: number;
    isFreeShipping?: boolean;
    type?: string;
  }> {
    const { data, error } = await this.db.rpc('apply_promotion', {
      p_code: input.code,
      p_user_id: input.userId,
      p_cart_total: input.cartTotal,
      p_item_count: input.itemCount,
    });

    if (error) {
      return { ok: false, error: 'Database error while validating promotion' };
    }

    const res = data as any;
    if (!res.ok) {
      return { ok: false, error: res.error };
    }

    // If it's a custom rule, evaluate it in Node
    if (res.type === 'custom' && res.rule) {
      const context: OrderContext = {
        subtotal: input.cartTotal,
        item_count: input.itemCount,
        membership_tier: input.membershipTier ?? 'standard',
        product_ids: input.productIds ?? [],
        category_ids: input.categoryIds ?? [],
      };

      const evalResult = FormulaEvaluator.evaluate(res.rule, context);
      
      if (!evalResult.isValid) {
        return { ok: false, error: 'Đơn hàng không đủ điều kiện áp dụng mã này' };
      }

      return {
        ok: true,
        promotionId: res.promotion_id,
        discount: evalResult.discountAmount,
        isFreeShipping: evalResult.isFreeShipping,
        type: 'custom',
      };
    }

    // Standard promotion from DB
    return {
      ok: true,
      promotionId: res.promotion_id,
      discount: res.discount,
      isFreeShipping: res.is_free_shipping,
      type: res.type,
    };
  }

  /**
   * Log promotion usage after an order is successfully created
   */
  async logUsage(promotionId: string, userId: string, orderId: string, discountAmount: number) {
    const { error } = await this.db.from('promotion_usages').insert({
      promotion_id: promotionId,
      user_id: userId,
      order_id: orderId,
      discount_amount: discountAmount,
    });

    if (error) throw error;

    // Increment usage_count on the promotion
    await this.db.rpc('increment_promotion_usage', { p_promo_id: promotionId });
  }

  // --- Admin Methods ---

  async getPromotions() {
    const { data, error } = await this.db
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data ?? [];
  }

  async getPromotionById(id: string) {
    const { data, error } = await this.db
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) return null;
    return data;
  }

  async createPromotion(input: any) {
    const { data, error } = await this.db
      .from('promotions')
      .insert(input)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async updatePromotion(id: string, input: any) {
    const { data, error } = await this.db
      .from('promotions')
      .update(input)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async deletePromotion(id: string) {
    const { error } = await this.db
      .from('promotions')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
}
