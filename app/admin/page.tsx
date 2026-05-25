import { DashboardService } from '@/lib/server/admin/dashboard.service';
import { AdminNotificationService } from '@/lib/server/admin/dashboard.service';
import { isSupabaseMode } from '@/lib/api/response';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  Package,
  CheckCircle,
  Clock,
  Truck,
} from 'lucide-react';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export default async function AdminDashboardPage() {
  const isSupa = isSupabaseMode();

  let stats = null;
  let notifications: Awaited<ReturnType<AdminNotificationService['getNotifications']>> = [];
  let chartData: { date: string; revenue: number; orders: number }[] = [];

  if (isSupa) {
    const dashboardService = new DashboardService();
    const notifService = new AdminNotificationService();
    [stats, notifications, chartData] = await Promise.all([
      dashboardService.getStats(),
      notifService.getNotifications({ unreadOnly: false, limit: 10 }),
      dashboardService.getRevenueChart(14),
    ]);
  }

  const statCards = stats
    ? [
        {
          label: 'Doanh thu hôm nay',
          value: formatVND(stats.revenue.today),
          sub: `Tháng này: ${formatVND(stats.revenue.thisMonth)}`,
          icon: TrendingUp,
          color: 'var(--admin-green)',
        },
        {
          label: 'Tổng đơn hàng',
          value: stats.orders.total.toLocaleString('vi-VN'),
          sub: `Hôm nay: ${stats.orders.todayCount} đơn`,
          icon: ShoppingBag,
          color: 'var(--admin-blue)',
        },
        {
          label: 'Khách hàng',
          value: stats.customers.total.toLocaleString('vi-VN'),
          sub: `Mới tháng này: ${stats.customers.newThisMonth}`,
          icon: Users,
          color: 'var(--admin-purple)',
        },
        {
          label: 'Cảnh báo tồn kho',
          value: stats.inventory.outOfStockCount + stats.inventory.lowStockCount,
          sub: `${stats.inventory.outOfStockCount} hết hàng · ${stats.inventory.lowStockCount} sắp hết`,
          icon: AlertTriangle,
          color: stats.inventory.outOfStockCount > 0 ? 'var(--admin-red)' : 'var(--admin-orange)',
        },
      ]
    : [];

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Tổng quan</h1>
        <p className="admin-page-subtitle">
          Chào mừng trở lại — đây là tình hình kinh doanh của bạn
        </p>
      </div>

      {!isSupa && (
        <div className="admin-notice">
          <AlertTriangle size={16} />
          <span>Chế độ Mock — kết nối Supabase để xem dữ liệu thực</span>
        </div>
      )}

      {/* Stat cards */}
      {stats && (
        <div className="admin-stat-grid">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="admin-stat-card">
                <div className="admin-stat-icon" style={{ '--icon-color': card.color } as React.CSSProperties}>
                  <Icon size={22} />
                </div>
                <div className="admin-stat-body">
                  <p className="admin-stat-value">{card.value}</p>
                  <p className="admin-stat-label">{card.label}</p>
                  <p className="admin-stat-sub">{card.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="admin-dashboard-grid">
        {/* Revenue chart */}
        <div className="admin-card admin-card-chart">
          <h2 className="admin-card-title">Doanh thu 14 ngày qua</h2>
          {chartData.length > 0 ? (
            <div className="admin-chart">
              {chartData.map((d) => (
                <div key={d.date} className="admin-chart-bar-wrap" title={`${d.date}: ${formatVND(d.revenue)}`}>
                  <div
                    className="admin-chart-bar"
                    style={{ height: `${Math.round((d.revenue / maxRevenue) * 100)}%` }}
                  />
                  <span className="admin-chart-label">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Order status breakdown */}
        {stats && (
          <div className="admin-card">
            <h2 className="admin-card-title">Trạng thái đơn hàng</h2>
            <div className="admin-status-list">
              {[
                { label: 'Chờ thanh toán', count: stats.orders.pending, icon: Clock, color: 'var(--admin-orange)' },
                { label: 'Đã thanh toán', count: stats.orders.paid, icon: Package, color: 'var(--admin-blue)' },
                { label: 'Đã xác nhận', count: stats.orders.confirmed, icon: Package, color: 'var(--admin-purple)' },
                { label: 'Đang giao', count: stats.orders.shipping, icon: Truck, color: 'var(--admin-blue)' },
                { label: 'Đã giao', count: stats.orders.delivered, icon: CheckCircle, color: 'var(--admin-green)' },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="admin-status-row">
                    <Icon size={16} style={{ color: s.color }} />
                    <span className="admin-status-label">{s.label}</span>
                    <span className="admin-status-count">{s.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent notifications */}
        <div className="admin-card admin-card-notifs">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Thông báo gần đây</h2>
            <a href="/admin/notifications" className="admin-card-link">Xem tất cả</a>
          </div>
          {notifications.length === 0 ? (
            <div className="admin-empty">Không có thông báo</div>
          ) : (
            <ul className="admin-notif-list">
              {notifications.map((n) => (
                <li key={n.id} className={`admin-notif-item ${n.read ? 'read' : 'unread'}`}>
                  <div className="admin-notif-dot" data-type={n.type} />
                  <div className="admin-notif-body">
                    <p className="admin-notif-title">{n.title}</p>
                    {n.body && <p className="admin-notif-sub">{n.body}</p>}
                    <time className="admin-notif-time">
                      {new Date(n.createdAt).toLocaleString('vi-VN')}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="admin-quick-actions">
        <h2 className="admin-card-title">Truy cập nhanh</h2>
        <div className="admin-quick-grid">
          {[
            { label: 'Quản lý đơn hàng', href: '/admin/orders', icon: ShoppingBag },
            { label: 'Kiểm tra tồn kho', href: '/admin/inventory', icon: Package },
            { label: 'Tạo khuyến mãi', href: '/admin/promotions/new', icon: AlertTriangle },
            { label: 'Duyệt đánh giá', href: '/admin/reviews', icon: Users },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <a key={action.href} href={action.href} className="admin-quick-btn">
                <Icon size={20} />
                <span>{action.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
