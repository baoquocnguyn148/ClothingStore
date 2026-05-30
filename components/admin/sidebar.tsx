'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Brain,
  FilePenLine,
  ShoppingBag,
  Package,
  FolderKanban,
  Warehouse,
  Tag,
  Star,
  FileText,
  Users,
  ClipboardList,
  Store,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  {
    label: 'Tổng quan',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'MIS Reports',
    href: '/admin/reports',
    icon: BarChart3,
  },
  {
    label: 'DSS',
    href: '/admin/decision-support',
    icon: Brain,
  },
  {
    label: 'ESS',
    href: '/admin/executive',
    icon: LayoutDashboard,
  },
  {
    label: 'Nội dung Home',
    href: '/admin/home-content',
    icon: FilePenLine,
  },
  {
    label: 'Đơn hàng',
    href: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    label: 'Sản phẩm',
    href: '/admin/products',
    icon: Package,
  },
  {
    label: 'Collections',
    href: '/admin/collections',
    icon: FolderKanban,
  },
  {
    label: 'Tồn kho',
    href: '/admin/inventory',
    icon: Warehouse,
  },
  {
    label: 'Khuyến mãi',
    href: '/admin/promotions',
    icon: Tag,
  },
  {
    label: 'Đánh giá',
    href: '/admin/reviews',
    icon: Star,
  },
  {
    label: 'Blog',
    href: '/admin/blog',
    icon: FileText,
  },
  {
    label: 'CMS pages',
    href: '/admin/pages',
    icon: FileText,
  },
  {
    label: 'Khách hàng',
    href: '/admin/customers',
    icon: Users,
  },
  {
    label: 'CRM',
    href: '/admin/crm',
    icon: ClipboardList,
  },
  {
    label: 'Cửa hàng',
    href: '/admin/settings',
    icon: Store,
  },
  {
    label: 'Cài đặt',
    href: '/admin/settings/notifications',
    icon: Settings,
  },
];


export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <Link href="/admin" className="admin-logo-link">
          <span className="admin-logo-text">B&amp;D</span>
          <span className="admin-logo-sub">Admin</span>
        </Link>
      </div>

      <nav className="admin-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('admin-nav-item', isActive && 'active')}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {isActive && <ChevronRight size={14} className="admin-nav-indicator" />}
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <Link href="/" className="admin-back-link">
          Về cửa hàng
        </Link>
      </div>
    </aside>
  );
}
