import { useState } from 'react';
import type { LegalSectionData } from '@/types/legal';
import { LegalTableOfContents } from './LegalTableOfContents';
import { Button } from '@/components/ui/button';
import { List, X } from 'lucide-react';

interface LegalMobileNavigationProps {
  sections: LegalSectionData[];
  activeSectionId: string;
  onSelectSection: (id: string) => void;
}

export function LegalMobileNavigation({
  sections,
  activeSectionId,
  onSelectSection,
}: LegalMobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: string) => {
    onSelectSection(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Bottom Button for Mobile */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-sky-500 hover:bg-sky-600 text-white rounded-full p-3 h-12 w-12 shadow-xl shadow-sky-500/30 border border-sky-400/30 flex items-center justify-center"
          aria-label="Toggle Table of Contents"
        >
          <List className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl p-5 border-t border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                Table of Contents
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <LegalTableOfContents
                sections={sections}
                activeSectionId={activeSectionId}
                onSelectSection={handleSelect}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}