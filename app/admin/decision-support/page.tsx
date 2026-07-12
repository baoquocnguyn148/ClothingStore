import Link from 'next/link';
import { AlertTriangle, Brain, Package, Ticket, Users } from 'lucide-react';
import { isSupabaseMode } from '@/lib/api/response';
import { InformationSystemService } from '@/lib/server/admin/information-system.service';

export const metadata = { title: 'DSS - Admin B&D' };
export const dynamic = 'force-dynamic';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('vi-VN') : '-';
}

export default async function AdminDecisionSupportPage() {
  const isSupa = isSupabaseMode();
  let data: Awaited<ReturnType<InformationSystemService['getDecisionSupport']>> | null = null;
  let loadError: string | null = null;

  if (!isSupa) {
    // Mock Mode DSS Data
    data = {
      customerSegments: {
        vipCustomers: [
          { userId: 'u1', name: 'Nguyễn Văn A', phone: '0901234567', totalSpent: 12000000, orderCount: 15, lastOrderAt: '2026-07-10', recommendation: 'Gửi quà tri ân', rfmScore: 555, rfmSegment: 'Champions', recencyDays: 2 },
          { userId: 'u2', name: 'Trần Thị B', phone: '0912345678', totalSpent: 8500000, orderCount: 10, lastOrderAt: '2026-07-05', recommendation: 'Mời tham gia sự kiện độc quyền', rfmScore: 554, rfmSegment: 'Loyal', recencyDays: 7 }
        ],
        atRiskCustomers: [
          { userId: 'u3', name: 'Lê Văn C', phone: '0923456789', totalSpent: 4500000, orderCount: 5, lastOrderAt: '2026-01-15', recommendation: 'Gửi voucher giảm giá 20%', rfmScore: 211, rfmSegment: 'At Risk', recencyDays: 178 }
        ],
        newNoOrderCustomers: []
      },
      productSuggestions: [
        { productTitle: 'B&D Signature Tee', sku: 'BD-TEE-01', action: 'Restock', reason: 'Bán chạy trong 7 ngày qua, tồn kho thấp' },
        { productTitle: 'B&D Denim Jacket', sku: 'BD-JKT-02', action: 'Promotion', reason: 'Tồn kho nhiều, tốc độ bán chậm' }
      ],
      crmPriorities: {
        urgentTickets: [],
        overdueTasks: []
      }
    };
  } else {
    try {
      data = await new InformationSystemService().getDecisionSupport();
    } catch (e) {
      loadError = e instanceof Error ? e.message : 'Khong tai duoc DSS.';
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Decision Support</h1>
          <p className="admin-page-subtitle">Goi y hanh dong dua tren khach hang, san pham, ton kho va CRM.</p>
        </div>
        <div className="admin-page-actions">
          <Link href="/admin/crm/campaigns" className="admin-btn admin-btn-primary">
            Create campaign
          </Link>
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
            <Stat icon={Users} label="VIP candidates" value={data.customerSegments.vipCustomers.length} />
            <Stat icon={Brain} label="At-risk customers" value={data.customerSegments.atRiskCustomers.length} />
            <Stat icon={Package} label="Product actions" value={data.productSuggestions.length} />
            <Stat icon={Ticket} label="Urgent CRM" value={data.crmPriorities.urgentTickets.length + data.crmPriorities.overdueTasks.length} />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <CustomerSegment title="VIP care" rows={data.customerSegments.vipCustomers} />
            <CustomerSegment title="Win-back" rows={data.customerSegments.atRiskCustomers} />
            <CustomerSegment title="New no order" rows={data.customerSegments.newNoOrderCustomers} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="admin-card">
              <h2 className="admin-card-title">Product recommendations</h2>
              {data.productSuggestions.length === 0 ? (
                <div className="admin-empty">Chua co goi y san pham.</div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Action</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.productSuggestions.map((item) => (
                        <tr key={`${item.sku}-${item.action}`}>
                          <td>{item.productTitle}</td>
                          <td className="admin-table-mono">{item.sku}</td>
                          <td>{item.action}</td>
                          <td className="text-slate-400">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="admin-card">
              <h2 className="admin-card-title">CRM priorities</h2>
              <div className="space-y-4">
                <PriorityList title="Overdue tasks" rows={data.crmPriorities.overdueTasks} type="task" />
                <PriorityList title="Urgent tickets" rows={data.crmPriorities.urgentTickets} type="ticket" />
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number }>; label: string; value: number }) {
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

function CustomerSegment({
  title,
  rows,
}: {
  title: string;
  rows: Array<{
    userId: string;
    name: string;
    phone: string | null;
    totalSpent: number;
    orderCount: number;
    lastOrderAt: string | null;
    recommendation: string;
    rfmScore?: number;
    rfmSegment?: string;
    recencyDays?: number | null;
  }>;
}) {
  return (
    <section className="admin-card">
      <h2 className="admin-card-title">{title}</h2>
      {rows.length === 0 ? (
        <div className="admin-empty">Chưa có khách hàng.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((row) => (
            <div key={row.userId} style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', borderRadius: 10, padding: '12px 14px' }}>
              <Link href={`/admin/customers/${row.userId}`} style={{ fontWeight: 600, color: 'var(--admin-blue)', fontSize: 14, textDecoration: 'none' }}>
                {row.name}
              </Link>
              <p style={{ fontSize: 12, color: 'var(--admin-text-muted)', margin: '4px 0 0' }}>
                {row.phone || 'Chưa có SĐT'} · {row.orderCount} đơn · {formatVND(row.totalSpent)}
              </p>
              <p style={{ fontSize: 12, color: 'var(--admin-text)', margin: '4px 0 0' }}>
                Đơn cuối: {formatDate(row.lastOrderAt)} · {row.recommendation}
              </p>
              {row.rfmScore !== undefined && (
                <p style={{ fontSize: 11, color: 'var(--admin-text-muted)', margin: '4px 0 0' }}>
                  RFM {row.rfmScore} · {row.rfmSegment} · recency {row.recencyDays ?? '-'}d
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const PRIORITY_COLOR: Record<string, string> = { urgent: '#f04c4c', high: '#f5a623', normal: '#4f8ef7', low: '#34c97b' };

function PriorityList({ title, rows, type }: { title: string; rows: any[]; type: 'task' | 'ticket' }) {
  return (
    <div style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: 'var(--admin-text)' }}>{title}</h3>
      {rows.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>Không có mục nào.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.slice(0, 8).map((row) => (
            <Link
              key={row.id}
              href={`/admin/customers/${row.customer_user_id}`}
              style={{ display: 'block', background: 'var(--admin-bg)', borderRadius: 8, padding: '10px 12px', textDecoration: 'none', borderLeft: `3px solid ${PRIORITY_COLOR[row.priority] ?? 'var(--admin-border)'}` }}
            >
              <p style={{ fontWeight: 500, fontSize: 13, color: 'var(--admin-text)', margin: 0 }}>{type === 'task' ? row.title : row.subject}</p>
              <p style={{ fontSize: 11, color: 'var(--admin-text-muted)', margin: '3px 0 0' }}>{row.priority} · {type === 'task' ? formatDate(row.due_at) : row.status}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
