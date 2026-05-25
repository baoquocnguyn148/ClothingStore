import Link from 'next/link';
import { isSupabaseMode } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import { Plus, FileText } from 'lucide-react';

export const metadata = { title: 'Blog — Admin B&D' };
export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const isSupa = isSupabaseMode();
  let posts: any[] = [];

  if (isSupa) {
    const db = createAdminClient();
    const { data } = await db
      .from('blog_posts')
      .select('id, slug, title, published_at, published, created_at')
      .order('created_at', { ascending: false });
    posts = data ?? [];
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Blog</h1>
          <p className="admin-page-subtitle">Tạo/sửa bài viết (Outfit) và gắn sản phẩm liên quan</p>
        </div>
        <div className="admin-page-actions">
          <Link href="/admin/blog/new" className="admin-btn admin-btn-primary">
            <Plus size={16} /> Tạo bài viết
          </Link>
        </div>
      </div>

      {!isSupa && (
        <div className="admin-notice">
          <FileText size={16} />
          <span>Chế độ Mock — kết nối Supabase để quản lý blog</span>
        </div>
      )}

      <div className="admin-card">
        {posts.length === 0 ? (
          <div className="admin-empty-state">
            <FileText size={48} />
            <h3>Chưa có bài viết</h3>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Slug</th>
                  <th>Ngày</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.title}</td>
                    <td className="admin-table-mono">{p.slug}</td>
                    <td className="text-sm text-gray-500">{p.published_at ?? '—'}</td>
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
                    <td className="text-right">
                      <Link href={`/admin/blog/${p.id}`} className="admin-btn admin-btn-secondary admin-btn-sm">
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
