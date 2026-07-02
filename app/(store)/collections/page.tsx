import Image from 'next/image';
import { getCommerceClient } from '@/lib/commerce/get-client';
import { ProductGrid } from '@/components/store/product-grid';
import { CollectionsFilter } from '@/components/store/collections-filter';
import type { Metadata } from 'next';

const bannerMap: Record<string, string> = {
  new: '/images/lifestyle/lifestyle_1.png',
  'best-seller': '/images/lifestyle/lifestyle_2.png',
  default: '/images/banners/banner1.png',
};

const titleMap: Record<string, string> = {
  new: 'Hàng mới về',
  'best-seller': 'Sản phẩm bán chạy',
  default: 'Tất cả sản phẩm',
};

const descriptionMap: Record<string, string> = {
  new: 'Cập nhật những xu hướng thời trang mới nhất từ B&D.',
  'best-seller': 'Những sản phẩm được yêu thích nhất bởi cộng đồng.',
  default: 'Khám phá toàn bộ bộ sưu tập thời trang của chúng tôi.',
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const tag = params.tag ?? 'default';
  const title = titleMap[tag] ?? titleMap.default;
  return {
    title: `${title} — B&D Fashion`,
    description: descriptionMap[tag] ?? descriptionMap.default,
  };
}

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string }>;
}) {
  const params = await searchParams;
  const commerce = getCommerceClient();

  let products = await commerce.getProducts({ query: params.q });

  if (params.tag === 'new') {
    products = products.filter((p) => p.tags.includes('new'));
  } else if (params.tag === 'best-seller') {
    products = products.filter((p) => p.tags.includes('best-seller'));
  }

  const tag = params.tag ?? 'default';
  const title = titleMap[tag] ?? titleMap.default;
  const description = descriptionMap[tag] ?? descriptionMap.default;
  const bannerSrc = bannerMap[tag] ?? bannerMap.default;

  return (
    <div className="animate-page-fade-in">
      {/* Hero Banner — full-bleed với ảnh nền + gradient overlay */}
      <div className="relative min-h-[280px] md:min-h-[400px] overflow-hidden">
        {/* Background image */}
        <Image
          src={bannerSrc}
          alt={title}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Gradient overlay từ đen lên trong */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

        {/* Text content — bottom-left */}
        <div className="absolute bottom-8 md:bottom-14 left-6 md:left-16 right-6 md:right-16 z-10">
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Breadcrumb */}
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-300 mb-3 flex items-center gap-2">
              <span>B&D</span>
              <span className="w-1 h-1 rounded-full bg-gray-400 inline-block" />
              <span>{title}</span>
            </p>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-3 max-w-2xl leading-none">
              {title}
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-base md:text-lg max-w-md leading-relaxed">
              {description}
            </p>

            {/* Product count badge */}
            <div className="mt-5">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-white/30">
                {products.length} sản phẩm
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products + Filter */}
      <div className="container-mqb py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Filter */}
          <aside className="w-full lg:w-[260px] shrink-0 lg:sticky lg:top-24">
            <CollectionsFilter productCount={products.length} currentTag={params.tag} />
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {products.length === 0 ? (
              <div className="py-20 text-center border border-border rounded-xl bg-gray-50">
                <p className="text-lg font-semibold mb-2">Không tìm thấy sản phẩm</p>
                <p className="text-gray-500 text-sm">Vui lòng thử lại với bộ lọc khác.</p>
              </div>
            ) : (
              <ProductGrid products={products} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
