import { getCommerceClient } from '@/lib/commerce/get-client';
import { ProductGrid } from '@/components/store/product-grid';
import { CollectionsFilter } from '@/components/store/collections-filter';

export const metadata = {
  title: 'Bộ sưu tập',
};

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

  const title =
    params.tag === 'new'
      ? 'Hàng mới về'
      : params.tag === 'best-seller'
      ? 'Sản phẩm bán chạy'
      : 'Tất cả sản phẩm';

  const description =
    params.tag === 'new'
      ? 'Cập nhật những xu hướng thời trang mới nhất từ B&D.'
      : params.tag === 'best-seller'
      ? 'Những sản phẩm được yêu thích nhất bởi cộng đồng.'
      : 'Khám phá toàn bộ bộ sưu tập thời trang của chúng tôi.';

  return (
    <div className="animate-page-fade-in">
      {/* Hero Banner */}
      <div className="bg-white border-b border-border py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
        <div className="container-mqb text-center relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center justify-center gap-2">
            <span>B&D</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>{title}</span>
          </p>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4 text-black">
            {title}
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed text-[15px]">
            {description}
          </p>
        </div>
      </div>

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
