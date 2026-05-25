'use client';

import { useState } from 'react';
import { ProductCard } from './product-card';

interface ProductSectionProps {
  title: string;
  tabs?: string[];
  defaultTab?: number;
  showViewAll?: boolean;
}

const products = [
  {
    id: 1,
    name: 'MQB® Essential Slide',
    price: 680000,
    colors: ['#0A0A0A'],
    image: 'slide-1.jpg',
  },
  {
    id: 2,
    name: 'MQB® Rhinestone Long Sleeve Body Tee',
    price: 720000,
    colors: ['#0A0A0A', '#FF3B30'],
    image: 'tee-1.jpg',
    isBestSeller: true,
  },
  {
    id: 3,
    name: 'MQB® Triple Star Corduroy Classic Cap',
    price: 580000,
    colors: ['#FF3B30'],
    image: 'cap-1.jpg',
  },
  {
    id: 4,
    name: 'MQB® Seasonal Hoodie Rosy',
    price: 820000,
    colors: ['#0A0A0A', '#8B8B8B'],
    image: 'hoodie-1.jpg',
  },
];

export function ProductSection({
  title,
  tabs,
  defaultTab = 0,
  showViewAll = true,
}: ProductSectionProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="container-mqb">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-heading-lg uppercase">{title}</h2>
          {showViewAll && (
            <a
              href="#"
              className="text-xs md:text-sm font-bold bg-black text-white px-4 py-2 hover:opacity-80 transition"
            >
              Xem lại cả bộ sưu tập
            </a>
          )}
        </div>

        {/* Tabs */}
        {tabs && tabs.length > 0 && (
          <div className="flex gap-6 md:gap-8 mb-12 border-b border-[#E5E5E5]">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(index)}
                className={`pb-4 text-sm md:text-base font-medium transition-all duration-300 ${
                  activeTab === index
                    ? 'text-black border-b-2 border-black'
                    : 'text-secondary hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
