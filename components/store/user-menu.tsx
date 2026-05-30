'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, UserCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { USE_SUPABASE } from '@/lib/config';
import { createClient } from '@/lib/supabase/client';
import { getSession, clearSession } from '@/lib/auth/session';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function check() {
      if (USE_SUPABASE) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setLoggedIn(Boolean(user));
        setName(user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? '');
      } else {
        const user = getSession();
        setLoggedIn(Boolean(user));
        setName(user?.name ?? '');
      }
      setIsChecking(false);
    }
    check();
  }, []);

  const logout = async () => {
    if (USE_SUPABASE) {
      await createClient().auth.signOut();
    } else {
      clearSession();
    }
    setLoggedIn(false);
    router.push('/');
    router.refresh();
  };

  // Prevent flicker
  if (isChecking) {
    return <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />;
  }

  if (!loggedIn) {
    return (
      <Link
        href="/login"
        className="rounded-full p-2.5 transition-all hover:bg-black/5"
        aria-label="Đăng nhập"
      >
        <User size={20} />
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full p-2.5 transition-all hover:bg-black/5 flex items-center justify-center"
          aria-label="Tài khoản"
        >
          <User size={20} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl">
        <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-muted">
          <Link href="/account" className="font-medium">Tài khoản</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-muted">
          <Link href="/account/orders" className="font-medium">Đơn hàng</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-muted">
          <Link href="/account/wishlist" className="font-medium">Yêu thích</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-muted">
          <Link href="/account/profile" className="font-medium">Thông tin cá nhân</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-muted">
          <Link href="/account/addresses" className="font-medium">Địa chỉ</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem onClick={logout} className="cursor-pointer rounded-md text-red-600 focus:bg-red-50 focus:text-red-700 font-semibold">
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
