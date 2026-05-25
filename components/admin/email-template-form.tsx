'use client';

import { FormEvent, useState } from 'react';

interface EmailTemplateFormProps {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
}

export function EmailTemplateForm({ id, name, type, subject: initialSubject, body: initialBody }: EmailTemplateFormProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/email-templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || result?.error || 'Failed to save');
      }
      setMessage({ type: 'success', text: 'Cập nhật template thành công' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">{type.replace('_', ' ')}</p>
          <h3 className="text-lg font-semibold">{name}</h3>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="admin-btn admin-btn-primary"
        >
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor={`subject-${id}`} className="block text-sm font-medium text-slate-700 mb-2">Tiêu đề email</label>
          <input
            id={`subject-${id}`}
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
          />
        </div>
        <div>
          <label htmlFor={`body-${id}`} className="block text-sm font-medium text-slate-700 mb-2">Nội dung mẫu</label>
          <textarea
            id={`body-${id}`}
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm font-mono"
          />
          <p className="mt-2 text-xs text-slate-500">
            Hỗ trợ biến:{' '}
            <code>{'{customer_name}'}</code>, <code>{'{order_number}'}</code>, <code>{'{tracking_number}'}</code>
          </p>
        </div>
      </div>

      {message && (
        <div className={`mt-4 rounded-md px-3 py-2 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
    </form>
  );
}
