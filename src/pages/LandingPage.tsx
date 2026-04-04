import type React from 'react';

import {
  ArrowRightIcon,
  BriefcaseIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GraduationCapIcon,
  KeyRoundIcon,
  LayoutListIcon,
  LockIcon,
  MonitorSmartphoneIcon,
  PenLineIcon,
  SendIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserIcon,
} from 'lucide-react';
import { type FormEvent, useRef, useState } from 'react';
import { Link } from 'react-router';

import { AppLogo } from '@/components/AppLogo';
import { GEMINI_LOGO_URL } from '@/components/GeminiIcon';
import { InstallPwa } from '@/components/InstallPwa';
import { RobotIcon } from '@/components/RobotIcon';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
    desc: 'Clear role, company, dates, and bullet points with measurable achievements — the format every ATS expects.',
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
    desc: 'Paste a job description and let Gemini rewrite your bullets with matching keywords — in seconds.',
  },
  {
    icon: FileTextIcon,
    title: 'ATS-safe DOCX export',
    desc: 'A clean, single-column Word document with structured headings that parsers read correctly.',
  },
  {
    icon: MonitorSmartphoneIcon,
    title: 'Live side-by-side preview',
    desc: 'See exactly how your CV looks as you type — on desktop or mobile.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Privacy-first',
    desc: 'Everything runs in your browser. No server, no cookies, no data sent anywhere.',
  },
  {
    icon: KeyRoundIcon,
    title: 'JSON import / export',
    desc: 'Save your full career data as JSON. Reload it anytime to tailor for the next application.',
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
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-primary px-4 text-primary-foreground"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.65_0.08_155/0.25),transparent_70%)]" />

      <div className="relative z-10 flex max-w-3xl flex-col items-center text-center">
        <RobotIcon
          className="mb-6 size-20 drop-shadow-lg [--background:var(--primary)] sm:size-28"
          aria-hidden="true"
        />

        <h1 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          Your CV, optimized for the machines that read it first.
        </h1>

        <p className="mt-4 max-w-xl text-base text-primary-foreground/80 sm:text-lg">
          Most CVs are rejected by applicant tracking systems before a human ever sees them. BioBot
          helps you build an ATS-friendly CV — tailored to each job with AI.
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

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/10 to-transparent" />
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
          <strong className="text-foreground">Applicant Tracking System (ATS)</strong> parses it. It
          extracts text, matches keywords, and scores you against the job description.
        </p>
        <p>
          Columns, tables, images, custom fonts, and fancy layouts? The parser often can&rsquo;t
          read them — and throws your CV into the reject pile.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 dark:bg-destructive/10">
          <p className="mb-3 text-sm font-semibold text-destructive">
            What ATS sees from a fancy CV
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>❌ Two-column layout &rarr; text merged into gibberish</li>
            <li>❌ Icons for phone/email &rarr; missing contact info</li>
            <li>❌ Skill bars &amp; charts &rarr; invisible to the parser</li>
            <li>❌ Header/footer text &rarr; often skipped entirely</li>
          </ul>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 dark:bg-primary/10">
          <p className="mb-3 text-sm font-semibold text-primary">
            What ATS reads from BioBot&rsquo;s export
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>✅ Single-column, structured headings</li>
            <li>✅ Plain-text contact details at the top</li>
            <li>✅ Keywords in bullet points, easy to score</li>
            <li>✅ Clean DOCX that every parser handles</li>
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
    <SectionWrapper className="bg-secondary text-secondary-foreground">
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
            <Icon className="mb-2 size-5 text-primary" aria-hidden="true" />
            <p className="mb-1 text-sm font-semibold">{title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

// ---------------------------------------------------------------------------
// How BioBot helps
// ---------------------------------------------------------------------------

function FeaturesSection() {
  return (
    <SectionWrapper className="bg-background text-foreground">
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
// Install banner
// ---------------------------------------------------------------------------

function InstallBanner() {
  return (
    <section className="bg-primary px-4 py-14 text-primary-foreground sm:py-16 lg:px-6 xl:px-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Install BioBot on your device
        </h2>
        <p className="max-w-lg text-sm text-primary-foreground/80 sm:text-base">
          No app store. No download. Tap install and use it like a native app — even offline. Your
          data never leaves your browser.
        </p>
        <InstallPwa variant="inverted-fill" size="default" label="Install BioBot" />
        <p className="text-xs text-primary-foreground/50">
          Works on Chrome, Edge, Safari, and most mobile browsers.
        </p>
      </div>
    </section>
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
    <SectionWrapper className="bg-muted text-foreground" id="behind-the-scenes">
      <SectionHeading>Behind the scenes</SectionHeading>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Built with */}
        <Card>
          <CardHeader>
            <CardTitle as="h3">Built with</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-xs text-muted-foreground">
              Code written in <strong>Cursor</strong> with <strong>Claude Opus</strong>. In-app AI
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
              <LockIcon className="inline size-4" aria-hidden="true" /> Cookies &amp; data privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>
              No cookies. No server. Gemini calls go directly from your browser to Google using your
              own API key.
            </p>
            <p>
              The only <code className="rounded bg-muted px-1">localStorage</code> usage is the
              light/dark theme preference. CV data lives in browser memory — nothing persists unless
              you export.
            </p>
            <p>
              Your API key is never stored server-side. It only appears in the exported JSON if you
              choose to include it.
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
                  className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
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
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
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
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                GitHub Issues
                <span className="sr-only"> (opens in new tab)</span>
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
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
      aria-label="Build your CV"
      className={
        'fixed bottom-6 right-6 z-50 inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none' +
        (visible ? ' scale-100 opacity-100' : ' pointer-events-none scale-75 opacity-0')
      }
    >
      <ArrowRightIcon className="size-6" />
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
          <InstallPwa />
          <ThemeToggle />
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

function LandingFooter({ ref }: { ref: React.RefObject<HTMLElement | null> }) {
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

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-primary-foreground/70">
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-foreground"
          >
            GitHub
          </a>
          <span aria-hidden="true">·</span>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-foreground"
          >
            LinkedIn
          </a>
        </div>

        <p className="text-xs text-primary-foreground/50">
          Made by Debmallya Bhattacharya &middot; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------

export default function LandingPage() {
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const ctaScrolledPast = useIsScrolledPast(ctaRef);
  const heroScrolledPast = useIsScrolledPast(heroRef);
  const footerInView = useIsInView(footerRef);

  return (
    <div className="h-dvh overflow-y-auto bg-background text-foreground">
      <LandingNav shadow={heroScrolledPast} />
      <main>
        <HeroSection ctaRef={ctaRef} sectionRef={heroRef} />
        <AtsExplainerSection />
        <AtsSectionsGrid />
        <FeaturesSection />
        <InstallBanner />
        <BehindTheScenesSection />
      </main>
      <LandingFooter ref={footerRef} />
      <FloatingCta visible={ctaScrolledPast && !footerInView} />
    </div>
  );
}
