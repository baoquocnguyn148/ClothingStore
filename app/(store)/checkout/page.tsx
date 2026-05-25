'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { formatPrice } from '@/lib/commerce/format';
import { trackEvent } from '@/lib/analytics';
import { USE_SUPABASE } from '@/lib/config';
import { apiFetch } from '@/lib/api/client';
import { cn } from '@/lib/utils';

type PaymentProvider = 'cod' | 'vnpay' | 'momo' | 'zalopay';

export default function CheckoutPage() {
  const { lines, subtotal, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<PaymentProvider>('cod');
  const [city, setCity] = useState('');
  const [quote, setQuote] = useState<{
    shippingFee: number;
    discountAmount: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (!USE_SUPABASE || !city.trim() || lines.length === 0) {
      setQuote(null);
      return;
    }

    const timer = setTimeout(() => {
      apiFetch<{
        ok: boolean;
        shippingFee: number;
        discountAmount: number;
        total: number;
      }>('/checkout/quote', {
        method: 'POST',
        body: JSON.stringify({ city: city.trim() }),
      })
        .then((data) => {
          if (data.ok !== false) {
            setQuote({
              shippingFee: data.shippingFee,
              discountAmount: data.discountAmount,
              total: data.total,
            });
          }
        })
        .catch(() => setQuote(null));
    }, 400);

    return () => clearTimeout(timer);
  }, [city, lines.length, subtotal]);

  const displayTotal = quote?.total ?? subtotal;
  const displayShipping = quote?.shippingFee ?? 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    trackEvent('begin_checkout', { total: subtotal });

    const form = new FormData(event.currentTarget);
    const shippingAddress = {
      name: form.get('name') as string,
      phone: form.get('phone') as string,
      address: form.get('address') as string,
      city: form.get('city') as string,
      email: form.get('email') as string,
    };

    try {
      if (USE_SUPABASE) {
        const { order } = await apiFetch<{ order: { id: string; order_number: string } }>('/orders', {
          method: 'POST',
          body: JSON.stringify({ shippingAddress, note: form.get('note') }),
        });

        const payResult = await apiFetch<{ paymentUrl: string; cod?: boolean }>(
          `/orders/${order.id}/pay`,
          {
            method: 'POST',
            body: JSON.stringify({ provider }),
          }
        );

        window.location.href = payResult.paymentUrl;
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
      setOrderId(`BD${Date.now().toString().slice(-8)}`);
      setSubmitted(true);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thanh toán thất bại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (lines.length === 0 && !submitted) {
    return (
      <div className="container-mqb flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-[#f7f7f5] mb-6">
          <ShoppingBag size={32} className="text-gray-400" />
        </div>
        <h1 className="text-heading-md uppercase mb-3">Giỏ hàng trống</h1>
        <p className="max-w-md text-[15px] text-gray-500 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các bộ sưu tập mới của chúng tôi.</p>
        <Link href="/collections" className="btn-primary">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container-mqb mx-auto max-w-lg py-24 text-center">
        <div className="flex justify-center mb-8">
          <CheckCircle2 size={80} className="text-emerald-500 animate-in zoom-in duration-500" />
        </div>
        <h1 className="text-heading-lg uppercase mb-4">Cảm ơn bạn!</h1>
        <p className="text-[15px] text-gray-500 mb-4 leading-relaxed">
          Đơn hàng <strong className="text-black">{orderId && `#${orderId}`}</strong> (chế độ demo) đã được ghi nhận cục bộ.
        </p>
        <p className="text-sm text-amber-700 mb-10">
          Đơn này không lưu vào database — admin sẽ không thấy. Để test admin, bật Supabase trong .env.local.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/account/orders" className="btn-primary w-full sm:w-auto">
            Xem đơn hàng
          </Link>
          <Link href="/" className="btn-secondary w-full sm:w-auto">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-mqb py-12 md:py-16">
      <div className="mb-10 text-center md:text-left">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-gray-400">Checkout</p>
        <h1 className="mt-2 text-heading-lg uppercase">Thanh toán</h1>
      </div>

      <div className="flex flex-col-reverse lg:grid lg:grid-cols-[1fr_480px] gap-10">
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-6 md:p-10 shadow-sm">
          <h2 className="mb-8 text-xl font-bold uppercase tracking-tight">Thông tin giao hàng</h2>
          
          {error && (
            <div className="mb-8 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid gap-6">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-bold uppercase tracking-wide text-gray-600">Họ tên *</label>
              <input id="name" name="name" required placeholder="Nguyễn Văn A" className="w-full rounded-lg border border-border bg-gray-50/50 px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-black focus:bg-white focus:ring-1 focus:ring-black" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-bold uppercase tracking-wide text-gray-600">Email *</label>
                <input id="email" name="email" type="email" required placeholder="email@example.com" className="w-full rounded-lg border border-border bg-gray-50/50 px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-black focus:bg-white focus:ring-1 focus:ring-black" />
              </div>
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-bold uppercase tracking-wide text-gray-600">Số điện thoại *</label>
                <input id="phone" name="phone" required placeholder="0901234567" className="w-full rounded-lg border border-border bg-gray-50/50 px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-black focus:bg-white focus:ring-1 focus:ring-black" />
              </div>
            </div>
            <div>
              <label htmlFor="address" className="mb-2 block text-sm font-bold uppercase tracking-wide text-gray-600">Địa chỉ giao hàng *</label>
              <input id="address" name="address" required placeholder="Số nhà, Tên đường, Phường/Xã" className="w-full rounded-lg border border-border bg-gray-50/50 px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-black focus:bg-white focus:ring-1 focus:ring-black" />
            </div>
            <div>
              <label htmlFor="city" className="mb-2 block text-sm font-bold uppercase tracking-wide text-gray-600">Tỉnh/Thành phố *</label>
              <input
                id="city"
                name="city"
                required
                placeholder="Hồ Chí Minh"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-border bg-gray-50/50 px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
              />
            </div>
            
            {USE_SUPABASE && (
              <div>
                <label htmlFor="provider" className="mb-2 block text-sm font-bold uppercase tracking-wide text-gray-600">Phương thức thanh toán</label>
                <select
                  id="provider"
                  value={provider}
                  onChange={(event) => setProvider(event.target.value as PaymentProvider)}
                  className="w-full rounded-lg border border-border bg-gray-50/50 px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-black focus:bg-white focus:ring-1 focus:ring-black appearance-none cursor-pointer"
                >
                  <option value="cod">COD — Thanh toán khi nhận hàng (khuyên dùng để test)</option>
                  <option value="vnpay">VNPay</option>
                  <option value="momo">MoMo</option>
                  <option value="zalopay">ZaloPay (demo)</option>
                </select>
              </div>
            )}
            
            <div>
              <label htmlFor="note" className="mb-2 block text-sm font-bold uppercase tracking-wide text-gray-600">Ghi chú (Tùy chọn)</label>
              <textarea
                id="note"
                name="note"
                rows={3}
                placeholder="Giao hàng trong giờ hành chính..."
                className="w-full rounded-lg border border-border bg-gray-50/50 px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-black focus:bg-white focus:ring-1 focus:ring-black resize-none"
              />
            </div>

            <div className="mt-4 pt-6 border-t border-border">
              <button 
                type="submit" 
                disabled={loading} 
                className={cn(
                  "btn-primary w-full py-4 text-base",
                  loading && "opacity-80 cursor-wait"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="mr-3 animate-spin" />
                    Đang xử lý đơn hàng...
                  </>
                ) : (
                  `Thanh toán an toàn • ${formatPrice(displayTotal)}`
                )}
              </button>
            </div>
          </div>
        </form>

        <aside className="h-fit rounded-xl border border-border bg-[#fbfbfa] p-6 md:p-8 lg:sticky lg:top-28">
          <h2 className="mb-6 text-xl font-bold uppercase tracking-tight">Đơn hàng của bạn</h2>
          <ul className="mb-8 space-y-5">
            {lines.map((line) => (
              <li key={line.variantId} className="flex gap-4 items-start">
                <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-md border border-border bg-white">
                  <Image src={line.image} alt={line.title} fill className="object-contain" sizes="80px" />
                  <span className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-gray-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {line.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-900">{line.title}</p>
                  <p className="mt-1.5 text-sm text-gray-500">
                    {line.size} / {line.color}
                  </p>
                  <p className="mt-2 text-[15px] font-bold">{formatPrice(line.price * line.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="space-y-4 border-t border-border pt-6">
            <div className="flex justify-between text-[15px] text-gray-600">
              <span>Tạm tính</span>
              <span className="font-medium text-black">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[15px] text-gray-600">
              <span>Phí vận chuyển</span>
              <span className="font-medium text-black">
                {USE_SUPABASE && city.trim()
                  ? displayShipping === 0
                    ? 'Miễn phí'
                    : formatPrice(displayShipping)
                  : 'Tính khi nhập thành phố'}
              </span>
            </div>
            {quote && quote.discountAmount > 0 && (
              <div className="flex justify-between text-[15px] text-emerald-700">
                <span>Giảm giá</span>
                <span>-{formatPrice(quote.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-6 text-xl font-bold uppercase tracking-tight">
              <span>Tổng cộng</span>
              <span>{formatPrice(displayTotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
