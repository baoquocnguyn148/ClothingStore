import { NextResponse } from 'next/server';

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function isSupabaseMode() {
  return (
    (process.env.COMMERCE_PROVIDER === 'supabase' ||
      process.env.NEXT_PUBLIC_COMMERCE_PROVIDER === 'supabase') &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
