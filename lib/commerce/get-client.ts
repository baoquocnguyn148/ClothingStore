import { MockCommerceClient } from './mock-client';
import { ShopifyCommerceClient } from './shopify-client';
import { SupabaseCommerceClient } from './supabase-client';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import type { CommerceClient } from './types';

export function getCommerceClient(): CommerceClient {
  const provider = process.env.COMMERCE_PROVIDER ?? 'mock';
  if (
    provider === 'supabase' &&
    isSupabaseConfigured() &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return new SupabaseCommerceClient();
  }
  if (provider === 'shopify') {
    return new ShopifyCommerceClient();
  }
  return new MockCommerceClient();
}

