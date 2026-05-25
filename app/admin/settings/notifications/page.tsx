import Link from 'next/link';
import { isSupabaseMode } from '@/lib/api/response';
import { AdminNotificationService, AdminNotification } from '@/lib/server/admin/dashboard.service';
import { EmailTemplateService, EmailTemplate } from '@/lib/server/admin/email-template.service';
import { Bell, Mail, ShieldCheck } from 'lucide-react';
import { NotificationsClient } from '@/components/admin/notifications-client';
import { EmailTemplateForm } from '@/components/admin/email-template-form';

export const metadata = { title: 'Thông báo — Cài đặt Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminNotificationSettingsPage() {
  const isSupa = isSupabaseMode();
  let notifications: AdminNotification[] = [];
  let unreadCount = 0;
  let templates: EmailTemplate[] = [];

  if (isSupa) {
    const service = new AdminNotificationService();
    const emailTemplateService = new EmailTemplateService();

    [notifications, unreadCount, templates] = await Promise.all([
      service.getNotifications({ unreadOnly: false, limit: 5 }),
      service.countUnread(),
      emailTemplateService.getTemplates(),
    ]);
  }

  return (
    <div className="admin-page max-w-6xl">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Thông báo &amp; email</h1>
          <p className="admin-page-subtitle">
            Quản lý thông báo admin và template email cho các trạng thái quan trọng.
          </p>
        </div>
        <div className="admin-page-actions">
          <Link href="/admin/notifications" className="admin-btn admin-btn-primary">
            Xem trung tâm thông báo
          </Link>
        </div>
      </div>

      {!isSupa && (
        <div className="admin-notice">
          <Bell size={16} />
          <span>Chế độ Mock — kết nối Supabase để truy cập dữ liệu thông báo và template email thực.</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div className="admin-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Mail size={24} className="text-slate-600" />
              <div>
                <h2 className="text-xl font-semibold">Email templates</h2>
                <p className="text-sm text-slate-500">
                  Chỉnh sửa tiêu đề và nội dung mẫu email gửi cho khách khi đơn hàng thay đổi trạng thái.
                </p>
              </div>
            </div>
          </div>

          {isSupa ? (
            <div className="space-y-4">
              {templates.map((template) => (
                <EmailTemplateForm
                  key={template.id}
                  id={template.id}
                  name={template.name}
                  type={template.type}
                  subject={template.subject}
                  body={template.body}
                />
              ))}
            </div>
          ) : (
            <div className="admin-card p-6">
              <p className="text-sm text-slate-700">
                Kết nối Supabase để quản lý và lưu các template email thực tế.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="admin-card p-6">
            <h2 className="text-lg font-semibold mb-3">Thông báo admin</h2>
            <p className="text-sm text-slate-500 mb-4">
              Số lượng thông báo chưa đọc và trạng thái thông báo sẽ giúp bạn theo dõi hoạt động đơn hàng.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Chưa đọc</p>
                  <p className="text-3xl font-semibold">{unreadCount}</p>
                </div>
                <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  {isSupa ? 'Supabase' : 'Mock mode'}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck size={24} className="text-slate-600" />
              <div>
                <h2 className="font-semibold">Hướng dẫn dùng</h2>
                <p className="text-sm text-slate-500">Sử dụng biến mẫu để cá nhân hóa email.</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <strong>
                  <code>{'{customer_name}'}</code>
                </strong>{' '}
                — tên khách hàng
              </li>
              <li>
                <strong>
                  <code>{'{order_number}'}</code>
                </strong>{' '}
                — mã đơn hàng
              </li>
              <li>
                <strong>
                  <code>{'{tracking_number}'}</code>
                </strong>{' '}
                — mã theo dõi vận chuyển
              </li>
            </ul>
          </div>

          <div className="admin-card p-6">
            <h2 className="text-lg font-semibold mb-3">Điều hướng</h2>
            <Link href="/admin/settings" className="admin-btn admin-btn-secondary">
              Quay lại Cài đặt
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
