'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { formatPrice } from '@/lib/commerce/format';
import { USE_SUPABASE } from '@/lib/config';
import { apiFetch } from '@/lib/api/client';
import { getSession } from '@/lib/auth/session';
import { useWishlist } from '@/lib/wishlist/wishlist-context';
import { Package, Heart, MapPin, ChevronRight, ArrowRight } from 'lucide-react';

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending_payment: { label: 'Chờ thanh toán', bg: 'bg-orange-100', text: 'text-orange-700' },
  paid: { label: 'Đã thanh toán', bg: 'bg-blue-100', text: 'text-blue-700' },
  confirmed: { label: 'Đã xác nhận', bg: 'bg-indigo-100', text: 'text-indigo-700' },
  shipping: { label: 'Đang giao', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  delivered: { label: 'Đã giao', bg: 'bg-green-100', text: 'text-green-700' },
  cancelled: { label: 'Đã hủy', bg: 'bg-red-100', text: 'text-red-700' },
  pending: { label: 'Chờ xử lý', bg: 'bg-gray-100', text: 'text-gray-700' },
};

export default function AccountDashboardPage() {
  const { count: wishlistCount } = useWishlist();
  const [orders, setOrders] = useState<Array<{
    id: string;
    order_number: string;
    date: string;
    status: string;
    total: number;
  }>>([]);
  const [addressCount, setAddressCount] = useState(0);
  const [tier, setTier] = useState('Member');

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
          if (data.profile?.membership_tier) setTier(data.profile.membership_tier);
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
          // unauth
        }
      } else {
        const user = getSession();
        if (user) {
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

  return (
    <div className="animate-page-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight">Tổng quan</h1>
          <p className="text-gray-500 mt-1">Quản lý hoạt động mua sắm của bạn</p>
        </div>
      </div>

      {/* Membership Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 to-black text-white p-6 md:p-8 mb-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold uppercase">{BRAND.fullName} {tier}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold tracking-wider backdrop-blur-md uppercase">
                VIP
              </span>
            </div>
            <p className="text-gray-400 max-w-md">
              Tích lũy thêm chi tiêu để nâng hạng và mở khóa các đặc quyền mua sắm độc quyền.
            </p>
          </div>
          <Link 
            href="/pages/membership" 
            className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg font-bold text-sm transition-transform hover:scale-105 active:scale-95 shrink-0 w-fit"
          >
            Đặc quyền của bạn
            <ArrowRight size={16} />
          </Link>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute right-20 -bottom-20 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link href="/account/orders" className="group p-5 rounded-2xl border border-border bg-gray-50/50 hover:bg-white hover:border-black/20 hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Package size={20} />
          </div>
          <p className="text-3xl font-black mb-1">{orders.length}</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Đơn hàng</p>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
          </div>
        </Link>
        
        <Link href="/account/wishlist" className="group p-5 rounded-2xl border border-border bg-gray-50/50 hover:bg-white hover:border-black/20 hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Heart size={20} className="fill-current" />
          </div>
          <p className="text-3xl font-black mb-1">{wishlistCount}</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Yêu thích</p>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
          </div>
        </Link>
        
        <Link href="/account/addresses" className="group p-5 rounded-2xl border border-border bg-gray-50/50 hover:bg-white hover:border-black/20 hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MapPin size={20} />
          </div>
          <p className="text-3xl font-black mb-1">{addressCount}</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Địa chỉ</p>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wide">Đơn hàng gần đây</h2>
          {orders.length > 0 && (
            <Link href="/account/orders" className="text-sm font-semibold text-gray-500 hover:text-black hover:underline underline-offset-4 transition-colors">
              Xem tất cả
            </Link>
          )}
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-2xl bg-gray-50">
            <Package size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="font-semibold text-gray-600 mb-2">Chưa có đơn hàng nào</p>
            <p className="text-sm text-gray-400 mb-6">Khám phá các sản phẩm mới nhất của chúng tôi</p>
            <Link href="/collections" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-black text-white font-semibold text-sm transition-all hover:bg-neutral-800 hover:scale-105">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, 3).map((order) => {
              const conf = statusConfig[order.status] || { label: order.status, bg: 'bg-gray-100', text: 'text-gray-700' };
              
              return (
                <Link
                  href={`/account/orders/${order.id}`}
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border hover:border-black/30 hover:shadow-sm transition-all group"
                >
                  <div>
                    <p className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">
                      #{order.order_number}
                    </p>
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold tabular-nums mb-1">{formatPrice(order.total)}</p>
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${conf.bg} ${conf.text}`}>
                        {conf.label}
                      </span>
                    </div>
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-black transition-colors hidden sm:block" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
