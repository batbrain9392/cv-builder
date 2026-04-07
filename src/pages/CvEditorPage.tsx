import { DownloadIcon, EyeIcon, PenLineIcon } from 'lucide-react';
import { useRef } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useIsInView } from '@/lib/useIsInView';

import type { CvFormData } from '../cv/cvFormSchema.ts';

import { FormActions } from '../cv/form/FormActions.tsx';
import { CvPreviewPanel } from '../cv/preview/CvPreviewPanel.tsx';
import { CvEditorDialogs } from './CvEditorDialogs.tsx';
import { CvFormPanel } from './CvFormPanel.tsx';
import { useCvEditorForm } from './useCvEditorForm.ts';

export function CvEditorPage({ defaultValues }: { defaultValues: CvFormData }) {
  useDocumentTitle('Editor');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const form = useCvEditorForm(defaultValues);

  const isPreviewInView = useIsInView(form.mobilePreviewRef, {
    root: scrollContainerRef,
    threshold: 0.3,
  });

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const scrollToPreview = () => {
    form.mobilePreviewRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground lg:bg-[linear-gradient(to_right,var(--color-background)_50%,var(--color-muted)_50%)]">
      <a
        href="#cv-editor"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-60 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to editor
      </a>

      <main className="mx-auto flex min-h-0 w-full max-w-[1728px] flex-1 overflow-hidden lg:flex-row">
        {/* Form panel */}
        <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto scroll-smooth">
          <ErrorBoundary
            fallback={(reset) => (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center text-muted-foreground">
                <p>
                  Something went wrong in the editor. If you have a JSON backup, you can reload your
                  data after retrying.
                </p>
                <Button variant="outline" size="sm" onClick={reset}>
                  Try again
                </Button>
              </div>
            )}
          >
            <CvFormPanel
              register={form.register}
              control={form.control}
              errors={form.errors}
              setValue={form.setValue}
              links={form.links}
              experience={form.experience}
              education={form.education}
              others={form.others}
              fileInputRef={form.fileInputRef}
              handleImport={form.handleImport}
              isStarterData={form.isStarterData}
              showBackupBanner={form.showBackupBanner}
              onDismissBackup={() => form.setShowBackupBanner(false)}
              showEditorGuideHint={form.showEditorGuideHint}
              onDismissEditorGuideHint={form.onDismissEditorGuideHint}
              toolsOpen={form.toolsOpen}
              setToolsOpen={form.setToolsOpen}
              mainCardOpen={form.mainCardOpen}
              setMainCardOpen={form.setMainCardOpen}
              sections={form.sections}
              setSectionOpen={form.setSectionOpen}
              toolsSections={form.toolsSections}
              setToolsSectionOpen={form.setToolsSectionOpen}
              summaryAiOpen={form.summaryAiOpen}
              setSummaryAiOpen={form.setSummaryAiOpen}
              anySectionOpen={form.anySectionOpen}
              anyToolsSectionOpen={form.anyToolsSectionOpen}
              expandAllSections={form.expandAllSections}
              collapseAllSections={form.collapseAllSections}
              expandAllToolsSections={form.expandAllToolsSections}
              collapseAllToolsSections={form.collapseAllToolsSections}
              expSignal={form.expSignal}
              setExpSignal={form.setExpSignal}
              eduSignal={form.eduSignal}
              setEduSignal={form.setEduSignal}
              othSignal={form.othSignal}
              setOthSignal={form.setOthSignal}
              aiApiKey={form.aiApiKey}
              canGenerate={form.canGenerate}
              ai={form.ai}
              onImportParsed={form.onImportParsed}
              scrollToImport={form.scrollToImport}
              onSaveToBrowser={form.onSaveToBrowser}
              onClearConfirm={() => form.setClearConfirmOpen(true)}
            />
          </ErrorBoundary>

          {/* Mobile preview — shown below form on mobile, hidden on desktop */}
          {!form.isDesktop && (
            <div
              ref={form.mobilePreviewRef}
              id="cv-preview-panel-mobile"
              aria-label="CV preview"
              className="border-t bg-muted pb-20"
            >
              <ErrorBoundary
                fallback={(reset) => (
                  <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center text-muted-foreground">
                    <p>Preview could not be rendered. Check your form data for issues.</p>
                    <Button variant="outline" size="sm" onClick={reset}>
                      Try again
                    </Button>
                  </div>
                )}
              >
                <CvPreviewPanel
                  control={form.control}
                  defaultValues={defaultValues}
                  isStarterData={form.isStarterData}
                  onGoToImport={form.scrollToImport}
                />
              </ErrorBoundary>
            </div>
          )}

          {!form.isDesktop && (
            <Button
              variant="secondary"
              className="fixed bottom-16 right-4 z-50 rounded-full border shadow-md"
              onClick={isPreviewInView ? scrollToTop : scrollToPreview}
              aria-label={isPreviewInView ? 'Back to editor' : 'Preview CV'}
            >
              {isPreviewInView ? (
                <>
                  <PenLineIcon data-icon="inline-start" />
                  Edit
                </>
              ) : (
                <>
                  <EyeIcon data-icon="inline-start" />
                  Preview
                </>
              )}
            </Button>
          )}
        </div>

        {/* Desktop preview — only mounted on lg+ to avoid duplicate useWatch + renders on mobile */}
        {form.isDesktop && (
          <aside
            id="cv-preview-panel-desktop"
            aria-label="CV preview"
            className="min-h-0 overflow-y-auto border-l bg-muted lg:w-1/2"
          >
            <ErrorBoundary
              fallback={(reset) => (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center text-muted-foreground">
                  <p>Preview could not be rendered. Check your form data for issues.</p>
                  <Button variant="outline" size="sm" onClick={reset}>
                    Try again
                  </Button>
                </div>
              )}
            >
              <CvPreviewPanel
                control={form.control}
                defaultValues={defaultValues}
                isStarterData={form.isStarterData}
                onGoToImport={form.scrollToImport}
              />
            </ErrorBoundary>
            <div className="px-4 pb-8 lg:px-6 xl:px-8">
              <div className="flex items-center justify-end gap-3 border-t pt-6">
                <Button onClick={form.handleDownloadClick}>
                  <DownloadIcon data-icon="inline-start" />
                  Download
                </Button>
              </div>
            </div>
          </aside>
        )}
      </main>

      <FormActions
        onClear={() => form.setClearConfirmOpen(true)}
        onSave={form.onSaveToBrowser}
        onDownload={form.handleDownloadClick}
        previewVisible={isPreviewInView}
      />

      <CvEditorDialogs
        apiKeyWarningOpen={form.apiKeyWarningOpen}
        setApiKeyWarningOpen={form.setApiKeyWarningOpen}
        onExportJsonWithoutKey={form.onExportJsonWithoutKey}
        onExportJsonWithKey={form.onExportJsonWithKey}
        clearConfirmOpen={form.clearConfirmOpen}
        setClearConfirmOpen={form.setClearConfirmOpen}
        onClearAll={form.onClearAll}
        downloadDialogOpen={form.downloadDialogOpen}
        setDownloadDialogOpen={form.setDownloadDialogOpen}
        onExportJson={form.handleSubmit(form.onExportJson, form.onValidationError)}
        onExportDocx={form.handleSubmit(form.onExportDocx, form.onValidationError)}
        exporting={form.exporting}
      />

      <Toaster position="bottom-left" mobileOffset={{ bottom: 72 }} />
    </div>
  );
}
