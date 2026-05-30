import { createAdminClient } from '@/lib/supabase/admin';
import { calculateRetentionRate, calculateRfmScores } from './analytics';

const REVENUE_STATUSES = ['paid', 'confirmed', 'shipping', 'delivered'];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysAgo(days: number) {
  const date = startOfDay(new Date());
  date.setDate(date.getDate() - days);
  return date;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  total: number;
  created_at: string;
};

type ProfileRow = {
  user_id: string;
  full_name: string;
  phone: string | null;
  membership_tier: string;
  created_at: string;
};

export class InformationSystemService {
  private db = createAdminClient();

  async getMisReport(days = 30) {
    const since = daysAgo(days).toISOString();

    const [ordersRes, profilesRes, variantsRes, tasksRes, ticketsRes, itemsRes] = await Promise.all([
      this.db
        .from('orders')
        .select('id, user_id, status, total, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false }),
      this.db
        .from('profiles')
        .select('user_id, full_name, phone, membership_tier, created_at')
        .eq('role', 'customer'),
      this.db
        .from('product_variants')
        .select('id, sku, size, color_name, stock_qty, is_active, products ( id, title, handle, published, deleted_at )')
        .eq('is_active', true),
      this.db
        .from('crm_tasks')
        .select('id, status, priority, due_at, customer_user_id, created_at')
        .gte('created_at', since),
      this.db
        .from('crm_tickets')
        .select('id, status, priority, customer_user_id, created_at')
        .gte('created_at', since),
      this.db
        .from('order_items')
        .select('product_title, quantity, unit_price, variant_id'),
    ]);

    if (ordersRes.error) throw ordersRes.error;
    if (profilesRes.error) throw profilesRes.error;
    if (variantsRes.error) throw variantsRes.error;
    if (tasksRes.error) throw tasksRes.error;
    if (ticketsRes.error) throw ticketsRes.error;
    if (itemsRes.error) throw itemsRes.error;

    const orders = (ordersRes.data ?? []) as OrderRow[];
    const profiles = (profilesRes.data ?? []) as ProfileRow[];
    const revenueOrders = orders.filter((order) => REVENUE_STATUSES.includes(order.status));
    const revenue = sum(revenueOrders.map((order) => order.total ?? 0));
    const orderCount = orders.length;
    const averageOrderValue = revenueOrders.length > 0 ? Math.round(revenue / revenueOrders.length) : 0;

    const statusCounts = new Map<string, number>();
    for (const order of orders) {
      statusCounts.set(order.status, (statusCounts.get(order.status) ?? 0) + 1);
    }

    const customerOrderCounts = new Map<string, number>();
    for (const order of revenueOrders) {
      customerOrderCounts.set(order.user_id, (customerOrderCounts.get(order.user_id) ?? 0) + 1);
    }
    const repeatCustomers = [...customerOrderCounts.values()].filter((count) => count >= 2).length;

    const topProductsMap = new Map<string, { title: string; quantity: number; revenue: number }>();
    for (const item of itemsRes.data ?? []) {
      const title = item.product_title ?? 'Unknown';
      const existing = topProductsMap.get(title) ?? { title, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity ?? 0;
      existing.revenue += (item.quantity ?? 0) * (item.unit_price ?? 0);
      topProductsMap.set(title, existing);
    }

    const lowStock = (variantsRes.data ?? []).filter((variant: any) => {
      const product = Array.isArray(variant.products) ? variant.products[0] : variant.products;
      return product?.published && !product?.deleted_at && (variant.stock_qty ?? 0) <= 5;
    });

    const rfm = calculateRfmScores(
      [...customerOrderCounts.entries()].map(([userId, orderCount]) => {
        const spent = revenueOrders
          .filter((order) => order.user_id === userId)
          .reduce((total, order) => total + (order.total ?? 0), 0);
        const lastOrderAt = revenueOrders
          .filter((order) => order.user_id === userId)
          .map((order) => order.created_at)
          .sort()
          .at(-1) ?? null;
        return { userId, orderCount, totalSpent: spent, lastOrderAt };
      })
    );

    return {
      periodDays: days,
      summary: {
        revenue,
        orderCount,
        averageOrderValue,
        customerCount: profiles.length,
        repeatCustomers,
        repeatRate: profiles.length > 0 ? Math.round((repeatCustomers / profiles.length) * 1000) / 10 : 0,
        vipByRfm: rfm.filter((row) => row.segment === 'vip').length,
        atRiskByRfm: rfm.filter((row) => row.segment === 'at_risk').length,
        openTasks: (tasksRes.data ?? []).filter((task) => task.status === 'open').length,
        openTickets: (ticketsRes.data ?? []).filter((ticket) => ['open', 'pending'].includes(ticket.status)).length,
        lowStockCount: lowStock.length,
      },
      orderStatus: [...statusCounts.entries()].map(([status, count]) => ({ status, count })),
      topProducts: [...topProductsMap.values()]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),
      crm: {
        tasksByStatus: this.countBy(tasksRes.data ?? [], 'status'),
        ticketsByStatus: this.countBy(ticketsRes.data ?? [], 'status'),
        overdueTasks: (tasksRes.data ?? []).filter((task) => task.status === 'open' && task.due_at && new Date(task.due_at) < new Date()).length,
        highPriorityTickets: (ticketsRes.data ?? []).filter((ticket) => ['open', 'pending'].includes(ticket.status) && ['high', 'urgent'].includes(ticket.priority)).length,
      },
      lowStock: lowStock.slice(0, 20).map((variant: any) => {
        const product = Array.isArray(variant.products) ? variant.products[0] : variant.products;
        return {
          sku: variant.sku,
          stockQty: variant.stock_qty,
          productTitle: product?.title ?? 'Unknown',
        };
      }),
    };
  }

  async getExecutiveDashboard() {
    const now = new Date();
    const currentStart = daysAgo(30);
    const previousStart = daysAgo(60);

    const [ordersRes, profilesRes, ticketsRes, variantsRes] = await Promise.all([
      this.db
        .from('orders')
        .select('id, user_id, status, total, created_at')
        .gte('created_at', previousStart.toISOString()),
      this.db
        .from('profiles')
        .select('user_id, full_name, phone, membership_tier, created_at')
        .eq('role', 'customer'),
      this.db
        .from('crm_tickets')
        .select('id, status, priority, created_at'),
      this.db
        .from('product_variants')
        .select('id, stock_qty, is_active, products ( published, deleted_at )')
        .eq('is_active', true),
    ]);

    if (ordersRes.error) throw ordersRes.error;
    if (profilesRes.error) throw profilesRes.error;
    if (ticketsRes.error) throw ticketsRes.error;
    if (variantsRes.error) throw variantsRes.error;

    const orders = (ordersRes.data ?? []) as OrderRow[];
    const currentOrders = orders.filter((order) => new Date(order.created_at) >= currentStart);
    const previousOrders = orders.filter((order) => {
      const date = new Date(order.created_at);
      return date >= previousStart && date < currentStart;
    });

    const currentRevenueOrders = currentOrders.filter((order) => REVENUE_STATUSES.includes(order.status));
    const previousRevenueOrders = previousOrders.filter((order) => REVENUE_STATUSES.includes(order.status));
    const currentRevenue = sum(currentRevenueOrders.map((order) => order.total ?? 0));
    const previousRevenue = sum(previousRevenueOrders.map((order) => order.total ?? 0));
    const currentCustomers = new Set(currentOrders.map((order) => order.user_id));
    const repeatCustomers = this.repeatCustomerCount(currentRevenueOrders);
    const retentionRate = calculateRetentionRate(orders, currentStart, previousStart, REVENUE_STATUSES);
    const totalCustomers = (profilesRes.data ?? []).length;
    const openTickets = (ticketsRes.data ?? []).filter((ticket) => ['open', 'pending'].includes(ticket.status)).length;
    const inventoryRisk = (variantsRes.data ?? []).filter((variant: any) => {
      const product = Array.isArray(variant.products) ? variant.products[0] : variant.products;
      return product?.published && !product?.deleted_at && (variant.stock_qty ?? 0) <= 5;
    }).length;

    return {
      asOf: now.toISOString(),
      kpis: [
        {
          label: '30d revenue',
          value: currentRevenue,
          change: pctChange(currentRevenue, previousRevenue),
          format: 'currency',
        },
        {
          label: '30d orders',
          value: currentOrders.length,
          change: pctChange(currentOrders.length, previousOrders.length),
          format: 'number',
        },
        {
          label: 'Active customers',
          value: currentCustomers.size,
          change: 0,
          format: 'number',
        },
        {
          label: 'Repeat rate',
          value: totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 1000) / 10 : 0,
          change: 0,
          format: 'percent',
        },
        {
          label: 'Retention',
          value: retentionRate,
          change: 0,
          format: 'percent',
        },
      ],
      risks: [
        {
          label: 'Open CRM tickets',
          value: openTickets,
          severity: openTickets > 10 ? 'high' : openTickets > 0 ? 'medium' : 'low',
        },
        {
          label: 'Low stock variants',
          value: inventoryRisk,
          severity: inventoryRisk > 10 ? 'high' : inventoryRisk > 0 ? 'medium' : 'low',
        },
        {
          label: 'Cancelled/refunded orders',
          value: currentOrders.filter((order) => ['cancelled', 'refunded'].includes(order.status)).length,
          severity: 'medium',
        },
      ],
      trend: this.groupRevenueByDate(currentRevenueOrders, 30),
    };
  }

  async getDecisionSupport() {
    const [ordersRes, profilesRes, variantsRes, itemsRes, tasksRes, ticketsRes, wishlistRes] = await Promise.all([
      this.db
        .from('orders')
        .select('id, user_id, status, total, created_at')
        .order('created_at', { ascending: false }),
      this.db
        .from('profiles')
        .select('user_id, full_name, phone, membership_tier, created_at')
        .eq('role', 'customer'),
      this.db
        .from('product_variants')
        .select('id, sku, stock_qty, products ( id, title, handle, published, deleted_at )')
        .eq('is_active', true),
      this.db
        .from('order_items')
        .select('variant_id, product_title, quantity, unit_price'),
      this.db
        .from('crm_tasks')
        .select('id, customer_user_id, title, due_at, status, priority')
        .eq('status', 'open')
        .order('due_at', { ascending: true, nullsFirst: false })
        .limit(20),
      this.db
        .from('crm_tickets')
        .select('id, customer_user_id, subject, status, priority, created_at')
        .in('status', ['open', 'pending'])
        .order('priority', { ascending: false })
        .limit(20),
      this.db
        .from('wishlist_items')
        .select('user_id, product_id, created_at'),
    ]);

    if (ordersRes.error) throw ordersRes.error;
    if (profilesRes.error) throw profilesRes.error;
    if (variantsRes.error) throw variantsRes.error;
    if (itemsRes.error) throw itemsRes.error;
    if (tasksRes.error) throw tasksRes.error;
    if (ticketsRes.error) throw ticketsRes.error;
    if (wishlistRes.error) throw wishlistRes.error;

    const orders = (ordersRes.data ?? []) as OrderRow[];
    const profiles = (profilesRes.data ?? []) as ProfileRow[];
    const profileByUser = new Map(profiles.map((profile) => [profile.user_id, profile]));
    const customerStats = this.customerStats(orders);
    const rfmRows = calculateRfmScores(
      profiles.map((profile) => {
        const stat = customerStats.get(profile.user_id) ?? { totalSpent: 0, orderCount: 0, lastOrderAt: null };
        return { userId: profile.user_id, ...stat };
      })
    );
    const rfmByUser = new Map(rfmRows.map((row) => [row.userId, row]));
    const sixtyDaysAgo = daysAgo(60);

    const vipCustomers = [...customerStats.entries()]
      .map(([userId, stat]) => ({ userId, stat, profile: profileByUser.get(userId) }))
      .filter((row) => row.profile?.membership_tier === 'vip' || rfmByUser.get(row.userId)?.segment === 'vip')
      .sort((a, b) => b.stat.totalSpent - a.stat.totalSpent)
      .slice(0, 10);

    const atRiskCustomers = [...customerStats.entries()]
      .map(([userId, stat]) => ({ userId, stat, profile: profileByUser.get(userId) }))
      .filter((row) => rfmByUser.get(row.userId)?.segment === 'at_risk' || (row.stat.lastOrderAt && new Date(row.stat.lastOrderAt) < sixtyDaysAgo))
      .sort((a, b) => b.stat.totalSpent - a.stat.totalSpent)
      .slice(0, 10);

    const newNoOrderCustomers = profiles
      .filter((profile) => !customerStats.has(profile.user_id))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 10);

    const soldByVariant = new Map<string, number>();
    for (const item of itemsRes.data ?? []) {
      if (!item.variant_id) continue;
      soldByVariant.set(item.variant_id, (soldByVariant.get(item.variant_id) ?? 0) + (item.quantity ?? 0));
    }

    const productSuggestions = (variantsRes.data ?? [])
      .map((variant: any) => {
        const product = Array.isArray(variant.products) ? variant.products[0] : variant.products;
        const soldQty = soldByVariant.get(variant.id) ?? 0;
        const stockQty = variant.stock_qty ?? 0;
        let action = '';
        let reason = '';

        if (stockQty <= 5 && soldQty > 0) {
          action = 'Restock';
          reason = `Stock ${stockQty}, sold ${soldQty}`;
        } else if (stockQty > 20 && soldQty === 0) {
          action = 'Consider discount';
          reason = `Stock ${stockQty}, no recorded sales`;
        }

        return {
          productTitle: product?.title ?? 'Unknown',
          sku: variant.sku,
          stockQty,
          soldQty,
          action,
          reason,
        };
      })
      .filter((item) => item.action)
      .slice(0, 20);

    return {
      customerSegments: {
        vipCustomers: vipCustomers.map((row) => this.customerDecisionRow(row.userId, row.profile, row.stat, rfmByUser.get(row.userId))),
        atRiskCustomers: atRiskCustomers.map((row) => this.customerDecisionRow(row.userId, row.profile, row.stat, rfmByUser.get(row.userId))),
        newNoOrderCustomers: newNoOrderCustomers.map((profile) => ({
          userId: profile.user_id,
          name: profile.full_name || profile.user_id,
          phone: profile.phone,
          totalSpent: 0,
          orderCount: 0,
          lastOrderAt: null,
          recommendation: 'Send welcome offer',
        })),
      },
      productSuggestions,
      crmPriorities: {
        overdueTasks: (tasksRes.data ?? []).filter((task) => task.due_at && new Date(task.due_at) < new Date()),
        urgentTickets: (ticketsRes.data ?? []).filter((ticket) => ['high', 'urgent'].includes(ticket.priority)),
      },
      wishlistSignals: {
        count: (wishlistRes.data ?? []).length,
      },
    };
  }

  private countBy(rows: any[], key: string) {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const value = row[key] ?? 'unknown';
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts.entries()].map(([label, count]) => ({ label, count }));
  }

  private repeatCustomerCount(orders: OrderRow[]) {
    const counts = new Map<string, number>();
    for (const order of orders) {
      counts.set(order.user_id, (counts.get(order.user_id) ?? 0) + 1);
    }
    return [...counts.values()].filter((count) => count >= 2).length;
  }

  private groupRevenueByDate(orders: OrderRow[], days: number) {
    const byDate = new Map<string, number>();
    for (const order of orders) {
      const date = order.created_at.slice(0, 10);
      byDate.set(date, (byDate.get(date) ?? 0) + (order.total ?? 0));
    }

    const result: Array<{ date: string; revenue: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = daysAgo(i).toISOString().slice(0, 10);
      result.push({ date, revenue: byDate.get(date) ?? 0 });
    }
    return result;
  }

  private customerStats(orders: OrderRow[]) {
    const stats = new Map<string, { totalSpent: number; orderCount: number; lastOrderAt: string | null }>();
    for (const order of orders.filter((item) => REVENUE_STATUSES.includes(item.status))) {
      const existing = stats.get(order.user_id) ?? { totalSpent: 0, orderCount: 0, lastOrderAt: null };
      existing.totalSpent += order.total ?? 0;
      existing.orderCount += 1;
      if (!existing.lastOrderAt || order.created_at > existing.lastOrderAt) {
        existing.lastOrderAt = order.created_at;
      }
      stats.set(order.user_id, existing);
    }
    return stats;
  }

  private customerDecisionRow(
    userId: string,
    profile: ProfileRow | undefined,
    stat: { totalSpent: number; orderCount: number; lastOrderAt: string | null },
    rfm?: { score: number; segment: string; recencyDays: number | null }
  ) {
    return {
      userId,
      name: profile?.full_name || userId,
      phone: profile?.phone ?? null,
      totalSpent: stat.totalSpent,
      orderCount: stat.orderCount,
      lastOrderAt: stat.lastOrderAt,
      rfmScore: rfm?.score ?? 0,
      rfmSegment: rfm?.segment ?? 'standard',
      recencyDays: rfm?.recencyDays ?? null,
      recommendation:
        profile?.membership_tier === 'vip' || rfm?.segment === 'vip'
          ? 'Prioritize personal care'
          : 'Send win-back offer',
    };
  }
}
