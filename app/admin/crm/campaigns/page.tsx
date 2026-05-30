import Link from 'next/link';
import { AlertTriangle, Send } from 'lucide-react';
import { isSupabaseMode } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import { CampaignForm } from '@/components/admin/campaign-form';

export const metadata = { title: 'CRM Campaigns - Admin B&D' };
export const dynamic = 'force-dynamic';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export default async function AdminCrmCampaignsPage() {
  const isSupa = isSupabaseMode();
  let segments: any[] = [];
  let campaigns: any[] = [];
  let loadError: string | null = null;

  if (!isSupa) {
    loadError = 'Ket noi Supabase de quan ly campaigns.';
  } else {
    try {
      const db = createAdminClient();
      const [segmentsResult, campaignsResult] = await Promise.all([
        db.from('crm_segments').select('id, slug, name, description').order('name'),
        db
          .from('crm_campaigns')
          .select('id, name, objective, channel, status, scheduled_at, budget, expected_revenue, notes, crm_segments ( name )')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);
      if (segmentsResult.error) throw segmentsResult.error;
      if (campaignsResult.error) throw campaignsResult.error;
      segments = segmentsResult.data ?? [];
      campaigns = campaignsResult.data ?? [];
    } catch (e) {
      loadError = e instanceof Error ? e.message : 'Khong tai duoc campaigns.';
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">CRM Campaigns</h1>
          <p className="admin-page-subtitle">Lap ke hoach cham soc, win-back va marketing theo segment.</p>
        </div>
        <div className="admin-page-actions">
          <Link href="/admin/decision-support" className="admin-btn admin-btn-secondary">
            DSS
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="admin-notice">
          <AlertTriangle size={16} />
          {loadError}
        </div>
      )}

      {isSupa && <CampaignForm segments={segments.map((segment) => ({ id: segment.id, name: segment.name }))} />}

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <section className="admin-card">
          <h2 className="admin-card-title">Segments</h2>
          <div className="space-y-3">
            {segments.map((segment) => (
              <div key={segment.id} className="rounded-xl border border-border p-3 text-sm">
                <p className="font-medium">{segment.name}</p>
                <p className="text-xs text-slate-400">{segment.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-card">
          <h2 className="admin-card-title">
            <Send size={18} /> Campaign pipeline
          </h2>
          {campaigns.length === 0 ? (
            <div className="admin-empty">Chua co campaign.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Segment</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Budget</th>
                    <th>Expected</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => {
                    const segment = Array.isArray(campaign.crm_segments)
                      ? campaign.crm_segments[0]
                      : campaign.crm_segments;
                    return (
                      <tr key={campaign.id}>
                        <td>
                          <div className="font-medium">{campaign.name}</div>
                          {campaign.objective && <div className="text-xs text-slate-400">{campaign.objective}</div>}
                        </td>
                        <td>{segment?.name ?? '-'}</td>
                        <td>{campaign.channel}</td>
                        <td>{campaign.status}</td>
                        <td>{formatVND(campaign.budget ?? 0)}</td>
                        <td>{formatVND(campaign.expected_revenue ?? 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
