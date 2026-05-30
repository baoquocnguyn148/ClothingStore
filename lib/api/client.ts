const API_BASE = '/api/v1';

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch (e) {
    // ignore JSON parse errors
  }

  if (!res.ok) {
    const err = new Error((json && json.error) || res.statusText || 'Request failed');
    // attach HTTP status for callers to handle auth vs other errors
    (err as any).status = res.status;
    throw err;
  }

  return json as T;
}
