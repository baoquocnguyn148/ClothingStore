'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense, type FormEvent } from 'react';
import type { Product } from '@/lib/commerce/types';
import { ProductGrid } from '@/components/store/product-grid';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQueryString = searchParams.toString();
  const q = searchParams.get('q') ?? '';

  const [inputValue, setInputValue] = useState(q);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(q);
  }, [q]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/products?${searchQueryString}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setError('Không thể tải kết quả. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [searchQueryString]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchQueryString);
    if (inputValue.trim()) {
      params.set('q', inputValue.trim());
    } else {
      params.delete('q');
    }
    const queryString = params.toString();
    router.push(`/search${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="container-mqb py-12 md:py-16">
      <h1 className="text-heading-lg uppercase mb-8">
        {q ? `Kết quả: "${q}"` : 'Tìm kiếm'}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="mb-12 max-w-md flex gap-2"
      >
        <input
          name="q"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Tìm sản phẩm..."
          className="flex-1 border border-border px-4 py-3 text-sm"
        />
        <button
          type="submit"
          className="btn-primary px-6 py-3 text-sm"
        >
          Tìm
        </button>
      </form>
      {loading ? (
        <p className="text-secondary">Đang tìm...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ProductGrid products={products} showFilters={true} />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-mqb py-16">Đang tải...</div>}>
      <SearchContent />
    </Suspense>
  );
}
