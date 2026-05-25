'use client';

import { useState } from 'react';

export function CustomerTierForm({
  userId,
  initialTier,
}: {
  userId: string;
  initialTier: string;
}) {
  const [tier, setTier] = useState(initialTier);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const tiers = ['standard', 'silver', 'gold', 'vip'];

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/customers/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipTier: tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || 'Cap nhat that bai');
      setMessage('Da cap nhat tier.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Loi khong xac dinh');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-card p-6 space-y-3">
      <h2 className="font-semibold">Membership tier</h2>
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="border border-border rounded px-3 py-2 text-sm"
        >
          {tiers.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="admin-btn admin-btn-primary disabled:opacity-50"
        >
          {saving ? 'Dang luu...' : 'Luu'}
        </button>
      </div>
      {message && <div className="text-sm text-gray-600">{message}</div>}
    </div>
  );
}

