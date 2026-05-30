'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CampaignForm({
  segments,
}: {
  segments: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [channel, setChannel] = useState('email');
  const [scheduledAt, setScheduledAt] = useState('');
  const [budget, setBudget] = useState(0);
  const [expectedRevenue, setExpectedRevenue] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/crm/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          objective: objective || null,
          segmentId: segmentId || null,
          channel,
          scheduledAt: scheduledAt || null,
          budget,
          expectedRevenue,
          notes: notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || 'Khong tao duoc campaign');
      setName('');
      setObjective('');
      setSegmentId('');
      setChannel('email');
      setScheduledAt('');
      setBudget(0);
      setExpectedRevenue(0);
      setNotes('');
      setMessage('Da tao campaign.');
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Khong tao duoc campaign');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-card p-6">
      <h2 className="admin-card-title">Create CRM campaign</h2>
      <div className="grid gap-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
          placeholder="Campaign name"
        />
        <textarea
          value={objective}
          onChange={(event) => setObjective(event.target.value)}
          className="min-h-20 rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
          placeholder="Objective"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={segmentId}
            onChange={(event) => setSegmentId(event.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
          >
            <option value="">No segment</option>
            {segments.map((segment) => (
              <option key={segment.id} value={segment.id}>
                {segment.name}
              </option>
            ))}
          </select>
          <select
            value={channel}
            onChange={(event) => setChannel(event.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="zalo">Zalo</option>
            <option value="phone">Phone</option>
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
          />
          <input
            type="number"
            value={budget}
            onChange={(event) => setBudget(Number(event.target.value))}
            className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
            placeholder="Budget"
          />
          <input
            type="number"
            value={expectedRevenue}
            onChange={(event) => setExpectedRevenue(Number(event.target.value))}
            className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
            placeholder="Expected revenue"
          />
        </div>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-20 rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100"
          placeholder="Internal notes"
        />
        <button
          type="button"
          onClick={submit}
          disabled={saving || !name.trim()}
          className="admin-btn admin-btn-primary w-fit disabled:opacity-50"
        >
          {saving ? 'Dang tao...' : 'Tao campaign'}
        </button>
        {message && <p className="text-sm text-slate-400">{message}</p>}
      </div>
    </div>
  );
}
