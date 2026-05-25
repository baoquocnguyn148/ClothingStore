'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/brand';
import { USE_SUPABASE } from '@/lib/config';
import { createClient } from '@/lib/supabase/client';
import { setSession, createDefaultUser } from '@/lib/auth/session';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get('name') as string;
    const email = form.get('email') as string;
    const phone = form.get('phone') as string;
    const password = form.get('password') as string;
    const confirm = form.get('confirm') as string;

    if (password !== confirm) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (USE_SUPABASE) {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, phone },
        },
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      router.push('/account');
      router.refresh();
      return;
    }

    setSession(createDefaultUser(email, name, phone));
    router.push('/account');
  };

  return (
    <div className="container-mqb py-16 max-w-md mx-auto">
      <h1 className="text-heading-lg uppercase mb-2 text-center">Đăng ký</h1>
      <p className="text-center text-sm text-secondary mb-8">
        Tham gia {BRAND.fullName} Membership
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-accent text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-bold mb-2">Họ tên</label>
          <input name="name" required className="w-full border border-border px-4 py-3" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Email</label>
          <input name="email" type="email" required className="w-full border border-border px-4 py-3" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Số điện thoại</label>
          <input name="phone" className="w-full border border-border px-4 py-3" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Mật khẩu</label>
          <input name="password" type="password" required minLength={6} className="w-full border border-border px-4 py-3" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Xác nhận mật khẩu</label>
          <input name="confirm" type="password" required className="w-full border border-border px-4 py-3" />
        </div>
        <button type="submit" className="w-full btn-primary">
          Đăng ký
        </button>
      </form>
      <p className="text-center text-sm text-secondary mt-8">
        Đã có tài khoản?{' '}
        <Link href="/login" className="underline font-bold text-black">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
