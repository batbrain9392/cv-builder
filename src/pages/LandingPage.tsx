import type React from 'react';

import {
  ArrowRightIcon,
  BookOpenIcon,
  BriefcaseIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GraduationCapIcon,
  KeyRoundIcon,
  LayoutListIcon,
  LockIcon,
  MonitorSmartphoneIcon,
  PenLineIcon,
  PrinterIcon,
  SendIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UploadIcon,
  UserIcon,
  WandSparklesIcon,
} from 'lucide-react';
import { type FormEvent, useRef, useState } from 'react';
import { Link } from 'react-router';

import { AppLogo } from '@/components/AppLogo';
import { GeminiIcon, GEMINI_LOGO_URL } from '@/components/GeminiIcon';
import { RobotIcon } from '@/components/RobotIcon';
import { ScrollToTopFab } from '@/components/ScrollToTopFab';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useIsInView } from '@/lib/useIsInView';
import { useIsScrolledPast } from '@/lib/useIsScrolledPast';

const GITHUB_REPO = 'https://github.com/batbrain9392/cv-builder';
const LINKEDIN_URL = 'https://www.linkedin.com/in/batbrain9392/';
const AVATAR_URL = 'https://github.com/batbrain9392.png';

const CURSOR_LOGO = 'https://cdn.simpleicons.org/cursor';
const CLAUDE_LOGO = 'https://cdn.simpleicons.org/claude';

const TECH_STACK = [
  { emoji: '⚛️', label: 'React 19 + TypeScript', href: 'https://react.dev' },
  { emoji: '⚡', label: 'Vite 6', href: 'https://vite.dev' },
  { emoji: '🎨', label: 'Tailwind CSS v4 + shadcn', href: 'https://tailwindcss.com' },
  { emoji: '📋', label: 'react-hook-form + Zod', href: 'https://react-hook-form.com' },
  { emoji: '📄', label: 'docx.js (Word export)', href: 'https://docx.js.org' },
  { emoji: '📝', label: 'marked (Markdown)', href: 'https://marked.js.org' },
  { emoji: '🌐', label: 'Fully client-side — no backend' },
] satisfies { emoji: string; label: string; href?: string }[];

const ATS_SECTIONS = [
  {
    icon: UserIcon,
    title: 'Contact information',
    desc: 'Name, email, phone, and LinkedIn in plain text — not embedded in headers, images, or tables.',
  },
  {
    icon: PenLineIcon,
    title: 'Professional summary',
    desc: 'A concise paragraph packed with keywords from the job posting so the parser can score relevance instantly.',
  },
  {
    icon: BriefcaseIcon,
    title: 'Work experience',
    desc: 'Clear role, company, dates, and measurable achievements — the format every ATS expects.',
  },
  {
    icon: LayoutListIcon,
    title: 'Skills with exact keywords',
    desc: 'Mirror the job description\'s wording. "React" won\'t match "React.js" in many systems.',
  },
  {
    icon: GraduationCapIcon,
    title: 'Education',
    desc: 'Degree, institution, and graduation year in a structure the parser can reliably extract.',
  },
] as const;

const FEATURES = [
  {
    icon: SparklesIcon,
    title: 'AI-powered tailoring',
    desc: 'Upload or paste a job description and let Gemini rewrite your experience highlights with matching keywords — in seconds.',
  },
  {
    icon: UploadIcon,
    title: 'Upload any CV format',
    desc: 'Drop in a PDF, Word document, or even a screenshot of your CV. Gemini reads it and populates every field automatically.',
  },
  {
    icon: FileTextIcon,
    title: 'ATS-safe DOCX export',
    desc: 'A clean, single-column Word document with structured headings that parsers read correctly.',
  },
  {
    icon: PrinterIcon,
    title: 'Pixel-perfect PDF',
    desc: 'Open the DOCX in Word or Google Docs and save as PDF — better results than any generator.',
  },
  {
    icon: MonitorSmartphoneIcon,
    title: 'Live side-by-side preview',
    desc: 'See exactly how your CV looks as you type — on desktop or mobile.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Privacy-first',
    desc: 'Your CV draft lives in local storage on your device. No sign-up and no app server. Optional Gemini; production builds send scrubbed errors to Sentry.',
  },
  {
    icon: KeyRoundIcon,
    title: 'JSON backup & restore',
    desc: 'Save your full career data as a JSON backup. Reload it anytime to tailor for the next application.',
  },
] as const;

// ---------------------------------------------------------------------------

function SectionWrapper({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-4 py-16 sm:py-20 lg:px-6 xl:px-8 ${className}`}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-8 text-center text-2xl font-bold tracking-tight sm:text-3xl">{children}</h2>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function HeroSection({
  ctaRef,
  sectionRef,
}: {
  ctaRef: React.RefObject<HTMLAnchorElement | null>;
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  return (
    <section
      ref={sectionRef}
      className="relative bg-primary px-4 pt-24 pb-16 text-primary-foreground sm:pb-20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--hero-glow),transparent_70%)]" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <RobotIcon
          className="mb-5 size-16 drop-shadow-lg [--background:var(--primary)] sm:size-20"
          aria-hidden="true"
        />

        <h1 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          Your CV, optimized for the machines that read it first.
        </h1>

        <p className="mt-4 max-w-xl text-base text-primary-foreground/80 sm:text-lg">
          Most CVs are rejected by applicant tracking systems before a human ever sees them. BioBot
          helps you build an ATS-friendly CV — upload your existing CV as a PDF, Word doc, or even a
          screenshot, and AI fills in the editor for you.
        </p>

        <Link
          ref={ctaRef}
          to="/app"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-primary-foreground px-6 text-base font-semibold text-primary shadow-lg transition-transform hover:scale-105 hover:bg-primary-foreground/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-100"
        >
          Build your CV
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Why your CV gets rejected
// ---------------------------------------------------------------------------

function AtsExplainerSection() {
  return (
    <SectionWrapper className="bg-background text-foreground">
      <SectionHeading>Why your fancy CV gets rejected</SectionHeading>

      <div className="mx-auto mb-10 max-w-2xl space-y-3 text-center text-sm text-muted-foreground sm:text-base">
        <p>
          Before a recruiter reads your CV, software called an{' '}
          <a
            href="https://en.wikipedia.org/wiki/Applicant_tracking_system"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
          >
            Applicant Tracking System (ATS)
          </a>{' '}
          parses it. It extracts text, matches keywords, and scores you against the job description.
        </p>
        <p>
          Columns, tables, images, custom fonts, and fancy layouts? The parser often can&rsquo;t
          read them — and throws your CV into the reject pile.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 dark:bg-destructive/20">
          <p className="mb-3 text-sm font-semibold text-destructive-text">
            What ATS sees from a fancy CV
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex gap-2">
              ❌ <span>Two-column layout &rarr; text merged into gibberish</span>
            </li>
            <li className="flex gap-2">
              ❌ <span>Icons for phone/email &rarr; missing contact info</span>
            </li>
            <li className="flex gap-2">
              ❌ <span>Skill bars &amp; charts &rarr; invisible to the parser</span>
            </li>
            <li className="flex gap-2">
              ❌ <span>Header/footer text &rarr; often skipped entirely</span>
            </li>
            <li className="flex gap-2">
              ❌ <span>Generic experience missing job description keywords</span>
            </li>
            <li className="flex gap-2">
              ❌ <span>No cover letter to reinforce your fit for the role</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 dark:bg-primary/20">
          <p className="mb-3 text-sm font-semibold text-primary-text">
            What ATS reads from BioBot&rsquo;s export
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex gap-2">
              ✅ <span>Upload your existing CV and BioBot restructures it for ATS</span>
            </li>
            <li className="flex gap-2">
              ✅ <span>Single-column, structured headings</span>
            </li>
            <li className="flex gap-2">
              ✅ <span>Plain-text contact details at the top</span>
            </li>
            <li className="flex gap-2">
              ✅ <span>Keywords woven into achievements, easy to score</span>
            </li>
            <li className="flex gap-2">
              ✅ <span>Clean DOCX that every parser handles</span>
            </li>
            <li className="flex gap-2">
              ✅ <span>Experience rewritten to match job description keywords</span>
            </li>
            <li className="flex gap-2">
              ✅ <span>Optional tailored cover letter included</span>
            </li>
          </ul>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Estimates suggest that over 90% of large employers use an ATS as a first-pass filter.
      </p>
    </SectionWrapper>
  );
}

// ---------------------------------------------------------------------------
// What makes a CV ATS-friendly
// ---------------------------------------------------------------------------

function AtsSectionsGrid() {
  return (
    <SectionWrapper className="bg-background text-foreground">
      <SectionHeading>Sections that matter to the machine</SectionHeading>

      <p className="mx-auto -mt-4 mb-8 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
        ATS parsers look for specific, well-labelled sections. Miss one and the system may score you
        as unqualified — even if you&rsquo;re a perfect fit.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ATS_SECTIONS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-xl border bg-card p-5 text-card-foreground ring-1 ring-foreground/5"
          >
            <Icon className="mb-2 size-5 text-primary-text" aria-hidden="true" />
            <p className="mb-1 text-sm font-semibold">{title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

// ---------------------------------------------------------------------------
// AI tailoring (opt-in)
// ---------------------------------------------------------------------------

const AI_STEPS = [
  {
    step: 1,
    icon: UploadIcon,
    title: 'Upload or paste the job description',
    desc: 'Upload the job posting as a PDF, screenshot, or paste the text directly. The AI identifies keywords, skills, and tone.',
  },
  {
    step: 2,
    icon: KeyRoundIcon,
    title: 'Add your free Gemini API key',
    desc: 'Get a key from Google AI Studio in seconds — no billing required. Your key stays in your browser.',
  },
  {
    step: 3,
    icon: WandSparklesIcon,
    title: 'AI rewrites to match',
    desc: 'Gemini rewrites your experience highlights, professional summary, and cover letter with the right keywords — ready in seconds.',
  },
] as const;

function AiTailoringSection() {
  return (
    <SectionWrapper className="bg-secondary text-secondary-foreground" id="ai-tailoring">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 flex items-center justify-center gap-2.5">
          <GeminiIcon className="size-6" />
          <Badge variant="outline" className="text-xs">
            Optional &middot; Bring your own key
          </Badge>
        </div>

        <SectionHeading>Tailor your CV in seconds with AI</SectionHeading>

        <p className="mx-auto -mt-4 mb-10 max-w-2xl text-sm text-muted-foreground sm:text-base">
          The core CV builder works perfectly on its own. Opt in to AI and let Google Gemini rewrite
          your content to match each job description — experience highlights, summary, and cover
          letter.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">
        {AI_STEPS.map(({ step, icon: Icon, title, desc }) => (
          <div
            key={step}
            className="relative rounded-xl border bg-card p-5 text-card-foreground ring-1 ring-foreground/5"
          >
            <span className="absolute -top-3 left-4 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {step}
            </span>
            <Icon className="mb-3 size-5 text-primary-text" aria-hidden="true" />
            <p className="mb-1 text-sm font-semibold">{title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-lg rounded-xl border bg-card p-6 text-center ring-1 ring-foreground/5">
        <BookOpenIcon className="mx-auto mb-3 size-6 text-primary-text" aria-hidden="true" />
        <p className="mb-1 text-sm font-semibold text-card-foreground">
          Need a detailed walkthrough?
        </p>
        <p className="mb-4 text-xs text-muted-foreground">
          Step-by-step instructions for every feature — from importing your CV to exporting the
          final DOCX.
        </p>
        <Link
          to="/guide"
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary-text transition-colors hover:bg-primary/10"
        >
          <BookOpenIcon className="size-4" />
          Read the full guide
        </Link>
      </div>

      <div className="mt-8 flex items-start justify-center gap-2 text-center text-xs text-muted-foreground">
        <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>
          Your data never touches a server. Gemini calls go directly from your browser to Google
          using your own API key.
        </span>
      </div>
    </SectionWrapper>
  );
}

// ---------------------------------------------------------------------------
// How BioBot helps
// ---------------------------------------------------------------------------

function FeaturesSection() {
  return (
    <SectionWrapper className="bg-secondary text-secondary-foreground">
      <SectionHeading>How BioBot helps you land the interview</SectionHeading>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle as="h3" className="flex items-center gap-2">
                <Icon className="size-4" aria-hidden="true" />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}

// ---------------------------------------------------------------------------
// Behind the scenes (condensed About content)
// ---------------------------------------------------------------------------

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
        <FieldLabel htmlFor="issue-title">Title</FieldLabel>
        <Input
          id="issue-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief summary of the issue or suggestion"
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="issue-body">Description</FieldLabel>
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

function BehindTheScenesSection() {
  return (
    <SectionWrapper className="bg-background text-foreground" id="behind-the-scenes">
      <SectionHeading>Behind the scenes</SectionHeading>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Built with */}
        <Card>
          <CardHeader>
            <CardTitle as="h3">Built with</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-xs text-muted-foreground">
              This entire app was vibe-coded — built by a human giving directions to AI agents. Code
              written in <strong>Cursor</strong> with <strong>Claude Opus</strong>. In-app AI
              powered by <strong>Google Gemini</strong> (gemini-2.5-flash).
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

        {/* Data privacy */}
        <Card>
          <CardHeader>
            <CardTitle as="h3">
              <LockIcon className="inline size-4" aria-hidden="true" /> Data privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>
              This app has <strong>no backend</strong> for your CV. Your draft, API key, and theme
              are saved to <code className="rounded bg-muted px-1">localStorage</code> on your
              device so you can pick up where you left off. They are not uploaded to us.
            </p>
            <p>
              <strong>Gemini</strong> (optional): requests go from your browser straight to Google
              using your own API key.
            </p>
            <p>
              <strong>Sentry</strong> (production only): scrubbed crash and performance data may be
              sent to Sentry so bugs can be fixed. Session replay is off. See the project README for
              what is redacted.
            </p>
            <p>
              No ad or marketing cookies. The Sentry SDK may still use browser storage for its own
              session correlation.
            </p>
            <p>
              Your API key stays on your device &mdash; anyone with access to this browser could
              read it, so use a device you trust.
            </p>
          </CardContent>
        </Card>

        {/* Tech stack */}
        <Card>
          <CardHeader>
            <CardTitle as="h3">Tech stack</CardTitle>
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

        {/* Developer */}
        <Card>
          <CardHeader>
            <CardTitle as="h3">Developer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={AVATAR_URL}
                alt="Debmallya Bhattacharya"
                className="size-14 rounded-full ring-2 ring-primary/20"
              />
              <div>
                <p className="text-sm font-medium">Debmallya Bhattacharya</p>
                <p className="text-xs text-muted-foreground">
                  Senior Software Developer at Workday, Dublin
                </p>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary-text hover:underline"
                >
                  <ExternalLinkIcon className="size-3" aria-hidden="true" />
                  LinkedIn
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>
            </div>
            <hr className="border-border" />
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Source code</p>
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary-text hover:underline"
              >
                <ExternalLinkIcon className="size-3" aria-hidden="true" />
                github.com/batbrain9392/cv-builder
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle as="h3">Suggestions &amp; feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <a
                href={`${GITHUB_REPO}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary-text hover:underline"
              >
                <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                GitHub Issues
                <span className="sr-only"> (opens in new tab)</span>
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary-text hover:underline"
              >
                <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                LinkedIn Messages
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            </div>
            <hr className="border-border" />
            <IssueForm />
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
}

// ---------------------------------------------------------------------------
// Floating CTA (FAB)
// ---------------------------------------------------------------------------

function FloatingCta({ visible }: { visible: boolean }) {
  return (
    <Link
      to="/app"
      className={
        'fixed bottom-6 right-[4.25rem] z-50 inline-flex h-10 items-center gap-1.5 rounded-full bg-primary pl-4 pr-3 text-sm font-medium text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-100' +
        (visible ? ' scale-100 opacity-100' : ' pointer-events-none scale-75 opacity-0')
      }
    >
      Build your CV
      <ArrowRightIcon className="size-4" />
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Top nav (landing-specific, lightweight)
// ---------------------------------------------------------------------------

function LandingNav({ shadow }: { shadow: boolean }) {
  return (
    <nav
      aria-label="Main navigation"
      className={
        'fixed inset-x-0 top-0 z-50 bg-primary px-4 py-3 text-primary-foreground transition-shadow duration-200 lg:px-6 xl:px-8' +
        (shadow ? ' shadow-md' : '')
      }
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <AppLogo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/guide"
            className="hidden items-center gap-1 rounded-lg border border-primary-foreground/30 px-2.5 py-1 text-[0.8rem] font-medium text-primary-foreground hover:bg-primary-foreground/15 sm:inline-flex"
          >
            <BookOpenIcon className="size-3.5" />
            How to use
          </Link>
          <Link
            to="/app"
            className="hidden items-center gap-1 rounded-lg border border-primary-foreground/30 px-2.5 py-1 text-[0.8rem] font-medium text-primary-foreground hover:bg-primary-foreground/15 sm:inline-flex"
          >
            Build your CV
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function LandingFooter({ ref }: { ref: React.Ref<HTMLElement | null> }) {
  return (
    <footer ref={ref} className="bg-primary px-4 py-10 text-primary-foreground lg:px-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
        <Link
          to="/app"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-foreground px-6 text-base font-semibold text-primary shadow transition-transform hover:scale-105 hover:bg-primary-foreground/90 active:scale-100"
        >
          Start building your CV
          <ArrowRightIcon className="size-4" />
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-footer-text">
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-primary-foreground"
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6.02 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.37.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3" />
            </svg>
            GitHub
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-primary-foreground"
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77A1.75 1.75 0 0 0 0 1.73v20.54A1.75 1.75 0 0 0 1.77 24h20.45A1.75 1.75 0 0 0 24 22.27V1.73A1.75 1.75 0 0 0 22.22 0Z" />
            </svg>
            LinkedIn
          </a>
        </div>

        <div className="flex items-center gap-2 text-xs text-footer-text-subtle">
          <img
            src={AVATAR_URL}
            alt=""
            aria-hidden="true"
            className="size-4 rounded-full ring-1 ring-primary-foreground/20"
            loading="lazy"
          />
          <span>Made by Debmallya Bhattacharya &middot; {new Date().getFullYear()}</span>
        </div>

        <p className="text-[0.65rem] text-footer-text-faint">100% vibe-coded with AI ✨</p>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------

export default function LandingPage() {
  useDocumentTitle();
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const ctaScrolledPast = useIsScrolledPast(ctaRef);
  const heroScrolledPast = useIsScrolledPast(heroRef);
  const [footerInView, footerInViewRef] = useIsInView();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <LandingNav shadow={heroScrolledPast} />
      <main>
        <HeroSection ctaRef={ctaRef} sectionRef={heroRef} />
        <AtsExplainerSection />
        <AiTailoringSection />
        <AtsSectionsGrid />
        <FeaturesSection />
        <BehindTheScenesSection />
      </main>
      <LandingFooter ref={footerInViewRef} />
      <FloatingCta visible={ctaScrolledPast && !footerInView} />
      <ScrollToTopFab
        visible={heroScrolledPast}
        onClick={scrollToTop}
        className="bottom-6 right-6"
      />
    </div>
  );
}
