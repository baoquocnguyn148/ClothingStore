import { NextRequest } from 'next/server';
import { z } from 'zod';
import { jsonOk, jsonError, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { EmailTemplateService } from '@/lib/server/admin/email-template.service';
import { validateBody } from '@/lib/api/validate';

const UpdateTemplateSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, errorResponse: validErr } = await validateBody(request, UpdateTemplateSchema);
  if (validErr) return validErr;

  try {
    const { id } = await params;
    const updated = await new EmailTemplateService().updateTemplate(id, data);
    return jsonOk(updated);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : 'Failed to update template', 500);
  }
}
