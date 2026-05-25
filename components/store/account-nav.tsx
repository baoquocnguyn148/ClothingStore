'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, Package, Heart, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/account', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/account/profile', label: 'Thông tin cá nhân', icon: User },
  { href: '/account/orders', label: 'Đơn hàng', icon: Package },
  { href: '/account/wishlist', label: 'Yêu thích', icon: Heart },
  { href: '/account/addresses', label: 'Địa chỉ giao hàng', icon: MapPin },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1.5 md:min-w-[260px] bg-[#fbfbfa] p-4 rounded-xl border border-border/50">
      <div className="mb-4 px-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Tài khoản của tôi</h3>
      </div>
      {links.map((link) => {
        // Use startsWith for sub-routes like /account/orders/123 to keep the parent nav item active
        // But for exact match on /account, we check strictly.
        const isActive = link.href === '/account' 
          ? pathname === '/account' 
          : pathname.startsWith(link.href);

        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all duration-200',
              isActive
                ? 'bg-black text-white shadow-md shadow-black/10'
                : 'text-gray-600 hover:bg-white hover:text-black hover:shadow-sm'
            )}
          >
            <Icon size={18} className={cn('transition-colors', isActive ? 'text-white' : 'text-gray-400')} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
