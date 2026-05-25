import { NextRequest } from 'next/server';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { CatalogService } from '@/lib/server/catalog/catalog.service';
import { getCommerceClient } from '@/lib/commerce/get-client';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const filters = {
      query: sp.get('q') ?? undefined,
      tag: sp.get('tag') as 'new' | 'best-seller' | undefined,
      collectionHandle: sp.get('collection') ?? undefined,
      sort: sp.get('sort') as 'relevance' | 'best-selling' | 'price-asc' | 'price-desc' | undefined,
    };

    if (isSupabaseMode()) {
      const catalog = new CatalogService();
      const products = await catalog.getProducts(filters);
      return jsonOk({ products });
    }

    const products = await getCommerceClient().getProducts(filters);
    return jsonOk({ products });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed to fetch products', 500);
  }
}

