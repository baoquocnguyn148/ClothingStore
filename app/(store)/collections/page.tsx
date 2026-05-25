import { getCommerceClient } from '@/lib/commerce/get-client';
import { ProductGrid } from '@/components/store/product-grid';

export const metadata = {
  title: 'Collection',
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

  return (
    <div className="container-mqb py-12 md:py-16">
      <h1 className="text-heading-lg uppercase mb-2">Collection</h1>
      <p className="text-secondary text-sm mb-12">
        Home / Collection Page
      </p>
      <ProductGrid products={products} />
    </div>
  );
}

