import { mockProducts } from '@/data/mock/products';
import { mockCollections } from '@/data/mock/collections';
import { mockBlogPosts } from '@/data/mock/blog';
import { mockPolicies } from '@/data/mock/policies';
import type {
  CommerceClient,
  Product,
  ProductFilters,
  Collection,
  BlogPost,
  PolicyPage,
} from './types';
import { withResolvedProductImages } from './product-images';

function sortProducts(products: Product[], sort?: ProductFilters['sort']): Product[] {
  const copy = [...products];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'best-selling':
      return copy.sort((a, b) => {
        const aBest = a.tags.includes('best-seller') ? 1 : 0;
        const bBest = b.tags.includes('best-seller') ? 1 : 0;
        return bBest - aBest;
      });
    default:
      return copy;
  }
}

function filterProducts(products: Product[], filters?: ProductFilters): Product[] {
  let result = [...products];

  if (filters?.collectionHandle) {
    result = result.filter((p) =>
      p.collectionHandles.includes(filters.collectionHandle!)
    );
  }

  if (filters?.tag === 'new') {
    result = result.filter((p) => p.tags.includes('new'));
  } else if (filters?.tag === 'best-seller') {
    result = result.filter((p) => p.tags.includes('best-seller'));
  }

  if (filters?.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q)
    );
  }

  if (filters?.minPrice != null) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters?.maxPrice != null) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }

  if (filters?.sizes?.length) {
    result = result.filter((p) =>
      p.variants.some((v) => filters.sizes!.includes(v.size) && v.available)
    );
  }

  if (filters?.colors?.length) {
    result = result.filter((p) =>
      p.colors.some((c) => filters.colors!.includes(c.name))
    );
  }

  return sortProducts(result, filters?.sort);
}

export class MockCommerceClient implements CommerceClient {
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    return filterProducts(mockProducts, filters).map(withResolvedProductImages);
  }

  async getProductByHandle(handle: string): Promise<Product | null> {
    const product = mockProducts.find((p) => p.handle === handle);
    return product ? withResolvedProductImages(product) : null;
  }

  async getCollections(): Promise<Collection[]> {
    return mockCollections;
  }

  async getCollectionByHandle(handle: string): Promise<Collection | null> {
    return mockCollections.find((c) => c.handle === handle) ?? null;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return mockBlogPosts;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    return mockBlogPosts.find((p) => p.slug === slug) ?? null;
  }

  async getPolicyBySlug(slug: string): Promise<PolicyPage | null> {
    return mockPolicies.find((p) => p.slug === slug) ?? null;
  }

  async getPolicies(): Promise<PolicyPage[]> {
    return mockPolicies;
  }
}
