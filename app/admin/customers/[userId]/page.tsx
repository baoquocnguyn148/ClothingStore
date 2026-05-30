import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ClipboardList, Heart, MessageSquare, ShoppingBag, User } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseMode } from '@/lib/api/response';
import { CustomerTierForm } from '@/components/admin/customer-tier-form';
import { CustomerCrmPanel } from '@/components/admin/customer-crm-panel';

export const metadata = { title: 'Chi tiết khách hàng - Admin B&D' };
export const dynamic = 'force-dynamic';

const REVENUE_STATUSES = ['paid', 'confirmed', 'shipping', 'delivered'];

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền',
};

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString('vi-VN') : '-';
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  if (!isSupabaseMode()) notFound();

  const db = createAdminClient();
  const { data: profile, error: profileError } = await db
    .from('profiles')
    .select('user_id, full_name, phone, membership_tier, role, created_at')
    .eq('user_id', userId)
    .single();

  if (profileError || !profile || profile.role !== 'customer') notFound();

  const [
    ordersResult,
    addressesResult,
    wishlistResult,
    reviewsResult,
    notesResult,
    tasksResult,
    ticketsResult,
  ] = await Promise.all([
    db
      .from('orders')
      .select('id, order_number, status, total, shipping_address, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    db
      .from('addresses')
      .select('id, name, phone, address_line, city, is_default, created_at')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false }),
    db
      .from('wishlist_items')
      .select('created_at, products ( id, handle, title )')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    db
      .from('product_reviews')
      .select('id, rating, title, body, published, verified, created_at, products ( title, handle )')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    db
      .from('crm_notes')
      .select('id, body, created_at')
      .eq('customer_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    db
      .from('crm_tasks')
      .select('id, title, body, due_at, status, priority, created_at')
      .eq('customer_user_id', userId)
      .order('status', { ascending: true })
      .order('due_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(20),
    db
      .from('crm_tickets')
      .select('id, subject, body, status, priority, created_at, order_id')
      .eq('customer_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const orders = ordersResult.data ?? [];
  const addresses = addressesResult.data ?? [];
  const wishlist = wishlistResult.data ?? [];
  const reviews = reviewsResult.data ?? [];
  const notes = notesResult.data ?? [];
  const tasks = tasksResult.data ?? [];
  const tickets = ticketsResult.data ?? [];
  const totalSpent = orders
    .filter((order) => REVENUE_STATUSES.includes(order.status))
    .reduce((sum, order) => sum + (order.total ?? 0), 0);
  const lastOrder = orders[0] ?? null;
  const latestShipping = (lastOrder?.shipping_address ?? {}) as { email?: string; name?: string; phone?: string };
  const displayName = profile.full_name || latestShipping.name || 'Khách chưa đặt tên';

  return (
    <div className="admin-page">
      <div className="admin-page-header mb-8 flex flex-col gap-4">
        <div>
          <Link href="/admin/customers" className="admin-back-link flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Quay lại danh sách khách hàng
          </Link>
          <h1 className="admin-page-title">{displayName}</h1>
          <p className="admin-page-subtitle">
            Customer 360 · tham gia từ {formatDate(profile.created_at)}
          </p>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <ShoppingBag size={22} />
          </div>
          <div className="admin-stat-body">
            <p className="admin-stat-value">{orders.length}</p>
            <p className="admin-stat-label">Tổng số đơn</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <ClipboardList size={22} />
          </div>
          <div className="admin-stat-body">
            <p className="admin-stat-value">{formatVND(totalSpent)}</p>
            <p className="admin-stat-label">Tổng chi tiêu hợp lệ</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Heart size={22} />
          </div>
          <div className="admin-stat-body">
            <p className="admin-stat-value">{wishlist.length}</p>
            <p className="admin-stat-label">Sản phẩm yêu thích</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <MessageSquare size={22} />
          </div>
          <div className="admin-stat-body">
            <p className="admin-stat-value">{reviews.length}</p>
            <p className="admin-stat-label">Đánh giá đã viết</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.4fr]">
        <aside className="space-y-6">
          <div className="admin-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <User size={22} />
              <h2 className="font-semibold">Hồ sơ khách hàng</h2>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="text-xs uppercase text-gray-400">Tên</p>
                <p className="font-medium">{displayName}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Số điện thoại</p>
                <p>{profile.phone || latestShipping.phone || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Email từ đơn gần nhất</p>
                <p>{latestShipping.email || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">User ID</p>
                <p className="break-all font-mono text-xs">{profile.user_id}</p>
              </div>
            </div>
          </div>

          <CustomerTierForm userId={profile.user_id} initialTier={profile.membership_tier ?? 'standard'} />

          <div className="admin-card p-6">
            <h2 className="font-semibold mb-4">Địa chỉ</h2>
            {addresses.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có địa chỉ lưu trong tài khoản.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div key={address.id} className="rounded-xl border border-border p-3 text-sm">
                    <div className="font-medium">
                      {address.name}
                      {address.is_default && <span className="ml-2 text-xs text-green-600">Mặc định</span>}
                    </div>
                    <p className="text-gray-500">{address.phone}</p>
                    <p className="text-gray-500">{address.address_line}, {address.city}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="admin-card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-semibold">Đơn hàng gần đây</h2>
              <Link href={`/admin/orders?search=${encodeURIComponent(displayName)}`} className="admin-card-link">
                Tìm trong đơn hàng
              </Link>
            </div>
            {orders.length === 0 ? (
              <p className="text-sm text-gray-500">Khách hàng chưa có đơn hàng.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Trạng thái</th>
                      <th>Tổng tiền</th>
                      <th>Ngày đặt</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="admin-table-mono">{order.order_number}</td>
                        <td>{STATUS_LABELS[order.status] ?? order.status}</td>
                        <td className="font-semibold">{formatVND(order.total)}</td>
                        <td className="text-gray-500">{formatDate(order.created_at)}</td>
                        <td className="text-right">
                          <Link href={`/admin/orders/${order.id}`} className="admin-btn admin-btn-secondary admin-btn-sm">
                            Xem
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="admin-card p-6">
              <h2 className="font-semibold mb-4">Wishlist</h2>
              {wishlist.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có sản phẩm yêu thích.</p>
              ) : (
                <div className="space-y-3">
                  {wishlist.map((item: any) => {
                    const product = Array.isArray(item.products) ? item.products[0] : item.products;
                    return (
                      <div key={`${product?.id}-${item.created_at}`} className="rounded-xl border border-border p-3 text-sm">
                        <Link href={`/admin/products/${product?.id}`} className="font-medium hover:underline">
                          {product?.title ?? 'Sản phẩm'}
                        </Link>
                        <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="admin-card p-6">
              <h2 className="font-semibold mb-4">Đánh giá</h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có đánh giá sản phẩm.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review: any) => {
                    const product = Array.isArray(review.products) ? review.products[0] : review.products;
                    return (
                      <div key={review.id} className="rounded-xl border border-border p-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{review.rating}/5 · {product?.title ?? 'Sản phẩm'}</p>
                          <span className={review.published ? 'text-green-600' : 'text-amber-600'}>
                            {review.published ? 'Đã duyệt' : 'Chờ duyệt'}
                          </span>
                        </div>
                        {review.title && <p className="mt-2">{review.title}</p>}
                        {review.body && <p className="mt-1 text-gray-500 line-clamp-2">{review.body}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <CustomerCrmPanel
            customerUserId={profile.user_id}
            notes={notes}
            tasks={tasks}
            tickets={tickets}
            orderOptions={orders.map((order) => ({
              id: order.id,
              orderNumber: order.order_number,
            }))}
          />
        </section>
      </div>
    </div>
  );
}
