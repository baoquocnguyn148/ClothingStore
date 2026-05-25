'use client';

import { useEffect, useState } from 'react';
import { USE_SUPABASE } from '@/lib/config';
import { apiFetch } from '@/lib/api/client';
import { getSession, updateSession } from '@/lib/auth/session';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      if (USE_SUPABASE) {
        const data = await apiFetch<{ user: { email: string }; profile: { full_name: string; phone: string } }>('/me');
        setName(data.profile?.full_name ?? '');
        setPhone(data.profile?.phone ?? '');
        setEmail(data.user?.email ?? '');
      } else {
        const user = getSession();
        if (user) {
          setName(user.name);
          setEmail(user.email);
          setPhone(user.phone ?? '');
        }
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (USE_SUPABASE) {
      await apiFetch('/me', {
        method: 'PATCH',
        body: JSON.stringify({ full_name: name, phone }),
      });
    } else {
      updateSession({ name, phone, email });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h1 className="text-heading-md uppercase mb-8">Thông tin cá nhân</h1>
      {saved && <p className="text-sm text-green-700 mb-4">Đã lưu thay đổi.</p>}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <div>
          <label className="block text-sm font-bold mb-2">Họ tên</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-border px-4 py-3"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Email</label>
          <input
            value={email}
            readOnly={USE_SUPABASE}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full border border-border px-4 py-3 bg-muted"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Số điện thoại</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-border px-4 py-3"
          />
        </div>
        <button type="submit" className="btn-primary">
          Lưu thay đổi
        </button>
      </form>
    </div>
  );
}
