'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/commerce/types';
import { formatPrice } from '@/lib/commerce/format';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { useWishlist } from '@/lib/wishlist/wishlist-context';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

function badgeLabel(product: Product) {
  if (product.tags.includes('sale')) return 'Sale';
  if (product.tags.includes('new')) return 'New';
  if (product.tags.includes('best-seller')) return 'Best seller';
  return null;
}

export function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addLine } = useCart();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.handle);

  const isSoldOut = product.tags.includes('sold-out') || product.variants.every((v) => !v.available);
  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const availableVariants = product.variants.filter((v) => v.available);
  const label = badgeLabel(product);
  const primaryImage = product.images[0];
  const hoverImage = product.images[1] ?? product.images[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const size = selectedSize ?? availableVariants[0]?.size;
    const variant = product.variants.find((v) => v.size === size && v.available);
    if (!variant) return;

    addLine({
      variantId: variant.id,
      productHandle: product.handle,
      title: product.title,
      size: variant.size,
      color: variant.color,
      price: variant.price,
      image: primaryImage,
    });
    trackEvent('add_to_cart', { product: product.handle, size: variant.size });
  };

  return (
    <article
      className="group overflow-hidden rounded-lg border border-transparent bg-white transition-all duration-300 hover:border-black/8 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setSelectedSize(null);
      }}
    >
      <Link href={`/products/${product.handle}`} className="block">
        {/* Image container with better aspect ratio */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f7f7f5]">
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            className={cn(
              'object-contain transition-all duration-500',
              hovered && product.images.length > 1 ? 'opacity-0 scale-[1.03]' : 'opacity-100'
            )}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {product.images.length > 1 && (
            <Image
              src={hoverImage}
              alt=""
              fill
              className={cn(
                'object-contain transition-all duration-500',
                hovered ? 'opacity-100 scale-[1.03]' : 'opacity-0 scale-100'
              )}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          )}

          {/* Badges */}
          {label && (
            <span className="absolute left-3 top-3 rounded-md bg-black px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
              {label}
            </span>
          )}
          {isSoldOut && (
            <span className="absolute right-3 top-3 rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-black shadow-sm backdrop-blur-sm">
              Hết hàng
            </span>
          )}

          {/* Wishlist button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.handle);
            }}
            className={cn(
              'absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full shadow-md transition-all duration-200',
              wishlisted
                ? 'bg-black text-white'
                : 'bg-white/95 text-gray-700 hover:bg-black hover:text-white hover:shadow-lg'
            )}
            aria-label={wishlisted ? 'Bỏ yêu thích' : 'Yêu thích'}
          >
            <Heart size={17} className={cn('transition-transform', wishlisted ? 'fill-current scale-110' : '')} />
          </button>

          {/* Quick add panel */}
          {!isSoldOut && (
            <div
              className={cn(
                'absolute inset-x-3 bottom-3 right-16 hidden rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur-sm transition-all duration-300 md:block',
                hovered ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0 pointer-events-none'
              )}
              onClick={(e) => e.preventDefault()}
            >
              <div className="mb-3 flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const available = product.variants.some((v) => v.size === size && v.available);
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!available}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSize(size);
                      }}
                      className={cn(
                        'min-w-12 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all',
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 hover:border-black',
                        !available && 'cursor-not-allowed text-gray-300 line-through'
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleQuickAdd}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-black px-3 py-2.5 text-xs font-semibold text-white transition-all hover:bg-neutral-800 hover:shadow-md active:scale-[0.98]"
              >
                <ShoppingBag size={14} /> Thêm nhanh
              </button>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-2.5 p-3.5 md:p-4">
          <div>
            <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 transition-colors group-hover:text-black/80 md:text-[15px]">
              {product.title}
            </h3>
            <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-400">{product.category}</p>
          </div>

          {/* Color swatches */}
          <div className="flex items-center gap-1.5">
            {product.colors.map((color) => (
              <span
                key={`${color.name}-${color.hex}`}
                className="h-4 w-4 rounded-full border border-black/8 ring-1 ring-white shadow-sm"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>

          {/* Price */}
          <p className="text-[15px] font-bold md:text-base">
            {formatPrice(product.price)}
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="ml-2 text-xs font-normal text-gray-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </p>
        </div>
      </Link>
    </article>
  );
}
