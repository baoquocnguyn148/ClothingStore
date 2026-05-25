import type { Product, ProductTag, Collection, BlogPost, PolicyPage } from '@/lib/commerce/types';
import { resolveProductImages } from '@/lib/commerce/product-images';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDbProduct(row: any): Product {
  const variants = (row.product_variants ?? []).map((v: {
    id: string; size: string; color_name: string; color_hex: string;
    price: number; stock_qty: number; is_active: boolean;
  }) => ({
    id: v.id,
    size: v.size,
    color: v.color_name,
    colorHex: v.color_hex,
    price: v.price,
    available: v.is_active && v.stock_qty > 0,
  }));

  const colorMap = new Map<string, string>();
  variants.forEach((v: { color: string; colorHex: string }) => {
    colorMap.set(v.color, v.colorHex);
  });

  const tags = (row.product_tag_assignments ?? [])
    .map((a: { tags: { slug: string } }) => a.tags?.slug)
    .filter(Boolean) as ProductTag[];

  const dbImages = (row.product_images ?? [])
    .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    .map((i: { url: string }) => i.url);
  const images = resolveProductImages({
    title: row.title,
    handle: row.handle,
    images: dbImages,
  });

  const collectionHandles = (row.collection_products ?? [])
    .map((cp: { collections: { handle: string } }) => cp.collections?.handle)
    .filter(Boolean);

  const minPrice = variants.length
    ? Math.min(...variants.map((v: { price: number }) => v.price))
    : row.base_price;

  return {
    id: row.id,
    handle: row.handle,
    title: row.title,
    description: row.description ?? '',
    price: minPrice,
    compareAtPrice: row.compare_at_price ?? undefined,
    images: images.length ? images : ['/images/products/navy_polo.png'],
    colors: Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex })),
    variants,
    tags,
    collectionHandles,
    category: row.category ?? 'general',
  };
}

export function mapDbCollection(row: {
  handle: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  collection_products?: { products: { handle: string } }[];
}): Collection {
  return {
    handle: row.handle,
    title: row.title,
    description: row.description ?? undefined,
    image: row.image_url ?? undefined,
    productHandles: (row.collection_products ?? [])
      .map((cp) => cp.products?.handle)
      .filter(Boolean) as string[],
  };
}

export function mapDbBlogPost(row: {
  slug: string;
  title: string;
  excerpt: string;
  image_url: string;
  published_at: string | null;
  blog_post_products?: { products: { handle: string } }[];
}): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    date: row.published_at ?? '',
    image: row.image_url,
    excerpt: row.excerpt,
    linkedProductHandles: (row.blog_post_products ?? [])
      .map((bp) => bp.products?.handle)
      .filter(Boolean) as string[],
  };
}

export function mapDbPolicy(row: { slug: string; title: string; html_content: string }): PolicyPage {
  return { slug: row.slug, title: row.title, content: row.html_content };
}

export const PRODUCT_SELECT = `
  *,
  product_variants (*),
  product_images (*),
  product_tag_assignments ( tags ( slug ) ),
  collection_products ( collections ( handle ) )
`;
