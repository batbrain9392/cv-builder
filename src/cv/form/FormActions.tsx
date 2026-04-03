import type React from 'react';

import { useRef } from 'react';

interface FormActionsProps {
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportJson: () => void;
  onExportDocx: () => void;
  exporting: boolean;
  message: string | null;
}

export function FormActions({
  onImport,
  onExportJson,
  onExportDocx,
  exporting,
  message,
}: FormActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImport(e);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header>
      <h1>CV Builder</h1>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          aria-label="Import CV JSON"
          onChange={handleImport}
        />
        <button type="button" onClick={onExportJson}>
          Export data
        </button>
        <button type="button" onClick={onExportDocx} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export as DOCX'}
        </button>
      </div>

      {message && <p>{message}</p>}
    </header>
  );
}
