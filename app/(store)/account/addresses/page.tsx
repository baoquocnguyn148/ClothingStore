'use client';

import { useEffect, useState } from 'react';
import { USE_SUPABASE } from '@/lib/config';
import { apiFetch } from '@/lib/api/client';
import { getSession, updateSession, type UserAddress } from '@/lib/auth/session';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    if (USE_SUPABASE) {
      const data = await apiFetch<{
        addresses: Array<{
          id: string;
          name: string;
          phone: string;
          address_line: string;
          city: string;
          is_default: boolean;
        }>;
      }>('/me');
      setAddresses(
        (data.addresses ?? []).map((a) => ({
          id: a.id,
          name: a.name,
          phone: a.phone,
          address: a.address_line,
          city: a.city,
          isDefault: a.is_default,
        }))
      );
    } else {
      setAddresses(getSession()?.addresses ?? []);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    if (USE_SUPABASE) {
      await apiFetch('/me/addresses', {
        method: 'POST',
        body: JSON.stringify({
          name: form.get('name'),
          phone: form.get('phone'),
          address_line: form.get('address'),
          city: form.get('city'),
          is_default: addresses.length === 0,
        }),
      });
    } else {
      const user = getSession();
      if (!user) return;
      const newAddress: UserAddress = {
        id: `addr-${Date.now()}`,
        name: form.get('name') as string,
        phone: form.get('phone') as string,
        address: form.get('address') as string,
        city: form.get('city') as string,
        isDefault: user.addresses.length === 0,
      };
      updateSession({ addresses: [...user.addresses, newAddress] });
    }

    setShowForm(false);
    (e.target as HTMLFormElement).reset();
    await load();
  };

  const removeAddress = async (id: string) => {
    if (USE_SUPABASE) {
      await apiFetch(`/me/addresses?id=${id}`, { method: 'DELETE' });
    } else {
      const user = getSession();
      if (!user) return;
      updateSession({ addresses: user.addresses.filter((a) => a.id !== id) });
    }
    await load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-heading-md uppercase">Địa chỉ giao hàng</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-bold underline"
        >
          {showForm ? 'Huỷ' : '+ Thêm địa chỉ'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="border border-border p-6 mb-8 space-y-4 max-w-md">
          <input name="name" placeholder="Họ tên" required className="w-full border px-3 py-2 text-sm" />
          <input name="phone" placeholder="SĐT" required className="w-full border px-3 py-2 text-sm" />
          <input name="address" placeholder="Địa chỉ" required className="w-full border px-3 py-2 text-sm" />
          <input name="city" placeholder="Tỉnh/TP" required className="w-full border px-3 py-2 text-sm" />
          <button type="submit" className="btn-primary text-sm">
            Lưu địa chỉ
          </button>
        </form>
      )}

      {addresses.length === 0 ? (
        <p className="text-secondary text-sm">Chưa có địa chỉ nào.</p>
      ) : (
        <ul className="space-y-4">
          {addresses.map((addr) => (
            <li key={addr.id} className="border border-border p-4">
              {addr.isDefault && (
                <span className="text-xs font-bold bg-black text-white px-2 py-0.5 mb-2 inline-block">
                  Mặc định
                </span>
              )}
              <p className="font-bold text-sm">{addr.name}</p>
              <p className="text-sm text-secondary">{addr.phone}</p>
              <p className="text-sm">
                {addr.address}, {addr.city}
              </p>
              <button
                type="button"
                onClick={() => removeAddress(addr.id)}
                className="text-xs text-accent underline mt-3"
              >
                Xoá
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
