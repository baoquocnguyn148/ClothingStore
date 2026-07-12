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
    // Mock Mode MIS Data
    report = {
      summary: { revenue: 158000000, orderCount: 420, repeatRate: 45, openTasks: 12, openTickets: 5, vipByRfm: 85, atRiskByRfm: 34 },
      orderStatus: [
        { status: 'pending', count: 45 },
        { status: 'shipping', count: 120 },
        { status: 'delivered', count: 255 }
      ],
      crm: {
        tasksByStatus: [{ label: 'To Do', count: 8 }, { label: 'In Progress', count: 4 }],
        ticketsByStatus: [{ label: 'Open', count: 3 }, { label: 'Pending', count: 2 }],
        overdueTasks: 2,
        highPriorityTickets: 1
      },
      topProducts: [
        { title: 'B&D Signature Tee', quantity: 150, revenue: 45000000 },
        { title: 'B&D Classic Hoodie', quantity: 85, revenue: 51000000 }
      ],
      lowStock: [
        { sku: 'BD-TEE-01', productTitle: 'B&D Signature Tee', stockQty: 5 },
        { sku: 'BD-CAP-03', productTitle: 'B&D Logo Cap', stockQty: 2 }
      ]
    };
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
              <h2 className="admin-card-title">Trạng thái đơn hàng</h2>
              <div className="admin-status-list">
                {report.orderStatus
                  .sort((a, b) => b.count - a.count)
                  .map((row) => {
                    const STATUS_COLOR: Record<string, string> = {
                      delivered: 'var(--admin-green)',
                      paid: 'var(--admin-blue)',
                      confirmed: 'var(--admin-blue)',
                      shipping: 'var(--admin-purple)',
                      cancelled: 'var(--admin-red)',
                      refunded: 'var(--admin-red)',
                      pending_payment: 'var(--admin-orange)',
                    };
                    const STATUS_LABEL: Record<string, string> = {
                      delivered: 'Đã giao', paid: 'Đã thanh toán', confirmed: 'Đã xác nhận',
                      shipping: 'Đang giao', cancelled: 'Đã hủy', refunded: 'Đã hoàn tiền',
                      pending_payment: 'Chờ thanh toán',
                    };
                    const color = STATUS_COLOR[row.status] ?? 'var(--admin-text-muted)';
                    const max = Math.max(...report.orderStatus.map(r => r.count), 1);
                    return (
                      <div key={row.status} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 14, color: 'var(--admin-text)' }}>{STATUS_LABEL[row.status] ?? row.status}</span>
                        <div style={{ flex: 2, background: 'var(--admin-surface-2)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.round((row.count / max) * 100)}%`, height: '100%', background: color, borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--admin-text)', width: 28, textAlign: 'right' }}>{row.count}</span>
                      </div>
                    );
                  })}
              </div>
            </section>


            <section className="admin-card">
              <h2 className="admin-card-title">CRM workload</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <MiniBreakdown title="Tasks" rows={report.crm.tasksByStatus} />
                <MiniBreakdown title="Tickets" rows={report.crm.ticketsByStatus} />
              </div>
              <div style={{ marginTop: 16, display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 16 }}>
                  <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', margin: '0 0 6px' }}>Task quá hạn</p>
                  <p style={{ fontSize: 26, fontWeight: 700, color: report.crm.overdueTasks > 0 ? 'var(--admin-orange)' : 'var(--admin-text)', margin: 0 }}>{report.crm.overdueTasks}</p>
                </div>
                <div style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 16 }}>
                  <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', margin: '0 0 6px' }}>Ticket ưu tiên cao</p>
                  <p style={{ fontSize: 26, fontWeight: 700, color: report.crm.highPriorityTickets > 0 ? 'var(--admin-red)' : 'var(--admin-text)', margin: 0 }}>{report.crm.highPriorityTickets}</p>
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
                <div className="admin-empty">Không có cảnh báo tồn kho.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {report.lowStock.map((item) => (
                    <div key={item.sku} style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', borderLeft: '3px solid var(--admin-orange)', borderRadius: 10, padding: '10px 14px' }}>
                      <p style={{ fontWeight: 500, fontSize: 13, margin: 0, color: 'var(--admin-text)' }}>{item.productTitle}</p>
                      <p style={{ fontSize: 11, color: 'var(--admin-text-muted)', margin: '3px 0 0' }}>SKU {item.sku} · Tồn: <span style={{ color: item.stockQty === 0 ? 'var(--admin-red)' : 'var(--admin-orange)', fontWeight: 600 }}>{item.stockQty}</span></p>
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
    <div style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', margin: '0 0 12px' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>Không có dữ liệu</p>
        ) : (
          rows.map((row) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--admin-text-muted)' }}>{row.label}</span>
              <span style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{row.count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
