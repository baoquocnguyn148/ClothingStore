import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isSupabaseMode } from '@/lib/api/response';
import { assertAdmin } from '@/lib/api/admin-helper';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice } from '@/lib/commerce/format';
import { OrderStatusForm } from '@/components/admin/order-status-form';
import { PaymentBlock } from '@/components/admin/payment-block';
import { OrderQuickActions } from '@/components/admin/order-quick-actions';

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền',
};

export const metadata = {
  title: 'Chi tiết đơn hàng — Admin B&D',
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = await params;

  if (!isSupabaseMode()) {
    notFound();
  }

  await assertAdmin();
  const db = createAdminClient();

  const { data: order, error } = await db
    .from('orders')
    .select(
      `id, order_number, status, subtotal, discount_amount, shipping_fee, total, promotion_code, note, shipping_address, user_id, created_at, updated_at,
      order_items ( id, product_title, variant_size, variant_color, quantity, unit_price, image_url ),
      order_status_logs ( id, from_status, to_status, note, created_at ),
      payments ( id, provider, status, amount, transaction_ref, payment_url, created_at )`
    )
    .eq('id', orderId)
    .single();

  if (error || !order) {
    notFound();
  }

  const { data: profile } = await db
    .from('profiles')
    .select('full_name, phone')
    .eq('user_id', order.user_id)
    .maybeSingle();

  const items = order.order_items ?? [];
  const logs = [...(order.order_status_logs ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const payments = order.payments ?? [];
  const codPayment = payments.find((p: any) => p.provider === 'cod');
  const address = (order.shipping_address ?? {}) as {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    email?: string;
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header mb-8 flex flex-col gap-4">
        <div>
          <h1 className="admin-page-title">Chi tiết đơn hàng</h1>
          <p className="admin-page-subtitle">Mã đơn: {order.order_number}</p>
        </div>
        <Link href="/admin/orders" className="admin-btn admin-btn-secondary w-fit">
          Quay về danh sách
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
        <section className="space-y-6">
          <div className="admin-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h2 className="font-semibold mb-2">Thông tin khách hàng</h2>
                <p>{address.name || profile?.full_name || 'Khách lẻ'}</p>
                {address.email && <p className="text-sm text-gray-500">{address.email}</p>}
                <p className="text-sm text-gray-500">{address.phone || profile?.phone}</p>
              </div>
              <div>
                <h2 className="font-semibold mb-2">Tình trạng đơn</h2>
                <p className="text-lg font-bold">{STATUS_LABELS[order.status] ?? order.status}</p>
                <p className="text-sm text-gray-500">Ngày tạo: {new Date(order.created_at).toLocaleString('vi-VN')}</p>
                <p className="text-sm text-gray-500">Cập nhật: {new Date(order.updated_at).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>

          <div className="admin-card p-6">
            <h2 className="font-semibold mb-4">Địa chỉ giao hàng</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>{address.name ?? 'N/A'}</p>
              {address.phone && <p>{address.phone}</p>}
              {address.address && <p>{address.address}</p>}
              {address.city && <p>{address.city}</p>}
              {address.email && <p>{address.email}</p>}
            </div>
          </div>

          {order.note && (
            <div className="admin-card p-6">
              <h2 className="font-semibold mb-4">Ghi chú đơn hàng</h2>
              <p className="text-sm text-gray-700">{order.note}</p>
            </div>
          )}

          <div className="admin-card p-6">
            <h2 className="font-semibold mb-4">Sản phẩm</h2>
            <div className="space-y-4">
              {items.map((item: any) => (
                <div key={item.id} className="grid gap-3 sm:grid-cols-[1fr_auto] items-center border border-border rounded-xl p-4">
                  <div>
                    <p className="font-medium">{item.product_title}</p>
                    <p className="text-sm text-gray-500">
                      {item.variant_size && `Size: ${item.variant_size}`}
                      {item.variant_size && item.variant_color ? ' · ' : ''}
                      {item.variant_color && `Màu: ${item.variant_color}`}
                    </p>
                    <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="text-right font-semibold">{formatPrice(item.unit_price)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="admin-card p-6">
            <h2 className="font-semibold mb-4">Tóm tắt thanh toán</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount_amount != null && (
                <div className="flex justify-between">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>{formatPrice(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-border pt-3">
                <span>Tổng</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              {order.promotion_code && (
                <div className="text-sm text-gray-500">Mã khuyến mãi: {order.promotion_code}</div>
              )}
            </div>
          </div>

          <OrderQuickActions orderId={order.id} currentStatus={order.status} />

          <OrderStatusForm orderId={order.id} currentStatus={order.status} />

          {codPayment && <PaymentBlock orderId={order.id} codPayment={codPayment} orderStatus={order.status} />}

          <div className="admin-card p-6">
            <h2 className="font-semibold mb-4">Lịch sử trạng thái</h2>
            <div className="space-y-3 text-sm text-gray-700">
              {logs.length === 0 ? (
                <p className="text-gray-500">Chưa có lịch sử.</p>
              ) : (
                logs.map((log: any) => (
                  <div key={log.id} className="rounded-xl border border-border p-3">
                    <p className="font-medium">
                      {(log.from_status && STATUS_LABELS[log.from_status]) || 'Khởi tạo'} → {STATUS_LABELS[log.to_status] ?? log.to_status}
                    </p>
                    {log.note && <p className="text-sm text-gray-500">{log.note}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(log.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
