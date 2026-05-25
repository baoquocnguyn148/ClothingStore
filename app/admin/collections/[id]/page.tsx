import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { isSupabaseMode } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import { CollectionForm } from '@/components/admin/collection-form';

export const metadata = { title: 'Sửa collection — Admin B&D' };
export const dynamic = 'force-dynamic';

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseMode()) notFound();

  const db = createAdminClient();
  const { data, error } = await db
    .from('collections')
    .select(
      `
      id, handle, title, description, image_url, sort_order, published,
      collection_products (
        product_id, sort_order,
        products ( id, handle, title )
      )
    `
    )
    .eq('id', id)
    .single();

  if (error || !data) notFound();

  const assigned = (data.collection_products ?? [])
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((cp: any, idx: number) => ({
      productId: cp.product_id,
      handle: cp.products?.handle ?? '',
      title: cp.products?.title ?? '',
      sortOrder: idx,
    }))
    .filter((p: any) => p.productId);

  return (
    <div className="admin-page max-w-4xl">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/collections" className="admin-back-link flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Quay lại danh sách
          </Link>
          <h1 className="admin-page-title">Sửa collection</h1>
          <p className="admin-page-subtitle">Chỉnh sửa thông tin và thứ tự sản phẩm</p>
        </div>
      </div>

      <CollectionForm
        initial={{
          id: data.id,
          handle: data.handle,
          title: data.title,
          description: data.description ?? '',
          imageUrl: data.image_url ?? '',
          sortOrder: data.sort_order ?? 0,
          published: data.published ?? true,
          products: assigned,
        }}
      />
    </div>
  );
}

