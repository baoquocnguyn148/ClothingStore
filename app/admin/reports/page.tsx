import Link from 'next/link';
import { AlertTriangle, BarChart3, ClipboardList, Package, ShoppingBag, Users } from 'lucide-react';
import { isSupabaseMode } from '@/lib/api/response';
import { InformationSystemService } from '@/lib/server/admin/information-system.service';

export const metadata = { title: 'MIS Reports - Admin B&D' };
export const dynamic = 'force-dynamic';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const days = Math.min(120, Math.max(7, parseInt(params.days ?? '30', 10) || 30));
  const isSupa = isSupabaseMode();
  let report: Awaited<ReturnType<InformationSystemService['getMisReport']>> | null = null;
  let loadError: string | null = null;

  if (!isSupa) {
    loadError = 'Ket noi Supabase de xem bao cao MIS.';
  } else {
    try {
      report = await new InformationSystemService().getMisReport(days);
    } catch (e) {
      loadError = e instanceof Error ? e.message : 'Khong tai duoc bao cao MIS.';
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">MIS Reports</h1>
          <p className="admin-page-subtitle">Bao cao quan tri tu du lieu giao dich, CRM va ton kho.</p>
        </div>
        <div className="admin-page-actions">
          {[7, 30, 90].map((value) => (
            <Link
              key={value}
              href={`/admin/reports?days=${value}`}
              className={`admin-btn admin-btn-sm ${days === value ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            >
              {value} ngay
            </Link>
          ))}
        </div>
      </div>

      {loadError && (
        <div className="admin-notice">
          <AlertTriangle size={16} />
          {loadError}
        </div>
      )}

      {report && (
        <>
          <div className="admin-stat-grid">
            <StatCard icon={BarChart3} label="Revenue" value={formatVND(report.summary.revenue)} />
            <StatCard icon={ShoppingBag} label="Orders" value={report.summary.orderCount.toLocaleString('vi-VN')} />
            <StatCard icon={Users} label="Repeat rate" value={`${report.summary.repeatRate}%`} />
            <StatCard icon={ClipboardList} label="Open CRM work" value={(report.summary.openTasks + report.summary.openTickets).toString()} />
          </div>

          <div className="admin-stat-grid admin-stat-grid-2">
            <StatCard icon={Users} label="VIP by RFM" value={report.summary.vipByRfm.toString()} />
            <StatCard icon={AlertTriangle} label="At-risk by RFM" value={report.summary.atRiskByRfm.toString()} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <section className="admin-card">
              <h2 className="admin-card-title">Order status</h2>
              <div className="admin-status-list">
                {report.orderStatus.map((row) => (
                  <div key={row.status} className="admin-status-row">
                    <span className="admin-status-label">{row.status}</span>
                    <span className="admin-status-count">{row.count}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-card">
              <h2 className="admin-card-title">CRM workload</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <MiniBreakdown title="Tasks" rows={report.crm.tasksByStatus} />
                <MiniBreakdown title="Tickets" rows={report.crm.ticketsByStatus} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-sm text-slate-400">Overdue tasks</p>
                  <p className="text-2xl font-semibold">{report.crm.overdueTasks}</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-sm text-slate-400">High priority tickets</p>
                  <p className="text-2xl font-semibold">{report.crm.highPriorityTickets}</p>
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="admin-card">
              <h2 className="admin-card-title">Top products</h2>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topProducts.map((item) => (
                      <tr key={item.title}>
                        <td>{item.title}</td>
                        <td>{item.quantity}</td>
                        <td>{formatVND(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="admin-card">
              <h2 className="admin-card-title">
                <Package size={18} /> Low stock
              </h2>
              {report.lowStock.length === 0 ? (
                <div className="admin-empty">Khong co canh bao ton kho.</div>
              ) : (
                <div className="space-y-3">
                  {report.lowStock.map((item) => (
                    <div key={item.sku} className="rounded-xl border border-border p-3 text-sm">
                      <p className="font-medium">{item.productTitle}</p>
                      <p className="text-xs text-slate-400">SKU {item.sku} · Stock {item.stockQty}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">
        <Icon size={22} />
      </div>
      <div className="admin-stat-body">
        <p className="admin-stat-value">{value}</p>
        <p className="admin-stat-label">{label}</p>
      </div>
    </div>
  );
}

function MiniBreakdown({ title, rows }: { title: string; rows: Array<{ label: string; count: number }> }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="space-y-2 text-sm">
        {rows.length === 0 ? (
          <p className="text-slate-400">No data</p>
        ) : (
          rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-3">
              <span className="text-slate-400">{row.label}</span>
              <span className="font-semibold">{row.count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
