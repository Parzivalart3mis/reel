import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'RATE_LIMITED'
  | 'UPSTREAM'
  | 'CONFIG'
  | 'INTERNAL';

const STATUS: Record<ApiErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 400,
  RATE_LIMITED: 429,
  UPSTREAM: 502,
  CONFIG: 500,
  INTERNAL: 500,
};

export class ApiError extends Error {
  code: ApiErrorCode;
  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

export function errorResponse(
  code: ApiErrorCode,
  message: string,
): NextResponse {
  return NextResponse.json(
    { error: { code, message } },
    { status: STATUS[code] },
  );
}

/** Parse a JSON request body, surfacing a clean VALIDATION error on garbage. */
export async function parseJsonBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ApiError('VALIDATION', 'Request body must be valid JSON');
  }
}

/** Drop keys whose value is `undefined` (so optional fields are simply absent). */
export function compact<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as T;
}

/** Normalises thrown values into the standard `{ error }` JSON shape. */
export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return errorResponse(err.code, err.message);
  }
  if (err instanceof ZodError) {
    const first = err.errors[0];
    const path = first?.path.join('.') ?? 'body';
    return errorResponse(
      'VALIDATION',
      first ? `${path}: ${first.message}` : 'Invalid request',
    );
  }
  // eslint-disable-next-line no-console
  console.error('Unhandled route error:', err);
  return errorResponse('INTERNAL', 'Something went wrong');
}
