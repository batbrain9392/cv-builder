import {
  ChevronDownIcon,
  Loader2Icon,
  PenLineIcon,
  SaveIcon,
  SettingsIcon,
  Trash2Icon,
} from 'lucide-react';

import { EmojiIcon } from '@/components/EmojiIcon';
import { GeminiIcon } from '@/components/GeminiIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { CollapsibleCard } from '@/cv/form/CollapsibleCard.tsx';
import { CollapsibleSection } from '@/cv/form/CollapsibleSection.tsx';
import { MarkdownHint } from '@/cv/form/MarkdownHint.tsx';

import { AiSettingsFields } from '../cv/form/AiSettingsFields.tsx';
import { BackupReminder } from '../cv/form/BackupReminder.tsx';
import { CoverLetterFields } from '../cv/form/CoverLetterFields.tsx';
import { EditorGuideHint } from '../cv/form/EditorGuideHint.tsx';
import { EducationEntry } from '../cv/form/EducationFields.tsx';
import { ExperienceEntryFields } from '../cv/form/ExperienceEntryFields.tsx';
import { GeneratedSummaryCard } from '../cv/form/GeneratedSummaryCard.tsx';
import { HighlightsInput } from '../cv/form/HighlightsInput.tsx';
import { ImportDataFields } from '../cv/form/ImportDataFields.tsx';
import { JobDescriptionFields } from '../cv/form/JobDescriptionFields.tsx';
import { PersonalInfoFields } from '../cv/form/PersonalInfoFields.tsx';
import { SectionToolbar } from '../cv/form/SectionToolbar.tsx';
import { useCvEditor } from './CvEditorContext.tsx';
import { EMPTY_EDUCATION, EMPTY_ENTRY } from './useCvEditorForm.ts';

export function CvFormPanel() {
  const {
    register,
    control,
    errors,
    setValue,
    links,
    experience,
    education,
    others,
    fileInputRef,
    handleImport,
    isStarterData,
    showBackupBanner,
    setShowBackupBanner,
    showEditorGuideHint,
    onDismissEditorGuideHint,
    toolsOpen,
    setToolsOpen,
    mainCardOpen,
    setMainCardOpen,
    sections,
    setSectionOpen,
    toolsSections,
    setToolsSectionOpen,
    summaryAiOpen,
    setSummaryAiOpen,
    anySectionOpen,
    anyToolsSectionOpen,
    expandAllSections,
    collapseAllSections,
    expandAllToolsSections,
    collapseAllToolsSections,
    expSignal,
    setExpSignal,
    eduSignal,
    setEduSignal,
    othSignal,
    setOthSignal,
    aiApiKey,
    canGenerate,
    ai,
    onImportParsed,
    scrollToImport,
    onSaveToBrowser,
    setClearConfirmOpen,
  } = useCvEditor();

  return (
    <form
      id="cv-editor"
      aria-label="CV editor"
      onSubmit={(e) => e.preventDefault()}
      className="space-y-6 px-4 py-8 lg:p-6 xl:p-8"
    >
      <div className="space-y-2">
        <h1 className="flex items-center gap-3 text-xl font-bold tracking-tight">
          <PenLineIcon className="size-5" aria-hidden="true" /> Edit your CV
        </h1>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          aria-label="Import CV JSON"
          onChange={handleImport}
          className="hidden"
        />
        <p className="text-sm text-muted-foreground">
          Hit <strong>Save</strong> to store your data in this browser&rsquo;s local storage. Use{' '}
          <strong>Download</strong> to export a DOCX &mdash; open it in Word or Google Docs and save
          as PDF.
        </p>
      </div>

      {showEditorGuideHint && <EditorGuideHint onDismiss={onDismissEditorGuideHint} />}

      {showBackupBanner && <BackupReminder onDismiss={() => setShowBackupBanner(false)} />}

      <CollapsibleCard
        id="tools-import-title"
        title={
          <>
            <SettingsIcon className="size-4" />
            Import CV <span className="font-normal text-muted-foreground">(optional)</span>
          </>
        }
        description={
          <>
            This app uses Google Gemini to parse your CV text or JSON into structured form data, and
            later to enhance your summary, cover letter, and experience highlights. Gemini has a
            free tier with no billing required &mdash; just a Google account and an API key.
          </>
        }
        open={toolsOpen}
        onOpenChange={setToolsOpen}
        expandCollapseAll={{
          anyOpen: anyToolsSectionOpen,
          onExpand: expandAllToolsSections,
          onCollapse: collapseAllToolsSections,
        }}
      >
        <AiSettingsFields
          register={register}
          errors={errors}
          open={toolsSections.aiSettings}
          onOpenChange={(open) => setToolsSectionOpen('aiSettings', open)}
        />

        <ImportDataFields
          currentApiKey={aiApiKey ?? ''}
          onPickJsonFile={() => fileInputRef.current?.click()}
          onImportParsed={onImportParsed}
          open={toolsSections.importData}
          onOpenChange={(open) => setToolsSectionOpen('importData', open)}
        />

        <JobDescriptionFields
          register={register}
          errors={errors}
          currentApiKey={aiApiKey ?? ''}
          onJobDescriptionExtracted={(text) =>
            setValue('jobDescriptionText', text, { shouldDirty: true })
          }
          open={toolsSections.jobDescription}
          onOpenChange={(open) => setToolsSectionOpen('jobDescription', open)}
        />

        <CoverLetterFields
          register={register}
          control={control}
          errors={errors}
          generating={ai.generatingCoverLetter}
          generatedText={ai.generatedCoverLetter}
          onGenerate={ai.onGenerateCoverLetter}
          onUse={ai.onUseCoverLetter}
          onCopy={ai.onCopyGenerated}
          onDismiss={() => ai.setGeneratedCoverLetter(null)}
          open={toolsSections.coverLetter}
          onOpenChange={(open) => setToolsSectionOpen('coverLetter', open)}
        />
      </CollapsibleCard>

      <CollapsibleCard
        id="main-cv-title"
        title={
          <>
            <PenLineIcon className="size-4" />
            Your CV
          </>
        }
        description={
          isStarterData ? (
            <>
              This starts with sample data to show you how the editor works. Clear it and add your
              own, or use{' '}
              <button
                type="button"
                onClick={scrollToImport}
                className="inline font-medium text-primary-text underline underline-offset-2 hover:text-primary-text/80"
              >
                Import CV
              </button>{' '}
              above to load a previous backup or parse an existing CV.
            </>
          ) : (
            <>
              Edit your CV details below. Use{' '}
              <button
                type="button"
                onClick={scrollToImport}
                className="inline font-medium text-primary-text underline underline-offset-2 hover:text-primary-text/80"
              >
                Import CV
              </button>{' '}
              above to load a previous backup or parse an existing CV.
            </>
          )
        }
        open={mainCardOpen}
        onOpenChange={setMainCardOpen}
        expandCollapseAll={{
          anyOpen: anySectionOpen,
          onExpand: expandAllSections,
          onCollapse: collapseAllSections,
        }}
      >
        <CollapsibleSection
          id="section-personal-info"
          title={
            <>
              <EmojiIcon emoji="👤" /> Personal Information
            </>
          }
          open={sections.personalInfo}
          onOpenChange={(open) => setSectionOpen('personalInfo', open)}
        >
          <PersonalInfoFields
            register={register}
            errors={errors.personalInfo}
            linkFields={links.fields}
            onAppendLink={() => links.append({ label: '', url: '' })}
            onRemoveLink={links.remove}
          />
        </CollapsibleSection>

        <CollapsibleSection
          id="section-summary"
          title={
            <>
              <EmojiIcon emoji="📜" /> Professional Summary
            </>
          }
          open={sections.summary}
          onOpenChange={(open) => setSectionOpen('summary', open)}
        >
          <FieldGroup>
            <Field data-invalid={errors.summary ? true : undefined}>
              <FieldLabel htmlFor="summary" className="sr-only">
                Summary
              </FieldLabel>
              <Textarea
                id="summary"
                {...register('summary')}
                rows={6}
                aria-invalid={errors.summary ? true : undefined}
                aria-describedby={'summary-hint' + (errors.summary ? ' summary-error' : '')}
              />
              <MarkdownHint id="summary-hint">
                A concise professional summary highlighting your key strengths.
              </MarkdownHint>
              {errors.summary && <FieldError id="summary-error" errors={[errors.summary]} />}
            </Field>

            <Collapsible open={summaryAiOpen} onOpenChange={setSummaryAiOpen}>
              <CollapsibleTrigger
                render={
                  <button
                    type="button"
                    aria-label="Enhance with AI"
                    className="flex items-center hover:opacity-80"
                  />
                }
              >
                <Badge variant="secondary" className="h-auto gap-1 text-xs [&>svg]:size-3.5!">
                  <GeminiIcon className="size-3.5" />
                  <ChevronDownIcon
                    className={
                      'size-3.5 transition-transform' + (summaryAiOpen ? ' rotate-180' : '')
                    }
                  />
                  Enhance with AI
                </Badge>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-3 pt-2">
                <Field>
                  <FieldLabel htmlFor="aiSummaryPrompt">AI prompt</FieldLabel>
                  <Textarea
                    id="aiSummaryPrompt"
                    {...register('aiSummaryPrompt')}
                    rows={4}
                    className="text-xs"
                    placeholder="Rewrite the professional summary to highlight relevant experience. Preserve the existing formatting."
                  />
                </Field>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={!canGenerate || ai.generatingSummary}
                    onClick={ai.onGenerateSummary}
                    aria-busy={ai.generatingSummary || undefined}
                  >
                    {ai.generatingSummary ? (
                      <Loader2Icon className="animate-spin" data-icon="inline-start" />
                    ) : (
                      <GeminiIcon className="size-4" data-icon="inline-start" />
                    )}
                    {ai.generatingSummary ? 'Generating…' : 'Generate with AI'}
                  </Button>
                  {!canGenerate && (
                    <span className="text-xs text-muted-foreground">Requires API key</span>
                  )}
                </div>

                {ai.generatedSummary && (
                  <GeneratedSummaryCard
                    summary={ai.generatedSummary}
                    onCopy={ai.onCopyGenerated}
                    onDismiss={() => ai.setGeneratedSummary(null)}
                    onUse={ai.onUseSummary}
                  />
                )}
              </CollapsibleContent>
            </Collapsible>
          </FieldGroup>
        </CollapsibleSection>

        <CollapsibleSection
          id="section-skills"
          title={
            <>
              <EmojiIcon emoji="🛠️" /> Skills
            </>
          }
          open={sections.skills}
          onOpenChange={(open) => setSectionOpen('skills', open)}
        >
          <HighlightsInput
            control={control}
            name="skills"
            id="skills"
            label="Skills"
            hint="One category per line, e.g. &ldquo;Frontend: React, TypeScript, Next.js&rdquo;. ATS systems scan for keyword matches, so list tools and technologies explicitly."
          />
        </CollapsibleSection>

        <CollapsibleSection
          id="section-experience"
          title={
            <>
              <EmojiIcon emoji="💼" /> Experience
            </>
          }
          open={sections.experience}
          onOpenChange={(open) => setSectionOpen('experience', open)}
        >
          <div className="space-y-4">
            <SectionToolbar
              id="section-experience-toolbar"
              title="Entries"
              count={experience.fields.length}
              onCollapse={() => setExpSignal((s) => ({ n: s.n + 1, open: false }))}
              onExpand={() => setExpSignal((s) => ({ n: s.n + 1, open: true }))}
              onAdd={() => experience.insert(0, EMPTY_ENTRY)}
              addLabel="Add Experience"
            />

            {experience.fields.map((field, index) => {
              const entryAi = ai.buildEntryAiProps(`experience.${index}`);
              return (
                <ExperienceEntryFields
                  key={field.id}
                  index={index}
                  prefix={`experience.${index}`}
                  idPrefix="exp"
                  register={register}
                  control={control}
                  errors={errors.experience}
                  onRemove={() => experience.remove(index)}
                  removeLabel="Remove Experience"
                  toggleSignal={expSignal}
                  canGenerate={entryAi.canGenerate}
                  generatingHighlights={entryAi.generatingHighlights}
                  generatedHighlights={entryAi.generatedHighlights}
                  onGenerateHighlights={entryAi.onGenerateHighlights}
                  onUseHighlights={entryAi.onUseHighlights}
                  onCopyHighlights={entryAi.onCopyHighlights}
                  onDismissHighlights={entryAi.onDismissHighlights}
                />
              );
            })}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="section-education"
          title={
            <>
              <EmojiIcon emoji="🎓" /> Education
            </>
          }
          open={sections.education}
          onOpenChange={(open) => setSectionOpen('education', open)}
        >
          <div className="space-y-4">
            <SectionToolbar
              id="section-education-toolbar"
              title="Entries"
              count={education.fields.length}
              onCollapse={() => setEduSignal((s) => ({ n: s.n + 1, open: false }))}
              onExpand={() => setEduSignal((s) => ({ n: s.n + 1, open: true }))}
              onAdd={() => education.append(EMPTY_EDUCATION)}
              addLabel="Add Education"
            />

            {education.fields.map((field, index) => (
              <EducationEntry
                key={field.id}
                index={index}
                register={register}
                control={control}
                errors={errors.education}
                onRemove={() => education.remove(index)}
                toggleSignal={eduSignal}
                ai={ai.buildEntryAiProps(`education.${index}`)}
              />
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="section-others"
          title={
            <>
              <EmojiIcon emoji="🧩" /> Others{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </>
          }
          open={sections.others}
          onOpenChange={(open) => setSectionOpen('others', open)}
        >
          <div className="space-y-4">
            <SectionToolbar
              id="section-others-toolbar"
              title="Entries"
              count={others.fields.length}
              onCollapse={() => setOthSignal((s) => ({ n: s.n + 1, open: false }))}
              onExpand={() => setOthSignal((s) => ({ n: s.n + 1, open: true }))}
              onAdd={() => others.insert(0, EMPTY_ENTRY)}
              addLabel="Add Other"
            />

            {others.fields.map((field, index) => {
              const entryAi = ai.buildEntryAiProps(`others.${index}`);
              return (
                <ExperienceEntryFields
                  key={field.id}
                  index={index}
                  prefix={`others.${index}`}
                  idPrefix="other"
                  register={register}
                  control={control}
                  errors={errors.others}
                  onRemove={() => others.remove(index)}
                  removeLabel="Remove"
                  toggleSignal={othSignal}
                  canGenerate={entryAi.canGenerate}
                  generatingHighlights={entryAi.generatingHighlights}
                  generatedHighlights={entryAi.generatedHighlights}
                  onGenerateHighlights={entryAi.onGenerateHighlights}
                  onUseHighlights={entryAi.onUseHighlights}
                  onCopyHighlights={entryAi.onCopyHighlights}
                  onDismissHighlights={entryAi.onDismissHighlights}
                />
              );
            })}
          </div>
        </CollapsibleSection>
      </CollapsibleCard>

      <div className="hidden items-center justify-end gap-3 border-t pt-6 lg:flex">
        <Button type="button" variant="ghost" onClick={() => setClearConfirmOpen(true)}>
          <Trash2Icon data-icon="inline-start" />
          Clear all
        </Button>
        <Button type="button" onClick={onSaveToBrowser}>
          <SaveIcon data-icon="inline-start" />
          Save to browser
        </Button>
      </div>
    </form>
  );
}
