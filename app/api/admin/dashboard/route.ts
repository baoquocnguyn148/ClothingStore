import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { DashboardService } from '@/lib/server/admin/dashboard.service';

export async function GET(request: Request) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('chart_days') ?? '30', 10);

    const service = new DashboardService();
    const [stats, chartData] = await Promise.all([
      service.getStats(),
      service.getRevenueChart(days),
    ]);

    return jsonOk({ stats, chartData });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed', 500);
  }
}
