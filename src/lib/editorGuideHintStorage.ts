const STORAGE_KEY = 'biobot-editor-guide-hint-dismissed';

export function isEditorGuideHintDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissEditorGuideHint(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // private browsing / quota — ignore
  }
}
