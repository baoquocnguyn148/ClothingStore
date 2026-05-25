import Link from 'next/link';
import { ProductForm } from '@/components/admin/product-form';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Tạo sản phẩm — Admin B&D' };
export const dynamic = 'force-dynamic';

export default function NewAdminProductPage() {
  return (
    <div className="admin-page max-w-4xl">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/products" className="admin-back-link flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Quay lại danh sách sản phẩm
          </Link>
          <h1 className="admin-page-title">Tạo sản phẩm mới</h1>
          <p className="admin-page-subtitle">Nhập thông tin cơ bản trước, sau đó cập nhật chi tiết sản phẩm.</p>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}
