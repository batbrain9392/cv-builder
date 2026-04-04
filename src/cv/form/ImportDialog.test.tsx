import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ParseCvResult } from '../ai/parseCvFromText.ts';

vi.mock('../ai/parseCvFromText.ts', () => ({
  parseCvFromText: vi.fn(),
}));

import { parseCvFromText } from '../ai/parseCvFromText.ts';
import { EMPTY_DEFAULTS } from '../loadDefaultValues.ts';
import { ImportDialog } from './ImportDialog.tsx';

const mockedParse = vi.mocked(parseCvFromText);

function renderDialog(overrides: Partial<Parameters<typeof ImportDialog>[0]> = {}) {
  const props = {
    open: true,
    onOpenChange: vi.fn(),
    onPickJsonFile: vi.fn(),
    onImportParsed: vi.fn(),
    currentApiKey: '',
    ...overrides,
  };
  const result = render(<ImportDialog {...props} />);
  return { ...result, props };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const VALID_RESULT: ParseCvResult = {
  data: {
    ...EMPTY_DEFAULTS,
    personalInfo: {
      name: 'Jane Doe',
      title: 'Engineer',
      location: 'Dublin',
      email: 'jane@example.com',
      phone: '+1 555 000',
      links: [],
    },
    summary: 'A professional summary.',
  },
  issues: [],
};

describe('ImportDialog', () => {
  it('opens on the choose step with both import methods', () => {
    renderDialog();

    expect(screen.getByText('Load CV data')).toBeInTheDocument();
    expect(screen.getByText('I have previously exported data')).toBeInTheDocument();
    expect(screen.getByText('Start fresh with my CV')).toBeInTheDocument();
  });

  it('full paste flow: enter API key -> paste text -> parse -> finish', async () => {
    const user = userEvent.setup();
    mockedParse.mockResolvedValueOnce(VALID_RESULT);

    const { props } = renderDialog();

    await user.click(screen.getByText('Start fresh with my CV'));

    expect(screen.getByText('Step 1: Gemini API Key')).toBeInTheDocument();

    const apiKeyInput = screen.getByLabelText('Gemini API Key');
    await user.type(apiKeyInput, 'AIzaTestKey');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText('Step 2: Paste your CV')).toBeInTheDocument();

    const textarea = screen.getByLabelText('CV text');
    await user.type(textarea, 'My CV content here');
    await user.click(screen.getByRole('button', { name: /Parse with Gemini/i }));

    await waitFor(() => {
      expect(screen.getByText('Import complete')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Open editor' }));

    expect(props.onImportParsed).toHaveBeenCalledOnce();
    expect(props.onImportParsed).toHaveBeenCalledWith(
      expect.objectContaining({
        aiApiKey: 'AIzaTestKey',
        personalInfo: expect.objectContaining({ name: 'Jane Doe' }),
      }),
    );
  });

  it('shows warning issues and allows "Load anyway"', async () => {
    const user = userEvent.setup();
    const resultWithIssues: ParseCvResult = {
      data: VALID_RESULT.data,
      issues: ['summary: Summary should be at least 10 characters'],
    };
    mockedParse.mockResolvedValueOnce(resultWithIssues);

    const { props } = renderDialog({ currentApiKey: 'existing-key' });

    await user.click(screen.getByText('Start fresh with my CV'));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    const textarea = screen.getByLabelText('CV text');
    await user.type(textarea, 'Some CV text');
    await user.click(screen.getByRole('button', { name: /Parse with Gemini/i }));

    await waitFor(() => {
      expect(screen.getByText(/Parsed with 1 issue/)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Load anyway' }));

    expect(screen.getByText('Import complete')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open editor' }));
    expect(props.onImportParsed).toHaveBeenCalledOnce();
  });

  it('shows error message when parsing fails', async () => {
    const user = userEvent.setup();
    mockedParse.mockRejectedValueOnce(new Error('Gemini returned invalid JSON. Please try again.'));

    renderDialog({ currentApiKey: 'existing-key' });

    await user.click(screen.getByText('Start fresh with my CV'));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    const textarea = screen.getByLabelText('CV text');
    await user.type(textarea, 'Bad data');
    await user.click(screen.getByRole('button', { name: /Parse with Gemini/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Gemini returned invalid JSON. Please try again.',
      );
    });

    expect(screen.getByText('Step 2: Paste your CV')).toBeInTheDocument();
  });
});
