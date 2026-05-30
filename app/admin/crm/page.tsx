import Link from 'next/link';
import { ClipboardList, Ticket, Users } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseMode } from '@/lib/api/response';

export const metadata = { title: 'CRM - Admin B&D' };
export const dynamic = 'force-dynamic';

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString('vi-VN') : '-';
}

export default async function AdminCrmPage() {
  const isSupa = isSupabaseMode();
  let openTasks: any[] = [];
  let openTickets: any[] = [];
  let customerMap = new Map<string, { full_name: string; phone: string | null }>();
  let loadError: string | null = null;

  if (!isSupa) {
    loadError = 'Kết nối Supabase để dùng CRM.';
  } else {
    try {
      const db = createAdminClient();
      const [tasksResult, ticketsResult] = await Promise.all([
        db
          .from('crm_tasks')
          .select('id, customer_user_id, title, body, due_at, status, priority, created_at')
          .eq('status', 'open')
          .order('due_at', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(50),
        db
          .from('crm_tickets')
          .select('id, customer_user_id, order_id, subject, body, status, priority, created_at')
          .in('status', ['open', 'pending'])
          .order('priority', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (ticketsResult.error) throw ticketsResult.error;

      openTasks = tasksResult.data ?? [];
      openTickets = ticketsResult.data ?? [];

      const userIds = [
        ...new Set([
          ...openTasks.map((task) => task.customer_user_id),
          ...openTickets.map((ticket) => ticket.customer_user_id),
        ]),
      ].filter(Boolean);

      if (userIds.length > 0) {
        const { data: profiles, error } = await db
          .from('profiles')
          .select('user_id, full_name, phone')
          .in('user_id', userIds);
        if (error) throw error;
        customerMap = new Map(
          (profiles ?? []).map((profile) => [
            profile.user_id,
            { full_name: profile.full_name, phone: profile.phone },
          ])
        );
      }
    } catch (e) {
      loadError = e instanceof Error ? e.message : 'Không tải được CRM inbox.';
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">CRM</h1>
          <p className="admin-page-subtitle">Inbox chăm sóc khách hàng, task và ticket cần xử lý.</p>
        </div>
        <div className="admin-page-actions">
          <Link href="/admin/crm/campaigns" className="admin-btn admin-btn-primary">
            Campaigns
          </Link>
          <Link href="/admin/customers" className="admin-btn admin-btn-secondary">
            <Users size={16} /> Khách hàng
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </div>
      )}

      <div className="admin-stat-grid admin-stat-grid-2">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <ClipboardList size={22} />
          </div>
          <div className="admin-stat-body">
            <p className="admin-stat-value">{openTasks.length}</p>
            <p className="admin-stat-label">Task đang mở</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Ticket size={22} />
          </div>
          <div className="admin-stat-body">
            <p className="admin-stat-value">{openTickets.length}</p>
            <p className="admin-stat-label">Ticket cần xử lý</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CrmTaskTable openTasks={openTasks} customerMap={customerMap} />
        <CrmTicketTable openTickets={openTickets} customerMap={customerMap} />
      </div>
    </div>
  );
}

function CrmTaskTable({
  openTasks,
  customerMap,
}: {
  openTasks: any[];
  customerMap: Map<string, { full_name: string; phone: string | null }>;
}) {
  return (
    <div className="admin-card">
      <h2 className="admin-card-title">
        <ClipboardList size={18} /> Follow-up tasks
      </h2>
      {openTasks.length === 0 ? (
        <div className="admin-empty">Không có task đang mở.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Khách</th>
                <th>Ưu tiên</th>
                <th>Hạn</th>
              </tr>
            </thead>
            <tbody>
              {openTasks.map((task) => {
                const customer = customerMap.get(task.customer_user_id);
                return (
                  <tr key={task.id}>
                    <td>
                      <div className="font-medium">{task.title}</div>
                      {task.body && <div className="text-xs text-slate-400">{task.body}</div>}
                    </td>
                    <td>
                      <Link href={`/admin/customers/${task.customer_user_id}`} className="admin-card-link">
                        {customer?.full_name || task.customer_user_id}
                      </Link>
                      {customer?.phone && <div className="text-xs text-slate-400">{customer.phone}</div>}
                    </td>
                    <td>{task.priority}</td>
                    <td className="text-slate-400">{formatDate(task.due_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CrmTicketTable({
  openTickets,
  customerMap,
}: {
  openTickets: any[];
  customerMap: Map<string, { full_name: string; phone: string | null }>;
}) {
  return (
    <div className="admin-card">
      <h2 className="admin-card-title">
        <Ticket size={18} /> Tickets CSKH
      </h2>
      {openTickets.length === 0 ? (
        <div className="admin-empty">Không có ticket cần xử lý.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Khách</th>
                <th>Trạng thái</th>
                <th>Ưu tiên</th>
              </tr>
            </thead>
            <tbody>
              {openTickets.map((ticket) => {
                const customer = customerMap.get(ticket.customer_user_id);
                return (
                  <tr key={ticket.id}>
                    <td>
                      <div className="font-medium">{ticket.subject}</div>
                      {ticket.body && <div className="text-xs text-slate-400">{ticket.body}</div>}
                    </td>
                    <td>
                      <Link href={`/admin/customers/${ticket.customer_user_id}`} className="admin-card-link">
                        {customer?.full_name || ticket.customer_user_id}
                      </Link>
                      {customer?.phone && <div className="text-xs text-slate-400">{customer.phone}</div>}
                    </td>
                    <td>{ticket.status}</td>
                    <td>{ticket.priority}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
