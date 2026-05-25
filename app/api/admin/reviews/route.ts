import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody, validateQuery } from '@/lib/api/validate';
import { ReviewService } from '@/lib/server/catalog/review.service';

const QuerySchema = z.object({
  published: z.enum(['true', 'false', 'all']).default('all'),
  productId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data: query, errorResponse: validErr } = validateQuery(request, QuerySchema);
  if (validErr) return validErr;

  try {
    const service = new ReviewService();
    const publishedFilter = query.published === 'all' ? undefined : query.published === 'true';

    const { reviews, total } = await service.getAllReviews({
      published: publishedFilter,
      productId: query.productId,
      limit: query.limit,
      offset: query.offset,
    });

    return jsonOk({ reviews, total });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

const ModerateSchema = z.object({
  reviewId: z.string().uuid(),
  published: z.boolean(),
});

export async function PATCH(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, ModerateSchema);
  if (validErr) return validErr;

  try {
    await new ReviewService().moderateReview(data.reviewId, data.published);
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}
