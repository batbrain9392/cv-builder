import type React from 'react';

import { Menu } from '@base-ui/react/menu';
import { ArrowLeftIcon, BrainIcon, ExternalLinkIcon, SendIcon } from 'lucide-react';
import { type FormEvent, useRef, useState } from 'react';
import { Link } from 'react-router';

import { AppHeader } from '@/components/AppHeader';
import { GEMINI_LOGO_URL } from '@/components/GeminiIcon';
import { InstallPwa } from '@/components/InstallPwa';
import { menuItemClass } from '@/components/menuItemClass';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const GITHUB_REPO = 'https://github.com/batbrain9392/cv-builder';
const LINKEDIN_URL = 'https://www.linkedin.com/in/batbrain9392/';
const AVATAR_URL = 'https://github.com/batbrain9392.png';

const PWA_LOGO = 'https://cdn.simpleicons.org/pwa';
const CURSOR_LOGO = 'https://cdn.simpleicons.org/cursor';
const CLAUDE_LOGO = 'https://cdn.simpleicons.org/claude';

const TECH_STACK = [
  { emoji: '⚛️', label: 'React 19 + TypeScript', href: 'https://react.dev' },
  { emoji: '⚡', label: 'Vite 6', href: 'https://vite.dev' },
  {
    emoji: '🎨',
    label: 'Tailwind CSS v4 + shadcn',
    href: 'https://tailwindcss.com',
  },
  {
    emoji: '📋',
    label: 'react-hook-form + Zod',
    href: 'https://react-hook-form.com',
  },
  { emoji: '📄', label: 'docx.js (Word export)', href: 'https://docx.js.org' },
  {
    emoji: '📝',
    label: 'marked (Markdown)',
    href: 'https://marked.js.org',
  },
  { emoji: '🌐', label: 'Fully client-side — no backend' },
] satisfies { emoji: string; label: string; href?: string }[];

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
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      aria-label="Submit a GitHub issue"
      className="space-y-3"
    >
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
  name,
  label,
  href,
}: {
  logo: string;
  name: string;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} — ${label} (opens in new tab)`}
      className="flex flex-col items-center gap-2 rounded-xl border bg-muted/40 p-4 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <img
        src={logo}
        alt=""
        aria-hidden="true"
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

function InstallCardRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
      <div className="flex-1">
        <p className="text-xs font-medium">Install on this device</p>
        <p className="text-xs text-muted-foreground">
          No app store needed — installs directly from your browser.
        </p>
      </div>
      {children}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid max-w-4xl gap-5 p-4 pb-24 [&>[data-slot=card]]:h-full lg:grid-cols-2 lg:p-6 lg:pb-6 xl:p-8 xl:pb-8">
          {/* Hero heading + motivation — full width */}
          <div className="lg:col-span-2">
            <h1 className="flex items-center gap-3 text-xl font-bold tracking-tight">
              <BrainIcon className="size-5" aria-hidden="true" />
              Behind the Bot
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything you wanted to know about this app (and some things you didn&rsquo;t).
            </p>
            <div className="mt-4 max-w-3xl space-y-2 text-sm">
              <p>
                Writing a CV is hard. Tailoring it for every job you apply to is even harder. This
                app exists so you can load your full career history once, paste a job description,
                let AI reshape your bullets and summary to match, then tweak the result before you
                export.
              </p>
              <p className="text-muted-foreground">
                The exported Word document uses clean, structured formatting designed to be parsed
                correctly by most applicant tracking systems (ATS).
              </p>
            </div>
          </div>

          {/* Features & tips — left */}
          <Card>
            <CardHeader>
              <CardTitle as="h2">✨ Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                ✏️ <strong>Live side-by-side preview</strong> as you edit. 📝 Markdown support in
                text fields for rich formatting.
              </p>
              <p>
                📄 Export to <strong>DOCX</strong> or <strong>JSON</strong> — import from JSON to
                pick up where you left off.
              </p>
              <p>
                📄 Need a PDF? Open the DOCX in Word, Google Docs, or LibreOffice and use{' '}
                <strong>File → Save as PDF</strong> / <strong>Print → Save as PDF</strong>.
              </p>
            </CardContent>
          </Card>

          {/* Tips — right */}
          <Card>
            <CardHeader>
              <CardTitle as="h2">💡 Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                👤 Already have a JSON export from a previous session? <strong>Import it</strong> to
                skip re-entering everything.
              </p>
              <p>
                🔑 You&rsquo;ll need a free <strong>Gemini API key</strong> for the AI features —
                grab one from Google AI Studio. Back it up somewhere safe (e.g.&nbsp;a password
                manager) since Google won&rsquo;t show it again.
              </p>
              <p>
                🤖 After AI enhances your CV, <strong>always review and tweak</strong> the result.
                You know your career better than any model does.
              </p>
            </CardContent>
          </Card>

          {/* Data Privacy — left */}
          <Card>
            <CardHeader>
              <CardTitle as="h2">🔒 Cookies &amp; Data Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                🍪 No cookies are used — at all. 🚫 No data is sent to any server. Gemini API calls
                go directly from your browser to Google using your own API key.
              </p>
              <p>
                💡 The only <code className="rounded bg-muted px-1 text-xs">localStorage</code>{' '}
                usage is for the light/dark theme preference. 🧠 CV data lives entirely in browser
                memory during the session. Nothing is persisted unless you explicitly export.
              </p>
              <p>
                🔑 Your Gemini API key is never stored server-side. It only appears in the exported
                JSON if you choose to include it.
              </p>
            </CardContent>
          </Card>

          {/* Suggestions & Feedback — right */}
          <Card>
            <CardHeader>
              <CardTitle as="h2">💬 Suggestions &amp; Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <a
                  href={`${GITHUB_REPO}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                  🐛 GitHub Issues
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                  💼 LinkedIn Messages
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>

              <hr className="border-border" />

              <IssueForm />
            </CardContent>
          </Card>

          {/* Built with — full width */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle as="h2">🛠️ Built with</CardTitle>
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
                  name="Cursor"
                  label="Code editor"
                  href="https://cursor.com"
                />
                <BuiltWithCard
                  logo={CLAUDE_LOGO}
                  name="Claude Opus"
                  label="AI coding agent"
                  href="https://anthropic.com/claude"
                />
                <BuiltWithCard
                  logo={GEMINI_LOGO_URL}
                  name="Google Gemini"
                  label="In-app AI engine"
                  href="https://gemini.google.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tech stack — right */}
          <Card>
            <CardHeader>
              <CardTitle as="h2">⚙️ Tech stack</CardTitle>
            </CardHeader>
            <CardContent>
              <ul aria-label="Technologies used" className="flex flex-wrap gap-2">
                {TECH_STACK.map(({ emoji, label, href }) => (
                  <li key={label}>
                    {href ? (
                      <Badge
                        variant="outline"
                        render={
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${label} (opens in new tab)`}
                          />
                        }
                      >
                        {emoji} {label}
                        <ExternalLinkIcon aria-hidden="true" />
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {emoji} {label}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Developer + Source code — left */}
          <Card>
            <CardHeader>
              <CardTitle as="h2">👨‍💻 Developer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={AVATAR_URL}
                  alt="Debmallya Bhattacharya"
                  className="size-16 rounded-full ring-2 ring-primary/20"
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
                    <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                    LinkedIn
                    <span className="sr-only"> (opens in new tab)</span>
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
                  <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                  github.com/batbrain9392/cv-builder
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Progressive Web App — full width, at the end */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle as="h2" className="flex items-center gap-2">
                <img src={PWA_LOGO} alt="" aria-hidden="true" className="h-5" loading="lazy" />
                Progressive Web App
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                BioBot is a{' '}
                <a
                  href="https://web.dev/explore/progressive-web-apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  Progressive Web App
                  <ExternalLinkIcon className="size-3" aria-hidden="true" />
                  <span className="sr-only"> (opens in new tab)</span>
                </a>{' '}
                &mdash; a website that can be installed on your device and used like a native app.
                PWAs load fast, work offline, and receive updates automatically without an app
                store.
              </p>
              <ul className="grid gap-1.5 text-muted-foreground sm:grid-cols-2">
                <li>📶 Works offline after first visit</li>
                <li>⚡ Instant load from cached assets</li>
                <li>📱 Add to home screen on any device</li>
                <li>🔄 Always up to date — no manual updates</li>
              </ul>
              <InstallPwa
                variant="default"
                size="default"
                label="Install BioBot"
                wrapper={InstallCardRow}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <AppHeader
        mobileMenuItems={
          <Menu.Item className={menuItemClass} render={<Link to="/" />}>
            <ArrowLeftIcon className="size-4" />
            Back to editor
          </Menu.Item>
        }
      >
        <Link
          to="/"
          aria-label="Back to editor"
          className="hidden items-center gap-1 rounded-lg border border-primary-foreground/30 px-2.5 py-1 text-[0.8rem] font-medium text-primary-foreground hover:bg-primary-foreground/15 sm:inline-flex"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to editor
        </Link>
      </AppHeader>
    </div>
  );
}
