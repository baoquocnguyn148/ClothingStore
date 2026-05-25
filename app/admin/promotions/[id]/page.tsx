import { isSupabaseMode } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import { Tag, Save, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PromotionForm } from '@/components/admin/promotion-form';

export const metadata = { title: 'Sửa khuyến mãi — Admin B&D' };
export const dynamic = 'force-dynamic';

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: promotionId } = await params;
  const isSupa = isSupabaseMode();
  let promotion: any = null;

  if (isSupa) {
    const db = createAdminClient();
    const { data } = await db
      .from('promotions')
      .select('*')
      .eq('id', promotionId)
      .single();
    promotion = data;
  }

  if (!promotion) {
    notFound();
  }

  return (
    <div className="admin-page max-w-4xl">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/promotions" className="admin-back-link flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Quay lại danh sách
          </Link>
          <h1 className="admin-page-title">Sửa khuyến mãi</h1>
          <p className="admin-page-subtitle">Chỉnh sửa thông tin chương trình giảm giá</p>
        </div>
      </div>

      <PromotionForm promotion={promotion} isEdit={true} />
    </div>
  );
}
