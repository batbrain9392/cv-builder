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
  MonitorSmartphoneIcon,
  PenLineIcon,
  SaveIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UploadIcon,
  WandSparklesIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';

import { AppLogo } from '@/components/AppLogo';
import { InstallPwa } from '@/components/InstallPwa';
import { ScrollToTopFab } from '@/components/ScrollToTopFab';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GuideCallout } from '@/guide/GuideCallout';
import { GuideSection } from '@/guide/GuideSection';
import { GuideToc } from '@/guide/GuideToc';
import { useIsScrolledPast } from '@/lib/useIsScrolledPast';
import { useMediaQuery } from '@/lib/useMediaQuery';

const GUIDE_SECTIONS = [
  { id: 'api-key', title: 'Get a Gemini API key' },
  { id: 'import-cv', title: 'Import your existing CV' },
  { id: 'import-json', title: 'Restore from a JSON backup' },
  { id: 'editing', title: 'Edit your CV' },
  { id: 'ai-tailoring', title: 'Tailor with AI' },
  { id: 'cover-letter', title: 'Generate a cover letter' },
  { id: 'preview', title: 'Live preview' },
  { id: 'save-export', title: 'Save and export' },
  { id: 'docx-to-pdf', title: 'DOCX to PDF' },
  { id: 'install-pwa', title: 'Install as an app' },
] as const;

function useActiveSection(scrollContainer: React.RefObject<HTMLElement | null>) {
  const [activeId, setActiveId] = useState<string | null>(GUIDE_SECTIONS[0].id);

  useEffect(() => {
    const root = scrollContainer.current;
    if (!root) return;

    const ids = GUIDE_SECTIONS.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { root, rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );

    for (const id of ids) {
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
          <InstallPwa />
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
  const activeTitle = GUIDE_SECTIONS.find((s) => s.id === activeId)?.title ?? 'Guide';

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
          <GuideToc sections={GUIDE_SECTIONS} activeId={activeId} onSelect={handleSelect} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------

export default function GuidePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroScrolledPast = useIsScrolledPast(heroRef);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const activeId = useActiveSection(scrollContainerRef);

  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const sectionProps = useMemo(
    () =>
      GUIDE_SECTIONS.map((s, i) => ({
        ...s,
        step: i + 1,
        alt: i % 2 !== 0,
      })),
    [],
  );

  return (
    <div ref={scrollContainerRef} className="h-dvh overflow-y-auto bg-background text-foreground">
      <GuideNav shadow={heroScrolledPast} />

      {/* Hero */}
      <section
        ref={heroRef}
        className="bg-primary px-4 pt-24 pb-12 text-primary-foreground sm:pb-16"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <BookOpenIcon className="mb-4 size-12 drop-shadow-lg sm:size-14" aria-hidden="true" />
          <h1 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            How to use BioBot
          </h1>
          <p className="mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
            A step-by-step walkthrough of every feature — from importing your CV to exporting a
            polished, ATS-friendly document.
          </p>
        </div>
      </section>

      {/* Mobile TOC */}
      {!isDesktop && <MobileTocDrawer activeId={activeId} onSelect={scrollToSection} />}

      {/* Content area */}
      <div className="mx-auto flex max-w-5xl">
        {/* Desktop sidebar TOC */}
        {isDesktop && (
          <aside className="sticky top-[52px] hidden h-[calc(100dvh-52px)] w-56 shrink-0 overflow-y-auto border-r py-8 pl-4 pr-2 lg:block">
            <p className="mb-3 px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Guide
            </p>
            <GuideToc sections={GUIDE_SECTIONS} activeId={activeId} onSelect={scrollToSection} />
          </aside>
        )}

        {/* Sections */}
        <main className="min-w-0 flex-1">
          {/* 1. API key */}
          <GuideSection
            id={sectionProps[0].id}
            step={sectionProps[0].step}
            icon={KeyRoundIcon}
            title={sectionProps[0].title}
            alt={sectionProps[0].alt}
          >
            <p className="text-sm text-muted-foreground">
              BioBot uses Google Gemini to parse your existing CV and to enhance your content with
              AI. Gemini has a generous free tier — no billing required, just a Google account.
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
                and sign in with your Google account.
              </li>
              <li>
                Click <strong>Create API key</strong> and copy the key that starts with{' '}
                <code className="rounded bg-muted px-1 text-xs">AIza...</code>.
              </li>
              <li>
                In BioBot, open the <strong>Import existing CV</strong> panel and expand{' '}
                <strong>Gemini API</strong>. Paste your key there.
              </li>
            </ol>
            <GuideCallout icon={ShieldCheckIcon} variant="privacy">
              Your API key is saved in this browser&rsquo;s local storage. It never leaves your
              device — Gemini calls go directly from your browser to Google.
            </GuideCallout>
          </GuideSection>

          {/* 2. Import CV */}
          <GuideSection
            id={sectionProps[1].id}
            step={sectionProps[1].step}
            icon={UploadIcon}
            title={sectionProps[1].title}
            alt={sectionProps[1].alt}
          >
            <p className="text-sm text-muted-foreground">
              Already have a CV? Upload it and Gemini will parse the content into structured form
              fields — no manual data entry.
            </p>
            <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
              <li>Make sure you&rsquo;ve entered your Gemini API key (step 1 above).</li>
              <li>
                Open the <strong>Import existing CV</strong> panel and expand{' '}
                <strong>Import data</strong>.
              </li>
              <li>
                Drag and drop a <strong>PDF</strong>, <strong>Word document</strong>, or even a{' '}
                <strong>screenshot</strong> of your CV into the drop zone. Or paste your CV text
                directly.
              </li>
              <li>
                Click <strong>Parse with Gemini</strong>. The AI reads your file and populates every
                form field.
              </li>
              <li>Review the parsed data and fix anything the AI got wrong.</li>
            </ol>
            <GuideCallout icon={InfoIcon}>
              Supported file types: PDF, DOCX, DOC, plain text, and common image formats (PNG, JPG,
              WebP). For best results, use a text-based PDF rather than a scanned image.
            </GuideCallout>
          </GuideSection>

          {/* 3. JSON backup */}
          <GuideSection
            id={sectionProps[2].id}
            step={sectionProps[2].step}
            icon={FileJsonIcon}
            title={sectionProps[2].title}
            alt={sectionProps[2].alt}
          >
            <p className="text-sm text-muted-foreground">
              If you previously exported your CV data as a JSON file, you can reload it to pick up
              where you left off.
            </p>
            <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
              <li>
                In the <strong>Import existing CV</strong> panel, expand{' '}
                <strong>Import data</strong>.
              </li>
              <li>
                Click <strong>Load JSON backup</strong> and select your{' '}
                <code className="rounded bg-muted px-1 text-xs">.json</code> file.
              </li>
              <li>
                All fields are restored instantly — including your API key if it was included in the
                export.
              </li>
            </ol>
            <GuideCallout icon={InfoIcon}>
              Keep a JSON backup stored in Google Drive, iCloud, or similar. BioBot does not save
              data to the cloud — your browser&rsquo;s local storage is the only copy.
            </GuideCallout>
          </GuideSection>

          {/* 4. Editing */}
          <GuideSection
            id={sectionProps[3].id}
            step={sectionProps[3].step}
            icon={PenLineIcon}
            title={sectionProps[3].title}
            alt={sectionProps[3].alt}
          >
            <p className="text-sm text-muted-foreground">
              The <strong>Your CV</strong> panel contains all the sections that appear in your final
              document. Expand any section to edit it.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Personal Information</strong> — name, email, phone, location, and links
                (LinkedIn, GitHub, portfolio, etc.).
              </li>
              <li>
                <strong>Professional Summary</strong> — a concise paragraph highlighting your key
                strengths. Supports Markdown for bold, italic, and lists.
              </li>
              <li>
                <strong>Skills</strong> — one category per line, e.g. &ldquo;Frontend: React,
                TypeScript, Next.js&rdquo;. ATS systems scan for keyword matches, so list tools and
                technologies explicitly.
              </li>
              <li>
                <strong>Experience</strong> — role, company, dates, location, and bullet-point
                highlights. Add tags for technologies used in each role.
              </li>
              <li>
                <strong>Education</strong> — degree, institution, dates, and optional highlights.
              </li>
              <li>
                <strong>Others</strong> (optional) — certifications, volunteering, publications, or
                anything else relevant.
              </li>
            </ul>
            <GuideCallout icon={InfoIcon}>
              Text fields that support Markdown show a hint below the input. Use{' '}
              <code className="rounded bg-muted px-1 text-xs">**bold**</code> and{' '}
              <code className="rounded bg-muted px-1 text-xs">*italic*</code> for emphasis — the
              preview and DOCX export both render them.
            </GuideCallout>
          </GuideSection>

          {/* 5. AI tailoring */}
          <GuideSection
            id={sectionProps[4].id}
            step={sectionProps[4].step}
            icon={WandSparklesIcon}
            title={sectionProps[4].title}
            alt={sectionProps[4].alt}
          >
            <p className="text-sm text-muted-foreground">
              The most powerful feature: paste a job description and let Gemini rewrite your CV
              content with matching keywords. This dramatically improves ATS match scores.
            </p>
            <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
              <li>
                Open the <strong>Import existing CV</strong> panel and expand{' '}
                <strong>Job description</strong>.
              </li>
              <li>
                Paste the job posting text, or drag and drop the posting as a PDF or screenshot.
              </li>
              <li>
                Go to any <strong>Experience</strong> entry and click the{' '}
                <strong>Enhance with AI</strong> badge. Gemini rewrites the highlights to match the
                job description&rsquo;s keywords and tone.
              </li>
              <li>
                Do the same for <strong>Professional Summary</strong> — expand the &ldquo;Enhance
                with AI&rdquo; section and click <strong>Generate with AI</strong>.
              </li>
              <li>
                Review each suggestion. Click <strong>Use this</strong> to accept, or dismiss and
                tweak manually.
              </li>
            </ol>
            <GuideCallout icon={SparklesIcon}>
              Each AI suggestion includes a short reasoning explaining what changed and why. The AI
              never invents facts — it rewrites your existing content with better keywords.
            </GuideCallout>
          </GuideSection>

          {/* 6. Cover letter */}
          <GuideSection
            id={sectionProps[5].id}
            step={sectionProps[5].step}
            icon={FileTextIcon}
            title={sectionProps[5].title}
            alt={sectionProps[5].alt}
          >
            <p className="text-sm text-muted-foreground">
              BioBot can generate a tailored cover letter based on your CV data and the job
              description. It&rsquo;s included as a second page in the DOCX export.
            </p>
            <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
              <li>
                Open the <strong>Import existing CV</strong> panel and expand{' '}
                <strong>Cover letter</strong>.
              </li>
              <li>Enable the cover letter toggle. You can write one manually or use AI.</li>
              <li>
                To generate with AI, expand the &ldquo;Enhance with AI&rdquo; section and click{' '}
                <strong>Generate with AI</strong>. The AI uses your CV data and the job description.
              </li>
              <li>
                Review, edit if needed, and click <strong>Use this cover letter</strong>.
              </li>
            </ol>
            <GuideCallout icon={InfoIcon}>
              The cover letter is optional. If disabled, the DOCX export only contains your CV. The
              cover letter supports Markdown formatting.
            </GuideCallout>
          </GuideSection>

          {/* 7. Preview */}
          <GuideSection
            id={sectionProps[6].id}
            step={sectionProps[6].step}
            icon={EyeIcon}
            title={sectionProps[6].title}
            alt={sectionProps[6].alt}
          >
            <p className="text-sm text-muted-foreground">
              The preview shows exactly how your CV will look in the exported DOCX — updated in real
              time as you type.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Desktop</strong> — the preview sits in a panel to the right of the editor.
                Both are visible side by side.
              </li>
              <li>
                <strong>Mobile</strong> — the preview appears below the form. Use the floating{' '}
                <strong>Preview</strong> / <strong>Edit</strong> button to jump between them.
              </li>
            </ul>
          </GuideSection>

          {/* 8. Save and export */}
          <GuideSection
            id={sectionProps[7].id}
            step={sectionProps[7].step}
            icon={DownloadIcon}
            title={sectionProps[7].title}
            alt={sectionProps[7].alt}
          >
            <p className="text-sm text-muted-foreground">
              BioBot gives you three ways to save your work:
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-card p-4 text-card-foreground ring-1 ring-foreground/5">
                <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <SaveIcon className="size-4 text-primary-text" /> Save to browser
                </p>
                <p className="text-xs text-muted-foreground">
                  Stores your data in localStorage so it persists between sessions. Hit{' '}
                  <strong>Save</strong> frequently.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-card-foreground ring-1 ring-foreground/5">
                <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <FileJsonIcon className="size-4 text-primary-text" /> JSON backup
                </p>
                <p className="text-xs text-muted-foreground">
                  Downloads a <code className="rounded bg-muted px-1">.json</code> file containing
                  your full CV data. Reload it anytime to resume editing.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-card-foreground ring-1 ring-foreground/5 sm:col-span-2">
                <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <FileTextIcon className="size-4 text-primary-text" /> Word document (.docx)
                </p>
                <p className="text-xs text-muted-foreground">
                  A polished, ATS-safe DOCX ready to send to recruiters. Single-column layout,
                  structured headings, clean formatting.
                </p>
              </div>
            </div>
            <GuideCallout icon={ShieldCheckIcon} variant="privacy">
              When exporting JSON, you&rsquo;ll be asked whether to include your API key. Choose
              &ldquo;Export without key&rdquo; if you plan to share the file.
            </GuideCallout>
          </GuideSection>

          {/* 9. DOCX to PDF */}
          <GuideSection
            id={sectionProps[8].id}
            step={sectionProps[8].step}
            icon={FileTextIcon}
            title={sectionProps[8].title}
            alt={sectionProps[8].alt}
          >
            <p className="text-sm text-muted-foreground">
              Most job applications accept PDF. The best way to get a pixel-perfect PDF is to open
              the exported DOCX in a word processor and save as PDF.
            </p>
            <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
              <li>Download the DOCX from BioBot (see step {sectionProps[7].step} above).</li>
              <li>
                Open it in <strong>Microsoft Word</strong> or <strong>Google Docs</strong>.
              </li>
              <li>
                File → Save as / Download as → <strong>PDF</strong>.
              </li>
            </ol>
            <GuideCallout icon={InfoIcon}>
              Google Docs is free and produces excellent PDF output. Upload the DOCX to Google
              Drive, open with Google Docs, then File → Download → PDF.
            </GuideCallout>
          </GuideSection>

          {/* 10. PWA install */}
          <GuideSection
            id={sectionProps[9].id}
            step={sectionProps[9].step}
            icon={MonitorSmartphoneIcon}
            title={sectionProps[9].title}
            alt={sectionProps[9].alt}
          >
            <p className="text-sm text-muted-foreground">
              BioBot is a Progressive Web App — you can install it on your device and use it like a
              native app, even offline.
            </p>
            <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
              <li>
                Look for the <strong>Install</strong> button in the top navigation bar or the
                hamburger menu.
              </li>
              <li>
                Tap it and follow your browser&rsquo;s install prompt. On iOS Safari, use the Share
                menu → Add to Home Screen.
              </li>
              <li>
                The installed app works offline and opens without browser chrome — a clean, focused
                experience.
              </li>
            </ol>
            <GuideCallout icon={InfoIcon}>
              Works on Chrome, Edge, Safari, and most mobile browsers. Your data stays in the
              browser that installed the app.
            </GuideCallout>
          </GuideSection>

          {/* Bottom CTA */}
          <section className="bg-primary px-4 py-14 text-primary-foreground sm:py-16">
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to build?</h2>
              <p className="max-w-lg text-sm text-primary-foreground/80 sm:text-base">
                Your CV data never leaves your browser. Start building now — it takes under a minute
                with AI import.
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

      <ScrollToTopFab
        visible={heroScrolledPast}
        onClick={scrollToTop}
        className="bottom-6 right-6"
      />
    </div>
  );
}
