import { NextRequest } from 'next/server';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAuth } from '@/lib/api/auth-helper';
import { ProfileService } from '@/lib/server/identity/profile.service';

export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);
  try {
    const user = await requireAuth();
    const body = await request.json();
    const address = await new ProfileService().addAddress(user.id, body);
    return jsonOk({ address }, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    return jsonError(msg, msg === 'Unauthorized' ? 401 : 500);
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);
  try {
    const user = await requireAuth();
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return jsonError('id required');
    await new ProfileService().deleteAddress(user.id, id);
    return jsonOk({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    return jsonError(msg, msg === 'Unauthorized' ? 401 : 500);
  }
}
