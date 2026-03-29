import { describe, expect, it } from "vitest";
import { CV_MAX_BYTES, validateCvBody } from "./validateCvBody.ts";

describe("validateCvBody", () => {
  it("rejects empty and whitespace-only", () => {
    expect(validateCvBody("").ok).toBe(false);
    expect(validateCvBody("   \n\t  ").ok).toBe(false);
  });

  it("accepts non-empty content", () => {
    expect(validateCvBody("# Hi\n")).toEqual({ ok: true });
  });

  it("rejects when UTF-8 byte length exceeds max", () => {
    const chunk = "あ"; // 3 bytes in UTF-8
    const n = Math.ceil(CV_MAX_BYTES / 3) + 1;
    const body = chunk.repeat(n);
    const r = validateCvBody(body);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("too_large");
    }
  });
});
