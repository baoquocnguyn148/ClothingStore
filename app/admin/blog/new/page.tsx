import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BlogPostForm } from '@/components/admin/blog-post-form';

export const metadata = { title: 'Tạo blog post — Admin B&D' };
export const dynamic = 'force-dynamic';

export default function NewBlogPostPage() {
  return (
    <div className="admin-page max-w-5xl">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/blog" className="admin-back-link flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Quay lại danh sách
          </Link>
          <h1 className="admin-page-title">Tạo bài viết</h1>
          <p className="admin-page-subtitle">Bài viết sẽ hiển thị tại /blog/post/[slug]</p>
        </div>
      </div>

      <BlogPostForm
        initial={{
          slug: '',
          title: '',
          excerpt: '',
          imageUrl: '',
          publishedAt: '',
          published: true,
          linkedProducts: [],
        }}
      />
    </div>
  );
}

