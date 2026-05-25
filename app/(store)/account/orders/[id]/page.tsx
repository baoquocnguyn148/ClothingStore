'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { USE_SUPABASE } from '@/lib/config';
import { formatPrice } from '@/lib/commerce/format';
import { apiFetch } from '@/lib/api/client';
import { getSession } from '@/lib/auth/session';

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền',
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = typeof params.id === 'string' ? params.id : '';
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Không tìm thấy đơn hàng');
      setLoading(false);
      return;
    }

    async function loadOrder() {
      if (USE_SUPABASE) {
        try {
          const data = await apiFetch<{ order: unknown }>(`/orders/${orderId}`);
          setOrder(data.order);
        } catch {
          setError('Không thể tải đơn hàng');
        }
      } else {
        const session = getSession();
        const found = session?.orders.find((o) => o.id === orderId) ?? null;
        if (!found) {
          setError('Đơn hàng không tồn tại');
        } else {
          setOrder(found);
        }
      }
      setLoading(false);
    }

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container-mqb py-24 text-center">
        <p className="text-secondary">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-mqb py-24 text-center">
        <p className="text-red-500 mb-6">{error ?? 'Không tìm thấy đơn hàng'}</p>
        <Link href="/account/orders" className="btn-primary">
          Quay lại đơn hàng
        </Link>
      </div>
    );
  }

  const items = order.order_items ?? order.items ?? [];
  const shipping = order.shipping_address ?? null;
  const status = order.status ?? 'unknown';

  return (
    <div className="container-mqb py-12 md:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-secondary">Đơn hàng</p>
          <h1 className="text-heading-lg">#{order.order_number ?? order.id}</h1>
          <p className="text-secondary mt-2">
            Trạng thái: {STATUS_LABELS[status] ?? status}
          </p>
        </div>
        <Link href="/account/orders" className="btn-secondary">
          Quay lại danh sách
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Thông tin giao hàng</h2>
            {shipping ? (
              <div className="space-y-2 text-sm text-secondary">
                <p>{shipping.name}</p>
                <p>{shipping.phone}</p>
                <p>{shipping.address}</p>
                <p>{shipping.city}</p>
                {shipping.email && <p>{shipping.email}</p>}
              </div>
            ) : (
              <p className="text-sm text-secondary">Không có thông tin giao hàng.</p>
            )}
          </div>

          <div className="border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Sản phẩm</h2>
            <div className="space-y-4">
              {items.map((item: any, index: number) => (
                <div key={index} className="grid grid-cols-[1fr_auto] gap-4 items-center">
                  <div>
                    <p className="font-medium">{item.product_title ?? item.title}</p>
                    <p className="text-sm text-secondary">
                      {item.variant_size && `Size: ${item.variant_size} `}
                      {item.variant_color && `| Màu: ${item.variant_color}`}
                    </p>
                    <p className="text-sm text-secondary">Số lượng: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.unit_price ?? item.price)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatPrice(order.subtotal ?? 0)}</span>
              </div>
              {order.discount_amount != null && order.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              {order.shipping_fee != null && (
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(order.shipping_fee)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold border-t border-border pt-3">
                <span>Tổng</span>
                <span>{formatPrice(order.total ?? 0)}</span>
              </div>
            </div>
          </div>

          {order.note && (
            <div className="border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-4">Ghi chú đơn hàng</h2>
              <p className="text-sm text-secondary">{order.note}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
