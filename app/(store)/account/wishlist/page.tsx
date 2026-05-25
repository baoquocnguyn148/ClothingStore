'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/commerce/types';
import { useWishlist } from '@/lib/wishlist/wishlist-context';
import { ProductCard } from '@/components/store/product-card';

export default function WishlistPage() {
  const { handles } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (handles.length === 0) {
      setProducts([]);
      return;
    }
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: { products: Product[] }) => {
        setProducts(
          data.products.filter((p: Product) => handles.includes(p.handle))
        );
      });
  }, [handles]);

  return (
    <div>
      <h1 className="text-heading-md uppercase mb-8">Yêu thích</h1>
      {products.length === 0 ? (
        <>
          <p className="text-secondary mb-6">
            Danh sách yêu thích trống. Nhấn biểu tượng trái tim trên sản phẩm để lưu.
          </p>
          <Link href="/collections" className="btn-primary">
            Khám phá sản phẩm
          </Link>
        </>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
