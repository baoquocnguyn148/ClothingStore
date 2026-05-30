'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AccountNav } from '@/components/store/account-nav';
import { USE_SUPABASE } from '@/lib/config';
import { createClient } from '@/lib/supabase/client';
import { getSession } from '@/lib/auth/session';
import { Loader2 } from 'lucide-react';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    async function check() {
      if (USE_SUPABASE) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/login');
          return;
        }
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member');
      } else {
        const session = getSession();
        if (!session) {
          router.replace('/login');
          return;
        }
        setUserName(session.name);
      }
      setReady(true);
    }
    check();
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-500">
        <Loader2 size={32} className="animate-spin text-black" />
        <p className="text-sm font-medium">Đang tải dữ liệu tài khoản...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="container-mqb py-12 md:py-16">
        <div className="flex flex-col md:flex-row gap-8 md:gap-10">
          <aside className="w-full md:w-[280px] shrink-0">
            <AccountNav userName={userName} />
          </aside>
          <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8 animate-page-fade-in">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
