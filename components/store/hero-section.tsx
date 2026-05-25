'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BRAND } from '@/lib/brand';
import type { HomeContentMap } from '@/lib/home-content/defaults';
import { getHomeText } from '@/lib/home-content/defaults';

interface HeroSectionProps {
  content: HomeContentMap;
}

export function HeroSection({ content }: HeroSectionProps) {
  return (
    <section className="w-full bg-white py-0 relative">
      <div className="relative w-full h-[500px] md:h-[600px] lg:h-[750px]">
        <Image
          src="/images/banners/banner1.png"
          alt={`${BRAND.fullName} hero campaign`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-8 left-8 md:bottom-16 md:left-16 text-white">
          <p className="text-xs md:text-sm font-medium tracking-widest mb-2">
            {getHomeText(content, 'hero.eyebrow')}
          </p>
          <h1 className="text-heading-xl text-white max-w-xl">
            {getHomeText(content, 'hero.title')}
          </h1>
          <p className="text-sm md:text-base mt-2 opacity-90">
            {getHomeText(content, 'hero.subtitle')}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href={getHomeText(content, 'hero.primary_href')}
              className="btn-primary text-sm"
            >
              {getHomeText(content, 'hero.primary_label')}
            </Link>
            <Link
              href={getHomeText(content, 'hero.secondary_href')}
              className="btn-secondary text-sm bg-white/10 border-white text-white hover:bg-white hover:text-black"
            >
              {getHomeText(content, 'hero.secondary_label')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
