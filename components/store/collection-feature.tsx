import Link from 'next/link';
import Image from 'next/image';
import { featuredCollections } from '@/data/mock/collections';
import type { HomeContentMap } from '@/lib/home-content/defaults';
import { getHomeText } from '@/lib/home-content/defaults';

interface CollectionFeatureProps {
  content: HomeContentMap;
}

export function CollectionFeature({ content }: CollectionFeatureProps) {
  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="container-mqb">
        <div className="mb-20 max-w-3xl mx-auto text-center">
          <h2 className="text-heading-lg uppercase mb-6">
            {getHomeText(content, 'collection.title')}
          </h2>
          <p className="text-base text-gray-500 leading-relaxed mb-8">
            {getHomeText(content, 'collection.description')}
          </p>
          <Link href={getHomeText(content, 'collection.cta_href')} className="btn-primary inline-block">
            {getHomeText(content, 'collection.cta')}
          </Link>
        </div>

        <div>
          <h2 className="text-2xl md:text-4xl font-extrabold uppercase mb-10 text-center tracking-tight">
            {getHomeText(content, 'collection.grid_title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredCollections.map((col) => (
              <Link
                key={col.handle}
                href={`/categories/${col.handle}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-0 flex items-end p-8">
                  <div className="transform transition-transform duration-300 ease-out group-hover:-translate-y-2">
                    <p className="text-white text-xl md:text-2xl font-bold uppercase tracking-wide">
                      {col.title}
                    </p>
                    <span className="mt-3 inline-block h-0.5 w-12 bg-white transition-all duration-300 group-hover:w-20" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
