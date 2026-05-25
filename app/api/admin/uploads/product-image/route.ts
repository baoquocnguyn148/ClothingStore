import { NextRequest } from 'next/server';
import { jsonError, jsonOk, isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { createAdminClient } from '@/lib/supabase/admin';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
]);

function safeName(value: string) {
  return value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export async function POST(request: NextRequest) {
  if (!isSupabaseMode()) return jsonError('Supabase not configured', 503);

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const productHandle = String(formData.get('handle') ?? 'product');

    if (!(file instanceof File)) {
      return jsonError('File is required', 400);
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return jsonError('Only JPG, PNG, WEBP or AVIF images are allowed', 422);
    }
    if (file.size > MAX_FILE_SIZE) {
      return jsonError('Image must be 5MB or smaller', 422);
    }

    const db = createAdminClient();
    const extension = ALLOWED_TYPES.get(file.type);
    const fileName = `${safeName(file.name) || 'image'}-${crypto.randomUUID()}.${extension}`;
    const path = `${safeName(productHandle) || 'product'}/${fileName}`;

    let { error: uploadError } = await db.storage
      .from('product-images')
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError && uploadError.message.toLowerCase().includes('bucket')) {
      await db.storage.createBucket('product-images', { public: true });
      const retry = await db.storage
        .from('product-images')
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
      uploadError = retry.error;
    }

    if (uploadError) throw uploadError;

    const { data } = db.storage.from('product-images').getPublicUrl(path);
    return jsonOk({ url: data.publicUrl, path });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Upload failed', 500);
  }
}
