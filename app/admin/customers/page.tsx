import Link from 'next/link';
import { Search, Users, ExternalLink } from 'lucide-react';
import { isSupabaseMode } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata = { title: 'Khách hàng - Admin B&D' };
export const dynamic = 'force-dynamic';

const ACTIVE_ORDER_STATUSES = ['paid', 'confirmed', 'shipping', 'delivered'];

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function tierClass(tier: string) {
  if (tier === 'vip') return 'bg-purple-100 text-purple-800';
  if (tier === 'gold') return 'bg-amber-100 text-amber-800';
  if (tier === 'silver') return 'bg-slate-100 text-slate-700';
  return 'bg-gray-100 text-gray-700';
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; tier?: string; page?: string }>;
}) {
  const isSupa = isSupabaseMode();
  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page ?? '1', 10) || 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  let customers: Array<{
    userId: string;
    fullName: string;
    phone: string;
    email: string;
    tier: string;
    createdAt: string;
    orderCount: number;
    totalSpent: number;
    lastOrderAt: string | null;
  }> = [];
  let total = 0;
  let loadError: string | null = null;

  if (!isSupa) {
    loadError = 'Kết nối Supabase để xem dữ liệu khách hàng thật.';
  } else {
    try {
      const db = createAdminClient();
      let q = db
        .from('profiles')
        .select('user_id, full_name, phone, membership_tier, created_at', { count: 'exact' })
        .eq('role', 'customer')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (resolvedParams.search) {
        const like = `%${resolvedParams.search.replace(/[\\%_]/g, '\\$&')}%`;
        q = q.or(`full_name.ilike.${like},phone.ilike.${like}`);
      }
      if (resolvedParams.tier) q = q.eq('membership_tier', resolvedParams.tier);

      const { data: profiles, count, error } = await q;
      if (error) throw error;

      total = count ?? 0;
      const userIds = (profiles ?? []).map((p) => p.user_id);
      const orderMap = new Map<
        string,
        { orderCount: number; totalSpent: number; lastOrderAt: string | null; email: string }
      >();

      if (userIds.length > 0) {
        const { data: orders, error: ordersError } = await db
          .from('orders')
          .select('user_id, status, total, created_at, shipping_address')
          .in('user_id', userIds)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        for (const order of orders ?? []) {
          const existing = orderMap.get(order.user_id) ?? {
            orderCount: 0,
            totalSpent: 0,
            lastOrderAt: null,
            email: '',
          };
          const shipping = (order.shipping_address ?? {}) as { email?: string };
          existing.orderCount += 1;
          if (ACTIVE_ORDER_STATUSES.includes(order.status)) {
            existing.totalSpent += order.total ?? 0;
          }
          if (!existing.lastOrderAt || order.created_at > existing.lastOrderAt) {
            existing.lastOrderAt = order.created_at;
          }
          if (!existing.email && shipping.email) existing.email = shipping.email;
          orderMap.set(order.user_id, existing);
        }
      }

      customers = (profiles ?? []).map((profile) => {
        const commerce = orderMap.get(profile.user_id);
        return {
          userId: profile.user_id,
          fullName: profile.full_name || 'Khách chưa đặt tên',
          phone: profile.phone ?? '',
          email: commerce?.email ?? '',
          tier: profile.membership_tier ?? 'standard',
          createdAt: profile.created_at,
          orderCount: commerce?.orderCount ?? 0,
          totalSpent: commerce?.totalSpent ?? 0,
          lastOrderAt: commerce?.lastOrderAt ?? null,
        };
      });
    } catch (e) {
      loadError = e instanceof Error ? e.message : 'Không tải được danh sách khách hàng.';
    }
  }

  const totalPages = Math.ceil(total / limit);
  const tiers = [
    { key: '', label: 'Tất cả' },
    { key: 'standard', label: 'Standard' },
    { key: 'silver', label: 'Silver' },
    { key: 'gold', label: 'Gold' },
    { key: 'vip', label: 'VIP' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Khách hàng</h1>
          <p className="admin-page-subtitle">
            {total.toLocaleString('vi-VN')} khách hàng trong hệ thống
          </p>
        </div>
      </div>

      {loadError && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </div>
      )}

      <div className="admin-card">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] mb-6">
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]" method="get" action="/admin/customers">
            {resolvedParams.tier && <input type="hidden" name="tier" value={resolvedParams.tier} />}
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
                placeholder="Tìm theo tên hoặc số điện thoại"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-100 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary">
              Lọc
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {tiers.map((tier) => {
              const selected = (resolvedParams.tier ?? '') === tier.key;
              const query: string[] = [];
              if (tier.key) query.push(`tier=${encodeURIComponent(tier.key)}`);
              if (resolvedParams.search) query.push(`search=${encodeURIComponent(resolvedParams.search)}`);
              const href = `/admin/customers${query.length > 0 ? `?${query.join('&')}` : ''}`;
              return (
                <Link
                  key={tier.key || 'all'}
                  href={href}
                  className={`admin-btn admin-btn-sm ${selected ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                >
                  {tier.label}
                </Link>
              );
            })}
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="admin-empty-state">
            <Users size={48} />
            <h3>Chưa có khách hàng</h3>
            <p>Khách hàng sẽ xuất hiện sau khi đăng ký hoặc đặt hàng ở chế độ Supabase.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Tier</th>
                  <th>Số đơn</th>
                  <th>Tổng chi tiêu</th>
                  <th>Đơn gần nhất</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.userId}>
                    <td>
                      <div className="font-medium">{customer.fullName}</div>
                      <div className="text-xs text-slate-400">
                        {[customer.phone, customer.email].filter(Boolean).join(' · ') || customer.userId}
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tierClass(customer.tier)}`}>
                        {customer.tier}
                      </span>
                    </td>
                    <td>{customer.orderCount}</td>
                    <td className="font-semibold">{formatVND(customer.totalSpent)}</td>
                    <td className="text-slate-400">
                      {customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleString('vi-VN') : '-'}
                    </td>
                    <td className="admin-table-center">
                      <Link href={`/admin/customers/${customer.userId}`} className="admin-btn admin-btn-secondary admin-btn-sm">
                        Chi tiết <ExternalLink size={14} className="ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-400">
              Hiển thị trang {page} trên {totalPages} · tổng {total} khách hàng
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/customers?page=${page - 1}${resolvedParams.tier ? `&tier=${encodeURIComponent(resolvedParams.tier)}` : ''}${resolvedParams.search ? `&search=${encodeURIComponent(resolvedParams.search)}` : ''}`}
                className={`admin-btn admin-btn-secondary ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                Trang trước
              </Link>
              <span className="text-sm text-slate-400">{page} / {totalPages}</span>
              <Link
                href={`/admin/customers?page=${page + 1}${resolvedParams.tier ? `&tier=${encodeURIComponent(resolvedParams.tier)}` : ''}${resolvedParams.search ? `&search=${encodeURIComponent(resolvedParams.search)}` : ''}`}
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
