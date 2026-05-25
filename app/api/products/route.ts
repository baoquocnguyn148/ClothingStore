import { NextRequest, NextResponse } from 'next/server';
import { getCommerceClient } from '@/lib/commerce/get-client';

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const q = sp.get('q') ?? undefined;
  const tag = sp.get('tag') as 'new' | 'best-seller' | undefined;
  const collection = sp.get('collection') ?? undefined;
  const category = sp.get('category') ?? undefined;
  const sizes = sp.getAll('size');
  const colors = sp.getAll('color');
  const minPrice = sp.get('minPrice')
    ? Number(sp.get('minPrice'))
    : undefined;
  const maxPrice = sp.get('maxPrice')
    ? Number(sp.get('maxPrice'))
    : undefined;
  const sort = sp.get('sort') as
    | 'relevance'
    | 'best-selling'
    | 'price-asc'
    | 'price-desc'
    | undefined;

  const commerce = getCommerceClient();
  const products = await commerce.getProducts({
    query: q,
    tag,
    collectionHandle: collection,
    category,
    sizes: sizes.length ? sizes : undefined,
    colors: colors.length ? colors : undefined,
    minPrice,
    maxPrice,
    sort,
  });

  return NextResponse.json({ products });
}

