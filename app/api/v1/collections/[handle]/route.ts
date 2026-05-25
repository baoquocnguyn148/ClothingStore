import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { CatalogService } from '@/lib/server/catalog/catalog.service';
import { getCommerceClient } from '@/lib/commerce/get-client';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;
    const collection = isSupabaseMode()
      ? await new CatalogService().getCollectionByHandle(handle)
      : await getCommerceClient().getCollectionByHandle(handle);

    if (!collection) return jsonError('Collection not found', 404);

    const products = isSupabaseMode()
      ? await new CatalogService().getProducts({ collectionHandle: handle })
      : await getCommerceClient().getProducts({ collectionHandle: handle });

    return jsonOk({ collection, products });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}
