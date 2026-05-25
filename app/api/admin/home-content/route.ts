import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/api/admin-helper';
import { jsonError, jsonOk, isSupabaseMode } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { HOME_CONTENT_BY_KEY } from '@/lib/home-content/defaults';
import { HomeContentService } from '@/lib/server/content/home-content.service';

const HomeContentPatchSchema = z.object({
  values: z
    .record(z.string().max(2000, 'Value must be 2000 characters or less'))
    .default({}),
});

function validateKnownKeys(values: Record<string, string>) {
  const unknown = Object.keys(values).filter((key) => !HOME_CONTENT_BY_KEY[key]);
  return unknown.length ? `Unsupported home content key(s): ${unknown.join(', ')}` : null;
}

export async function GET() {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const blocks = await new HomeContentService().listBlocks();
    return jsonOk({ blocks });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

export async function PATCH(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validationError } = await validateBody(
    request,
    HomeContentPatchSchema
  );
  if (validationError) return validationError;

  const values = data.values ?? {};
  const keyError = validateKnownKeys(values);
  if (keyError) return jsonError(keyError, 422);

  try {
    const blocks = await new HomeContentService().updateValues(values);
    return jsonOk({ blocks });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}
