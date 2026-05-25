import { CatalogService } from '@/lib/server/catalog/catalog.service';
import type { CommerceClient, ProductFilters } from './types';

export class SupabaseCommerceClient implements CommerceClient {
  private catalog = new CatalogService();

  getProducts(filters?: ProductFilters) {
    return this.catalog.getProducts(filters);
  }

  getProductByHandle(handle: string) {
    return this.catalog.getProductByHandle(handle);
  }

  getCollections() {
    return this.catalog.getCollections();
  }

  getCollectionByHandle(handle: string) {
    return this.catalog.getCollectionByHandle(handle);
  }

  getBlogPosts() {
    return this.catalog.getBlogPosts();
  }

  getBlogPostBySlug(slug: string) {
    return this.catalog.getBlogPostBySlug(slug);
  }

  getPolicyBySlug(slug: string) {
    return this.catalog.getPolicyBySlug(slug);
  }

  getPolicies() {
    return this.catalog.getPolicies();
  }
}
