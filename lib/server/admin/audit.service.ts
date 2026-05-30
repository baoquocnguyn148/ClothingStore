import { createAdminClient } from '@/lib/supabase/admin';

export async function logAdminAction(input: {
  actorId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const db = createAdminClient();
    await db.from('admin_audit_logs').insert({
      actor_id: input.actorId,
      action: input.action,
      entity: input.entity,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? {},
    });
  } catch {
    // Audit logging must not block the operational transaction.
  }
}
