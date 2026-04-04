import { ArrowLeftIcon, BotIcon, ExternalLinkIcon, SendIcon } from 'lucide-react';
import { type FormEvent, useRef, useState } from 'react';
import { Link } from 'react-router';

import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const GITHUB_REPO = 'https://github.com/batbrain9392/cv-builder';
const LINKEDIN_URL = 'https://www.linkedin.com/in/batbrain9392/';
const AVATAR_URL = 'https://avatars.githubusercontent.com/u/16217568?v=4';

const CURSOR_LOGO = 'https://cdn.simpleicons.org/cursor';
const CLAUDE_LOGO = 'https://cdn.simpleicons.org/claude';
const GEMINI_LOGO = 'https://cdn.simpleicons.org/googlegemini';

const TECH_STACK = [
  { emoji: '⚛️', label: 'React 19 + TypeScript' },
  { emoji: '⚡', label: 'Vite 6' },
  { emoji: '🎨', label: 'Tailwind CSS v4 + shadcn' },
  { emoji: '📋', label: 'react-hook-form + Zod' },
  { emoji: '📄', label: 'docx (Word export)' },
  { emoji: '📝', label: 'marked (Markdown)' },
  { emoji: '🌐', label: 'Fully client-side — no backend' },
];

function IssueForm() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const params = new URLSearchParams();
    params.set('title', title.trim());
    if (body.trim()) params.set('body', body.trim());

    window.open(`${GITHUB_REPO}/issues/new?${params.toString()}`, '_blank');
    setTitle('');
    setBody('');
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs text-muted-foreground">
        This opens a pre-filled issue on GitHub. You&rsquo;ll need a GitHub account to submit.
      </p>
      <Field>
        <FieldLabel htmlFor="issue-title">📌 Title</FieldLabel>
        <Input
          id="issue-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief summary of the issue or suggestion"
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="issue-body">📝 Description</FieldLabel>
        <Textarea
          id="issue-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Details, steps to reproduce, or feature description (optional)"
          rows={3}
        />
      </Field>
      <Button type="submit" size="sm" disabled={!title.trim()}>
        <SendIcon data-icon="inline-start" />
        Open issue on GitHub
      </Button>
    </form>
  );
}

function BuiltWithCard({
  logo,
  alt,
  name,
  label,
  href,
}: {
  logo: string;
  alt: string;
  name: string;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-2 rounded-xl border bg-muted/40 p-4 transition-colors hover:bg-muted"
    >
      <img
        src={logo}
        alt={alt}
        className="h-6 dark:invert"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <div className="text-center">
        <span className="text-xs font-medium">{name}</span>
        <span className="block text-[0.65rem] text-muted-foreground">{label}</span>
      </div>
    </a>
  );
}

export default function AboutPage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="z-40 flex shrink-0 items-center justify-between bg-primary px-4 py-3 text-primary-foreground shadow-md lg:px-6 xl:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <BotIcon className="size-6" />
          Bot-ter Than You
        </Link>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-lg border border-primary-foreground/30 px-2.5 py-1 text-[0.8rem] font-medium text-primary-foreground hover:bg-primary-foreground/15"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to editor
          </Link>
        </nav>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid max-w-4xl gap-5 p-4 pb-16 [&>[data-slot=card]]:h-full lg:grid-cols-2 lg:p-6 xl:p-8">
          {/* Hero heading — full width */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold tracking-tight">🤖 Behind the Bot</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything you wanted to know about this app (and some things you didn&rsquo;t).
            </p>
          </div>

          {/* What this app does — left */}
          <Card>
            <CardHeader>
              <CardTitle>🤖 What this app does</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✏️ Build and edit a CV with a live side-by-side preview</li>
                <li>
                  ✨ AI-powered generation of professional summary, cover letter, and bullet points
                  using Google Gemini
                </li>
                <li>📄 Export to DOCX or JSON — import from JSON to pick up where you left off</li>
                <li>📝 Supports Markdown in text fields for rich formatting</li>
              </ul>
            </CardContent>
          </Card>

          {/* How to best use it — right */}
          <Card>
            <CardHeader>
              <CardTitle>🚀 How to best use it</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-inside list-decimal space-y-2 text-sm">
                <li>
                  📋 Paste a <strong>job description</strong> and add your free{' '}
                  <strong>Gemini API key</strong>
                </li>
                <li>👤 Fill in your personal info, experience, and education</li>
                <li>🤖 Hit &ldquo;Enhance with AI&rdquo; to tailor bullets to the job</li>
                <li>💾 Export as DOCX for submission, or JSON to save your progress</li>
                <li>
                  📄 Need a PDF? Open the DOCX in Word, Google Docs, or LibreOffice and use{' '}
                  <strong>File → Save as PDF</strong> / <strong>Print → Save as PDF</strong>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Built with — full width */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>🛠️ Built with</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                🖥️ Code written in <strong>Cursor</strong> with <strong>Claude Opus</strong> by
                Anthropic. ✨ Live AI features inside the app are powered by{' '}
                <strong>Google Gemini</strong> (gemini-2.5-flash).
              </p>
              <div className="grid grid-cols-3 gap-3">
                <BuiltWithCard
                  logo={CURSOR_LOGO}
                  alt="Cursor"
                  name="Cursor"
                  label="Code editor"
                  href="https://cursor.com"
                />
                <BuiltWithCard
                  logo={CLAUDE_LOGO}
                  alt="Claude by Anthropic"
                  name="Claude Opus"
                  label="AI coding agent"
                  href="https://anthropic.com/claude"
                />
                <BuiltWithCard
                  logo={GEMINI_LOGO}
                  alt="Google Gemini"
                  name="Google Gemini"
                  label="In-app AI engine"
                  href="https://gemini.google.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Developer + Source code — left */}
          <Card>
            <CardHeader>
              <CardTitle>👨‍💻 Developer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={AVATAR_URL}
                  alt="Debmallya Bhattacharya"
                  className="size-16 rounded-full ring-2 ring-primary/20"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="font-medium">Debmallya Bhattacharya</p>
                  <p className="text-sm text-muted-foreground">
                    Senior Software Developer at Workday, Dublin
                  </p>
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLinkIcon className="size-3.5" />
                    LinkedIn
                  </a>
                </div>
              </div>

              <hr className="border-border" />

              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">💻 Source code</p>
                <a
                  href={GITHUB_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLinkIcon className="size-3.5" />
                  github.com/batbrain9392/cv-builder
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Tech stack — right */}
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Tech stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK.map(({ emoji, label }) => (
                  <Badge key={label} variant="outline">
                    {emoji} {label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Privacy — left */}
          <Card>
            <CardHeader>
              <CardTitle>🔒 Cookies &amp; Data Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>🍪 No cookies are used — at all.</li>
                <li>
                  🚫 No data is sent to any server. Gemini API calls go directly from your browser
                  to Google using your own API key.
                </li>
                <li>
                  💡 The only <code className="rounded bg-muted px-1 text-xs">localStorage</code>{' '}
                  usage is for the light/dark theme preference.
                </li>
                <li>
                  🧠 CV data lives entirely in browser memory during the session. Nothing is
                  persisted unless you explicitly export.
                </li>
                <li>
                  🔑 Your Gemini API key is never stored server-side. It only appears in the
                  exported JSON if you choose to include it.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Suggestions & Feedback — right */}
          <Card>
            <CardHeader>
              <CardTitle>💬 Suggestions &amp; Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <a
                  href={`${GITHUB_REPO}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLinkIcon className="size-3.5" />
                  🐛 GitHub Issues
                </a>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLinkIcon className="size-3.5" />
                  💼 LinkedIn Messages
                </a>
              </div>

              <hr className="border-border" />

              <IssueForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
