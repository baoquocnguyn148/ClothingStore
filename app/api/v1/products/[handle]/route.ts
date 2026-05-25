import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { CatalogService } from '@/lib/server/catalog/catalog.service';
import { getCommerceClient } from '@/lib/commerce/get-client';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;
    const product = isSupabaseMode()
      ? await new CatalogService().getProductByHandle(handle)
      : await getCommerceClient().getProductByHandle(handle);

    if (!product) return jsonError('Product not found', 404);
    return jsonOk({ product });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}
