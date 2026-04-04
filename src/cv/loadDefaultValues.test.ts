import { describe, it, expect } from 'vitest';
import { cvFormSchema } from './cvFormSchema';
import { AI_FIELD_DEFAULTS, backfillEntryPrompts } from './loadDefaultValues';
import starterCv from './starterCv.json';

describe('starterCv.json', () => {
  it('parses successfully against cvFormSchema after merging AI defaults', () => {
    const merged = backfillEntryPrompts({ ...AI_FIELD_DEFAULTS, ...starterCv });
    const result = cvFormSchema.safeParse(merged);
    expect(result.success).toBe(true);
  });
});
