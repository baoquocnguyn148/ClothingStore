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
              <div className="relative aspect-[4/5] overflow-hidden mb-3 rounded-xl shadow-sm border border-black/5 group-hover:shadow-md transition-all duration-300">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1">{getHomeText(content, 'styling.card_label')}</p>
                  <p className="text-[11px] text-gray-300 font-medium">{post.date}</p>
                </div>
              </div>
              <h3 className="text-sm md:text-base font-bold line-clamp-2 mt-2 group-hover:text-gray-600 transition-colors">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
