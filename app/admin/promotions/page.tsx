import { isSupabaseMode } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import { Tag, Plus, Edit } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Khuyến mãi — Admin B&D' };
export const dynamic = 'force-dynamic';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export default async function AdminPromotionsPage() {
  const isSupa = isSupabaseMode();
  let promotions: any[] = [];

  if (isSupa) {
    const db = createAdminClient();
    const { data } = await db
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });
    promotions = data ?? [];
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Khuyến mãi & Voucher</h1>
          <p className="admin-page-subtitle">Quản lý các chương trình giảm giá và mã voucher</p>
        </div>
        <div className="admin-page-actions">
          <Link href="/admin/promotions/new" className="admin-btn admin-btn-primary">
            <Plus size={16} /> Tạo khuyến mãi
          </Link>
        </div>
      </div>

      <div className="admin-card">
        {promotions.length === 0 ? (
          <div className="admin-empty-state">
            <Tag size={48} />
            <h3>Chưa có chương trình khuyến mãi nào</h3>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên chương trình</th>
                  <th>Mã (Code)</th>
                  <th>Loại</th>
                  <th>Giá trị</th>
                  <th>Lượt dùng</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name}</td>
                    <td>
                      {p.code ? (
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
                          {p.code}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-sm">Tự động áp dụng</span>
                      )}
                    </td>
                    <td>
                      <span className="capitalize text-sm text-gray-600">{p.type.replace('_', ' ')}</span>
                    </td>
                    <td className="font-medium">
                      {p.type === 'percentage' ? `${p.value}%` : 
                       p.type === 'fixed_amount' ? formatVND(p.value) : 
                       p.type === 'free_shipping' ? 'Miễn phí' : 'Tùy chỉnh'}
                    </td>
                    <td>{p.usage_count} / {p.max_uses || '∞'}</td>
                    <td>
                      {p.published ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td>
                      <Link href={`/admin/promotions/${p.id}`} className="admin-btn-icon admin-btn-secondary">
                        <Edit size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
