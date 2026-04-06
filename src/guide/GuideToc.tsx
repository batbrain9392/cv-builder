import { cn } from '@/lib/utils';

interface GuideTocProps {
  sections: readonly { id: string; title: string }[];
  activeId: string | null;
  onSelect?: (id: string) => void;
}

export function GuideToc({ sections, activeId, onSelect }: GuideTocProps) {
  return (
    <nav aria-label="Guide table of contents">
      <ul className="space-y-1">
        {sections.map(({ id, title }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                if (onSelect) {
                  e.preventDefault();
                  onSelect(id);
                }
              }}
              className={cn(
                'block rounded-md border-l-2 py-1.5 pl-3 pr-2 text-sm transition-colors hover:text-foreground',
                activeId === id
                  ? 'border-primary font-semibold text-primary-text'
                  : 'border-transparent text-muted-foreground',
              )}
            >
              {title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
