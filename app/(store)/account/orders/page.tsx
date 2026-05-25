'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/commerce/format';
import { USE_SUPABASE } from '@/lib/config';
import { apiFetch } from '@/lib/api/client';
import { getSession } from '@/lib/auth/session';

const statusLabel: Record<string, string> = {
  pending_payment: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  pending: 'Chờ xử lý',
};

interface OrderView {
  id: string;
  order_number: string;
  date: string;
  status: string;
  total: number;
  items: { product_title: string; quantity: number; unit_price: number }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderView[]>([]);

  useEffect(() => {
    async function load() {
      if (USE_SUPABASE) {
        const data = await apiFetch<{ orders: OrderView[] }>('/orders');
        setOrders(
          (data.orders ?? []).map((o: OrderView & { created_at?: string; order_items?: OrderView['items'] }) => ({
            ...o,
            date: o.date ?? new Date((o as { created_at: string }).created_at).toLocaleDateString('vi-VN'),
            items: o.items ?? (o as { order_items: OrderView['items'] }).order_items ?? [],
          }))
        );
      } else {
        const user = getSession();
        setOrders(
          (user?.orders ?? []).map((o) => ({
            id: o.id,
            order_number: o.id,
            date: o.date,
            status: o.status,
            total: o.total,
            items: o.items.map((i) => ({
              product_title: i.title,
              quantity: i.quantity,
              unit_price: i.price,
            })),
          }))
        );
      }
    }
    load();
  }, []);

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="text-heading-md uppercase mb-8">Đơn hàng</h1>
        <p className="text-secondary mb-6">Chưa có đơn hàng nào.</p>
        <Link href="/collections" className="btn-primary">
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-heading-md uppercase mb-8">Đơn hàng</h1>
      <ul className="space-y-6">
        {orders.map((order) => (
          <li key={order.id} className="border border-border p-6">
            <div className="flex flex-wrap justify-between gap-2 mb-4">
              <div>
                <Link href={`/account/orders/${order.id}`} className="font-bold hover:underline">
                  #{order.order_number}
                </Link>
                <p className="text-xs text-secondary">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{statusLabel[order.status] ?? order.status}</p>
                <p className="text-sm">{formatPrice(order.total)}</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm border-t border-border pt-4">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {item.product_title} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.unit_price * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
