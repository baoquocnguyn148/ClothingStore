import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost } from '@/lib/commerce/types';
import type { HomeContentMap } from '@/lib/home-content/defaults';
import { getHomeText } from '@/lib/home-content/defaults';

interface StylingSectionProps {
  posts: BlogPost[];
  content: HomeContentMap;
}

export function StylingSection({ posts, content }: StylingSectionProps) {
  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="container-mqb">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-heading-lg uppercase">
            {getHomeText(content, 'styling.title')}
          </h2>
          <Link
            href="/blog"
            className="text-xs md:text-sm font-bold bg-black text-white px-4 py-2 hover:opacity-80 transition"
          >
            {getHomeText(content, 'styling.cta')}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {posts.slice(0, 8).map((post) => (
            <Link
              key={post.slug}
              href={`/blog/post/${post.slug}`}
              className="group"
            >
              <div className="relative aspect-square overflow-hidden mb-3">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3">
                  <p className="text-xs uppercase">{getHomeText(content, 'styling.card_label')}</p>
                  <p className="text-xs opacity-80">{post.date}</p>
                </div>
              </div>
              <h3 className="text-xs md:text-sm font-bold uppercase line-clamp-2">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
