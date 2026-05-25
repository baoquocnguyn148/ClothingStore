'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart } from '@/lib/cart/cart-context';
import { formatPrice } from '@/lib/commerce/format';

export function CartDrawer() {
  const { lines, subtotal, isOpen, closeCart, updateQuantity, removeLine } = useCart();
  const totalQuantity = lines.reduce((total, item) => total + item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between gap-3 text-lg tracking-tight">
            <span>Giỏ hàng của bạn</span>
            <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase text-secondary">
              {totalQuantity} sản phẩm
            </span>
          </SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-muted">
              <ShoppingBag size={28} className="text-secondary" />
            </div>
            <div>
              <p className="text-lg font-semibold">Giỏ hàng đang trống</p>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Khám phá bộ sưu tập mới và thêm sản phẩm bạn thích.
              </p>
            </div>
            <Link href="/collections" onClick={closeCart} className="btn-primary text-sm">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-0 overflow-y-auto py-2">
              {lines.map((line, index) => (
                <li
                  key={line.variantId}
                  className={`flex gap-4 p-4 transition-colors hover:bg-muted/40 ${
                    index !== lines.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  {/* Product image - better ratio and rounded corners */}
                  <div className="relative aspect-[3/4] w-[90px] shrink-0 overflow-hidden rounded-md border border-border bg-[#f7f7f5]">
                    <Image
                      src={line.image}
                      alt={line.title}
                      fill
                      className="object-contain"
                      sizes="90px"
                    />
                  </div>

                  {/* Product info */}
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-[15px] font-semibold leading-snug">
                          {line.title}
                        </p>
                        <p className="mt-1.5 text-sm text-secondary">
                          Size: {line.size} · Màu: {line.color}
                        </p>
                      </div>
                      <p className="shrink-0 text-[15px] font-bold tabular-nums">
                        {formatPrice(line.price * line.quantity)}
                      </p>
                    </div>

                    <p className="mt-2 text-sm text-secondary">
                      Đơn giá: {formatPrice(line.price)}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center overflow-hidden rounded-md border border-border">
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                          className="grid h-10 w-10 place-items-center transition-colors hover:bg-muted"
                          aria-label="Giảm số lượng"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-11 border-x border-border text-center text-sm font-semibold tabular-nums leading-10">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                          className="grid h-10 w-10 place-items-center transition-colors hover:bg-muted"
                          aria-label="Tăng số lượng"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.variantId)}
                        className="text-sm font-semibold uppercase tracking-wide text-secondary transition-colors hover:text-red-500"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-1 pt-5">
              <div className="flex items-center justify-between text-sm text-secondary">
                <span>Tổng số lượng</span>
                <span className="font-medium">{totalQuantity}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-base font-semibold">Tạm tính</span>
                <span className="text-xl font-bold tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-3 text-sm leading-5 text-secondary">
                Phí vận chuyển và ưu đãi sẽ được tính ở bước thanh toán.
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 mb-1 inline-flex h-[52px] w-full items-center justify-center rounded-md bg-black px-4 text-[15px] font-semibold tracking-wide text-white transition-all hover:bg-neutral-800 hover:shadow-lg active:scale-[0.98]"
              >
                Thanh toán
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
