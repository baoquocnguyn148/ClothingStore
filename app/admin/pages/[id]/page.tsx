import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { isSupabaseMode } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import { CmsPageForm } from '@/components/admin/cms-page-form';

export const metadata = { title: 'Sửa CMS page — Admin B&D' };
export const dynamic = 'force-dynamic';

export default async function EditCmsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseMode()) notFound();

  const db = createAdminClient();
  const { data, error } = await db.from('cms_pages').select('*').eq('id', id).single();
  if (error || !data) notFound();

  return (
    <div className="admin-page max-w-5xl">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/pages" className="admin-back-link flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Quay lại danh sách
          </Link>
          <h1 className="admin-page-title">Sửa CMS page</h1>
          <p className="admin-page-subtitle">Cập nhật nội dung và trạng thái</p>
        </div>
      </div>

      <CmsPageForm
        initial={{
          id: data.id,
          slug: data.slug,
          title: data.title,
          htmlContent: data.html_content ?? '',
          published: data.published ?? true,
        }}
      />
    </div>
  );
}

