import { createServerSupabaseClient } from '@/lib/supabase/server';
import { jsonError } from './response';

/**
 * Require the current user to have the 'admin' role (stored in profiles.role).
 * Returns the user if authorized, throws/returns error response otherwise.
 *
 * Usage in API routes:
 *   const { user, errorResponse } = await requireAdmin();
 *   if (errorResponse) return errorResponse;
 */
export async function requireAdmin(): Promise<
  | { user: { id: string; email: string }; errorResponse: null }
  | { user: null; errorResponse: ReturnType<typeof jsonError> }
> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, errorResponse: jsonError('Unauthorized', 401) };
  }

  // Check admin role in profiles table using service role client
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const db = createAdminClient();

  const { data: profile } = await db
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { user: null, errorResponse: jsonError('Forbidden', 403) };
  }

  return {
    user: { id: user.id, email: user.email ?? '' },
    errorResponse: null,
  };
}

/**
 * Simpler version that redirects instead of returning error response.
 * Use in server-side functions (not API routes).
 */
export async function assertAdmin(): Promise<{ id: string; email: string }> {
  const result = await requireAdmin();
  if (result.errorResponse) {
    const { redirect } = await import('next/navigation');
    redirect('/login?redirect=/admin');
    // TypeScript needs this return statement even though redirect never returns
    throw new Error('Redirected');
  }
  return result.user;
}
