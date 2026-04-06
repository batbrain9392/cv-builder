import { useEffect } from 'react';

const BASE_TITLE = 'BioBot';

export function useDocumentTitle(subtitle?: string) {
  useEffect(() => {
    document.title = subtitle ? `${subtitle} — ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [subtitle]);
}
