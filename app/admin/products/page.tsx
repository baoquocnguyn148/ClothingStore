import { isSupabaseMode } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import { Package, Plus, ExternalLink, Edit } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductDeleteButton } from '@/components/admin/product-delete-button';
import { resolveProductImages } from '@/lib/commerce/product-images';

export const metadata = { title: 'Sản phẩm — Admin B&D' };
export const dynamic = 'force-dynamic';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}) {
  const isSupa = isSupabaseMode();
  let products: any[] = [];
  let total = 0;

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page ?? '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  if (isSupa) {
    const db = createAdminClient();
    let q = db
      .from('products')
      .select(`
        id, handle, title, base_price, category, published,
        product_images ( url, sort_order ),
        product_variants ( stock_qty )
      `, { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (resolvedParams.search) q = q.ilike('title', `%${resolvedParams.search}%`);
    if (resolvedParams.category) q = q.eq('category', resolvedParams.category);

    const { data, count } = await q;
    
    // Process products
    products = (data ?? []).map((p) => {
      const variants = p.product_variants ?? [];
      const totalStock = variants.reduce((s: number, v: { stock_qty: number }) => s + (v.stock_qty ?? 0), 0);
      const dbImages = (p.product_images ?? [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url ?? null;
      const primaryImage = resolveProductImages({
        title: p.title,
        handle: p.handle,
        images: dbImages ? [dbImages] : [],
      })[0] ?? null;
        
      return { ...p, totalStock, primaryImage };
    });
    
    total = count ?? 0;
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý sản phẩm</h1>
          <p className="admin-page-subtitle">{total} sản phẩm tìm thấy</p>
        </div>
        <div className="admin-page-actions">
          <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
            <Plus size={16} /> Thêm sản phẩm
          </Link>
        </div>
      </div>

      <div className="admin-card">
        {products.length === 0 ? (
          <div className="admin-empty-state">
            <Package size={48} />
            <h3>Không có sản phẩm nào</h3>
            <p>Hãy thêm sản phẩm đầu tiên của bạn.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Phân loại</th>
                  <th>Giá bán</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {product.primaryImage ? (
                          <div className="w-10 h-10 rounded overflow-hidden relative flex-shrink-0 bg-gray-100">
                            <Image 
                              src={product.primaryImage} 
                              alt={product.title} 
                              fill 
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
                            <Package size={20} />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{product.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{product.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="capitalize">{product.category}</td>
                    <td className="font-medium">{formatVND(product.base_price)}</td>
                    <td>
                      <span className={`admin-stock-qty ${product.totalStock === 0 ? 'sold-out' : product.totalStock <= 5 ? 'low' : 'normal'}`}>
                        {product.totalStock}
                      </span>
                    </td>
                    <td>
                      {product.published ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Hiển thị
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Đã ẩn
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <Link href={`/products/${product.handle}`} target="_blank" className="admin-btn-icon admin-btn-ghost">
                          <ExternalLink size={16} />
                        </Link>
                        <Link href={`/admin/products/${product.id}`} className="admin-btn-icon admin-btn-secondary">
                          <Edit size={16} />
                        </Link>
                        <ProductDeleteButton
                          productId={product.id}
                          productTitle={product.title}
                          compact
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Link 
              href={`/admin/products?page=${page - 1}`}
              className={`admin-btn admin-btn-secondary ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Trang trước
            </Link>
            <span className="text-sm">Trang {page} / {totalPages}</span>
            <Link 
              href={`/admin/products?page=${page + 1}`}
              className={`admin-btn admin-btn-secondary ${page >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Trang sau
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
