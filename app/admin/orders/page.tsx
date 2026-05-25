import { isSupabaseMode } from '@/lib/api/response';
import { OrderService } from '@/lib/server/order/order.service';
import { Package, Search, ExternalLink, Download } from 'lucide-react';
import Link from 'next/link';
import { ExportButton } from '@/components/admin/export-button';

export const metadata = { title: 'Đơn hàng — Admin B&D' };
export const dynamic = 'force-dynamic';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  pending_payment: { label: 'Chờ thanh toán', class: 'text-orange-500' },
  paid: { label: 'Đã thanh toán', class: 'text-blue-500' },
  confirmed: { label: 'Đã xác nhận', class: 'text-purple-500' },
  shipping: { label: 'Đang giao', class: 'text-blue-600' },
  delivered: { label: 'Đã giao', class: 'text-green-500' },
  cancelled: { label: 'Đã hủy', class: 'text-red-500' },
  refunded: { label: 'Đã hoàn tiền', class: 'text-red-600' },
};

const STATUS_OPTIONS = [
  { key: '', label: 'Tất cả' },
  { key: 'pending_payment', label: 'Chờ thanh toán' },
  { key: 'paid', label: 'Đã thanh toán' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'cancelled', label: 'Đã hủy' },
  { key: 'refunded', label: 'Đã hoàn tiền' },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const isSupa = isSupabaseMode();
  let orders: Array<{
    id: string;
    order_number: string;
    status: string;
    total: number;
    created_at: string;
    customer_name: string;
    customer_phone: string;
  }> = [];
  let total = 0;
  let loadError: string | null = null;

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page ?? '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  if (!isSupa) {
    loadError =
      'Chế độ Supabase chưa bật trên server. Đặt COMMERCE_PROVIDER=supabase, NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY trong .env.local rồi khởi động lại dev server.';
  } else {
    try {
      const result = await new OrderService().listOrdersForAdmin({
        status: resolvedParams.status,
        search: resolvedParams.search,
        offset,
        limit,
      });
      orders = result.orders;
      total = result.total;
    } catch (e) {
      loadError = e instanceof Error ? e.message : 'Không tải được danh sách đơn';
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý đơn hàng</h1>
          <p className="admin-page-subtitle">{total} đơn hàng tìm thấy</p>
        </div>
        <div className="admin-page-actions">
          <ExportButton status={resolvedParams.status} search={resolvedParams.search} />
        </div>
      </div>

      {loadError && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </div>
      )}

      <div className="admin-card">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] mb-6">
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]" method="get" action="/admin/orders">
            <label className="sr-only" htmlFor="search">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="search"
                name="search"
                type="search"
                defaultValue={resolvedParams.search ?? ''}
                placeholder="Tìm theo mã đơn, tên khách hoặc SĐT"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-100 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary">
              Lọc
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {STATUS_OPTIONS.map((status) => {
              const selected = resolvedParams.status === status.key;
              const query: string[] = [];
              if (status.key) query.push(`status=${encodeURIComponent(status.key)}`);
              if (resolvedParams.search) query.push(`search=${encodeURIComponent(resolvedParams.search)}`);
              const href = `/admin/orders${query.length > 0 ? `?${query.join('&')}` : ''}`;
              return (
                <Link
                  key={status.key || 'all'}
                  href={href}
                  className={`admin-btn admin-btn-sm ${selected ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                >
                  {status.label}
                </Link>
              );
            })}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="admin-empty-state">
            <Package size={48} />
            <h3>Không có đơn hàng nào</h3>
            {!loadError && (
              <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                Nếu khách đã đặt hàng nhưng không thấy ở đây: kiểm tra đơn được tạo ở chế độ Supabase (không phải mock
                checkout), và tài khoản admin đang xem cùng project Supabase.
              </p>
            )}
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                  <th>Ngày đặt</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const st = STATUS_MAP[order.status] ?? { label: order.status, class: '' };

                  return (
                    <tr key={order.id}>
                      <td className="admin-table-mono">{order.order_number}</td>
                      <td>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-xs text-slate-400">{order.customer_phone}</div>
                      </td>
                      <td>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${st.class}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="font-semibold">{formatVND(order.total)}</td>
                      <td className="text-slate-400">{new Date(order.created_at).toLocaleString('vi-VN')}</td>
                      <td className="admin-table-center">
                        <Link href={`/admin/orders/${order.id}`} className="admin-btn admin-btn-secondary admin-btn-sm">
                          Chi tiết <ExternalLink size={14} className="ml-1" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-400">
              Hiển thị trang {page} trên {totalPages} — tổng {total} đơn hàng
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/orders?page=${page - 1}${resolvedParams.status ? `&status=${encodeURIComponent(resolvedParams.status)}` : ''}${resolvedParams.search ? `&search=${encodeURIComponent(resolvedParams.search)}` : ''}`}
                className={`admin-btn admin-btn-secondary ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                Trang trước
              </Link>
              <span className="text-sm text-slate-400">
                {page} / {totalPages}
              </span>
              <Link
                href={`/admin/orders?page=${page + 1}${resolvedParams.status ? `&status=${encodeURIComponent(resolvedParams.status)}` : ''}${resolvedParams.search ? `&search=${encodeURIComponent(resolvedParams.search)}` : ''}`}
                className={`admin-btn admin-btn-secondary ${page >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
              >
                Trang sau
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
