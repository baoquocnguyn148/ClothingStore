import Link from 'next/link';

export const metadata = { title: 'Settings — Admin' };
export const dynamic = 'force-dynamic';

export default function AdminSettingsPage() {
  return (
    <div className="admin-page max-w-4xl">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Cài đặt hệ thống</h1>
          <p className="admin-page-subtitle">Các thiết lập admin sẽ sớm được tích hợp vào giao diện này.</p>
        </div>
      </div>

      <div className="admin-card p-6 space-y-4">
        <p className="text-sm text-gray-700">Chọn một mục trong thanh điều hướng để tiếp tục.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/admin/settings/shipping" className="admin-card-link">Cài đặt vận chuyển</Link>
          <Link href="/admin/settings/notifications" className="admin-card-link">Thông báo &amp; email</Link>
        </div>
      </div>
    </div>
  );
}
