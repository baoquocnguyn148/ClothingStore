'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountNav } from '@/components/store/account-nav';
import { USE_SUPABASE } from '@/lib/config';
import { createClient } from '@/lib/supabase/client';
import { getSession } from '@/lib/auth/session';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function check() {
      if (USE_SUPABASE) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/login');
          return;
        }
      } else if (!getSession()) {
        router.replace('/login');
        return;
      }
      setReady(true);
    }
    check();
  }, [router]);

  if (!ready) {
    return <div className="container-mqb py-16 text-secondary">Đang tải...</div>;
  }

  return (
    <div className="container-mqb py-12 md:py-16">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        <AccountNav />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
