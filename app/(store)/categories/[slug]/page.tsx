import { notFound } from 'next/navigation';
import { getCommerceClient } from '@/lib/commerce/get-client';
import { ProductGrid } from '@/components/store/product-grid';

function formatCategoryTitle(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const commerce = getCommerceClient();
  const collection = await commerce.getCollectionByHandle(slug);
  if (collection) return { title: collection.title };

  const products = await commerce.getProducts({ category: slug });
  return { title: products.length ? formatCategoryTitle(slug) : 'Category' };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const commerce = getCommerceClient();
  const collection = await commerce.getCollectionByHandle(slug);

  if (collection) {
    const products = await commerce.getProducts({ collectionHandle: slug });

    return (
      <div className="container-mqb py-12 md:py-16">
        <h1 className="text-heading-lg uppercase mb-4">{collection.title}</h1>
        {collection.description && (
          <p className="text-secondary text-sm mb-12 max-w-2xl">
            {collection.description}
          </p>
        )}
        <ProductGrid products={products} />
      </div>
    );
  }

  const products = await commerce.getProducts({ category: slug });
  if (products.length === 0) notFound();
  const title = formatCategoryTitle(slug);

  return (
    <div className="container-mqb py-12 md:py-16">
      <h1 className="text-heading-lg uppercase mb-2">{title}</h1>
      <p className="text-secondary text-sm mb-12">
        Home / Category / {title}
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
