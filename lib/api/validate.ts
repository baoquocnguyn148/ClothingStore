import { z } from 'zod';
import { jsonError } from './response';

/**
 * Validate request body against a Zod schema.
 * Returns { data, errorResponse } — if errorResponse is set, return it immediately.
 *
 * Usage:
 *   const { data, errorResponse } = await validateBody(request, MySchema);
 *   if (errorResponse) return errorResponse;
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<{ data: T; errorResponse: null } | { data: null; errorResponse: ReturnType<typeof jsonError> }> {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return { data: null, errorResponse: jsonError('Invalid JSON body', 400) };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const message = result.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    return { data: null, errorResponse: jsonError(message, 422) };
  }

  return { data: result.data, errorResponse: null };
}

/**
 * Validate URL search params against a Zod schema.
 *
 * Usage:
 *   const { data, errorResponse } = validateQuery(request, MyQuerySchema);
 *   if (errorResponse) return errorResponse;
 */
export function validateQuery<T>(
  request: Request,
  schema: z.ZodType<T>
): { data: T; errorResponse: null } | { data: null; errorResponse: ReturnType<typeof jsonError> } {
  const url = new URL(request.url);
  const raw = Object.fromEntries(url.searchParams.entries());

  const result = schema.safeParse(raw);
  if (!result.success) {
    const message = result.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    return { data: null, errorResponse: jsonError(message, 422) };
  }

  return { data: result.data, errorResponse: null };
}
