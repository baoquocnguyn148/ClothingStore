'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense, type FormEvent } from 'react';
import type { Product } from '@/lib/commerce/types';
import { ProductGrid } from '@/components/store/product-grid';
import { Search as SearchIcon, SearchX } from 'lucide-react';
import Link from 'next/link';

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
    if (!q) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/products?${searchQueryString}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setError('Không thể tải kết quả. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [searchQueryString, q]);

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
    <div className="animate-page-fade-in">
      <div className="bg-[#FAFAFA] border-b border-border py-12 md:py-20">
        <div className="container-mqb max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-8">
            Tìm kiếm sản phẩm
          </h1>
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center w-full shadow-sm rounded-xl overflow-hidden border-2 border-transparent focus-within:border-black transition-colors bg-white"
          >
            <div className="pl-5 text-gray-400">
              <SearchIcon size={20} />
            </div>
            <input
              name="q"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Nhập tên sản phẩm..."
              className="flex-1 px-4 py-4 text-base bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="bg-black text-white px-8 py-4 font-semibold text-sm transition-colors hover:bg-neutral-800"
            >
              Tìm kiếm
            </button>
          </form>
          {q && !loading && (
            <p className="mt-6 text-gray-500">
              Tìm thấy <strong className="text-black">{products.length}</strong> kết quả cho "{q}"
            </p>
          )}
        </div>
      </div>

      <div className="container-mqb py-16">
        {!q ? (
          <div className="text-center py-10">
            <SearchIcon size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 mb-6">Nhập từ khóa để bắt đầu tìm kiếm.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-400 mr-2 self-center">Gợi ý:</span>
              <Link href="/collections?tag=new" className="px-4 py-2 rounded-full bg-gray-100 text-sm font-medium hover:bg-gray-200 transition-colors">Áo Thun</Link>
              <Link href="/collections?tag=new" className="px-4 py-2 rounded-full bg-gray-100 text-sm font-medium hover:bg-gray-200 transition-colors">Hoodie</Link>
              <Link href="/collections?tag=best-seller" className="px-4 py-2 rounded-full bg-gray-100 text-sm font-medium hover:bg-gray-200 transition-colors">Bán chạy</Link>
            </div>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/5] skeleton-pulse" />
                <div className="h-4 skeleton-pulse w-2/3" />
                <div className="h-4 skeleton-pulse w-1/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <SearchX size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-500">Không có sản phẩm nào khớp với "{q}". Vui lòng thử từ khóa khác.</p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-mqb py-16 text-center skeleton-pulse h-[400px] w-full" />}>
      <SearchContent />
    </Suspense>
  );
}
