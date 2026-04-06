import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as cvStorage from '@/lib/cvStorage.ts';

import { EMPTY_DEFAULTS } from '../cv/loadDefaultValues.ts';

vi.mock('../cv/preview/CvPreviewPanel.tsx', () => ({
  CvPreviewPanel: () => <div data-testid="cv-preview-panel" />,
}));
vi.mock('../cv/useAiGeneration.ts', () => ({
  useAiGeneration: () => ({
    generatingSummary: false,
    generatedSummary: null,
    setGeneratedSummary: vi.fn(),
    onGenerateSummary: vi.fn(),
    onUseSummary: vi.fn(),
    onCopyGenerated: vi.fn(),
    generatingCoverLetter: false,
    generatedCoverLetter: null,
    setGeneratedCoverLetter: vi.fn(),
    onGenerateCoverLetter: vi.fn(),
    onUseCoverLetter: vi.fn(),
    buildEntryAiProps: () => ({
      canGenerate: false,
      generatingHighlights: false,
      generatedHighlights: null,
      onGenerateHighlights: vi.fn(),
      onUseHighlights: vi.fn(),
      onCopyHighlights: vi.fn(),
      onDismissHighlights: vi.fn(),
    }),
  }),
}));
vi.mock('@/lib/useMediaQuery', () => ({
  useMediaQuery: () => true,
}));

import { CvEditorPage } from './CvEditorPage.tsx';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderPage() {
  return render(
    <MemoryRouter>
      <CvEditorPage defaultValues={EMPTY_DEFAULTS} />
    </MemoryRouter>,
  );
}

function getCardTrigger(cardId: string): HTMLElement {
  const heading = document.getElementById(cardId);
  if (!heading) throw new Error(`No element with id "${cardId}"`);
  const trigger = heading.closest('[data-slot="collapsible-trigger"]');
  if (!(trigger instanceof HTMLElement))
    throw new Error(`No collapsible trigger found for "${cardId}"`);
  return trigger;
}

function isCardExpanded(cardId: string) {
  return getCardTrigger(cardId).getAttribute('aria-expanded') === 'true';
}

function getSectionTrigger(container: HTMLElement, sectionId: string): HTMLElement {
  const heading = within(container).getByText((_content, el) => el?.id === sectionId);
  const trigger = heading.closest('[data-slot="collapsible-trigger"]');
  if (!(trigger instanceof HTMLElement))
    throw new Error(`No collapsible trigger found for section "${sectionId}"`);
  return trigger;
}

function getCard(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`No element with id "${id}"`);
  const card = el.closest('[data-slot="collapsible"]');
  if (!(card instanceof HTMLElement)) throw new Error(`No collapsible card found for "${id}"`);
  return card;
}

const CV_SECTION_IDS = [
  'section-personal-info',
  'section-summary',
  'section-skills',
  'section-experience',
  'section-education',
  'section-others',
];

const TOOLS_SECTION_IDS = [
  'ai-settings-title',
  'import-data-title',
  'jd-title',
  'cover-letter-title',
];

describe('CvEditorPage card expansion', () => {
  it('fresh user: Import card collapsed, Your CV card expanded, all inner sections collapsed', () => {
    vi.spyOn(cvStorage, 'hasUserCv').mockReturnValue(false);

    renderPage();

    expect(isCardExpanded('tools-import-title')).toBe(false);
    expect(isCardExpanded('main-cv-title')).toBe(true);

    const mainCard = getCard('main-cv-title');
    for (const id of CV_SECTION_IDS) {
      expect(getSectionTrigger(mainCard, id).getAttribute('aria-expanded')).toBe('false');
    }
  });

  it('returning user: Import card collapsed, Your CV card expanded', () => {
    vi.spyOn(cvStorage, 'hasUserCv').mockReturnValue(true);

    renderPage();

    expect(isCardExpanded('tools-import-title')).toBe(false);
    expect(isCardExpanded('main-cv-title')).toBe(true);
  });

  it('Expand All on Your CV card expands all inner sections', async () => {
    vi.spyOn(cvStorage, 'hasUserCv').mockReturnValue(true);
    const user = userEvent.setup();

    renderPage();

    const mainCard = getCard('main-cv-title');
    const expandAllBtn = within(mainCard).getByRole('button', { name: /expand all/i });
    await user.click(expandAllBtn);

    for (const id of CV_SECTION_IDS) {
      expect(getSectionTrigger(mainCard, id).getAttribute('aria-expanded')).toBe('true');
    }
  });

  it('Collapse All on Your CV card collapses all inner sections', async () => {
    vi.spyOn(cvStorage, 'hasUserCv').mockReturnValue(true);
    const user = userEvent.setup();

    renderPage();

    const mainCard = getCard('main-cv-title');

    const expandBtn = within(mainCard).getByRole('button', { name: /expand all/i });
    await user.click(expandBtn);

    const collapseBtn = within(mainCard).getByRole('button', { name: /collapse all/i });
    await user.click(collapseBtn);

    for (const id of CV_SECTION_IDS) {
      expect(getSectionTrigger(mainCard, id).getAttribute('aria-expanded')).toBe('false');
    }
  });

  it('Expand/Collapse All on Import card toggles its inner sections', async () => {
    vi.spyOn(cvStorage, 'hasUserCv').mockReturnValue(false);
    const user = userEvent.setup();

    renderPage();

    await user.click(getCardTrigger('tools-import-title'));

    const toolsCard = getCard('tools-import-title');

    const expandBtn = within(toolsCard).getByRole('button', { name: /expand all/i });
    await user.click(expandBtn);

    for (const id of TOOLS_SECTION_IDS) {
      expect(getSectionTrigger(toolsCard, id).getAttribute('aria-expanded')).toBe('true');
    }

    const collapseBtn = within(toolsCard).getByRole('button', { name: /collapse all/i });
    await user.click(collapseBtn);

    for (const id of TOOLS_SECTION_IDS) {
      expect(getSectionTrigger(toolsCard, id).getAttribute('aria-expanded')).toBe('false');
    }
  });
});
