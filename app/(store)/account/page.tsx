'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { formatPrice } from '@/lib/commerce/format';
import { USE_SUPABASE } from '@/lib/config';
import { apiFetch } from '@/lib/api/client';
import { getSession, clearSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/client';
import { useWishlist } from '@/lib/wishlist/wishlist-context';

const statusLabel: Record<string, string> = {
  pending_payment: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  pending: 'Chờ xử lý',
};

export default function AccountDashboardPage() {
  const { count: wishlistCount } = useWishlist();
  const [name, setName] = useState('');
  const [orders, setOrders] = useState<Array<{
    id: string;
    order_number: string;
    date: string;
    status: string;
    total: number;
  }>>([]);
  const [addressCount, setAddressCount] = useState(0);

  useEffect(() => {
    async function load() {
      if (USE_SUPABASE) {
        try {
          const data = await apiFetch<{
            profile: { full_name: string; membership_tier: string };
            orders: Array<{
              id: string;
              order_number: string;
              created_at: string;
              status: string;
              total: number;
            }>;
            addresses: unknown[];
          }>('/me');
          setName(data.profile?.full_name ?? '');
          setAddressCount(data.addresses?.length ?? 0);
          setOrders(
            (data.orders ?? []).map((o) => ({
              id: o.id,
              order_number: o.order_number,
              date: new Date(o.created_at).toLocaleDateString('vi-VN'),
              status: o.status,
              total: o.total,
            }))
          );
        } catch {
          // unauthorized
        }
      } else {
        const user = getSession();
        if (user) {
          setName(user.name);
          setAddressCount(user.addresses.length);
          setOrders(
            user.orders.map((o) => ({
              id: o.id,
              order_number: o.id,
              date: o.date,
              status: o.status,
              total: o.total,
            }))
          );
        }
      }
    }
    load();
  }, []);

  const handleLogout = async () => {
    if (USE_SUPABASE) {
      await createClient().auth.signOut();
    } else {
      clearSession();
    }
    window.location.href = '/';
  };

  return (
    <div>
      <h1 className="text-heading-lg uppercase mb-2">Tài khoản</h1>
      <p className="text-secondary text-sm mb-8">
        Xin chào, <strong className="text-black">{name}</strong>
      </p>

      <section className="border border-border p-6 mb-6">
        <h2 className="font-bold uppercase mb-2">{BRAND.fullName} Membership</h2>
        <Link href="/pages/membership" className="text-sm font-bold underline">
          Tìm hiểu thêm
        </Link>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-border p-4">
          <p className="text-2xl font-bold">{orders.length}</p>
          <p className="text-xs text-secondary uppercase">Đơn hàng</p>
          <Link href="/account/orders" className="text-xs underline mt-2 inline-block">
            Xem tất cả
          </Link>
        </div>
        <div className="border border-border p-4">
          <p className="text-2xl font-bold">{wishlistCount}</p>
          <p className="text-xs text-secondary uppercase">Yêu thích</p>
          <Link href="/account/wishlist" className="text-xs underline mt-2 inline-block">
            Xem danh sách
          </Link>
        </div>
        <div className="border border-border p-4">
          <p className="text-2xl font-bold">{addressCount}</p>
          <p className="text-xs text-secondary uppercase">Địa chỉ</p>
          <Link href="/account/addresses" className="text-xs underline mt-2 inline-block">
            Quản lý
          </Link>
        </div>
      </div>

      {orders.length > 0 && (
        <section className="border border-border p-6 mb-6">
          <h2 className="font-bold uppercase mb-4">Đơn hàng gần đây</h2>
          <ul className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <li
                key={order.id}
                className="flex justify-between text-sm border-b border-border pb-3 last:border-0"
              >
                <span>
                  #{order.order_number} · {order.date}
                </span>
                <span>
                  {statusLabel[order.status] ?? order.status} · {formatPrice(order.total)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button type="button" onClick={handleLogout} className="btn-secondary">
        Đăng xuất
      </button>
    </div>
  );
}
