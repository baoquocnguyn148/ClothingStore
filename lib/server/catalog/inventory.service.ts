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
  note?: string;
  actorId?: string;
}

export interface InventoryVariantRow {
  variantId: string;
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  price: number;
  costPrice: number;
  stockQty: number;
  stockValue: number;
  isActive: boolean;
  threshold: number;
  isSoldOut: boolean;
  isLowStock: boolean;
  productId: string;
  productTitle: string;
  productHandle: string;
}

export interface InventoryMovementRow {
  id: string;
  variantId: string;
  delta: number;
  reason: string;
  note: string | null;
  actorId: string | null;
  referenceOrderId: string | null;
  createdAt: string;
  // Joined
  variantSku?: string;
  variantSize?: string;
  variantColorName?: string;
  productTitle?: string;
}

export interface InventorySummary {
  totalVariants: number;
  activeVariants: number;
  soldOutCount: number;
  lowStockCount: number;
  totalStockQty: number;
  totalStockValue: number; // cost price = 50% sell price
  totalSellValue: number;
}

export interface GetAllVariantsOptions {
  search?: string;
  status?: 'all' | 'in-stock' | 'low-stock' | 'sold-out';
  page?: number;
  pageSize?: number;
  sortBy?: 'stock_qty' | 'sku' | 'product_title' | 'price';
  sortDir?: 'asc' | 'desc';
}

export interface GetMovementsOptions {
  variantId?: string;
  productId?: string;
  reason?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export class InventoryService {
  private db = createAdminClient();

  // ────────────────────────────────────────────────
  // SUMMARY / KPIs
  // ────────────────────────────────────────────────

  async getInventorySummary(): Promise<InventorySummary> {
    const globalThreshold = await this.getGlobalThreshold();

    const { data: configs } = await this.db
      .from('stock_alert_config')
      .select('variant_id, low_stock_threshold')
      .not('variant_id', 'is', null);

    const thresholdMap = new Map<string, number>(
      (configs ?? []).map((c) => [c.variant_id!, c.low_stock_threshold])
    );

    const { data: variants, error } = await this.db
      .from('product_variants')
      .select('id, stock_qty, price, is_active');

    if (error) throw error;

    let soldOutCount = 0;
    let lowStockCount = 0;
    let totalStockQty = 0;
    let totalStockValue = 0;
    let totalSellValue = 0;
    let activeVariants = 0;

    for (const v of variants ?? []) {
      if (!v.is_active) continue;
      activeVariants++;
      const threshold = thresholdMap.get(v.id) ?? globalThreshold;
      totalStockQty += v.stock_qty;
      const costPrice = Math.round(v.price * 0.5);
      totalStockValue += v.stock_qty * costPrice;
      totalSellValue += v.stock_qty * v.price;

      if (v.stock_qty === 0) soldOutCount++;
      else if (v.stock_qty <= threshold) lowStockCount++;
    }

    return {
      totalVariants: variants?.length ?? 0,
      activeVariants,
      soldOutCount,
      lowStockCount,
      totalStockQty,
      totalStockValue,
      totalSellValue,
    };
  }

  // ────────────────────────────────────────────────
  // FULL INVENTORY LIST
  // ────────────────────────────────────────────────

  async getAllVariantsStock(options: GetAllVariantsOptions = {}): Promise<{
    items: InventoryVariantRow[];
    total: number;
  }> {
    const {
      search,
      status = 'all',
      page = 1,
      pageSize = 50,
      sortBy = 'product_title',
      sortDir = 'asc',
    } = options;

    const globalThreshold = await this.getGlobalThreshold();

    const { data: configs } = await this.db
      .from('stock_alert_config')
      .select('variant_id, low_stock_threshold')
      .not('variant_id', 'is', null);

    const thresholdMap = new Map<string, number>(
      (configs ?? []).map((c) => [c.variant_id!, c.low_stock_threshold])
    );

    let query = this.db
      .from('product_variants')
      .select(`
        id, sku, size, color_name, color_hex, price, stock_qty, is_active,
        products!inner ( id, title, handle, published, deleted_at )
      `)
      .eq('is_active', true)
      .eq('products.published', true)
      .is('products.deleted_at', null);

    if (search) {
      query = query.or(
        `sku.ilike.%${search}%,size.ilike.%${search}%,color_name.ilike.%${search}%`
      );
    }

    // Sort
    const validSortCols: Record<string, string> = {
      stock_qty: 'stock_qty',
      sku: 'sku',
      price: 'price',
      product_title: 'sku', // We sort by sku as proxy, then re-sort in JS
    };
    const col = validSortCols[sortBy] ?? 'sku';
    query = query.order(col, { ascending: sortDir === 'asc' });

    const { data: variants, error } = await query;
    if (error) throw error;

    let rows: InventoryVariantRow[] = (variants ?? []).map((v) => {
      const product = Array.isArray(v.products) ? v.products[0] : v.products;
      const threshold = thresholdMap.get(v.id) ?? globalThreshold;
      const costPrice = Math.round(v.price * 0.5);
      return {
        variantId: v.id,
        sku: v.sku,
        size: v.size,
        colorName: v.color_name,
        colorHex: v.color_hex,
        price: v.price,
        costPrice,
        stockQty: v.stock_qty,
        stockValue: v.stock_qty * costPrice,
        isActive: v.is_active,
        threshold,
        isSoldOut: v.stock_qty === 0,
        isLowStock: v.stock_qty > 0 && v.stock_qty <= threshold,
        productId: product.id,
        productTitle: product.title,
        productHandle: product.handle,
      };
    });

    // Filter by status in JS (simpler than complex SQL filter)
    if (status === 'sold-out') rows = rows.filter((r) => r.isSoldOut);
    else if (status === 'low-stock') rows = rows.filter((r) => r.isLowStock);
    else if (status === 'in-stock') rows = rows.filter((r) => !r.isSoldOut && !r.isLowStock);

    // Product title sort (JS level)
    if (sortBy === 'product_title') {
      rows.sort((a, b) =>
        sortDir === 'asc'
          ? a.productTitle.localeCompare(b.productTitle, 'vi')
          : b.productTitle.localeCompare(a.productTitle, 'vi')
      );
    }

    // Apply search to product title too
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.productTitle.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q) ||
          r.size.toLowerCase().includes(q) ||
          r.colorName.toLowerCase().includes(q)
      );
    }

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const items = rows.slice(start, start + pageSize);

    return { items, total };
  }

  // ────────────────────────────────────────────────
  // ALERTS (sold-out + low-stock)
  // ────────────────────────────────────────────────

  async getLowStockVariants(): Promise<StockAlertItem[]> {
    const { data: globalConfig } = await this.db
      .from('stock_alert_config')
      .select('low_stock_threshold')
      .is('variant_id', null)
      .single();

    const globalThreshold = globalConfig?.low_stock_threshold ?? 5;

    const { data: variantConfigs } = await this.db
      .from('stock_alert_config')
      .select('variant_id, low_stock_threshold')
      .not('variant_id', 'is', null);

    const thresholdMap = new Map<string, number>(
      (variantConfigs ?? []).map((c) => [c.variant_id!, c.low_stock_threshold])
    );

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

  // ────────────────────────────────────────────────
  // STOCK UPDATES
  // ────────────────────────────────────────────────

  async updateStock(input: InventoryMovementInput): Promise<{ newQty: number }> {
    const { data: variant, error: fetchErr } = await this.db
      .from('product_variants')
      .select('stock_qty')
      .eq('id', input.variantId)
      .single();

    if (fetchErr || !variant) throw new Error('Variant not found');

    const newQty = variant.stock_qty + input.delta;
    if (newQty < 0)
      throw new Error(`Stock would go negative (current: ${variant.stock_qty}, delta: ${input.delta})`);

    const { error: updateErr } = await this.db
      .from('product_variants')
      .update({ stock_qty: newQty })
      .eq('id', input.variantId);

    if (updateErr) throw updateErr;

    await this.db.from('inventory_movements').insert({
      variant_id: input.variantId,
      delta: input.delta,
      reason: input.reason ?? 'admin_adjustment',
      note: input.note ?? null,
      actor_id: input.actorId ?? null,
    });

    return { newQty };
  }

  async setStock(
    variantId: string,
    qty: number,
    reason?: string,
    note?: string,
    actorId?: string
  ): Promise<{ newQty: number }> {
    const { data: variant } = await this.db
      .from('product_variants')
      .select('stock_qty')
      .eq('id', variantId)
      .single();

    if (!variant) throw new Error('Variant not found');

    const delta = qty - variant.stock_qty;
    return this.updateStock({ variantId, delta, reason: reason ?? 'admin_set', note, actorId });
  }

  async bulkUpdateStock(
    items: Array<{ variantId: string; qty: number; reason?: string; note?: string }>,
    actorId?: string
  ): Promise<Array<{ variantId: string; newQty: number; error?: string }>> {
    const results: Array<{ variantId: string; newQty: number; error?: string }> = [];

    for (const item of items) {
      try {
        const result = await this.setStock(
          item.variantId,
          item.qty,
          item.reason ?? 'bulk_update',
          item.note,
          actorId
        );
        results.push({ variantId: item.variantId, newQty: result.newQty });
      } catch (e) {
        results.push({
          variantId: item.variantId,
          newQty: -1,
          error: e instanceof Error ? e.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  // ────────────────────────────────────────────────
  // PRODUCT INVENTORY
  // ────────────────────────────────────────────────

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

    return (variants ?? []).map((v) => {
      const cfg = Array.isArray(v.stock_alert_config)
        ? v.stock_alert_config[0]
        : (v.stock_alert_config as { low_stock_threshold: number } | null);
      const threshold = cfg?.low_stock_threshold ?? globalThreshold;
      const costPrice = Math.round(v.price * 0.5);
      return {
        id: v.id,
        sku: v.sku,
        size: v.size,
        colorName: v.color_name,
        colorHex: v.color_hex,
        price: v.price,
        costPrice,
        stockQty: v.stock_qty,
        stockValue: v.stock_qty * costPrice,
        isActive: v.is_active,
        threshold,
        isSoldOut: v.stock_qty === 0,
        isLowStock: v.stock_qty > 0 && v.stock_qty <= threshold,
      };
    });
  }

  // ────────────────────────────────────────────────
  // MOVEMENT HISTORY
  // ────────────────────────────────────────────────

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

  async getMovementsFiltered(options: GetMovementsOptions = {}): Promise<{
    items: InventoryMovementRow[];
    total: number;
  }> {
    const { variantId, reason, dateFrom, dateTo, page = 1, pageSize = 50 } = options;

    let query = this.db
      .from('inventory_movements')
      .select(`
        id, variant_id, delta, reason, note, actor_id, reference_order_id, created_at,
        product_variants!inner (
          sku, size, color_name,
          products!inner ( title )
        )
      `)
      .order('created_at', { ascending: false });

    if (variantId) query = query.eq('variant_id', variantId);
    if (reason) query = query.eq('reason', reason);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);

    const { data, error } = await query;
    if (error) throw error;

    const allItems: InventoryMovementRow[] = (data ?? []).map((m) => {
      const variant = Array.isArray(m.product_variants)
        ? m.product_variants[0]
        : m.product_variants;
      const product = variant
        ? Array.isArray(variant.products)
          ? variant.products[0]
          : variant.products
        : null;

      return {
        id: m.id,
        variantId: m.variant_id,
        delta: m.delta,
        reason: m.reason,
        note: m.note,
        actorId: m.actor_id,
        referenceOrderId: m.reference_order_id,
        createdAt: m.created_at,
        variantSku: variant?.sku,
        variantSize: variant?.size,
        variantColorName: variant?.color_name,
        productTitle: product?.title,
      };
    });

    const total = allItems.length;
    const start = (page - 1) * pageSize;
    const items = allItems.slice(start, start + pageSize);

    return { items, total };
  }

  // ────────────────────────────────────────────────
  // THRESHOLD CONFIG
  // ────────────────────────────────────────────────

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
      await this.db.from('stock_alert_config').insert({ low_stock_threshold: threshold });
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
