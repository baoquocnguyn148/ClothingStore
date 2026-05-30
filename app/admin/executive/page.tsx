import { AlertTriangle, LineChart, ShieldAlert } from 'lucide-react';
import { isSupabaseMode } from '@/lib/api/response';
import { InformationSystemService } from '@/lib/server/admin/information-system.service';

export const metadata = { title: 'Executive Dashboard - Admin B&D' };
export const dynamic = 'force-dynamic';

function formatValue(value: number, format: string) {
  if (format === 'currency') {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
  if (format === 'percent') return `${value}%`;
  return value.toLocaleString('vi-VN');
}

export default async function AdminExecutivePage() {
  const isSupa = isSupabaseMode();
  let data: Awaited<ReturnType<InformationSystemService['getExecutiveDashboard']>> | null = null;
  let loadError: string | null = null;

  if (!isSupa) {
    loadError = 'Ket noi Supabase de xem ESS dashboard.';
  } else {
    try {
      data = await new InformationSystemService().getExecutiveDashboard();
    } catch (e) {
      loadError = e instanceof Error ? e.message : 'Khong tai duoc ESS dashboard.';
    }
  }

  const maxRevenue = Math.max(...(data?.trend.map((point) => point.revenue) ?? [1]), 1);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Executive Dashboard</h1>
          <p className="admin-page-subtitle">ESS cho lanh dao: KPI, xu huong va rui ro chinh.</p>
        </div>
      </div>

      {loadError && (
        <div className="admin-notice">
          <AlertTriangle size={16} />
          {loadError}
        </div>
      )}

      {data && (
        <>
          <div className="admin-stat-grid">
            {data.kpis.map((kpi) => (
              <div key={kpi.label} className="admin-stat-card">
                <div className="admin-stat-icon">
                  <LineChart size={22} />
                </div>
                <div className="admin-stat-body">
                  <p className="admin-stat-value">{formatValue(kpi.value, kpi.format)}</p>
                  <p className="admin-stat-label">{kpi.label}</p>
                  <p className="admin-stat-sub">
                    {kpi.change >= 0 ? '+' : ''}
                    {kpi.change}% vs previous 30d
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <section className="admin-card admin-card-chart">
              <h2 className="admin-card-title">30d revenue trend</h2>
              <div className="admin-chart">
                {data.trend.map((point) => (
                  <div key={point.date} className="admin-chart-bar-wrap" title={`${point.date}: ${point.revenue}`}>
                    <div
                      className="admin-chart-bar"
                      style={{ height: `${Math.max(2, Math.round((point.revenue / maxRevenue) * 100))}%` }}
                    />
                    <span className="admin-chart-label">{point.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-card">
              <h2 className="admin-card-title">
                <ShieldAlert size={18} /> Strategic risks
              </h2>
              <div className="space-y-3">
                {data.risks.map((risk) => (
                  <div key={risk.label} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium">{risk.label}</span>
                      <span className="text-lg font-semibold">{risk.value}</span>
                    </div>
                    <p className="mt-2 text-xs uppercase text-slate-400">Severity: {risk.severity}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
