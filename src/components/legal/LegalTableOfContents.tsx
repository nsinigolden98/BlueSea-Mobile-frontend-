import { LegalSectionData } from '@/types/legal';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface LegalTableOfContentsProps {
  sections: LegalSectionData[];
  activeSectionId: string;
  onSelectSection: (id: string) => void;
  className?: string;
}

export function LegalTableOfContents({
  sections,
  activeSectionId,
  onSelectSection,
  className,
}: LegalTableOfContentsProps) {
  return (
    <nav aria-label="Table of contents" className={cn('space-y-1', className)}>
      <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-3">
        Document Chapters
      </p>

      <div className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-hide pr-1">
        {sections.map((sec) => {
          const isActive = activeSectionId === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group',
                isActive
                  ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span
                  className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  )}
                >
                  {sec.chapterNumber}
                </span>
                <span className="truncate">{sec.title}</span>
              </div>
              <ChevronRight
                className={cn(
                  'w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0',
                  isActive ? 'opacity-100 text-white' : 'text-slate-400'
                )}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}