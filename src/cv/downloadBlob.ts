export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  // Delay revoke so the browser has time to start the download.
  // Safari in particular needs this — immediate revoke can abort the save.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
