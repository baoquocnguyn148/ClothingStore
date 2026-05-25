import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { isSupabaseMode } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import { BlogPostForm } from '@/components/admin/blog-post-form';

export const metadata = { title: 'Sửa blog post — Admin B&D' };
export const dynamic = 'force-dynamic';

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseMode()) notFound();

  const db = createAdminClient();
  const { data, error } = await db
    .from('blog_posts')
    .select(
      `
      *,
      blog_post_products ( product_id, products ( id, handle, title ) )
    `
    )
    .eq('id', id)
    .single();

  if (error || !data) notFound();

  const linked = (data.blog_post_products ?? [])
    .map((bp: any) => ({
      productId: bp.product_id,
      handle: bp.products?.handle ?? '',
      title: bp.products?.title ?? '',
    }))
    .filter((p: any) => p.productId);

  return (
    <div className="admin-page max-w-5xl">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/blog" className="admin-back-link flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Quay lại danh sách
          </Link>
          <h1 className="admin-page-title">Sửa bài viết</h1>
          <p className="admin-page-subtitle">Cập nhật nội dung và sản phẩm liên quan</p>
        </div>
      </div>

      <BlogPostForm
        initial={{
          id: data.id,
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt ?? '',
          imageUrl: data.image_url ?? '',
          publishedAt: data.published_at ?? '',
          published: data.published ?? true,
          linkedProducts: linked,
        }}
      />
    </div>
  );
}

