'use client';

import { Bell, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface Props {
  adminName: string;
}

export default function AdminTopBar({ adminName }: Props) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread notification count
    fetch('/api/admin/notifications?unread=true&limit=1')
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.unreadCount ?? 0))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        {/* Breadcrumb slot — filled by individual pages */}
        <span className="admin-topbar-breadcrumb" id="admin-breadcrumb" />
      </div>

      <div className="admin-topbar-right">
        {/* Notification bell */}
        <a href="/admin/notifications" className="admin-topbar-bell" title="Thông báo">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="admin-notif-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </a>

        {/* Admin name */}
        <span className="admin-topbar-name">{adminName}</span>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="admin-topbar-logout"
          title="Đăng xuất"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
