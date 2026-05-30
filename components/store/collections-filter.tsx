'use client';

import { useRouter } from 'next/navigation';
import { Filter } from 'lucide-react';

interface CollectionsFilterProps {
  productCount: number;
  currentTag?: string;
}

export function CollectionsFilter({ productCount, currentTag }: CollectionsFilterProps) {
  const router = useRouter();

  const handleCategoryChange = (tag: string | null) => {
    if (tag) {
      router.push(`/collections?tag=${tag}`);
    } else {
      router.push('/collections');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center gap-2 font-bold mb-6 pb-4 border-b border-border">
        <Filter size={18} />
        <span>Bộ lọc</span>
      </div>

      {/* Danh mục */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
          Danh mục
        </h3>
        <ul className="space-y-2 text-[15px]">
          <li>
            <button
              onClick={() => handleCategoryChange(null)}
              className={`block w-full text-left transition-colors ${
                !currentTag ? 'font-bold text-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Tất cả sản phẩm
            </button>
          </li>
          <li>
            <button
              onClick={() => handleCategoryChange('new')}
              className={`block w-full text-left transition-colors ${
                currentTag === 'new' ? 'font-bold text-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Hàng mới về
            </button>
          </li>
          <li>
            <button
              onClick={() => handleCategoryChange('best-seller')}
              className={`block w-full text-left transition-colors ${
                currentTag === 'best-seller'
                  ? 'font-bold text-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Bán chạy
            </button>
          </li>
        </ul>
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-sm text-gray-500">
          Hiển thị <strong className="text-black">{productCount}</strong> sản phẩm
        </p>
      </div>
    </div>
  );
}
