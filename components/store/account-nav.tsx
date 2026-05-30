'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, Package, Heart, MapPin, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { USE_SUPABASE } from '@/lib/config';
import { createClient } from '@/lib/supabase/client';
import { clearSession } from '@/lib/auth/session';
import { BRAND } from '@/lib/brand';

const links = [
  { href: '/account', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/account/profile', label: 'Thông tin cá nhân', icon: User },
  { href: '/account/orders', label: 'Đơn hàng', icon: Package },
  { href: '/account/wishlist', label: 'Yêu thích', icon: Heart },
  { href: '/account/addresses', label: 'Địa chỉ giao hàng', icon: MapPin },
];

export function AccountNav({ userName = 'Member' }: { userName?: string }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    if (USE_SUPABASE) {
      await createClient().auth.signOut();
    } else {
      clearSession();
    }
    window.location.href = '/login';
  };

  const getInitials = (name: string) => {
    if (!name) return 'M';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="flex flex-col gap-1.5 bg-white p-4 md:p-5 rounded-2xl border border-border shadow-sm sticky top-24">
      {/* User Profile Summary */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
        <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold tracking-widest shrink-0">
          {getInitials(userName)}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-500 truncate">Xin chào,</p>
          <p className="font-bold truncate text-black">{userName}</p>
        </div>
      </div>

      {links.map((link) => {
        const isActive = link.href === '/account' 
          ? pathname === '/account' 
          : pathname.startsWith(link.href);

        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200',
              isActive
                ? 'bg-black text-white shadow-md shadow-black/10'
                : 'text-gray-600 hover:bg-gray-50 hover:text-black'
            )}
          >
            <Icon size={18} className={cn('transition-colors', isActive ? 'text-white' : 'text-gray-400')} />
            {link.label}
          </Link>
        );
      })}

      <div className="mt-4 pt-4 border-t border-border">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </nav>
  );
}
