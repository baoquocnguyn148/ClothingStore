'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ClipboardList, MessageSquarePlus, Ticket } from 'lucide-react';

type CrmNote = {
  id: string;
  body: string;
  created_at: string;
};

type CrmTask = {
  id: string;
  title: string;
  body: string | null;
  due_at: string | null;
  status: string;
  priority: string;
  created_at: string;
};

type CrmTicket = {
  id: string;
  subject: string;
  body: string | null;
  status: string;
  priority: string;
  created_at: string;
  order_id: string | null;
};

type OrderOption = {
  id: string;
  orderNumber: string;
};

export function CustomerCrmPanel({
  customerUserId,
  notes,
  tasks,
  tickets,
  orderOptions,
}: {
  customerUserId: string;
  notes: CrmNote[];
  tasks: CrmTask[];
  tickets: CrmTicket[];
  orderOptions: OrderOption[];
}) {
  const router = useRouter();
  const [noteBody, setNoteBody] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskBody, setTaskBody] = useState('');
  const [taskDueAt, setTaskDueAt] = useState('');
  const [taskPriority, setTaskPriority] = useState('normal');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketBody, setTicketBody] = useState('');
  const [ticketPriority, setTicketPriority] = useState('normal');
  const [ticketOrderId, setTicketOrderId] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const request = async (url: string, body: unknown, method = 'POST') => {
    setSaving(url);
    setMessage(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || 'Thao tác thất bại');
      router.refresh();
      setMessage('Đã lưu thay đổi.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Thao tác thất bại');
    } finally {
      setSaving(null);
    }
  };

  const addNote = async () => {
    if (!noteBody.trim()) return;
    await request('/api/admin/crm/notes', { customerUserId, body: noteBody });
    setNoteBody('');
  };

  const addTask = async () => {
    if (!taskTitle.trim()) return;
    await request('/api/admin/crm/tasks', {
      customerUserId,
      title: taskTitle,
      body: taskBody || null,
      dueAt: taskDueAt || null,
      priority: taskPriority,
    });
    setTaskTitle('');
    setTaskBody('');
    setTaskDueAt('');
    setTaskPriority('normal');
  };

  const addTicket = async () => {
    if (!ticketSubject.trim()) return;
    await request('/api/admin/crm/tickets', {
      customerUserId,
      orderId: ticketOrderId || null,
      subject: ticketSubject,
      body: ticketBody || null,
      priority: ticketPriority,
    });
    setTicketSubject('');
    setTicketBody('');
    setTicketPriority('normal');
    setTicketOrderId('');
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    await request(`/api/admin/crm/tasks/${taskId}`, { status }, 'PATCH');
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    await request(`/api/admin/crm/tickets/${ticketId}`, { status }, 'PATCH');
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100">
          {message}
        </div>
      )}

      <div className="admin-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <MessageSquarePlus size={20} />
          <h2 className="font-semibold">Ghi chú nội bộ</h2>
        </div>
        <div className="grid gap-3">
          <textarea
            value={noteBody}
            onChange={(event) => setNoteBody(event.target.value)}
            className="min-h-24 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100"
            placeholder="Thêm ghi chú chăm sóc khách hàng..."
          />
          <button
            type="button"
            onClick={addNote}
            disabled={saving === '/api/admin/crm/notes' || !noteBody.trim()}
            className="admin-btn admin-btn-primary w-fit disabled:opacity-50"
          >
            Lưu ghi chú
          </button>
        </div>
        <div className="mt-5 space-y-3">
          {notes.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có ghi chú CRM.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="rounded-xl border border-border p-3 text-sm">
                <p className="whitespace-pre-wrap">{note.body}</p>
                <p className="mt-2 text-xs text-gray-500">{new Date(note.created_at).toLocaleString('vi-VN')}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="admin-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <ClipboardList size={20} />
            <h2 className="font-semibold">Follow-up tasks</h2>
          </div>
          <div className="grid gap-3">
            <input
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
              placeholder="Ví dụ: Gọi lại sau khi nhận hàng"
            />
            <textarea
              value={taskBody}
              onChange={(event) => setTaskBody(event.target.value)}
              className="min-h-20 rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
              placeholder="Ghi chú task..."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="datetime-local"
                value={taskDueAt}
                onChange={(event) => setTaskDueAt(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
              />
              <select
                value={taskPriority}
                onChange={(event) => setTaskPriority(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <button
              type="button"
              onClick={addTask}
              disabled={saving === '/api/admin/crm/tasks' || !taskTitle.trim()}
              className="admin-btn admin-btn-primary w-fit disabled:opacity-50"
            >
              Tạo task
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có task chăm sóc.</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-border p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.body && <p className="mt-1 text-gray-500">{task.body}</p>}
                      <p className="mt-2 text-xs text-gray-500">
                        {task.priority} · {task.status} · {task.due_at ? new Date(task.due_at).toLocaleString('vi-VN') : 'Không có hạn'}
                      </p>
                    </div>
                    {task.status === 'open' && (
                      <button
                        type="button"
                        onClick={() => updateTaskStatus(task.id, 'done')}
                        className="admin-btn-icon admin-btn-success"
                        title="Đánh dấu hoàn tất"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <Ticket size={20} />
            <h2 className="font-semibold">Tickets CSKH</h2>
          </div>
          <div className="grid gap-3">
            <input
              value={ticketSubject}
              onChange={(event) => setTicketSubject(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
              placeholder="Chủ đề ticket"
            />
            <textarea
              value={ticketBody}
              onChange={(event) => setTicketBody(event.target.value)}
              className="min-h-20 rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
              placeholder="Mô tả vấn đề..."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={ticketOrderId}
                onChange={(event) => setTicketOrderId(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
              >
                <option value="">Không gắn đơn hàng</option>
                {orderOptions.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.orderNumber}
                  </option>
                ))}
              </select>
              <select
                value={ticketPriority}
                onChange={(event) => setTicketPriority(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <button
              type="button"
              onClick={addTicket}
              disabled={saving === '/api/admin/crm/tickets' || !ticketSubject.trim()}
              className="admin-btn admin-btn-primary w-fit disabled:opacity-50"
            >
              Tạo ticket
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {tickets.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có ticket CSKH.</p>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-xl border border-border p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{ticket.subject}</p>
                      {ticket.body && <p className="mt-1 text-gray-500">{ticket.body}</p>}
                      <p className="mt-2 text-xs text-gray-500">
                        {ticket.priority} · {ticket.status} · {new Date(ticket.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                      <button
                        type="button"
                        onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
