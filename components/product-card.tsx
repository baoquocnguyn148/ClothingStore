'use client';

import { useState } from 'react';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  colors: string[];
  image: string;
  image2?: string;
  isNew?: boolean;
  isSale?: boolean;
  isBestSeller?: boolean;
}

export function ProductCard({
  id,
  name,
  price,
  colors,
  image,
  image2,
  isNew,
  isSale,
  isBestSeller,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="group cursor-pointer">
      {/* Product Image */}
      <div
        className="relative w-full aspect-square bg-muted rounded-none overflow-hidden mb-4"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4F4F4] to-[#E5E5E5] flex items-center justify-center">
          <span className="text-secondary text-sm">PRODUCT IMAGE</span>
        </div>

        {/* Badges */}
        {isNew && (
          <div className="absolute top-4 left-4 bg-black text-white px-2 py-1 text-xs font-bold">
            NEW
          </div>
        )}
        {isSale && (
          <div className="absolute top-4 left-4 bg-[#FF3B30] text-white px-2 py-1 text-xs font-bold">
            SALE
          </div>
        )}
        {isBestSeller && (
          <div className="absolute top-4 left-4 bg-black text-white px-2 py-1 text-xs font-bold">
            BEST SELLER
          </div>
        )}

        {/* Quick View on Hover */}
        {hovered && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
            <button className="btn-primary">QUICK VIEW</button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        <h3 className="text-sm md:text-base font-bold mb-2 uppercase tracking-tight">
          {name}
        </h3>

        {/* Color Swatches */}
        <div className="flex gap-2 mb-3">
          {colors.map((color) => (
            <div
              key={color}
              className="w-6 h-6 rounded-full border border-[#E5E5E5] cursor-pointer hover:border-black transition"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Price */}
        <p className="text-sm md:text-base font-medium text-black">
          {price >= 100000 ? `${(price / 1000).toLocaleString()} VND` : `$${price.toLocaleString()}`}
        </p>
      </div>
    </div>
  );
}
