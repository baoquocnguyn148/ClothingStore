import { NextRequest } from 'next/server';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/admin/tags
export async function GET(_request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const db = createAdminClient();
    const { data, error } = await db
      .from('tags')
      .select('id, slug, label')
      .order('slug', { ascending: true });

    if (error) throw error;
    return jsonOk({ tags: data ?? [] });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed to fetch tags', 500);
  }
}

