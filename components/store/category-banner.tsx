import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { HomeContentMap } from '@/lib/home-content/defaults';
import { getHomeText } from '@/lib/home-content/defaults';

interface CategoryBannerProps {
  content: HomeContentMap;
}

export function CategoryBanner({ content }: CategoryBannerProps) {
  const categories = [
    {
      href: '/collections?tag=new',
      label: getHomeText(content, 'category.card1_label'),
      title: getHomeText(content, 'category.card1_title'),
      description: getHomeText(content, 'category.card1_description'),
    },
    {
      href: '/collections?tag=best-seller',
      label: getHomeText(content, 'category.card2_label'),
      title: getHomeText(content, 'category.card2_title'),
      description: getHomeText(content, 'category.card2_description'),
    },
  ];

  return (
    <section className="w-full border-b border-border py-16 md:py-24 bg-[#FAFAFA]">
      <div className="container-mqb">
        <div className="flex flex-col gap-8 md:gap-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-secondary mb-3">
              {getHomeText(content, 'category.eyebrow')}
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight">
              {getHomeText(content, 'category.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="group block rounded-xl border border-border bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-4">
                  {cat.label}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-black transition-colors group-hover:text-black/80">
                  {cat.title}
                </h3>
                <p className="text-[15px] text-gray-500 leading-relaxed mb-8 max-w-md">
                  {cat.description}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-black transition-transform group-hover:translate-x-1">
                  {getHomeText(content, 'category.card_cta')}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
