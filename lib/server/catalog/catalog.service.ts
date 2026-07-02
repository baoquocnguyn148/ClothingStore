import { createAdminClient } from '@/lib/supabase/admin';
import type { ProductFilters } from '@/lib/commerce/types';
import { mapDbProduct, mapDbCollection, mapDbBlogPost, mapDbPolicy, PRODUCT_SELECT } from './mapper';
import { mockPolicies } from '@/data/mock/policies';

export class CatalogService {
  private db = createAdminClient();

  async getProducts(filters?: ProductFilters) {
    let query = this.db
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('published', true)
      .is('deleted_at', null);

    if (filters?.query) {
      query = query.ilike('title', `%${filters.query}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    let products = (data ?? []).map(mapDbProduct);

    if (filters?.collectionHandle) {
      products = products.filter((p) =>
        p.collectionHandles.includes(filters.collectionHandle!)
      );
    }
    if (filters?.category) {
      products = products.filter((p) => p.category === filters.category);
    }
    if (filters?.tag === 'new') {
      products = products.filter((p) => p.tags.includes('new'));
    } else if (filters?.tag === 'best-seller') {
      products = products.filter((p) => p.tags.includes('best-seller'));
    }
    if (filters?.minPrice != null) {
      products = products.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters?.maxPrice != null) {
      products = products.filter((p) => p.price <= filters.maxPrice!);
    }
    if (filters?.sizes?.length) {
      products = products.filter((p) =>
        p.variants.some((v) => filters.sizes!.includes(v.size) && v.available)
      );
    }
    if (filters?.colors?.length) {
      products = products.filter((p) =>
        p.colors.some((c) => filters.colors!.includes(c.name))
      );
    }

    switch (filters?.sort) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'best-selling':
        products.sort((a, b) => {
          const aB = a.tags.includes('best-seller') ? 1 : 0;
          const bB = b.tags.includes('best-seller') ? 1 : 0;
          return bB - aB;
        });
        break;
    }

    return products;
  }

  async getProductByHandle(handle: string) {
    const { data, error } = await this.db
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('handle', handle)
      .eq('published', true)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return mapDbProduct(data);
  }

  async getCollections() {
    const { data, error } = await this.db
      .from('collections')
      .select(`*, collection_products ( products ( handle ) )`)
      .eq('published', true)
      .order('sort_order');

    if (error) throw error;
    return (data ?? []).map(mapDbCollection);
  }

  async getCollectionByHandle(handle: string) {
    const { data, error } = await this.db
      .from('collections')
      .select(`*, collection_products ( products ( handle ) )`)
      .eq('handle', handle)
      .eq('published', true)
      .single();

    if (error || !data) return null;
    return mapDbCollection(data);
  }

  async getBlogPosts() {
    const { data, error } = await this.db
      .from('blog_posts')
      .select(`*, blog_post_products ( products ( handle ) )`)
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapDbBlogPost);
  }

  async getBlogPostBySlug(slug: string) {
    const { data, error } = await this.db
      .from('blog_posts')
      .select(`*, blog_post_products ( products ( handle ) )`)
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error || !data) return null;
    return mapDbBlogPost(data);
  }

  async getPolicyBySlug(slug: string) {
    const { data, error } = await this.db
      .from('cms_pages')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error || !data) {
      const mock = mockPolicies.find(p => p.slug === slug);
      if (mock) return mock;
      return null;
    }
    return mapDbPolicy(data);
  }

  async getPolicies() {
    const { data, error } = await this.db
      .from('cms_pages')
      .select('*')
      .eq('published', true);

    if (error || !data || data.length === 0) return mockPolicies;
    return data.map(mapDbPolicy);
  }
}
