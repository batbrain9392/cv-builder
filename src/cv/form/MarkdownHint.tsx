export function MarkdownHint({ id, children }: { id: string; children?: React.ReactNode }) {
  return (
    <p id={id} className="text-xs text-muted-foreground">
      {children}{' '}
      <a
        href="https://www.markdownguide.org/cheat-sheet/#basic-syntax"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-foreground"
      >
        Markdown
        <span className="sr-only"> (opens in new tab)</span>
      </a>{' '}
      supported.
    </p>
  );
}
