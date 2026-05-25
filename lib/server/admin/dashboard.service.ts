import { createAdminClient } from '@/lib/supabase/admin';

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  entity: string | null;
  entityId: string | null;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  orders: {
    total: number;
    pending: number;
    paid: number;
    confirmed: number;
    shipping: number;
    delivered: number;
    todayCount: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
  };
  inventory: {
    lowStockCount: number;
    outOfStockCount: number;
  };
  unreadNotifications: number;
}

export class AdminNotificationService {
  private db = createAdminClient();

  /**
   * Get admin notifications with optional filter.
   */
  async getNotifications(opts?: { unreadOnly?: boolean; limit?: number }): Promise<AdminNotification[]> {
    let query = this.db
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(opts?.limit ?? 50);

    if (opts?.unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body ?? null,
      entity: n.entity ?? null,
      entityId: n.entity_id ?? null,
      read: n.read,
      createdAt: n.created_at,
    }));
  }

  /**
   * Mark a notification as read.
   */
  async markRead(notificationId: string): Promise<void> {
    await this.db
      .from('admin_notifications')
      .update({ read: true })
      .eq('id', notificationId);
  }

  /**
   * Mark all notifications as read.
   */
  async markAllRead(): Promise<void> {
    await this.db
      .from('admin_notifications')
      .update({ read: true })
      .eq('read', false);
  }

  /**
   * Count unread notifications.
   */
  async countUnread(): Promise<number> {
    const { count } = await this.db
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);
    return count ?? 0;
  }
}

export class DashboardService {
  private db = createAdminClient();

  /**
   * Get comprehensive dashboard statistics.
   */
  async getStats(): Promise<DashboardStats> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      revenueResult,
      ordersResult,
      customersResult,
      inventoryResult,
      unreadCount,
    ] = await Promise.all([
      this.getRevenueStats(todayStart, weekStart, monthStart),
      this.getOrderStats(todayStart),
      this.getCustomerStats(monthStart),
      this.getInventoryAlertCounts(),
      new AdminNotificationService().countUnread(),
    ]);

    return {
      revenue: revenueResult,
      orders: ordersResult,
      customers: customersResult,
      inventory: inventoryResult,
      unreadNotifications: unreadCount,
    };
  }

  private async getRevenueStats(todayStart: string, weekStart: string, monthStart: string) {
    const { data: allOrders } = await this.db
      .from('orders')
      .select('total, created_at')
      .in('status', ['paid', 'confirmed', 'shipping', 'delivered']);

    const orders = allOrders ?? [];
    const total = orders.reduce((s, o) => s + (o.total ?? 0), 0);
    const today = orders.filter((o) => o.created_at >= todayStart).reduce((s, o) => s + (o.total ?? 0), 0);
    const thisWeek = orders.filter((o) => o.created_at >= weekStart).reduce((s, o) => s + (o.total ?? 0), 0);
    const thisMonth = orders.filter((o) => o.created_at >= monthStart).reduce((s, o) => s + (o.total ?? 0), 0);

    return { today, thisWeek, thisMonth, total };
  }

  private async getOrderStats(todayStart: string) {
    const { data: orders } = await this.db
      .from('orders')
      .select('status, created_at');

    const all = orders ?? [];
    return {
      total: all.length,
      pending: all.filter((o) => o.status === 'pending_payment').length,
      paid: all.filter((o) => o.status === 'paid').length,
      confirmed: all.filter((o) => o.status === 'confirmed').length,
      shipping: all.filter((o) => o.status === 'shipping').length,
      delivered: all.filter((o) => o.status === 'delivered').length,
      todayCount: all.filter((o) => o.created_at >= todayStart).length,
    };
  }

  private async getCustomerStats(monthStart: string) {
    const { count: total } = await this.db
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    const { count: newThisMonth } = await this.db
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')
      .gte('created_at', monthStart);

    return { total: total ?? 0, newThisMonth: newThisMonth ?? 0 };
  }

  private async getInventoryAlertCounts() {
    // Get global threshold
    const { data: cfg } = await this.db
      .from('stock_alert_config')
      .select('low_stock_threshold')
      .is('variant_id', null)
      .single();
    const threshold = cfg?.low_stock_threshold ?? 5;

    const { count: outOfStock } = await this.db
      .from('product_variants')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('stock_qty', 0);

    const { count: lowStock } = await this.db
      .from('product_variants')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gt('stock_qty', 0)
      .lte('stock_qty', threshold);

    return {
      outOfStockCount: outOfStock ?? 0,
      lowStockCount: lowStock ?? 0,
    };
  }

  /**
   * Get revenue chart data for the last N days.
   */
  async getRevenueChart(days = 30): Promise<{ date: string; revenue: number; orders: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data } = await this.db
      .from('orders')
      .select('total, created_at')
      .in('status', ['paid', 'confirmed', 'shipping', 'delivered'])
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    // Group by date
    const byDate = new Map<string, { revenue: number; orders: number }>();
    for (const order of data ?? []) {
      const date = order.created_at.slice(0, 10);
      const existing = byDate.get(date) ?? { revenue: 0, orders: 0 };
      byDate.set(date, {
        revenue: existing.revenue + (order.total ?? 0),
        orders: existing.orders + 1,
      });
    }

    // Fill all days in range
    const result: { date: string; revenue: number; orders: number }[] = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      result.push({ date, ...(byDate.get(date) ?? { revenue: 0, orders: 0 }) });
    }

    return result;
  }
}
