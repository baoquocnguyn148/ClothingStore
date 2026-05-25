import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { AdminNotificationService } from '@/lib/server/admin/dashboard.service';

export async function GET(request: Request) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get('unread') === 'true';
    const limit = parseInt(url.searchParams.get('limit') ?? '50', 10);

    const service = new AdminNotificationService();
    const notifications = await service.getNotifications({ unreadOnly, limit });
    const unreadCount = await service.countUnread();

    return jsonOk({ notifications, unreadCount });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}

// Mark all as read
export async function PATCH() {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    await new AdminNotificationService().markAllRead();
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}
