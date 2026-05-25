import Link from 'next/link';
import { isSupabaseMode } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import { Plus, FileText } from 'lucide-react';

export const metadata = { title: 'CMS pages — Admin B&D' };
export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
  const isSupa = isSupabaseMode();
  let pages: any[] = [];

  if (isSupa) {
    const db = createAdminClient();
    const { data } = await db
      .from('cms_pages')
      .select('id, slug, title, published, updated_at')
      .order('updated_at', { ascending: false });
    pages = data ?? [];
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">CMS pages</h1>
          <p className="admin-page-subtitle">Quản lý chính sách (shipping/returns/...) và các trang nội dung</p>
        </div>
        <div className="admin-page-actions">
          <Link href="/admin/pages/new" className="admin-btn admin-btn-primary">
            <Plus size={16} /> Tạo page
          </Link>
        </div>
      </div>

      {!isSupa && (
        <div className="admin-notice">
          <FileText size={16} />
          <span>Chế độ Mock — kết nối Supabase để quản lý CMS pages</span>
        </div>
      )}

      <div className="admin-card">
        {pages.length === 0 ? (
          <div className="admin-empty-state">
            <FileText size={48} />
            <h3>Chưa có page</h3>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Slug</th>
                  <th>Trạng thái</th>
                  <th>Cập nhật</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.title}</td>
                    <td className="admin-table-mono">{p.slug}</td>
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
                    <td className="text-sm text-gray-500">{p.updated_at ? new Date(p.updated_at).toLocaleString('vi-VN') : '—'}</td>
                    <td className="text-right">
                      <Link href={`/admin/pages/${p.id}`} className="admin-btn admin-btn-secondary admin-btn-sm">
                        Sửa
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

