import { notFound } from 'next/navigation';
import { getCommerceClient } from '@/lib/commerce/get-client';
import { ProductDetail } from '@/components/store/product-detail';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCommerceClient().getProductByHandle(slug);
  if (!product) return { title: 'Product' };
  return {
    title: product.title,
    description: product.description,
    openGraph: { images: product.images[0] ? [product.images[0]] : [] },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const commerce = getCommerceClient();
  const product = await commerce.getProductByHandle(slug);

  if (!product) notFound();

  const all = await commerce.getProducts();
  const related = all
    .filter(
      (p) =>
        p.handle !== product.handle &&
        p.collectionHandles.some((h) =>
          product.collectionHandles.includes(h)
        )
    )
    .slice(0, 4);

  return <ProductDetail product={product} related={related} />;
}
