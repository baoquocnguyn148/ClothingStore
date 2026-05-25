import type { CommerceClient, Product, ProductFilters, Collection, BlogPost, PolicyPage } from './types';
import { MockCommerceClient } from './mock-client';

/**
 * Shopify Storefront API client.
 * Falls back to mock when credentials are not configured.
 */
export class ShopifyCommerceClient implements CommerceClient {
  private fallback = new MockCommerceClient();
  private domain = process.env.SHOPIFY_STORE_DOMAIN;
  private token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  private get enabled() {
    return Boolean(this.domain && this.token);
  }

  private async shopifyFetch<T>(_query: string, _variables?: Record<string, unknown>): Promise<T | null> {
    if (!this.enabled) return null;
    try {
      const res = await fetch(`https://${this.domain}/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': this.token!,
        },
        body: JSON.stringify({ query: _query, variables: _variables }),
        next: { revalidate: 60 },
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (json.errors) return null;
      return json.data as T;
    } catch {
      return null;
    }
  }

  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    if (!this.enabled) return this.fallback.getProducts(filters);
    // TODO: map Shopify products when token available
    return this.fallback.getProducts(filters);
  }

  async getProductByHandle(handle: string): Promise<Product | null> {
    if (!this.enabled) return this.fallback.getProductByHandle(handle);
    return this.fallback.getProductByHandle(handle);
  }

  async getCollections(): Promise<Collection[]> {
    if (!this.enabled) return this.fallback.getCollections();
    return this.fallback.getCollections();
  }

  async getCollectionByHandle(handle: string): Promise<Collection | null> {
    if (!this.enabled) return this.fallback.getCollectionByHandle(handle);
    return this.fallback.getCollectionByHandle(handle);
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return this.fallback.getBlogPosts();
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    return this.fallback.getBlogPostBySlug(slug);
  }

  async getPolicyBySlug(slug: string): Promise<PolicyPage | null> {
    return this.fallback.getPolicyBySlug(slug);
  }

  async getPolicies(): Promise<PolicyPage[]> {
    return this.fallback.getPolicies();
  }
}
