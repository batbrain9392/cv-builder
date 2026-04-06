import { FileUpIcon, XIcon } from 'lucide-react';
import {
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';

import { cn } from '@/lib/utils';

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;

function formatMaxSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return `${Number.isInteger(mb) ? mb : mb.toFixed(1)} MB`;
  }
  const kb = Math.max(1, Math.round(bytes / 1024));
  return `${kb} KB`;
}

function fileMatchesAccept(file: File, accept: string): boolean {
  const trimmed = accept.trim();
  if (!trimmed) return true;
  const tokens = trimmed
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  for (const token of tokens) {
    if (token.startsWith('.')) {
      if (name.endsWith(token.toLowerCase())) return true;
      continue;
    }
    if (token.endsWith('/*')) {
      const prefix = token.slice(0, -1).toLowerCase();
      if (mime.startsWith(prefix)) return true;
      continue;
    }
    if (mime === token.toLowerCase()) return true;
  }
  return false;
}

export interface FileDropZoneProps {
  accept: string;
  acceptLabel: string;
  maxSizeBytes?: number;
  onFile: (file: File) => void;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
}

export function FileDropZone({
  accept,
  acceptLabel,
  maxSizeBytes = DEFAULT_MAX_BYTES,
  onFile,
  onClear,
  disabled = false,
  className,
}: FileDropZoneProps) {
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const processFile = useCallback(
    (file: File) => {
      if (!fileMatchesAccept(file, accept)) {
        setSelectedFile(null);
        setError(`This file type is not allowed. Expected ${acceptLabel}.`);
        return;
      }
      if (file.size > maxSizeBytes) {
        setSelectedFile(null);
        setError(`File is too large. Maximum size is ${formatMaxSize(maxSizeBytes)}.`);
        return;
      }
      setError('');
      setSelectedFile(file);
      onFile(file);
    },
    [accept, acceptLabel, maxSizeBytes, onFile],
  );

  const openPicker = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const clearFile = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setSelectedFile(null);
      setError('');
      if (inputRef.current) inputRef.current.value = '';
      onClear?.();
    },
    [onClear],
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleZoneKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPicker();
      }
    },
    [disabled, openPicker],
  );

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current += 1;
      setDragActive(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setDragActive(false);
      }
    },
    [disabled],
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
    },
    [disabled],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [disabled, processFile],
  );

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'rounded-lg border-2 border-dashed transition-colors',
          error
            ? 'border-destructive/50'
            : dragActive
              ? 'border-primary bg-primary/5'
              : 'border-primary/40',
          !error && !disabled && !dragActive && 'hover:border-primary/50 hover:bg-muted/50',
          disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled}
          onChange={handleInputChange}
          tabIndex={-1}
        />
        {!selectedFile ? (
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled || undefined}
            aria-label={`Choose file. ${acceptLabel}`}
            onClick={openPicker}
            onKeyDown={handleZoneKeyDown}
            className={cn(
              'flex min-h-30 cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
            )}
          >
            <FileUpIcon className="size-8 shrink-0 text-muted-foreground" aria-hidden />
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary-text">
                Drop a file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">{acceptLabel}</p>
            </div>
          </div>
        ) : (
          <div
            className="flex min-h-30 flex-col items-center justify-center gap-2 p-4"
            role="status"
            aria-live="polite"
            aria-label={`Selected file ${selectedFile.name}`}
          >
            <div className="flex w-full max-w-full items-center gap-2 px-1">
              <button
                type="button"
                onClick={openPicker}
                className="min-h-11 min-w-0 flex-1 truncate rounded-md text-left text-sm font-medium text-primary-text transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {selectedFile.name}
              </button>
              <button
                type="button"
                onClick={clearFile}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary-text focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                aria-label={`Remove ${selectedFile.name}`}
              >
                <XIcon className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        )}
      </div>
      {error ? (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
