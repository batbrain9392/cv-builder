export function EmojiIcon({ emoji, label }: { emoji: string; label?: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      aria-hidden={!label || undefined}
      className="inline-flex shrink-0 items-center leading-none"
    >
      {emoji}
    </span>
  );
}
