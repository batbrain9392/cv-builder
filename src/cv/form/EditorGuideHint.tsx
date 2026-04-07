import { BookOpenIcon } from 'lucide-react';
import { useNavigate } from 'react-router';

import { DismissibleStatusBanner } from '@/components/DismissibleStatusBanner';
import { Button } from '@/components/ui/button';

export function EditorGuideHint({ onDismiss }: { onDismiss: () => void }) {
  const navigate = useNavigate();

  return (
    <DismissibleStatusBanner
      aria-label="How-to guide suggestion"
      onDismiss={onDismiss}
      dismissAriaLabel="Dismiss guide hint"
    >
      <div className="space-y-2">
        <p>
          Need help? The <strong>How to use</strong> guide walks through import, AI, and export step
          by step.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => navigate('/guide')}>
          <BookOpenIcon data-icon="inline-start" className="size-3.5" aria-hidden="true" />
          Open how-to guide
        </Button>
      </div>
    </DismissibleStatusBanner>
  );
}
