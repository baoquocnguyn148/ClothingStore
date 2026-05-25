/** Client + server: commerce reads/writes go through Supabase when provider is supabase. */
export const USE_SUPABASE =
  process.env.NEXT_PUBLIC_COMMERCE_PROVIDER === 'supabase' ||
  process.env.COMMERCE_PROVIDER === 'supabase';

/** Server-only: API routes that need service role (orders, admin, webhooks). */
export function isServerSupabaseReady() {
  return (
    USE_SUPABASE &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
