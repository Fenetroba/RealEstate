import type { ZodError, ZodType } from 'zod';

/** First human-readable message from a Zod failure. */
export function firstZodError(error: ZodError): string {
  const issue = error.issues[0];
  return issue?.message ?? 'Validation failed';
}

/** Map Zod issues to `{ fieldPath: message }` for inline form errors. */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function validateWithSchema<T>(
  schema: ZodType<T>,
  data: unknown,
): { ok: true; data: T } | { ok: false; message: string; fieldErrors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  return {
    ok: false,
    message: firstZodError(result.error),
    fieldErrors: zodFieldErrors(result.error),
  };
}
