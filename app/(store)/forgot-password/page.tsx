'use client';

import { useState } from 'react';
import Link from 'next/link';
import { USE_SUPABASE } from '@/lib/config';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get('email') as string;

    if (USE_SUPABASE) {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/account/profile`,
      });
      if (authError) {
        setError(authError.message);
        return;
      }
    }

    setSent(true);
  };

  return (
    <div className="container-mqb py-16 max-w-md mx-auto">
      <h1 className="text-heading-lg uppercase mb-4 text-center">
        Quên mật khẩu
      </h1>
      {sent ? (
        <div className="text-center">
          <p className="text-secondary text-sm mb-8">
            Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại
            mật khẩu.
          </p>
          <Link href="/login" className="btn-primary">
            Về đăng nhập
          </Link>
        </div>
      ) : (
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
          <button type="submit" className="w-full btn-primary">
            Gửi yêu cầu
          </button>
        </form>
      )}
      <p className="text-center text-sm text-secondary mt-8">
        <Link href="/login" className="underline font-bold text-black">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
