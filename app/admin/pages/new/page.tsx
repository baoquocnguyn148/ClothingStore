import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CmsPageForm } from '@/components/admin/cms-page-form';

export const metadata = { title: 'Tạo CMS page — Admin B&D' };
export const dynamic = 'force-dynamic';

export default function NewCmsPage() {
  return (
    <div className="admin-page max-w-5xl">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/pages" className="admin-back-link flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Quay lại danh sách
          </Link>
          <h1 className="admin-page-title">Tạo CMS page</h1>
          <p className="admin-page-subtitle">Trang nội dung sẽ hiển thị tại /pages/[slug]</p>
        </div>
      </div>

      <CmsPageForm initial={{ slug: '', title: '', htmlContent: '', published: true }} />
    </div>
  );
}

