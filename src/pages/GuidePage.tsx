import {
  ArrowRightIcon,
  BookOpenIcon,
  ChevronDownIcon,
  DownloadIcon,
  EyeIcon,
  FileJsonIcon,
  FileTextIcon,
  InfoIcon,
  KeyRoundIcon,
  PenLineIcon,
  PlayIcon,
  SaveIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UploadIcon,
  WandSparklesIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

import { AppLogo } from '@/components/AppLogo';
import { ScrollToTopFab } from '@/components/ScrollToTopFab';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GuideCallout } from '@/guide/GuideCallout';
import { GuidePathPicker } from '@/guide/GuidePathPicker';
import { GuidePhase } from '@/guide/GuidePhase';
import { GuideSection } from '@/guide/GuideSection';
import { GuideToc, type TocGroup } from '@/guide/GuideToc';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useIsInView } from '@/lib/useIsInView';
import { useIsScrolledPast } from '@/lib/useIsScrolledPast';
import { useMediaQuery } from '@/lib/useMediaQuery';

// ---------------------------------------------------------------------------
// Navigation data
// ---------------------------------------------------------------------------

const TOC_GROUPS: TocGroup[] = [
  {
    label: 'Getting started',
    items: [
      { id: 'start-fresh', title: 'Start from sample data' },
      { id: 'import-cv', title: 'Import a CV file' },
      { id: 'import-json', title: 'Restore JSON backup' },
      { id: 'api-key', title: 'Gemini API key' },
    ],
  },
  {
    label: 'Editor',
    items: [{ id: 'editing', title: 'Edit your CV' }],
  },
  {
    label: 'AI and job description',
    items: [
      { id: 'ai-tailoring', title: 'Tailor with AI' },
      { id: 'cover-letter', title: 'Cover letter' },
    ],
  },
  {
    label: 'Preview and export',
    items: [
      { id: 'preview', title: 'Live preview' },
      { id: 'save-export', title: 'Save and export' },
      { id: 'docx-to-pdf', title: 'DOCX to PDF' },
    ],
  },
];

const ALL_IDS = TOC_GROUPS.flatMap((g) => g.items.map((i) => i.id));

const PHASE_IDS = ['phase-getting-started', 'phase-editor', 'phase-ai', 'phase-export'] as const;
type PhaseId = (typeof PHASE_IDS)[number];

const SECTION_TO_PHASE: Record<string, PhaseId> = {};
const PHASE_FOR_GROUP: PhaseId[] = [];
for (let i = 0; i < TOC_GROUPS.length; i++) {
  const phaseId = PHASE_IDS[i];
  PHASE_FOR_GROUP.push(phaseId);
  for (const item of TOC_GROUPS[i].items) {
    SECTION_TO_PHASE[item.id] = phaseId;
  }
}

const PATH_CARDS = [
  {
    icon: PlayIcon,
    label: 'Start from sample CV',
    description: 'Explore the editor with sample data, then replace with your own.',
    targetId: 'start-fresh',
  },
  {
    icon: UploadIcon,
    label: 'Import a CV file',
    description: 'Upload a PDF, DOCX, or image and let Gemini parse it.',
    targetId: 'import-cv',
  },
  {
    icon: FileJsonIcon,
    label: 'Restore a backup',
    description: 'Load a previously exported JSON file to pick up where you left off.',
    targetId: 'import-json',
  },
  {
    icon: DownloadIcon,
    label: 'Preview and export',
    description: 'Live preview, DOCX download, and PDF tips.',
    targetId: 'preview',
  },
];

// ---------------------------------------------------------------------------
// Scroll spy
// ---------------------------------------------------------------------------

function useActiveSection(scrollContainer: React.RefObject<HTMLElement | null>) {
  const [activeId, setActiveId] = useState<string | null>(ALL_IDS[0]);

  useEffect(() => {
    const root = scrollContainer.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { root, rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );

    for (const id of ALL_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [scrollContainer]);

  return activeId;
}

// ---------------------------------------------------------------------------
// Nav
// ---------------------------------------------------------------------------

function GuideNav({ shadow }: { shadow: boolean }) {
  return (
    <header
      className={
        'fixed inset-x-0 top-0 z-50 bg-primary px-4 py-3 text-primary-foreground transition-shadow duration-200 lg:px-6 xl:px-8' +
        (shadow ? ' shadow-md' : '')
      }
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <AppLogo />
        <nav aria-label="Guide navigation" className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/"
            className="hidden items-center gap-1 rounded-lg border border-primary-foreground/30 px-2.5 py-1 text-[0.8rem] font-medium text-primary-foreground hover:bg-primary-foreground/15 sm:inline-flex"
          >
            <InfoIcon className="size-3.5" />
            Why BioBot?
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center gap-1 rounded-lg bg-primary-foreground px-2.5 py-1 text-[0.8rem] font-semibold text-primary hover:bg-primary-foreground/90"
          >
            Build your CV
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Mobile TOC drawer
// ---------------------------------------------------------------------------

function MobileTocDrawer({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeTitle =
    TOC_GROUPS.flatMap((g) => g.items).find((s) => s.id === activeId)?.title ?? 'Guide';

  const handleSelect = (id: string) => {
    setOpen(false);
    onSelect(id);
  };

  return (
    <div className="sticky top-[52px] z-40 border-b bg-background/95 backdrop-blur lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          <BookOpenIcon className="size-4 text-primary-text" />
          {activeTitle}
        </span>
        <ChevronDownIcon
          className={
            'size-4 text-muted-foreground transition-transform' + (open ? ' rotate-180' : '')
          }
        />
      </button>
      {open && (
        <div className="border-t px-4 pb-3 pt-1">
          <GuideToc groups={TOC_GROUPS} activeId={activeId} onSelect={handleSelect} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared hint
// ---------------------------------------------------------------------------

function ImportHint({ section }: { section: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      In the editor, expand <strong>Import CV</strong> (optional), then open{' '}
      <strong>{section}</strong>.
    </p>
  );
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------

export default function GuidePage() {
  useDocumentTitle('Guide');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const heroScrolledPast = useIsScrolledPast(heroRef);
  const ctaInView = useIsInView(ctaRef, { root: scrollContainerRef });
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const activeId = useActiveSection(scrollContainerRef);

  const [phases, setPhases] = useState<Record<PhaseId, boolean>>({
    'phase-getting-started': true,
    'phase-editor': false,
    'phase-ai': false,
    'phase-export': false,
  });

  const setPhaseOpen = useCallback((phaseId: PhaseId, open: boolean) => {
    setPhases((prev) => ({ ...prev, [phaseId]: open }));
  }, []);

  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToSection = useCallback(
    (id: string) => {
      const phaseId = SECTION_TO_PHASE[id];
      if (phaseId && !phases[phaseId]) {
        setPhases((prev) => ({ ...prev, [phaseId]: true }));
        requestAnimationFrame(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        });
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [phases],
  );

  return (
    <div ref={scrollContainerRef} className="h-dvh overflow-y-auto bg-background text-foreground">
      <GuideNav shadow={heroScrolledPast} />

      {/* Hero */}
      <section
        ref={heroRef}
        className="bg-primary px-4 pt-24 pb-10 text-primary-foreground sm:pb-12"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <BookOpenIcon className="mb-4 size-10 drop-shadow-lg sm:size-12" aria-hidden="true" />
          <h1 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            How BioBot works
          </h1>
          <p className="mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
            Build an ATS-friendly CV your way — start from sample data, import an existing CV, or
            restore a backup. No account required; everything stays in your browser.
          </p>
        </div>
      </section>

      {/* Path picker */}
      <section className="border-b px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Pick your starting point
          </p>
          <GuidePathPicker paths={PATH_CARDS} onSelect={scrollToSection} />
        </div>
      </section>

      {/* Mobile TOC */}
      {!isDesktop && <MobileTocDrawer activeId={activeId} onSelect={scrollToSection} />}

      {/* Content area */}
      <div className="mx-auto flex max-w-5xl">
        {/* Desktop sidebar TOC */}
        {isDesktop && (
          <aside className="sticky top-[52px] hidden h-[calc(100dvh-52px)] w-56 shrink-0 overflow-y-auto border-r py-6 pl-4 pr-2 lg:block">
            <GuideToc groups={TOC_GROUPS} activeId={activeId} onSelect={scrollToSection} />
          </aside>
        )}

        {/* Phases */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* ── Phase 1: Getting started ── */}
          <GuidePhase
            id="phase-getting-started"
            title="Getting started"
            open={phases['phase-getting-started']}
            onOpenChange={(o) => setPhaseOpen('phase-getting-started', o)}
          >
            <GuideSection
              id="start-fresh"
              icon={PlayIcon}
              title="Start from sample data"
              tag={{ label: 'Default path' }}
            >
              <p className="text-sm text-muted-foreground">
                The editor opens with sample data so you can see what a finished CV looks like.
                Dismiss the sample-data banner, clear or overwrite the fields with your own content,
                and the live preview updates as you type. No API key or import needed.
              </p>
            </GuideSection>

            <GuideSection
              id="import-cv"
              icon={UploadIcon}
              title="Import a CV file"
              tag={{ label: 'Needs Gemini', variant: 'gemini' }}
            >
              <p className="text-sm text-muted-foreground">
                Upload a PDF, Word document, or screenshot of your existing CV and Gemini parses it
                into structured form fields.
              </p>
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>
                  Set up your Gemini API key (see{' '}
                  <a
                    href="#api-key"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('api-key');
                    }}
                    className="font-medium text-primary-text underline underline-offset-2 hover:text-primary-text/80"
                  >
                    below
                  </a>
                  ).
                </li>
                <li>
                  Expand <strong>Import CV</strong> (optional) &rarr; <strong>Import data</strong>{' '}
                  and drag your file into the drop zone, or paste your CV text directly.
                </li>
                <li>
                  Click <strong>Parse with Gemini</strong>. The AI populates every form field.
                </li>
                <li>Review and correct anything the AI got wrong.</li>
              </ol>
              <GuideCallout icon={InfoIcon}>
                Supported files: PDF, DOCX, DOC, plain text, PNG, JPG, WebP. Text-based PDFs work
                best.
              </GuideCallout>
            </GuideSection>

            <GuideSection
              id="import-json"
              icon={FileJsonIcon}
              title="Restore a JSON backup"
              tag={{ label: 'Pick one path' }}
            >
              <p className="text-sm text-muted-foreground">
                Previously exported your CV data? Load the JSON file to resume editing.
              </p>
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>
                  Expand <strong>Import CV</strong> (optional) &rarr; <strong>Import data</strong>.
                </li>
                <li>
                  Click <strong>Load JSON backup</strong> and select your{' '}
                  <code className="rounded bg-muted px-1 text-xs">.json</code> file.
                </li>
                <li>
                  All fields restore instantly, including your API key if it was in the export.
                </li>
              </ol>
              <GuideCallout icon={InfoIcon}>
                Store JSON backups in Google Drive, iCloud, or similar. BioBot keeps data only in
                your browser&rsquo;s local storage.
              </GuideCallout>
            </GuideSection>

            <GuideSection
              id="api-key"
              icon={KeyRoundIcon}
              title="Gemini API key"
              tag={{ label: 'Only for AI features', variant: 'gemini' }}
            >
              <p className="text-sm text-muted-foreground">
                You only need this if you use CV import, AI tailoring, or AI cover-letter
                generation. Gemini&rsquo;s free tier requires no billing &mdash; just a Google
                account.
              </p>
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>
                  Go to{' '}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary-text underline underline-offset-2 hover:text-primary-text/80"
                  >
                    Google AI Studio
                  </a>{' '}
                  and sign in.
                </li>
                <li>
                  Click <strong>Create API key</strong> and copy the key (starts with{' '}
                  <code className="rounded bg-muted px-1 text-xs">AIza...</code>).
                </li>
                <li>
                  In BioBot, expand <strong>Import CV</strong> (optional) &rarr;{' '}
                  <strong>Gemini API</strong> and paste it.
                </li>
              </ol>
              <GuideCallout icon={ShieldCheckIcon} variant="privacy">
                Your key stays in local storage and never leaves your device. Gemini calls go
                directly from your browser to Google.
              </GuideCallout>
            </GuideSection>
          </GuidePhase>

          {/* ── Phase 2: Editor ── */}
          <GuidePhase
            id="phase-editor"
            title="Editor"
            open={phases['phase-editor']}
            onOpenChange={(o) => setPhaseOpen('phase-editor', o)}
          >
            <GuideSection id="editing" icon={PenLineIcon} title="Edit your CV">
              <p className="text-sm text-muted-foreground">
                The <strong>Your CV</strong> card contains every section in your final document. You
                can edit on top of the sample data or after an import &mdash; either way, expand a
                section and start typing.
              </p>

              <details className="group rounded-xl border">
                <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium select-none">
                  <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
                  All sections explained
                </summary>
                <ul className="space-y-2 px-4 pb-4 text-sm text-muted-foreground">
                  <li>
                    <strong>Personal Information</strong> &mdash; name, email, phone, location, and
                    links (LinkedIn, GitHub, portfolio).
                  </li>
                  <li>
                    <strong>Professional Summary</strong> &mdash; a short paragraph of key
                    strengths. Supports Markdown.
                  </li>
                  <li>
                    <strong>Skills</strong> &mdash; one category per line, e.g. &ldquo;Frontend:
                    React, TypeScript&rdquo;. ATS scanners match keywords here.
                  </li>
                  <li>
                    <strong>Experience</strong> &mdash; role, company, dates, location, bullet-point
                    highlights, and technology tags.
                  </li>
                  <li>
                    <strong>Education</strong> &mdash; degree, institution, dates, and optional
                    highlights.
                  </li>
                  <li>
                    <strong>Others</strong> (optional) &mdash; certifications, volunteering,
                    publications, or anything else.
                  </li>
                </ul>
              </details>

              <GuideCallout icon={InfoIcon}>
                Markdown fields show a hint below the input. Use{' '}
                <code className="rounded bg-muted px-1 text-xs">**bold**</code> and{' '}
                <code className="rounded bg-muted px-1 text-xs">*italic*</code> &mdash; the preview
                and DOCX export render them.
              </GuideCallout>
            </GuideSection>
          </GuidePhase>

          {/* ── Phase 3: AI and job description ── */}
          <GuidePhase
            id="phase-ai"
            title="AI and job description"
            open={phases['phase-ai']}
            onOpenChange={(o) => setPhaseOpen('phase-ai', o)}
          >
            <p className="text-sm text-muted-foreground">
              Both features below require a{' '}
              <a
                href="#api-key"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('api-key');
                }}
                className="font-medium text-primary-text underline underline-offset-2 hover:text-primary-text/80"
              >
                Gemini API key
              </a>{' '}
              and are entirely optional.
            </p>

            <GuideSection
              id="ai-tailoring"
              icon={WandSparklesIcon}
              title="Tailor with AI"
              tag={{ label: 'Needs Gemini', variant: 'gemini' }}
            >
              <p className="text-sm text-muted-foreground">
                Paste a job description and let Gemini rewrite your CV content with matching
                keywords, improving ATS match scores.
              </p>
              <ImportHint section="Job description" />
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>Paste the job posting or drag it as a PDF/screenshot.</li>
                <li>
                  In any <strong>Experience</strong> entry, click <strong>Enhance with AI</strong>.
                  Gemini rewrites highlights to match the job description.
                </li>
                <li>
                  Do the same for <strong>Professional Summary</strong> &mdash; expand
                  &ldquo;Enhance with AI&rdquo; and click <strong>Generate with AI</strong>.
                </li>
                <li>
                  Review each suggestion: click <strong>Use this</strong> to accept, or dismiss and
                  tweak manually.
                </li>
              </ol>
              <GuideCallout icon={SparklesIcon}>
                Each suggestion includes a short reasoning. The AI never invents facts &mdash; it
                rewrites your existing content with better keywords.
              </GuideCallout>
            </GuideSection>

            <GuideSection
              id="cover-letter"
              icon={FileTextIcon}
              title="Cover letter"
              tag={{ label: 'Optional', variant: 'optional' }}
            >
              <p className="text-sm text-muted-foreground">
                Generate a tailored cover letter from your CV data and the job description. It
                appears as a second page in the DOCX export.
              </p>
              <ImportHint section="Cover letter" />
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>Enable the cover letter toggle. Write manually or use AI.</li>
                <li>
                  To generate with AI, expand &ldquo;Enhance with AI&rdquo; and click{' '}
                  <strong>Generate with AI</strong>.
                </li>
                <li>
                  Review, edit if needed, and click <strong>Use this cover letter</strong>.
                </li>
              </ol>
              <GuideCallout icon={InfoIcon}>
                The cover letter is optional. If disabled, the DOCX export only contains your CV.
                Markdown formatting is supported.
              </GuideCallout>
            </GuideSection>
          </GuidePhase>

          {/* ── Phase 4: Preview and export ── */}
          <GuidePhase
            id="phase-export"
            title="Preview and export"
            open={phases['phase-export']}
            onOpenChange={(o) => setPhaseOpen('phase-export', o)}
          >
            <GuideSection id="preview" icon={EyeIcon} title="Live preview">
              <p className="text-sm text-muted-foreground">
                The preview shows exactly how your CV will look in the exported DOCX, updated in
                real time as you type.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong>Desktop</strong> &mdash; the preview sits in a panel to the right of the
                  editor, visible side by side.
                </li>
                <li>
                  <strong>Mobile</strong> &mdash; the preview appears below the form. Use the
                  floating <strong>Preview</strong> / <strong>Edit</strong> button to jump between
                  them.
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">
                On first visit the preview shows sample data with a dismissible banner. Replace the
                sample content in the editor and the preview updates instantly.
              </p>
            </GuideSection>

            <GuideSection id="save-export" icon={DownloadIcon} title="Save and export">
              <p className="text-sm text-muted-foreground">Three ways to save your work:</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-card p-4 text-card-foreground ring-1 ring-foreground/5">
                  <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
                    <SaveIcon className="size-4 text-primary-text" /> Save to browser
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Stores data in localStorage so it persists between sessions. Hit{' '}
                    <strong>Save</strong> frequently.
                  </p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-card-foreground ring-1 ring-foreground/5">
                  <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
                    <FileJsonIcon className="size-4 text-primary-text" /> JSON backup
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Downloads a <code className="rounded bg-muted px-1">.json</code> file with your
                    full CV data. Reload anytime to resume editing.
                  </p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-card-foreground ring-1 ring-foreground/5 sm:col-span-2">
                  <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
                    <FileTextIcon className="size-4 text-primary-text" /> Word document (.docx)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    A polished, ATS-safe DOCX ready to send. Single-column layout, structured
                    headings, clean formatting.
                  </p>
                </div>
              </div>
              <GuideCallout icon={ShieldCheckIcon} variant="privacy">
                When exporting JSON, you&rsquo;ll be asked whether to include your API key. Choose
                &ldquo;Export without key&rdquo; if you plan to share the file.
              </GuideCallout>
            </GuideSection>

            <GuideSection id="docx-to-pdf" icon={FileTextIcon} title="DOCX to PDF">
              <p className="text-sm text-muted-foreground">
                Most job applications accept PDF. Open the exported DOCX in a word processor and
                save as PDF for pixel-perfect results.
              </p>
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>Download the DOCX from BioBot.</li>
                <li>
                  Open in <strong>Microsoft Word</strong> or <strong>Google Docs</strong>.
                </li>
                <li>
                  File &rarr; Save as / Download as &rarr; <strong>PDF</strong>.
                </li>
              </ol>
              <GuideCallout icon={InfoIcon}>
                Google Docs is free and produces excellent PDF output. Upload the DOCX to Google
                Drive, open with Docs, then File &rarr; Download &rarr; PDF.
              </GuideCallout>
            </GuideSection>
          </GuidePhase>

          {/* Bottom CTA */}
          <section
            ref={ctaRef}
            className="mt-auto bg-primary px-4 py-14 text-primary-foreground sm:py-16"
          >
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to build?</h2>
              <p className="max-w-lg text-sm text-primary-foreground/80 sm:text-base">
                Your CV data never leaves your browser. Start building now &mdash; it takes under a
                minute with AI import, or jump straight in with the sample data.
              </p>
              <Link
                to="/app"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-foreground px-6 text-base font-semibold text-primary shadow transition-transform hover:scale-105 hover:bg-primary-foreground/90 active:scale-100"
              >
                Build your CV
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </section>
        </main>
      </div>

      <FloatingCta visible={heroScrolledPast && !ctaInView} />
      <ScrollToTopFab
        visible={heroScrolledPast}
        onClick={scrollToTop}
        className="bottom-6 right-6"
      />
    </div>
  );
}

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
