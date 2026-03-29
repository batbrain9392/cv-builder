/** Max body size for PUT /api/cv (UTF-8 bytes). */
export const CV_MAX_BYTES = 512 * 1024;

export type ValidateCvBodyResult =
  | { ok: true }
  | { ok: false; error: string; code: "empty" | "too_large" };

export function validateCvBody(body: string): ValidateCvBodyResult {
  if (body.trim().length === 0) {
    return { ok: false, error: "CV must not be empty.", code: "empty" };
  }
  const bytes = new TextEncoder().encode(body).length;
  if (bytes > CV_MAX_BYTES) {
    return {
      ok: false,
      error: `CV exceeds maximum size (${CV_MAX_BYTES} bytes).`,
      code: "too_large",
    };
  }
  return { ok: true };
}
