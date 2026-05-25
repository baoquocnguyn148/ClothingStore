import Link from 'next/link';
import Image from 'next/image';
import { getCommerceClient } from '@/lib/commerce/get-client';

export const metadata = { title: 'Outfit' };

export default async function BlogPage() {
  const posts = await getCommerceClient().getBlogPosts();

  return (
    <div className="container-mqb py-12 md:py-16">
      <h1 className="text-heading-lg uppercase mb-12">STYLING / Outfit</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/post/${post.slug}`} className="group">
            <div className="relative aspect-[3/4] overflow-hidden mb-3">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <p className="text-xs text-secondary uppercase">{post.date}</p>
            <h2 className="text-sm font-bold uppercase mt-1 line-clamp-2">
              {post.title}
            </h2>
          </Link>
        ))}
      </div>
    </div>
  );
}

