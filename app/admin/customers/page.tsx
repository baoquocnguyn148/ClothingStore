import Link from 'next/link';

export const metadata = { title: 'Customers Admin — Coming Soon' };
export const dynamic = 'force-dynamic';

export default function AdminCustomersPage() {
  return (
    <div className="admin-page max-w-4xl">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Khách hàng</h1>
          <p className="admin-page-subtitle">Quản lý khách hàng sẽ xuất hiện tại đây trong bản cập nhật tiếp theo.</p>
        </div>
      </div>
      <div className="admin-card p-6">
        <p className="text-sm text-gray-700">Hiện tại chưa có dữ liệu quản lý khách hàng trong phiên bản này.</p>
        <Link href="/admin" className="mt-4 inline-flex admin-btn admin-btn-secondary">
          Quay về trang quản trị
        </Link>
      </div>
    </div>
  );
}
