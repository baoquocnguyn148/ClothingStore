'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BRAND } from '@/lib/brand';
import { USE_SUPABASE } from '@/lib/config';
import { createClient } from '@/lib/supabase/client';
import { setSession, createDefaultUser } from '@/lib/auth/session';
import { useCart } from '@/lib/cart/cart-context';
import { Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshCart } = useCart();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const justRegistered = searchParams.get('registered') === '1';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    if (!email || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    setError('');

    if (USE_SUPABASE) {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        // Translate common Supabase auth errors to Vietnamese
        const msg = authError.message;
        if (msg === 'Email not confirmed') {
          setError('Email chưa được xác nhận. Vui lòng kiểm tra hộp thư hoặc liên hệ admin.');
        } else if (msg === 'Invalid login credentials') {
          setError('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.');
        } else if (msg.includes('Too many requests')) {
          setError('Quá nhiều lần thử. Vui lòng đợi vài phút rồi thử lại.');
        } else {
          setError(msg);
        }
        setLoading(false);
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

    // Mock mode
    setTimeout(() => {
      setSession(createDefaultUser(email, email.split('@')[0]));
      router.push('/account');
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex animate-page-fade-in">
      {/* Visual side - hidden on mobile */}
      <div className="hidden lg:flex w-1/2 relative bg-neutral-900 text-white flex-col justify-between p-16 overflow-hidden">
        <Image
          src="/images/banners/banner1.png"
          alt="Login banner"
          fill
          className="object-cover opacity-40 mix-blend-overlay"
          sizes="50vw"
          priority
        />
        <div className="relative z-10">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase">{BRAND.name}</Link>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black uppercase leading-tight mb-6">
            Đăng nhập để nhận<br />ưu đãi độc quyền.
          </h2>
          <p className="text-gray-200 max-w-md leading-relaxed text-lg mb-8">
            Quản lý đơn hàng, lưu danh sách yêu thích và trải nghiệm mua sắm mượt mà hơn cùng {BRAND.fullName}.
          </p>
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            <span className="w-2 h-2 rounded-full bg-white/40" />
            <span className="w-2 h-2 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-[440px]">
          <h1 className="text-3xl font-extrabold uppercase mb-2">Đăng nhập</h1>
          <p className="text-gray-500 mb-8">
            Chào mừng bạn quay lại với {BRAND.siteTitle}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {justRegistered && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center gap-2">
                <CheckCircle size={16} className="shrink-0" />
                Đăng ký thành công! Vui lòng đăng nhập bằng tài khoản vừa tạo.
              </div>
            )}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-gray-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="Nhập địa chỉ email..."
                className="input-base"
              />
            </div>
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="block text-sm font-bold uppercase tracking-wide text-gray-700">
                  Mật khẩu
                </label>
                <Link href="/forgot-password" className="text-sm font-medium text-black hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu..."
                  className="input-base pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 mt-4 flex items-center justify-center gap-2 rounded-xl bg-black font-bold text-white transition-all hover:bg-neutral-800 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-500">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-bold text-black hover:underline transition-all">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
