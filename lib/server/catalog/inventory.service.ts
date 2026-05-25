import { createAdminClient } from '@/lib/supabase/admin';

export interface StockAlertItem {
  variantId: string;
  sku: string;
  size: string;
  colorName: string;
  stockQty: number;
  threshold: number;
  productId: string;
  productTitle: string;
  productHandle: string;
  isSoldOut: boolean;
}

export interface InventoryMovementInput {
  variantId: string;
  delta: number;
  reason?: string;
  actorId?: string;
}

export class InventoryService {
  private db = createAdminClient();

  /**
   * Get all variants that are sold out OR below their low-stock threshold.
   */
  async getLowStockVariants(): Promise<StockAlertItem[]> {
    // Get global threshold as fallback
    const { data: globalConfig } = await this.db
      .from('stock_alert_config')
      .select('low_stock_threshold')
      .is('variant_id', null)
      .single();

    const globalThreshold = globalConfig?.low_stock_threshold ?? 5;

    // Get all per-variant configs
    const { data: variantConfigs } = await this.db
      .from('stock_alert_config')
      .select('variant_id, low_stock_threshold')
      .not('variant_id', 'is', null);

    const thresholdMap = new Map<string, number>(
      (variantConfigs ?? []).map((c) => [c.variant_id!, c.low_stock_threshold])
    );

    // Query variants with product info
    const { data: variants, error } = await this.db
      .from('product_variants')
      .select(`
        id, sku, size, color_name, stock_qty, is_active,
        products!inner ( id, title, handle, published, deleted_at )
      `)
      .eq('is_active', true)
      .eq('products.published', true)
      .is('products.deleted_at', null)
      .order('stock_qty', { ascending: true });

    if (error) throw error;

    const results: StockAlertItem[] = [];
    for (const v of variants ?? []) {
      const threshold = thresholdMap.get(v.id) ?? globalThreshold;
      if (v.stock_qty <= threshold) {
        const product = Array.isArray(v.products) ? v.products[0] : v.products;
        results.push({
          variantId: v.id,
          sku: v.sku,
          size: v.size,
          colorName: v.color_name,
          stockQty: v.stock_qty,
          threshold,
          productId: product.id,
          productTitle: product.title,
          productHandle: product.handle,
          isSoldOut: v.stock_qty === 0,
        });
      }
    }

    return results;
  }

  /**
   * Update stock for a variant and log the movement.
   */
  async updateStock(input: InventoryMovementInput): Promise<{ newQty: number }> {
    // Get current stock
    const { data: variant, error: fetchErr } = await this.db
      .from('product_variants')
      .select('stock_qty')
      .eq('id', input.variantId)
      .single();

    if (fetchErr || !variant) throw new Error('Variant not found');

    const newQty = variant.stock_qty + input.delta;
    if (newQty < 0) throw new Error(`Stock would go negative (current: ${variant.stock_qty}, delta: ${input.delta})`);

    // Update variant stock
    const { error: updateErr } = await this.db
      .from('product_variants')
      .update({ stock_qty: newQty })
      .eq('id', input.variantId);

    if (updateErr) throw updateErr;

    // Log the movement
    await this.db.from('inventory_movements').insert({
      variant_id: input.variantId,
      delta: input.delta,
      reason: input.reason ?? 'admin_adjustment',
    });

    return { newQty };
  }

  /**
   * Set absolute stock level (not delta-based).
   */
  async setStock(variantId: string, qty: number, reason?: string): Promise<{ newQty: number }> {
    const { data: variant } = await this.db
      .from('product_variants')
      .select('stock_qty')
      .eq('id', variantId)
      .single();

    if (!variant) throw new Error('Variant not found');

    const delta = qty - variant.stock_qty;
    return this.updateStock({ variantId, delta, reason: reason ?? 'admin_set' });
  }

  /**
   * Get all variants for a product with their stock levels.
   */
  async getProductInventory(productId: string) {
    const { data: globalConfig } = await this.db
      .from('stock_alert_config')
      .select('low_stock_threshold')
      .is('variant_id', null)
      .single();

    const globalThreshold = globalConfig?.low_stock_threshold ?? 5;

    const { data: variants, error } = await this.db
      .from('product_variants')
      .select(`
        id, sku, size, color_name, color_hex, stock_qty, is_active, price,
        stock_alert_config ( low_stock_threshold )
      `)
      .eq('product_id', productId)
      .order('size')
      .order('color_name');

    if (error) throw error;

    return (variants ?? []).map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      colorName: v.color_name,
      colorHex: v.color_hex,
      price: v.price,
      stockQty: v.stock_qty,
      isActive: v.is_active,
      threshold: (Array.isArray(v.stock_alert_config) ? v.stock_alert_config[0] : v.stock_alert_config as { low_stock_threshold: number } | null)?.low_stock_threshold ?? globalThreshold,
      isSoldOut: v.stock_qty === 0,
      isLowStock: v.stock_qty > 0 && v.stock_qty <= ((Array.isArray(v.stock_alert_config) ? v.stock_alert_config[0] : v.stock_alert_config as { low_stock_threshold: number } | null)?.low_stock_threshold ?? globalThreshold),
    }));
  }

  /**
   * Get recent inventory movements for a variant.
   */
  async getMovements(variantId: string, limit = 50) {
    const { data, error } = await this.db
      .from('inventory_movements')
      .select('*')
      .eq('variant_id', variantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Get or update the global low-stock threshold.
   */
  async getGlobalThreshold(): Promise<number> {
    const { data } = await this.db
      .from('stock_alert_config')
      .select('low_stock_threshold')
      .is('variant_id', null)
      .single();
    return data?.low_stock_threshold ?? 5;
  }

  async setGlobalThreshold(threshold: number): Promise<void> {
    const { data: existing } = await this.db
      .from('stock_alert_config')
      .select('id')
      .is('variant_id', null)
      .single();

    if (existing) {
      await this.db
        .from('stock_alert_config')
        .update({ low_stock_threshold: threshold, updated_at: new Date().toISOString() })
        .is('variant_id', null);
    } else {
      await this.db
        .from('stock_alert_config')
        .insert({ low_stock_threshold: threshold });
    }
  }

  async setVariantThreshold(variantId: string, threshold: number): Promise<void> {
    const { data: existing } = await this.db
      .from('stock_alert_config')
      .select('id')
      .eq('variant_id', variantId)
      .single();

    if (existing) {
      await this.db
        .from('stock_alert_config')
        .update({ low_stock_threshold: threshold, updated_at: new Date().toISOString() })
        .eq('variant_id', variantId);
    } else {
      await this.db
        .from('stock_alert_config')
        .insert({ variant_id: variantId, low_stock_threshold: threshold });
    }
  }
}
