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

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? 'Request failed');
  }
  return json as T;
}
