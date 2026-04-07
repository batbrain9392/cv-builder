import { useEffect } from 'react';

const BASE_TITLE = 'BioBot';

export function useDocumentTitle(subtitle?: string) {
  useEffect(() => {
    document.title = subtitle ? `${BASE_TITLE} — ${subtitle}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [subtitle]);
}
