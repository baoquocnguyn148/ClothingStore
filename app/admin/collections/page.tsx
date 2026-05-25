import Link from 'next/link';
import { isSupabaseMode } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import { Plus, FolderKanban } from 'lucide-react';

export const metadata = { title: 'Collections — Admin B&D' };
export const dynamic = 'force-dynamic';

export default async function AdminCollectionsPage() {
  const isSupa = isSupabaseMode();
  let collections: any[] = [];

  if (isSupa) {
    const db = createAdminClient();
    const { data } = await db
      .from('collections')
      .select('id, handle, title, sort_order, published, created_at')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    collections = data ?? [];
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Collections</h1>
          <p className="admin-page-subtitle">Quản lý danh mục hiển thị trên storefront</p>
        </div>
        <div className="admin-page-actions">
          <Link href="/admin/collections/new" className="admin-btn admin-btn-primary">
            <Plus size={16} /> Tạo collection
          </Link>
        </div>
      </div>

      {!isSupa && (
        <div className="admin-notice">
          <FolderKanban size={16} />
          <span>Chế độ Mock — kết nối Supabase để quản lý collection</span>
        </div>
      )}

      <div className="admin-card">
        {collections.length === 0 ? (
          <div className="admin-empty-state">
            <FolderKanban size={48} />
            <h3>Chưa có collection</h3>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Handle</th>
                  <th>Sort</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {collections.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium">{c.title}</td>
                    <td className="admin-table-mono">{c.handle}</td>
                    <td>{c.sort_order}</td>
                    <td>
                      {c.published ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <Link href={`/admin/collections/${c.id}`} className="admin-btn admin-btn-secondary admin-btn-sm">
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

