import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CV_API_PATH, downloadCvFile, loadCv, saveCv } from "./api/cv.ts";
import { validateCvBody } from "./lib/validateCvBody.ts";
import "./App.css";

export function App() {
  const [markdown, setMarkdown] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const text = await loadCv();
        if (!cancelled) {
          setMarkdown(text);
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load CV.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSave = useCallback(async () => {
    setSaveMessage(null);
    const check = validateCvBody(markdown);
    if (!check.ok) {
      setSaveMessage(check.error);
      return;
    }
    setSaving(true);
    const result = await saveCv(markdown);
    setSaving(false);
    if (result.ok) {
      setSaveMessage("Saved.");
    } else {
      setSaveMessage(result.error);
    }
  }, [markdown]);

  const onDownload = useCallback(() => {
    downloadCvFile("cv.md", markdown);
  }, [markdown]);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">CV builder</h1>
        <p className="app-lede">
          Edit Markdown on the left; preview on the right. Save writes{" "}
          <code className="inline-code">content/cv.md</code> via the dev server (
          <code className="inline-code">{CV_API_PATH}</code>). Use <strong>npm run dev</strong>.
        </p>
        <div className="toolbar">
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" className="btn" onClick={onDownload}>
            Download .md
          </button>
        </div>
        {loadError ? <p className="banner banner-error">{loadError}</p> : null}
        {saveMessage ? (
          <p className={`banner ${saveMessage === "Saved." ? "banner-success" : "banner-error"}`}>{saveMessage}</p>
        ) : null}
      </header>

      <details className="staff-hints">
        <summary>Staff-level signals (quick checklist)</summary>
        <ul>
          <li>Outcomes and scope—not only tools; numbers only when true.</li>
          <li>Technical depth: tradeoffs, constraints, reliability—not buzzwords.</li>
          <li>Cross-team influence when it reflects real work.</li>
          <li>See <code className="inline-code">STAFF_CV_GUIDE.md</code> for the full guide and reference posting.</li>
        </ul>
      </details>

      <main className="layout">
        <section className="panel panel-editor" aria-label="Markdown source">
          <h2 className="panel-heading">Source</h2>
          <textarea
            className="editor"
            value={markdown}
            onChange={(e) => {
              setMarkdown(e.target.value);
              setSaveMessage(null);
            }}
            spellCheck
            aria-label="CV Markdown"
          />
        </section>
        <section className="panel panel-preview" aria-label="Preview">
          <h2 className="panel-heading">Preview</h2>
          <article className="preview markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          </article>
        </section>
      </main>
    </div>
  );
}
