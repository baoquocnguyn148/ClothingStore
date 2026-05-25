import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PromotionForm } from '@/components/admin/promotion-form';

export const metadata = { title: 'Tạo khuyến mãi — Admin B&D' };
export const dynamic = 'force-dynamic';

export default function NewPromotionPage() {
  return (
    <div className="admin-page max-w-4xl">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/promotions" className="admin-back-link flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Quay lại danh sách
          </Link>
          <h1 className="admin-page-title">Tạo khuyến mãi mới</h1>
          <p className="admin-page-subtitle">Thiết lập chương trình giảm giá hoặc mã voucher</p>
        </div>
      </div>

      <PromotionForm isEdit={false} />
    </div>
  );
}
