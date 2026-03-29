export const CV_API_PATH = "/api/cv";

export async function loadCv(): Promise<string> {
  const res = await fetch(CV_API_PATH);
  if (!res.ok) {
    throw new Error(`Could not load CV (${res.status}).`);
  }
  return res.text();
}

type SaveErrorJson = { ok?: unknown; error?: unknown };

export async function saveCv(markdown: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(CV_API_PATH, {
    method: "PUT",
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
    body: markdown,
  });
  const data = (await res.json().catch(() => null)) as SaveErrorJson | null;
  if (res.ok && data?.ok === true) {
    return { ok: true };
  }
  const err =
    typeof data?.error === "string" ? data.error : `Save failed (${res.status}).`;
  return { ok: false, error: err };
}

export function downloadCvFile(filename: string, markdown: string): void {
  const blob = new Blob([markdown], { type: "text/markdown; charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.click();
  URL.revokeObjectURL(url);
}
