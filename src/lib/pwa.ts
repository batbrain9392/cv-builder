export function isInStandaloneMode(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  return 'standalone' in navigator && navigator.standalone === true;
}
