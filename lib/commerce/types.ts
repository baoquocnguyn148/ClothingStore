export type ProductTag = 'new' | 'best-seller' | 'sale' | 'sold-out';

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  available: boolean;
  price: number;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  colors: { name: string; hex: string }[];
  variants: ProductVariant[];
  tags: ProductTag[];
  collectionHandles: string[];
  category: string;
}

export interface Collection {
  handle: string;
  title: string;
  description?: string;
  image?: string;
  productHandles: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  image: string;
  excerpt: string;
  linkedProductHandles: string[];
}

export interface PolicyPage {
  slug: string;
  title: string;
  content: string;
}

export interface ProductFilters {
  collectionHandle?: string;
  category?: string;
  query?: string;
  tag?: 'new' | 'best-seller';
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: 'relevance' | 'best-selling' | 'price-asc' | 'price-desc';
}

export interface CartLine {
  cartItemId?: string;
  variantId: string;
  productHandle: string;
  title: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Cart {
  id: string;
  lines: CartLine[];
  checkoutUrl?: string;
}

export interface CommerceClient {
  getProducts(filters?: ProductFilters): Promise<Product[]>;
  getProductByHandle(handle: string): Promise<Product | null>;
  getCollections(): Promise<Collection[]>;
  getCollectionByHandle(handle: string): Promise<Collection | null>;
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | null>;
  getPolicyBySlug(slug: string): Promise<PolicyPage | null>;
  getPolicies(): Promise<PolicyPage[]>;
}
