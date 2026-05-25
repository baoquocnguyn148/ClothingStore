import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getCommerceClient } from '@/lib/commerce/get-client';
import { ProductCard } from '@/components/store/product-card';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getCommerceClient().getBlogPostBySlug(slug);
  return { title: post?.title ?? 'Outfit' };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const commerce = getCommerceClient();
  const post = await commerce.getBlogPostBySlug(slug);

  if (!post) notFound();

  const all = await commerce.getProducts();
  const linked = all.filter((p) =>
    post.linkedProductHandles.includes(p.handle)
  );

  return (
    <article className="container-mqb py-12 md:py-16">
      <p className="text-xs text-secondary uppercase mb-2">
        Outfit · {post.date}
      </p>
      <h1 className="text-heading-lg uppercase mb-8 max-w-3xl">{post.title}</h1>
      <div className="relative aspect-[4/5] max-w-2xl mb-12 overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 672px"
          priority
        />
      </div>
      <p className="text-secondary max-w-2xl mb-16">{post.excerpt}</p>

      {linked.length > 0 && (
        <section>
          <h2 className="text-heading-md uppercase mb-8">Sản phẩm trong outfit</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {linked.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
