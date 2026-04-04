import { toast } from 'sonner';

const SHARE_DATA: ShareData = {
  title: 'BioBot',
  text: 'AI-powered CV and cover letter builder — runs entirely in your browser.',
  url: 'https://batbrain9392.github.io/cv-builder/',
};

export async function shareApp(): Promise<void> {
  if (navigator.share && navigator.canShare?.(SHARE_DATA)) {
    try {
      await navigator.share(SHARE_DATA);
    } catch {
      // User cancelled
    }
    return;
  }

  await navigator.clipboard.writeText(SHARE_DATA.url!);
  toast.success('Link copied to clipboard.');
}
