'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/cart/cart-context';
import { apiFetch } from '@/lib/api/client';
import {
  CheckCircle2,
  Package,
  MapPin,
  CreditCard,
  Clock,
  Copy,
  ExternalLink,
  Printer,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  product_title: string;
  variant_size?: string;
  variant_color?: string;
  unit_price: number;
  quantity: number;
  image_url?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total: number;
  note?: string;
  created_at: string;
  shipping_address: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    email?: string;
  };
  order_items: OrderItem[];
  payments: Array<{ provider: string; status: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const providerLabel: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  vnpay: 'VNPay',
  momo: 'MoMo',
  zalopay: 'ZaloPay',
};

const statusLabel: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Chờ thanh toán', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  confirmed:       { label: 'Đã xác nhận',   color: 'text-blue-600  bg-blue-50  border-blue-200'  },
  paid:            { label: 'Đã thanh toán', color: 'text-green-600 bg-green-50 border-green-200' },
  shipping:        { label: 'Đang giao',     color: 'text-purple-600 bg-purple-50 border-purple-200' },
  delivered:       { label: 'Đã giao',       color: 'text-green-700 bg-green-100 border-green-300' },
  cancelled:       { label: 'Đã huỷ',        color: 'text-red-600   bg-red-50   border-red-200'   },
};

// ─── Content Component ────────────────────────────────────────────────────────
function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const { refreshCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const orderId  = searchParams.get('order');
  const provider = searchParams.get('provider') ?? '';

  useEffect(() => {
    refreshCart();
    if (!orderId) { setLoading(false); return; }

    apiFetch<{ order: Order }>(`/orders/${orderId}`)
      .then(d => setOrder(d.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const copyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-black rounded-full animate-spin" />
          <p className="text-sm">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  // ── No order data fallback ──────────────────────────────────────────────────
  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-black uppercase">Đặt hàng thành công!</h1>
        <p className="text-gray-500 max-w-md">
          Cảm ơn bạn đã mua hàng tại{' '}
          <strong className="text-black">BN STORE</strong>. Đơn hàng của bạn đang được xử lý.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/account/orders" className="btn-primary">Xem đơn hàng</Link>
          <Link href="/" className="btn-secondary">Về trang chủ</Link>
        </div>
      </div>
    );
  }

  const payment   = order.payments?.[0];
  const st        = statusLabel[order.status] ?? { label: order.status, color: 'text-gray-600 bg-gray-50 border-gray-200' };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* ── Success banner ──────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4
                        animate-in zoom-in duration-500">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-1">
          Đặt hàng thành công!
        </h1>
        <p className="text-gray-500">
          Cảm ơn bạn. Chúng tôi đã nhận được đơn hàng và đang xử lý.
        </p>
      </div>

      {/* ── Bill card ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none">

        {/* Header */}
        <div className="bg-black text-white px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Mã đơn hàng</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wide">#{order.order_number}</span>
              <button
                onClick={copyOrderNumber}
                className="text-gray-400 hover:text-white transition-colors"
                title="Copy mã đơn"
              >
                <Copy size={14} />
              </button>
              {copied && <span className="text-xs text-green-400">Đã copy!</span>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Trạng thái</p>
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${st.color}`}>
              {st.label}
            </span>
          </div>
        </div>

        {/* Datetime + payment method */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {new Date(order.created_at).toLocaleString('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard size={14} />
            {providerLabel[provider] ?? providerLabel[payment?.provider ?? ''] ?? 'N/A'}
          </span>
        </div>

        {/* Order items */}
        <div className="px-6 py-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
            <ShoppingBag size={14} />
            Sản phẩm
          </h2>
          <div className="space-y-4">
            {order.order_items.map(item => (
              <div key={item.id} className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt={item.product_title} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={24} className="text-gray-300" />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug">{item.product_title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {[item.variant_size && `Size: ${item.variant_size}`, item.variant_color && `Màu: ${item.variant_color}`]
                      .filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">SL: {item.quantity}</p>
                </div>
                {/* Price */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm">{fmt(item.unit_price * item.quantity)}</p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-gray-400">{fmt(item.unit_price)} × {item.quantity}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider dashed */}
        <div className="mx-6 border-t border-dashed border-gray-200" />

        {/* Totals */}
        <div className="px-6 py-5 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Tạm tính</span>
            <span>{fmt(order.subtotal)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Giảm giá</span>
              <span>−{fmt(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <span>Phí vận chuyển</span>
            <span>{order.shipping_fee === 0 ? <span className="text-green-600 font-medium">Miễn phí</span> : fmt(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between font-black text-lg pt-2 border-t border-gray-200">
            <span>Tổng cộng</span>
            <span>{fmt(order.total)}</span>
          </div>
        </div>

        {/* Divider dashed */}
        <div className="mx-6 border-t border-dashed border-gray-200" />

        {/* Shipping address */}
        <div className="px-6 py-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
            <MapPin size={14} />
            Địa chỉ giao hàng
          </h2>
          <div className="text-sm space-y-1 text-gray-700">
            {order.shipping_address?.name && (
              <p className="font-semibold">{order.shipping_address.name}</p>
            )}
            {order.shipping_address?.phone && (
              <p className="text-gray-500">📞 {order.shipping_address.phone}</p>
            )}
            {order.shipping_address?.email && (
              <p className="text-gray-500">✉ {order.shipping_address.email}</p>
            )}
            {(order.shipping_address?.address || order.shipping_address?.city) && (
              <p className="text-gray-500">
                {[order.shipping_address.address, order.shipping_address.city]
                  .filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          {order.note && (
            <p className="mt-3 text-sm text-gray-500 italic">📝 Ghi chú: {order.note}</p>
          )}
        </div>

        {/* COD notice */}
        {(provider === 'cod' || payment?.provider === 'cod') && (
          <div className="mx-6 mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
            💵 <strong>Thanh toán khi nhận hàng (COD):</strong> Vui lòng chuẩn bị đúng số tiền{' '}
            <strong>{fmt(order.total)}</strong> khi nhận hàng.
          </div>
        )}
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center print:hidden">
        <Link
          href="/account/orders"
          className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
        >
          <Package size={16} />
          Theo dõi đơn hàng
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Printer size={16} />
          In hoá đơn
        </button>
        <Link
          href="/collections"
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
          Tiếp tục mua sắm
        </Link>
      </div>

      {/* ── Print-only footer ────────────────────────────────────────────────── */}
      <div className="hidden print:block text-center text-xs text-gray-400 mt-8">
        BN STORE — bnstore.vn · support@bnstore.vn · Hotline: 1800-xxxx<br />
        Cảm ơn bạn đã tin tưởng và mua sắm tại BN STORE!
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
