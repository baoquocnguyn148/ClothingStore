'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import type { Product, ProductFilters } from '@/lib/commerce/types';
import { ProductCard } from './product-card';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  showFilters?: boolean;
}

const SORT_OPTIONS: { value: ProductFilters['sort']; label: string }[] = [
  { value: 'relevance', label: 'Liên quan' },
  { value: 'best-selling', label: 'Bán chạy' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
];

const PRICE_RANGES = [
  { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
  { label: '1 - 2 triệu', min: 1000000, max: 2000000 },
  { label: 'Trên 2 triệu', min: 2000000, max: Number.MAX_SAFE_INTEGER },
];

export function ProductGrid({ products, showFilters = true }: ProductGridProps) {
  const [sort, setSort] = useState<ProductFilters['sort']>('relevance');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeOptions = useMemo(
    () => [...new Set(products.flatMap((product) => product.variants.map((variant) => variant.size)))],
    [products]
  );
  const colorOptions = useMemo(
    () => [...new Map(products.flatMap((product) => product.colors.map((color) => [color.name, color]))).values()],
    [products]
  );

  const filtered = useMemo(() => {
    let result = [...products];

    if (sizes.length) {
      result = result.filter((p) => p.variants.some((v) => sizes.includes(v.size) && v.available));
    }
    if (colors.length) {
      result = result.filter((p) => p.colors.some((c) => colors.includes(c.name)));
    }
    if (priceRange != null) {
      const range = PRICE_RANGES[priceRange];
      result = result.filter((p) => p.price >= range.min && p.price <= range.max);
    }

    switch (sort) {
      case 'price-asc':
        return result.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return result.sort((a, b) => b.price - a.price);
      case 'best-selling':
        return result.sort((a, b) => {
          const aBest = a.tags.includes('best-seller') ? 1 : 0;
          const bBest = b.tags.includes('best-seller') ? 1 : 0;
          return bBest - aBest;
        });
      default:
        return result;
    }
  }, [products, sort, sizes, colors, priceRange]);

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter((item) => item !== val) : [...arr, val]);
  };

  const hasFilters = sizes.length > 0 || colors.length > 0 || priceRange != null;

  const resetFilters = () => {
    setSizes([]);
    setColors([]);
    setPriceRange(null);
    setSort('relevance');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-y border-border py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SlidersHorizontal size={18} />
          <p className="text-sm">
            <strong>{filtered.length}</strong> sản phẩm
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-black"
            >
              <X size={14} /> Xóa lọc
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm relative" ref={sortRef}>
          <span className="text-gray-500">Sắp xếp:</span>
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 rounded-md border border-border bg-white px-4 py-2 font-medium hover:border-black transition-colors"
          >
            {SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Liên quan'}
            <ChevronDown size={14} className={cn("transition-transform", isSortOpen && "rotate-180")} />
          </button>
          
          {isSortOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-white p-1.5 shadow-lg z-20 animate-in fade-in slide-in-from-top-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSort(option.value as ProductFilters['sort']);
                    setIsSortOpen(false);
                  }}
                  className={cn(
                    "w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
                    sort === option.value 
                      ? "bg-black text-white font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="grid gap-4 rounded-md bg-[#f7f7f5] p-4 md:grid-cols-3">
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggle(sizes, size, setSizes)}
                  className={cn(
                    'rounded-sm border px-3 py-2 text-xs transition',
                    sizes.includes(size) ? 'border-black bg-black text-white' : 'border-transparent bg-white'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Màu</h3>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => toggle(colors, color.name, setColors)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-sm border px-3 py-2 text-xs transition',
                    colors.includes(color.name) ? 'border-black bg-white' : 'border-transparent bg-white'
                  )}
                >
                  <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                  {color.name}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Giá</h3>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((range, index) => (
                <button
                  key={range.label}
                  type="button"
                  onClick={() => setPriceRange(priceRange === index ? null : index)}
                  className={cn(
                    'rounded-sm border px-3 py-2 text-xs transition',
                    priceRange === index ? 'border-black bg-black text-white' : 'border-transparent bg-white'
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-md bg-[#f7f7f5] py-20 text-center text-gray-500">
          Không tìm thấy sản phẩm phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
