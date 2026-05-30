import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { validateBody } from '@/lib/api/validate';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/server/admin/audit.service';

const CreateCampaignSchema = z.object({
  name: z.string().trim().min(1).max(200),
  objective: z.string().trim().max(1000).nullable().optional(),
  segmentId: z.string().uuid().nullable().optional(),
  channel: z.string().trim().min(1).max(40).default('email'),
  status: z.enum(['draft', 'scheduled', 'running', 'completed', 'cancelled']).default('draft'),
  scheduledAt: z.string().nullable().optional(),
  budget: z.number().int().min(0).default(0),
  expectedRevenue: z.number().int().min(0).default(0),
  notes: z.string().trim().max(5000).nullable().optional(),
});

export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { user, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, CreateCampaignSchema);
  if (validErr) return validErr;

  try {
    const db = createAdminClient();
    const { data: campaign, error } = await db
      .from('crm_campaigns')
      .insert({
        name: data.name,
        objective: data.objective || null,
        segment_id: data.segmentId || null,
        channel: data.channel,
        status: data.status,
        scheduled_at: data.scheduledAt || null,
        budget: data.budget,
        expected_revenue: data.expectedRevenue,
        notes: data.notes || null,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (error) throw error;
    await logAdminAction({
      actorId: user.id,
      action: 'crm_campaign.create',
      entity: 'crm_campaigns',
      entityId: campaign.id,
      metadata: { segmentId: data.segmentId ?? null, status: data.status },
    });
    return jsonOk({ campaign }, 201);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed to create campaign', 500);
  }
}
