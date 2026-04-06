/** @vitest-environment happy-dom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FileDropZone } from './FileDropZone.tsx';

afterEach(cleanup);

const PDF_FILE = new File(['%PDF'], 'resume.pdf', { type: 'application/pdf' });
const TXT_FILE = new File(['hello'], 'notes.txt', { type: 'text/plain' });
const BIG_FILE = new File(['x'], 'big.pdf', { type: 'application/pdf' });
Object.defineProperty(BIG_FILE, 'size', { value: 20 * 1024 * 1024 });

function getFileInput(): HTMLInputElement {
  const input = document.querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) throw new Error('file input not found');
  return input;
}

function getDropTarget(): HTMLElement {
  const button = screen.getByRole('button', { name: /choose file/i });
  const parent = button.parentElement;
  if (!parent) throw new Error('drop target parent not found');
  return parent;
}

describe('FileDropZone', () => {
  it('calls onFile when a valid file is selected via click', async () => {
    const onFile = vi.fn();
    render(<FileDropZone accept=".pdf,.txt" acceptLabel="PDF or text" onFile={onFile} />);

    await userEvent.upload(getFileInput(), PDF_FILE);

    expect(onFile).toHaveBeenCalledWith(PDF_FILE);
  });

  it('calls onFile when a valid file is dropped', () => {
    const onFile = vi.fn();
    render(<FileDropZone accept=".pdf,.txt" acceptLabel="PDF or text" onFile={onFile} />);

    fireEvent.drop(getDropTarget(), { dataTransfer: { files: [TXT_FILE] } });

    expect(onFile).toHaveBeenCalledWith(TXT_FILE);
  });

  it('shows error for an unsupported file type via drop', () => {
    const onFile = vi.fn();
    const unsupported = new File(['data'], 'image.bmp', { type: 'image/bmp' });

    render(<FileDropZone accept=".pdf,.txt" acceptLabel="PDF or text" onFile={onFile} />);

    fireEvent.drop(getDropTarget(), { dataTransfer: { files: [unsupported] } });

    expect(onFile).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/not allowed/i);
  });

  it('shows error for an oversized file', async () => {
    const onFile = vi.fn();

    render(
      <FileDropZone
        accept=".pdf"
        acceptLabel="PDF"
        maxSizeBytes={10 * 1024 * 1024}
        onFile={onFile}
      />,
    );

    await userEvent.upload(getFileInput(), BIG_FILE);

    expect(onFile).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/too large/i);
  });

  it('displays selected file name after successful selection', async () => {
    const onFile = vi.fn();
    render(<FileDropZone accept=".pdf,.txt" acceptLabel="PDF or text" onFile={onFile} />);

    await userEvent.upload(getFileInput(), PDF_FILE);

    expect(screen.getByText('resume.pdf')).toBeInTheDocument();
  });

  it('calls onClear when the remove button is clicked', async () => {
    const onFile = vi.fn();
    const onClear = vi.fn();
    render(<FileDropZone accept=".pdf" acceptLabel="PDF" onFile={onFile} onClear={onClear} />);

    await userEvent.upload(getFileInput(), PDF_FILE);

    const removeBtn = screen.getByRole('button', { name: /remove/i });
    await userEvent.click(removeBtn);

    expect(onClear).toHaveBeenCalledOnce();
  });
});
