'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/brand';
import { USE_SUPABASE } from '@/lib/config';
import { createClient } from '@/lib/supabase/client';
import { setSession, createDefaultUser } from '@/lib/auth/session';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get('name') as string;
    const email = form.get('email') as string;
    const phone = form.get('phone') as string;
    const password = form.get('password') as string;
    const confirm = form.get('confirm') as string;

    if (password !== confirm) {
      setError('Mật khẩu không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    setError('');

    if (USE_SUPABASE) {
      try {
        const res = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, phone }),
        });
        const result = await res.json();

        if (!res.ok) {
          setError(result.error ?? 'Đăng ký thất bại. Vui lòng thử lại.');
          setLoading(false);
          return;
        }

        // Sign in immediately after register (server already confirmed email)
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          // Registration succeeded but auto-login failed — redirect to login
          router.push('/login?registered=1');
          return;
        }

        router.push('/account');
        router.refresh();
        return;
      } catch (e: any) {
        setError(e?.message ?? 'Lỗi server. Vui lòng thử lại.');
        setLoading(false);
        return;
      }
    }

    // Mock mode
    setTimeout(() => {
      setSession(createDefaultUser(email, name, phone));
      router.push('/account');
    }, 800);

  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex animate-page-fade-in">
      {/* Form side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-[440px]">
          <h1 className="text-3xl font-extrabold uppercase mb-2">Đăng ký</h1>
          <p className="text-gray-500 mb-8">
            Tham gia {BRAND.fullName} Membership
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide text-gray-700">
                Họ tên
              </label>
              <input name="name" required placeholder="Nguyễn Văn A" className="input-base py-2.5" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide text-gray-700">
                  Email
                </label>
                <input name="email" type="email" required placeholder="email@domain.com" className="input-base py-2.5" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide text-gray-700">
                  Số điện thoại
                </label>
                <input name="phone" placeholder="0901234567" className="input-base py-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <input 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  minLength={6} 
                  placeholder="Tối thiểu 6 ký tự" 
                  className="input-base py-2.5 pr-12" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide text-gray-700">
                Xác nhận mật khẩu
              </label>
              <input 
                name="confirm" 
                type={showPassword ? 'text' : 'password'} 
                required 
                className="input-base py-2.5" 
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-black font-bold text-white transition-all hover:bg-neutral-800 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Đã có tài khoản?{' '}
              <Link href="/login" className="font-bold text-black hover:underline transition-all">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Visual side - hidden on mobile */}
      <div className="hidden lg:flex w-1/2 bg-gray-50 flex-col justify-center items-center p-16 border-l border-border relative overflow-hidden">
        {/* Abstract shapes/decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-200 rounded-bl-full opacity-50 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gray-200 rounded-tr-full opacity-50 blur-3xl" />
        
        <div className="relative z-10 max-w-md text-center">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight mb-6">Đặc quyền thành viên</h2>
          <ul className="space-y-6 text-left">
            <li className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-black text-white flex items-center justify-center font-bold">1</div>
              <div>
                <h4 className="font-bold text-lg">Tích điểm đổi quà</h4>
                <p className="text-gray-500 mt-1">Tích lũy B-Points cho mỗi đơn hàng để đổi các voucher giá trị.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-black text-white flex items-center justify-center font-bold">2</div>
              <div>
                <h4 className="font-bold text-lg">Ưu đãi sinh nhật</h4>
                <p className="text-gray-500 mt-1">Nhận mã giảm giá đặc biệt lên đến 20% trong tháng sinh nhật của bạn.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-black text-white flex items-center justify-center font-bold">3</div>
              <div>
                <h4 className="font-bold text-lg">Early Access</h4>
                <p className="text-gray-500 mt-1">Mua sắm sớm các bộ sưu tập mới trước khi ra mắt công chúng.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
