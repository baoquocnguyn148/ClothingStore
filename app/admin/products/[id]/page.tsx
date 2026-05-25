import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProductForm } from '@/components/admin/product-form';
import { ProductDeleteButton } from '@/components/admin/product-delete-button';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ProductData {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  base_price: number;
  compare_at_price: number | null;
  category: string;
  published: boolean;
  product_tag_assignments?: Array<{
    tags?: { slug: string; label: string };
  }>;
  product_images?: Array<{
    id: string;
    url: string;
    alt: string | null;
    sort_order: number;
  }>;
  product_variants?: Array<{
    id: string;
    sku: string;
    size: string;
    color_name: string;
    color_hex: string;
    price: number;
    stock_qty: number;
    is_active: boolean;
  }>;
}

type ProductImageRow = NonNullable<ProductData['product_images']>[number];
type ProductVariantRow = NonNullable<ProductData['product_variants']>[number];

async function getProduct(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_tag_assignments ( tags ( slug, label ) ),
      product_images ( id, url, alt, sort_order ),
      product_variants ( id, sku, size, color_name, color_hex, price, stock_qty, is_active )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !data) return null;

  const imageRows = (data.product_images ?? [])
    .sort((a: ProductImageRow, b: ProductImageRow) => a.sort_order - b.sort_order);

  return {
    id: data.id,
    handle: data.handle,
    title: data.title,
    description: data.description,
    basePrice: data.base_price,
    compareAtPrice: data.compare_at_price,
    category: data.category ?? 'general',
    published: data.published,
    tags: (data.product_tag_assignments ?? [])
      .map((a: { tags?: { slug: string } }) => a.tags?.slug)
      .filter(Boolean),
    images: imageRows.map((image: ProductImageRow, index: number) => ({
      id: image.id,
      url: image.url,
      alt: image.alt ?? data.title,
      sortOrder: index,
    })),
    variants: (data.product_variants ?? [])
      .filter((variant: ProductVariantRow) => variant.is_active)
      .sort((a: ProductVariantRow, b: ProductVariantRow) =>
        `${a.size}-${a.color_name}`.localeCompare(`${b.size}-${b.color_name}`)
      )
      .map((variant: ProductVariantRow) => ({
        id: variant.id,
        sku: variant.sku,
        size: variant.size,
        colorName: variant.color_name,
        colorHex: variant.color_hex,
        price: variant.price,
        stockQty: variant.stock_qty,
        isActive: variant.is_active,
      })),
  };
}

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return notFound();

  return (
    <div className="admin-page max-w-4xl">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/products" className="admin-back-link flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Quay lại danh sách sản phẩm
          </Link>
          <h1 className="admin-page-title">Chỉnh sửa sản phẩm</h1>
          <p className="admin-page-subtitle">Cập nhật thông tin sản phẩm hoặc thay đổi trạng thái.</p>
        </div>
        <ProductDeleteButton productId={product.id} productTitle={product.title} />
      </div>

      <ProductForm product={product} />
    </div>
  );
}
