import { isSupabaseMode } from '@/lib/api/response';
import { AdminNotificationService, AdminNotification } from '@/lib/server/admin/dashboard.service';
import { Bell, Check, CheckCircle2, RefreshCw } from 'lucide-react';
import { NotificationsClient } from '@/components/admin/notifications-client';
import { MarkReadButton } from '@/components/admin/mark-read-button';

export const metadata = { title: 'Thông báo — Admin B&D' };
export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  const isSupa = isSupabaseMode();
  let notifications: AdminNotification[] = [];
  let unreadCount = 0;

  if (isSupa) {
    const service = new AdminNotificationService();
    [notifications, unreadCount] = await Promise.all([
      service.getNotifications({ unreadOnly: false, limit: 100 }),
      service.countUnread(),
    ]);
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Thông báo</h1>
          <p className="admin-page-subtitle">
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
          </p>
        </div>
        <div className="admin-page-actions">
          <NotificationsClient unreadCount={unreadCount} />
        </div>
      </div>

      {!isSupa && (
        <div className="admin-notice">
          <Bell size={16} />
          <span>Chế độ Mock — kết nối Supabase để xem thông báo thực</span>
        </div>
      )}

      <div className="admin-card">
        {notifications.length === 0 ? (
          <div className="admin-empty-state">
            <Bell size={48} />
            <h3>Không có thông báo</h3>
          </div>
        ) : (
          <div className="admin-notif-list">
            {notifications.map((n) => (
              <div key={n.id} className={`admin-notif-item ${n.read ? 'read' : 'unread'}`}>
                <div className="admin-notif-dot" data-type={n.type} />
                <div className="admin-notif-body">
                  <p className="admin-notif-title">{n.title}</p>
                  {n.body && <p className="admin-notif-sub">{n.body}</p>}
                  <time className="admin-notif-time">
                    {new Date(n.createdAt).toLocaleString('vi-VN')}
                  </time>
                </div>
                {!n.read && (
                  <MarkReadButton notificationId={n.id} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
