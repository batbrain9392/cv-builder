import { describe, it, expect } from 'vitest';
import { cvFormSchema, DEFAULT_HIGHLIGHTS_PROMPT } from './cvFormSchema';
import { AI_FIELD_DEFAULTS, backfillEntryPrompts } from './loadDefaultValues';
import starterCv from './starterCv.json';

describe('starterCv.json', () => {
  it('parses successfully against cvFormSchema after merging AI defaults', () => {
    const merged = backfillEntryPrompts({ ...AI_FIELD_DEFAULTS, ...starterCv });
    const result = cvFormSchema.safeParse(merged);
    expect(result.success).toBe(true);
  });
});

describe('backfillEntryPrompts', () => {
  it('adds aiHighlightsPrompt to entries missing it', () => {
    const data = {
      experience: [{ role: 'Dev', items: ['x'] }],
      education: [{ degree: 'BSc' }],
      others: [{ role: 'Cert' }],
    };
    const result = backfillEntryPrompts(data);

    expect((result.experience as Array<Record<string, unknown>>)[0].aiHighlightsPrompt).toBe(
      DEFAULT_HIGHLIGHTS_PROMPT,
    );
    expect((result.education as Array<Record<string, unknown>>)[0].aiHighlightsPrompt).toBe(
      DEFAULT_HIGHLIGHTS_PROMPT,
    );
    expect((result.others as Array<Record<string, unknown>>)[0].aiHighlightsPrompt).toBe(
      DEFAULT_HIGHLIGHTS_PROMPT,
    );
  });

  it('leaves entries alone that already have aiHighlightsPrompt', () => {
    const data = {
      experience: [{ role: 'Dev', aiHighlightsPrompt: 'custom prompt' }],
      education: [],
      others: [],
    };
    const result = backfillEntryPrompts(data);

    expect((result.experience as Array<Record<string, unknown>>)[0].aiHighlightsPrompt).toBe(
      'custom prompt',
    );
  });

  it('passes through non-array values without crashing', () => {
    const data = {
      experience: undefined,
      education: 'not an array',
      others: null,
    };
    const result = backfillEntryPrompts(data as Record<string, unknown>);

    expect(result.experience).toBeUndefined();
    expect(result.education).toBe('not an array');
    expect(result.others).toBeNull();
  });
});
