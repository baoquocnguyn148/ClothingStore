import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminSidebar from '@/components/admin/sidebar';
import AdminTopBar from '@/components/admin/topbar';

export const metadata: Metadata = {
  title: 'Admin Panel — B&D',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth guard: must be logged in + admin role
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  // Check admin role
  const db = createAdminClient();
  const { data: profile } = await db
    .from('profiles')
    .select('role, full_name')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopBar adminName={profile.full_name || user.email || 'Admin'} />
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
