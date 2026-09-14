import type { LegalMetadata } from '@/types/legal';
import { LegalStatusBadge } from './LegalStatusBadge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText, Download, ShieldCheck, Share2 } from 'lucide-react';

interface LegalHeroProps {
  metadata: LegalMetadata;
  onDownloadPdf?: () => void;
  onShare?: () => void;
}

export function LegalHero({ metadata, onDownloadPdf, onShare }: LegalHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-6 md:p-10 text-white shadow-xl shadow-sky-950/20 border border-slate-800">
      {/* Background Decorative Accent */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <LegalStatusBadge status={metadata.status} />
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            v{metadata.version}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-300 backdrop-blur-md">
            {metadata.category}
          </span>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            {metadata.title}
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl">
            {metadata.shortDescription}
          </p>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-700/60 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Last Revised</p>
              <p className="font-medium text-white">{metadata.lastUpdated}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Effective Date</p>
              <p className="font-medium text-white">{metadata.effectiveDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300 col-span-2 sm:col-span-1">
            <Clock className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Read Time</p>
              <p className="font-medium text-white">{metadata.estimatedReadingTime}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {onDownloadPdf && (
            <Button
              onClick={onDownloadPdf}
              className="bg-sky-500 hover:bg-sky-600 text-white font-medium shadow-lg shadow-sky-500/25 transition-all rounded-xl text-xs sm:text-sm h-10 px-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Official Copy (PDF)
            </Button>
          )}

          {onShare && (
            <Button
              onClick={onShare}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl text-xs sm:text-sm h-10 px-4"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Document
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}