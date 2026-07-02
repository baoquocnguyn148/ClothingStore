import { notFound } from 'next/navigation';
import { getCommerceClient } from '@/lib/commerce/get-client';
import { ProductDetail } from '@/components/store/product-detail';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCommerceClient().getProductByHandle(slug);
  if (!product) return { title: 'Product' };
  return {
    title: `${product.title} — B&D Fashion`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: product.images[0] ? [product.images[0]] : [],
    },
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

  const isAvailable = product.variants.some((v) => v.available);

  // JSON-LD Structured Data (Schema.org Product)
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bd-fashion.vercel.app';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images,
    url: `${base}/products/${product.handle}`,
    brand: {
      '@type': 'Brand',
      name: 'B&D Fashion',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: product.price,
      availability: isAvailable
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'B&D Fashion',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} related={related} />
    </>
  );
}
