import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

const GUEST_COOKIE = 'bd_guest_session';

export async function getGuestSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(GUEST_COOKIE)?.value;
  if (existing) return existing;

  const id = randomUUID();
  cookieStore.set(GUEST_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  return id;
}

export async function getGuestSessionIdFromRequest(
  request: Request
): Promise<string | undefined> {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(new RegExp(`${GUEST_COOKIE}=([^;]+)`));
  return match?.[1];
}
