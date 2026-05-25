import { NextRequest } from 'next/server';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAuth } from '@/lib/api/auth-helper';
import { ProfileService } from '@/lib/server/identity/profile.service';
import { OrderService } from '@/lib/server/order/order.service';

export async function GET() {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);
  try {
    const user = await requireAuth();
    const profileService = new ProfileService();
    const { profile, addresses } = await profileService.getProfile(user.id);
    const orders = await new OrderService().getOrdersByUser(user.id);

    return jsonOk({
      user: { id: user.id, email: user.email },
      profile,
      addresses,
      orders,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    return jsonError(msg, msg === 'Unauthorized' ? 401 : 500);
  }
}

export async function PATCH(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);
  try {
    const user = await requireAuth();
    const body = await request.json();
    const profile = await new ProfileService().updateProfile(user.id, {
      full_name: body.full_name,
      phone: body.phone,
    });
    return jsonOk({ profile });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    return jsonError(msg, msg === 'Unauthorized' ? 401 : 500);
  }
}
