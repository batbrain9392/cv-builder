import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { afterEach, describe, expect, it } from 'vitest';

import type { CvFormData } from '../cvFormSchema.ts';

import { EMPTY_DEFAULTS } from '../loadDefaultValues.ts';
import { HighlightsInput } from './HighlightsInput.tsx';

function Harness({ bullets = ['First bullet'] }) {
  const { control } = useForm<CvFormData>({
    defaultValues: {
      ...EMPTY_DEFAULTS,
      experience: [{ ...EMPTY_DEFAULTS.experience[0], bullets }],
    },
  });
  return (
    <HighlightsInput
      control={control}
      name="experience.0.bullets"
      id="highlights"
      label="Key highlights"
    />
  );
}

afterEach(cleanup);

describe('HighlightsInput', () => {
  it('renders bullets prefixed with dashes', () => {
    render(<Harness bullets={['Built APIs', 'Led team']} />);
    const textarea = screen.getByLabelText('Key highlights');
    expect(textarea).toHaveValue('- Built APIs\n- Led team');
  });

  it('renders label and hint text', () => {
    render(<Harness />);
    expect(screen.getByText('Key highlights')).toBeInTheDocument();
    expect(screen.getByText(/One highlight per line/)).toBeInTheDocument();
  });

  it('accepts typed text and preserves it in the display', async () => {
    const user = userEvent.setup();
    render(<Harness bullets={['Existing']} />);

    const textarea = screen.getByLabelText('Key highlights');
    await user.clear(textarea);
    await user.type(textarea, 'New bullet');

    expect(textarea).toHaveValue('- New bullet');
  });

  it('handles multiline input with newlines', async () => {
    const user = userEvent.setup();
    render(<Harness bullets={['One']} />);

    const textarea = screen.getByLabelText('Key highlights');
    await user.clear(textarea);
    await user.type(textarea, 'First{Enter}Second');

    expect(textarea).toHaveValue('- First\n- Second');
  });
});
