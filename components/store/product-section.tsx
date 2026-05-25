'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, PackageOpen } from 'lucide-react';
import type { Product } from '@/lib/commerce/types';
import { ProductCard } from './product-card';
import { cn } from '@/lib/utils';

interface ProductSectionProps {
  title: string;
  products: Product[];
  tabs?: { label: string; tag?: 'new' | 'best-seller' }[];
  showViewAll?: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function ProductSection({
  title,
  products,
  tabs,
  showViewAll = true,
  viewAllHref = '/collections',
  viewAllLabel = 'Xem tất cả',
}: ProductSectionProps) {
  const [activeTab, setActiveTab] = useState(0);

  const filtered = tabs?.[activeTab]?.tag
    ? products.filter((p) => p.tags.includes(tabs[activeTab].tag!))
    : products;

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="container-mqb">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
          <h2 className="text-heading-lg uppercase">{title}</h2>
          {showViewAll && (
            <Link
              href={viewAllHref}
              className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-black transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              {viewAllLabel}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {tabs && tabs.length > 0 && (
          <div className="flex flex-wrap gap-2 md:gap-4 mb-10">
            {tabs.map((tab, index) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(index)}
                className={cn(
                  'rounded-full px-6 py-2.5 text-[15px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
                  activeTab === index
                    ? 'bg-black text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Added min-height to prevent layout shift during tab changes */}
        <div className="min-h-[400px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl bg-[#f7f7f5]">
              <PackageOpen size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có sản phẩm</h3>
              <p className="text-sm text-gray-500 max-w-md">Hiện chưa có sản phẩm nào trong danh mục này. Vui lòng quay lại sau.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {filtered.slice(0, 8).map((product) => (
                <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
