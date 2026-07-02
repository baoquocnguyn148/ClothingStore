import { getCommerceClient } from '@/lib/commerce/get-client';
import type { MetadataRoute } from 'next';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bd-fashion.vercel.app';
  const commerce = getCommerceClient();

  const [products, posts] = await Promise.allSettled([
    commerce.getProducts(),
    commerce.getBlogPosts(),
  ]);

  const staticRoutes = [
    '',
    '/collections',
    '/collections?tag=new',
    '/collections?tag=best-seller',
    '/about-us',
    '/careers',
    '/pages/contact',
    '/pages/membership',
    '/pages/shipping',
    '/pages/returns',
    '/pages/privacy',
    '/pages/size-guide',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const productRoutes =
    products.status === 'fulfilled'
      ? products.value.map((p) => ({
          url: `${base}/products/${p.handle}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }))
      : [];

  const blogRoutes =
    posts.status === 'fulfilled'
      ? posts.value.map((p) => ({
          url: `${base}/blog/${p.slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        }))
      : [];

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
