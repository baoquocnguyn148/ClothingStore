'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/brand';
import { USE_SUPABASE } from '@/lib/config';
import { createClient } from '@/lib/supabase/client';
import { setSession, createDefaultUser } from '@/lib/auth/session';
import { useCart } from '@/lib/cart/cart-context';

export default function LoginPage() {
  const router = useRouter();
  const { refreshCart } = useCart();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    if (!email || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (USE_SUPABASE) {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      try {
        await fetch('/api/v1/cart/merge', { method: 'POST', credentials: 'include' });
      } catch {
        // guest cart optional
      }
      await refreshCart();
      router.push('/account');
      router.refresh();
      return;
    }

    setSession(createDefaultUser(email, email.split('@')[0]));
    router.push('/account');
  };

  return (
    <div className="container-mqb py-16 max-w-md mx-auto">
      <h1 className="text-heading-lg uppercase mb-2 text-center">Đăng nhập</h1>
      <p className="text-center text-sm text-secondary mb-8">{BRAND.siteTitle}</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-accent text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-bold mb-2">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-border px-4 py-3"
          />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-bold">Mật khẩu</label>
            <Link href="/forgot-password" className="text-xs underline text-secondary">
              Quên mật khẩu?
            </Link>
          </div>
          <input
            name="password"
            type="password"
            required
            className="w-full border border-border px-4 py-3"
          />
        </div>
        <button type="submit" className="w-full btn-primary">
          Đăng nhập
        </button>
      </form>
      <p className="text-center text-sm text-secondary mt-8">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="underline font-bold text-black">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
