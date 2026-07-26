import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LegalDocumentConfig } from '@/types/legal';

// Import Legal Subcomponents
import { LegalHero } from './LegalHero';
import { LegalOverviewCards } from './LegalOverviewCards';
import { LegalTableOfContents } from './LegalTableOfContents';
import { LegalReadingProgress } from './LegalReadingProgress';
import { LegalSection } from './LegalSection';
import { LegalMobileNavigation } from './LegalMobileNavigation';
import { LegalNextPreviousNavigation } from './LegalNextPreviousNavigation';
import { LegalScrollToTop } from './LegalScrollToTop';
import { LegalFooter } from './LegalFooter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface LegalDocumentTemplateProps {
  config: LegalDocumentConfig;
}

export function LegalDocumentTemplate({ config }: LegalDocumentTemplateProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    config.sections[0]?.id || ''
  );
  const [readingProgress, setReadingProgress] = useState(0);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll spy & reading progress tracker
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // Calculate scroll progress percentage
      const totalScroll = scrollHeight - clientHeight;
      const progress = totalScroll > 0 ? (scrollTop / totalScroll) * 100 : 0;
      setReadingProgress(progress);

      // Determine active section using section offsets
      for (let i = config.sections.length - 1; i >= 0; i--) {
        const sec = config.sections[i];
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop - container.offsetTop - 120;
          if (scrollTop >= top) {
            setActiveSectionId(sec.id);
            break;
          }
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [config.sections]);

  const handleSelectSection = (id: string) => {
    setActiveSectionId(id);
    const element = document.getElementById(id);
    const container = scrollContainerRef.current;
    if (element && container) {
      const top = element.offsetTop - container.offsetTop - 100;
      container.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleScrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      {/* Main Viewport */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Scrollable Document Workspace */}
        <main
          ref={scrollContainerRef}
          className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide z-10 scroll-smooth"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Top Return Button */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/legal')}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Legal Center
              </Button>

              <LegalScrollToTop onClick={handleScrollToTop} />
            </div>

            {/* Hero Section */}
            <LegalHero metadata={config.metadata} />

            {/* Key Metrics / Overview */}
            <LegalOverviewCards
              metadata={config.metadata}
              totalSectionsCount={config.sections.length}
            />

            {/* Desktop Layout Grid (TOC Sidebar + Main Article Content) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-4">
              {/* Sticky TOC Sidebar (Desktop) */}
              <aside className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-6 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <LegalReadingProgress progress={readingProgress} variant="vertical" className="h-6" />
                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {Math.round(readingProgress)}% Read
                    </p>
                  </div>

                  <LegalTableOfContents
                    sections={config.sections}
                    activeSectionId={activeSectionId}
                    onSelectSection={handleSelectSection}
                  />
                </div>
              </aside>

              {/* Document Main Content Viewport */}
              <article className="md:col-span-8 lg:col-span-9 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 min-w-0">
                {config.sections.map((section) => (
                  <LegalSection key={section.id} section={section} />
                ))}

                {/* Next/Previous Pagination Navigation */}
                <LegalNextPreviousNavigation
                  previousDoc={config.previousDoc}
                  nextDoc={config.nextDoc}
                />
              </article>
            </div>

            {/* Dedicated Legal Footer */}
            <LegalFooter />
          </div>
        </main>
      </div>

      {/* Mobile Drawer Trigger for TOC */}
      <LegalMobileNavigation
        sections={config.sections}
        activeSectionId={activeSectionId}
        onSelectSection={handleSelectSection}
      />
    </div>
  );
}