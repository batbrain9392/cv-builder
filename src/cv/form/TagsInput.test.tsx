import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { afterEach, describe, expect, it } from 'vitest';

import type { CvFormData } from '../cvFormSchema.ts';

import { EMPTY_DEFAULTS } from '../loadDefaultValues.ts';
import { TagsInput } from './TagsInput.tsx';

const EMPTY_TAGS: string[] = [];

const MINIMAL_ENTRY = {
  role: '',
  company: '',
  url: '',
  startDate: '',
  location: '',
  items: [''],
  tagsLabel: '',
};

function Harness({ tags = EMPTY_TAGS }) {
  const { control } = useForm<CvFormData>({
    defaultValues: {
      ...EMPTY_DEFAULTS,
      experience: [{ ...MINIMAL_ENTRY, tags }],
    },
  });
  return <TagsInput control={control} name="experience.0.tags" id="tags" />;
}

afterEach(cleanup);

describe('TagsInput', () => {
  it('renders empty state with hint text', () => {
    render(<Harness />);
    expect(screen.getByText('Type and press Enter to add.')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('adds a tag on Enter', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'React{Enter}');

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('adds a tag on comma', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'TypeScript,');

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('does not add duplicate tags', async () => {
    const user = userEvent.setup();
    render(<Harness tags={['React']} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'React{Enter}');

    expect(screen.getAllByText('React')).toHaveLength(1);
  });

  it('removes a tag when clicking the remove button', async () => {
    const user = userEvent.setup();
    render(<Harness tags={['React', 'Vue']} />);

    expect(screen.getByText('React')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove React' }));

    expect(screen.queryByText('React')).not.toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
  });

  it('removes last tag on Backspace with empty input', async () => {
    const user = userEvent.setup();
    render(<Harness tags={['React', 'Vue']} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.keyboard('{Backspace}');

    expect(screen.queryByText('Vue')).not.toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('adds tag on blur', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Node');
    await user.tab();

    expect(screen.getByText('Node')).toBeInTheDocument();
  });
});
