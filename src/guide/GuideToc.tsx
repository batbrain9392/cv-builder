import { cn } from '@/lib/utils';

export interface TocGroup {
  label: string;
  items: readonly { id: string; title: string }[];
}

interface GuideTocProps {
  groups: readonly TocGroup[];
  activeId: string | null;
  onSelect?: (id: string) => void;
}

export function GuideToc({ groups, activeId, onSelect }: GuideTocProps) {
  return (
    <nav aria-label="Guide table of contents">
      <ul className="space-y-4">
        {groups.map((group) => (
          <li key={group.label}>
            <p className="mb-1.5 px-3 text-[0.65rem] font-semibold tracking-wider text-muted-foreground/70 uppercase">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ id, title }) => (
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
          </li>
        ))}
      </ul>
    </nav>
  );
}
