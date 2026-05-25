import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CollectionForm } from '@/components/admin/collection-form';

export const metadata = { title: 'Tạo collection — Admin B&D' };
export const dynamic = 'force-dynamic';

export default function NewCollectionPage() {
  return (
    <div className="admin-page max-w-4xl">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/collections" className="admin-back-link flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Quay lại danh sách
          </Link>
          <h1 className="admin-page-title">Tạo collection</h1>
          <p className="admin-page-subtitle">Tạo danh mục sản phẩm cho storefront</p>
        </div>
      </div>

      <CollectionForm
        initial={{
          handle: '',
          title: '',
          description: '',
          imageUrl: '',
          sortOrder: 0,
          published: true,
          products: [],
        }}
      />
    </div>
  );
}

