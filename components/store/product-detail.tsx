'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import type { Product } from '@/lib/commerce/types';
import { formatPrice } from '@/lib/commerce/format';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  Truck,
  Zap,
} from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { useWishlist } from '@/lib/wishlist/wishlist-context';
import { trackEvent } from '@/lib/analytics';
import { ProductCard } from './product-card';
import { cn } from '@/lib/utils';

interface ProductDetailProps {
  product: Product;
  related: Product[];
}

type DetailPanel = 'info' | 'shipping' | 'exchange';
type ActionState = 'idle' | 'adding' | 'buying' | 'added';

function categoryLabel(category: string) {
  const normalized = category.replace(/-/g, ' ').toUpperCase();
  if (['TEE', 'TSHIRT', 'T-SHIRT', 'POLO'].includes(normalized)) return 'T-SHIRT & POLO';
  return normalized || 'PRODUCTS';
}



export function ProductDetail({ product, related }: ProductDetailProps) {
  const firstAvailable = product.variants.find((v) => v.available) ?? product.variants[0];
  const [selectedColor, setSelectedColor] = useState(firstAvailable?.color ?? product.colors[0]?.name ?? '');
  const [selectedVariantId, setSelectedVariantId] = useState(firstAvailable?.id);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openPanel, setOpenPanel] = useState<DetailPanel>('info');
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [actionState, setActionState] = useState<ActionState>('idle');
  const { addLine, openCart } = useCart();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();

  const colorOptions = useMemo(() => {
    const map = new Map<string, { name: string; hex: string; available: boolean }>();
    for (const variant of product.variants) {
      const current = map.get(variant.color);
      map.set(variant.color, {
        name: variant.color,
        hex: variant.colorHex,
        available: Boolean(current?.available || variant.available),
      });
    }
    return Array.from(map.values());
  }, [product.variants]);

  const variantsByColor = useMemo(
    () => product.variants.filter((variant) => variant.color === selectedColor),
    [product.variants, selectedColor]
  );

  const variant =
    product.variants.find((v) => v.id === selectedVariantId) ??
    variantsByColor.find((v) => v.available) ??
    variantsByColor[0] ??
    firstAvailable;
  const isSoldOut = product.tags.includes('sold-out') || !variant?.available;
  const selectedColorHex = colorOptions.find((color) => color.name === selectedColor)?.hex ?? '#111111';
  const wishlistActive = isWishlisted(product.handle);
  const currentImage = product.images[imageIndex] ?? product.images[0];

  useEffect(() => {
    const current = product.variants.find((item) => item.id === selectedVariantId);
    if (current?.color === selectedColor) return;

    const next = variantsByColor.find((item) => item.available) ?? variantsByColor[0];
    if (next) setSelectedVariantId(next.id);
  }, [product.variants, selectedColor, selectedVariantId, variantsByColor]);

  useEffect(() => {
    if (actionState !== 'added') return;
    const timeout = window.setTimeout(() => setActionState('idle'), 1800);
    return () => window.clearTimeout(timeout);
  }, [actionState]);

  const addSelectedToCart = async (redirectToCheckout = false) => {
    if (!variant || !variant.available || actionState === 'adding' || actionState === 'buying') return;

    setActionState(redirectToCheckout ? 'buying' : 'adding');
    try {
      await Promise.resolve(
        addLine({
          variantId: variant.id,
          productHandle: product.handle,
          title: product.title,
          size: variant.size,
          color: variant.color,
          price: variant.price,
          quantity,
          image: product.images[0],
        })
      );
      trackEvent(redirectToCheckout ? 'begin_checkout' : 'add_to_cart', {
        product: product.handle,
        quantity,
      });

      if (redirectToCheckout) {
        window.location.href = '/checkout';
        return;
      }

      setActionState('added');
      openCart();
    } catch {
      setActionState('idle');
      window.alert('Không thể thêm sản phẩm vào giỏ. Vui lòng thử lại.');
    }
  };

  const panelRows: Array<{
    id: DetailPanel;
    title: string;
    summary: string;
    body: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'info',
      title: 'Thông tin sản phẩm',
      summary: product.description || 'Chi tiết chất liệu, form dáng và cảm giác khi mặc.',
      body: product.description || 'Sản phẩm được thiết kế theo form hiện đại, dễ mặc hằng ngày và phù hợp nhiều phong cách.',
      icon: <ShieldCheck size={18} />,
    },
    {
      id: 'shipping',
      title: 'Chính sách vận chuyển',
      summary: 'Giao hàng tiêu chuẩn từ 2-3 ngày.',
      body: 'Đơn hàng được xử lý trong giờ hành chính. Phí vận chuyển được tính theo địa chỉ nhận hàng tại checkout.',
      icon: <Truck size={18} />,
    },
    {
      id: 'exchange',
      title: 'Chính sách đổi trả',
      summary: 'Hỗ trợ đổi size/màu khi sản phẩm còn nguyên tem mác.',
      body: 'Sản phẩm cần còn nguyên tình trạng ban đầu. Vui lòng liên hệ bộ phận chăm sóc khách hàng để được hỗ trợ.',
      icon: <RotateCcw size={18} />,
    },
  ];

  const addLabel =
    actionState === 'adding' ? 'Đang thêm...' : actionState === 'added' ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ';
  const buyLabel = actionState === 'buying' ? 'Đang xử lý...' : 'Mua ngay';

  return (
    <div className="bg-white text-[#111111]">
      {/* Breadcrumb */}
      <nav className="border-b border-border bg-white/95 px-4 py-4 text-sm backdrop-blur md:px-8">
        <div className="flex flex-wrap items-center gap-1.5 text-sm text-gray-400 md:text-base">
          <Link href="/" className="transition-colors hover:text-black">Trang chủ</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <Link href={`/collections?category=${product.category}`} className="transition-colors hover:text-black">
            {categoryLabel(product.category)}
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="line-clamp-1 font-medium text-black">{product.title}</span>
        </div>
      </nav>

      <div className="grid min-h-[calc(100vh-120px)] lg:grid-cols-[minmax(0,1fr)_520px] xl:grid-cols-[minmax(0,1fr)_600px]">
        {/* Image gallery section */}
        <section className="border-r border-border bg-white">
          <div className="grid gap-5 p-4 md:grid-cols-[84px_1fr] md:p-8 xl:p-10">
            {/* Thumbnail strip */}
            {product.images.length > 1 && (
              <div className="order-2 flex gap-2.5 overflow-x-auto md:order-1 md:flex-col md:overflow-visible">
                {product.images.map((img, i) => (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    onClick={() => setImageIndex(i)}
                    className={cn(
                      'relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-[#f7f7f5] transition-all duration-200 md:h-[84px] md:w-full',
                      imageIndex === i
                        ? 'border-black shadow-sm'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'
                    )}
                    aria-label={`Xem ảnh ${i + 1}`}
                  >
                    <Image src={img} alt="" fill className="object-contain p-1.5" sizes="84px" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="order-1 overflow-hidden rounded-lg border border-border bg-[#f7f7f5] md:order-2 group relative">
              <div className="relative aspect-[3/4] w-full md:aspect-auto md:h-[calc(100vh-220px)] md:min-h-[500px] md:max-h-[800px]">
                {currentImage && (
                  <Image
                    src={currentImage}
                    alt={product.title}
                    fill
                    className="object-contain transition-opacity duration-300"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    priority
                  />
                )}
              </div>
              
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 grid h-10 w-10 md:h-12 md:w-12 place-items-center rounded-full border border-black/5 bg-white/70 text-black opacity-0 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-white hover:scale-105 group-hover:opacity-100"
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft size={24} className="mr-0.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 grid h-10 w-10 md:h-12 md:w-12 place-items-center rounded-full border border-black/5 bg-white/70 text-black opacity-0 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-white hover:scale-105 group-hover:opacity-100"
                    aria-label="Ảnh tiếp theo"
                  >
                    <ChevronRight size={24} className="ml-0.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Image indicator dots */}
          {product.images.length > 1 && (
            <div className="mx-auto mb-8 flex max-w-md gap-2 px-8">
              {product.images.map((img, i) => (
                <button
                  key={`indicator-${img}-${i}`}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all duration-300',
                    imageIndex === i ? 'bg-black' : 'bg-gray-200 hover:bg-gray-300'
                  )}
                  aria-label={`Chuyển đến ảnh ${i + 1}`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Product info sidebar */}
        <aside className="bg-[#fbfbfa] px-5 py-8 md:px-10 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto xl:px-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{BRAND.name}</p>
          <div className="mb-6 flex items-start justify-between gap-4">
            <h1 className="max-w-xl text-[28px] font-medium leading-tight tracking-[-0.01em] md:text-[34px]">
              {product.title}
            </h1>
            <button
              type="button"
              onClick={() => toggleWishlist(product.handle)}
              className={cn(
                'grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 transition-all duration-200',
                wishlistActive
                  ? 'border-black bg-black text-white scale-110'
                  : 'border-border bg-white hover:border-black hover:shadow-sm'
              )}
              aria-label={wishlistActive ? 'Bỏ yêu thích' : 'Yêu thích'}
            >
              <Heart size={20} className={cn('transition-transform', wishlistActive ? 'fill-current' : '')} />
            </button>
          </div>

          {/* Price */}
          <div className="mb-6 flex items-baseline gap-3">
            <p className="text-[26px] font-medium tracking-[-0.01em]">{formatPrice(variant?.price ?? product.price)}</p>
            {product.compareAtPrice && (
              <p className="text-sm text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</p>
            )}
          </div>

          {/* Voucher */}
          <button
            type="button"
            onClick={() => setVoucherOpen((value) => !value)}
            className="mb-4 flex w-full items-center justify-between rounded-md border border-dashed border-red-300 bg-red-50/50 px-5 py-4 text-left transition-all hover:border-red-500 hover:bg-red-50 hover:shadow-sm"
            aria-expanded={voucherOpen}
          >
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-red-500 shadow-sm">
                <Ticket size={18} />
              </span>
              <span>
                <span className="block text-base font-semibold">Voucher của B&D</span>
                <span className="block text-xs text-gray-500">Ưu đãi được áp dụng tại trang thanh toán</span>
              </span>
            </span>
            <ChevronDown size={18} className={cn('transition-transform duration-200', voucherOpen && 'rotate-180')} />
          </button>
          {voucherOpen && (
            <div className="mb-7 rounded-md border border-red-100 bg-white p-4 text-sm leading-6 text-gray-600 shadow-sm">
              Nhập mã <strong>BDSTYLE</strong> để nhận ưu đãi cho đơn hàng hợp lệ. Voucher có thể thay đổi theo từng thời điểm.
            </div>
          )}

          {/* Color selector */}
          <div className="mb-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400">COLOR</p>
                <p className="mt-1 text-lg font-semibold">{selectedColor}</p>
              </div>
              <span className="h-7 w-7 rounded-full border-2 border-black/10 shadow-sm" style={{ backgroundColor: selectedColorHex }} />
            </div>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  disabled={!color.available}
                  onClick={() => setSelectedColor(color.name)}
                  className={cn(
                    'relative h-[68px] w-[68px] overflow-hidden rounded-md border-2 bg-white transition-all duration-200',
                    selectedColor === color.name
                      ? 'border-black shadow-md'
                      : 'border-border hover:border-black/40 hover:shadow-sm',
                    !color.available && 'cursor-not-allowed opacity-40'
                  )}
                  title={color.name}
                >
                  <Image src={product.images[0]} alt={color.name} fill className="object-cover" sizes="68px" />
                </button>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400">SIZE</p>
              <Link
                href="/pages/size-guide"
                className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
              >
                <Ruler size={16} /> Bảng size
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {variantsByColor.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={!item.available}
                  onClick={() => setSelectedVariantId(item.id)}
                  className={cn(
                    'h-12 rounded-md border-2 px-4 text-sm font-medium transition-all duration-200',
                    selectedVariantId === item.id
                      ? 'border-black bg-black text-white shadow-md'
                      : 'border-border bg-white hover:border-black',
                    !item.available && 'cursor-not-allowed bg-gray-100 text-gray-400 line-through hover:border-border'
                  )}
                >
                  {item.size}
                </button>
              ))}
            </div>
            <p className={cn('mt-3 flex items-center gap-1.5 text-sm', isSoldOut ? 'text-red-500' : 'text-emerald-700')}>
              <span className={cn('inline-block h-2 w-2 rounded-full', isSoldOut ? 'bg-red-500' : 'bg-emerald-500')} />
              {isSoldOut ? 'Biến thể này đang hết hàng.' : 'Còn hàng - sẵn sàng giao.'}
            </p>
          </div>

          {/* Quantity */}
          <div className="mb-6 flex items-center justify-between rounded-md border border-border bg-white px-5 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400">Số lượng</p>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="grid h-10 w-10 place-items-center rounded-full border border-border transition-all hover:border-black hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30"
                disabled={quantity <= 1}
                aria-label="Giảm số lượng"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-8 text-center text-lg font-semibold tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(99, value + 1))}
                className="grid h-10 w-10 place-items-center rounded-full border border-border transition-all hover:border-black hover:shadow-sm"
                aria-label="Tăng số lượng"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mb-8 grid gap-3">
            <button
              type="button"
              onClick={() => addSelectedToCart(false)}
              disabled={isSoldOut || actionState === 'adding' || actionState === 'buying'}
              className={cn(
                'group flex h-14 w-full items-center justify-center gap-3 rounded-md border-2 text-base font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]',
                actionState === 'added'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-black bg-white text-black hover:bg-black hover:text-white hover:shadow-lg'
              )}
            >
              {actionState === 'added' ? <Check size={18} /> : <ShoppingBag size={18} />}
              {isSoldOut ? 'Hết hàng' : addLabel}
            </button>
            <button
              type="button"
              onClick={() => addSelectedToCart(true)}
              disabled={isSoldOut || actionState === 'adding' || actionState === 'buying'}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-md bg-black text-base font-semibold text-white transition-all duration-200 hover:bg-neutral-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
            >
              <Zap size={18} />
              {isSoldOut ? 'Hết hàng' : buyLabel}
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 border-y border-border py-5 text-center text-[11px] font-medium uppercase tracking-wide text-gray-500">
            <span className="flex flex-col items-center gap-1.5">
              <ShieldCheck size={16} className="text-gray-400" />
              Thanh toán an toàn
            </span>
            <span className="flex flex-col items-center gap-1.5">
              <Truck size={16} className="text-gray-400" />
              Giao nhanh
            </span>
            <span className="flex flex-col items-center gap-1.5">
              <RotateCcw size={16} className="text-gray-400" />
              Đổi trả dễ dàng
            </span>
          </div>

          {/* Accordion panels */}
          <div className="divide-y divide-border">
            {panelRows.map((row) => (
              <section key={row.id} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenPanel((current) => (current === row.id ? 'info' : row.id))}
                  className="flex w-full items-start justify-between gap-4 text-left"
                  aria-expanded={openPanel === row.id}
                >
                  <span className="flex gap-3">
                    <span className="mt-0.5 text-gray-400">{row.icon}</span>
                    <span>
                      <span className="block text-base font-semibold">{row.title}</span>
                      <span className="mt-1 line-clamp-2 block text-sm leading-6 text-gray-500">{row.summary}</span>
                    </span>
                  </span>
                  <ChevronDown
                    size={18}
                    className={cn('mt-2 shrink-0 transition-transform duration-200', openPanel === row.id && 'rotate-180')}
                  />
                </button>
                {openPanel === row.id && <p className="ml-8 mt-3 text-sm leading-6 text-gray-600">{row.body}</p>}
              </section>
            ))}
          </div>
        </aside>
      </div>

      {/* Mobile fixed bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-[1fr_1fr] gap-2">
          <button
            type="button"
            onClick={() => addSelectedToCart(false)}
            disabled={isSoldOut || actionState === 'adding' || actionState === 'buying'}
            className="h-12 rounded-md border-2 border-black text-sm font-semibold transition-all disabled:opacity-50 active:scale-[0.97]"
          >
            {actionState === 'added' ? 'Đã thêm' : 'Thêm giỏ'}
          </button>
          <button
            type="button"
            onClick={() => addSelectedToCart(true)}
            disabled={isSoldOut || actionState === 'adding' || actionState === 'buying'}
            className="h-12 rounded-md bg-black text-sm font-semibold text-white transition-all disabled:opacity-50 active:scale-[0.97]"
          >
            {buyLabel}
          </button>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="container-mqb py-16 pb-28 lg:pb-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Có thể bạn sẽ thích</p>
              <h2 className="mt-2 text-heading-lg uppercase">Sản phẩm liên quan</h2>
            </div>
            <Link href="/collections" className="hidden text-sm font-semibold underline-offset-4 hover:underline md:block">
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
