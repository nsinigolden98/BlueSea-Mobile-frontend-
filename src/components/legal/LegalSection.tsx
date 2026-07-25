import { LegalSectionData } from '@/types/legal';
import { LegalCallout } from './LegalCallout';

interface LegalSectionProps {
  section: LegalSectionData;
}

export function LegalSection({ section }: LegalSectionProps) {
  return (
    <section
      id={section.id}
      className="scroll-mt-24 space-y-4 py-6 border-b border-slate-200/80 dark:border-slate-800/80 last:border-b-0"
    >
      {/* Chapter Title Block */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-500 font-bold flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-800/40 text-sm">
          {section.chapterNumber}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              {section.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Chapter Body Container */}
      <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-4 max-w-none">
        {section.body}
      </div>

      {/* Section Callouts */}
      {section.callouts && section.callouts.length > 0 && (
        <div className="space-y-3 pt-2">
          {section.callouts.map((c, i) => (
            <LegalCallout key={i} type={c.type} title={c.title}>
              {c.description}
            </LegalCallout>
          ))}
        </div>
      )}

      {/* Section Illustration */}
      {section.illustration && <div className="pt-2">{section.illustration}</div>}

      {/* Subsections if available */}
      {section.subSections && section.subSections.length > 0 && (
        <div className="space-y-4 pt-4 pl-4 border-l-2 border-slate-200 dark:border-slate-800 my-4">
          {section.subSections.map((sub) => (
            <div key={sub.id} id={sub.id} className="space-y-1.5 scroll-mt-24">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {sub.title}
              </h3>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {sub.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}