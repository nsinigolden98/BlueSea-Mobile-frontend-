import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ChevronRight, CheckCircle2 } from 'lucide-react';
import { PLACEHOLDER_COMPANIES } from './constants';
import { Company } from './types';
import { SharedPaymentModal } from './SharedPaymentModal';

export const BlueConnectPreview: React.FC = () => {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Interaction State
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Double list for infinite loop behavior
  const companies = [...PLACEHOLDER_COMPANIES, ...PLACEHOLDER_COMPANIES];

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    let animationFrameId: number;
    
    const autoScroll = () => {
      if (!isPaused && !isDragging && container) {
        container.scrollLeft += 0.6; // Slow, smooth auto scroll speed
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, isDragging]);

  // Touch / Drag event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <>
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                BlueConnect
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                <Zap className="w-2.5 h-2.5 fill-current" />
                Gateway
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pay trusted organizations through BlueConnect
            </p>
          </div>
          <button
            onClick={() => navigate('/blueconnect')}
            className="text-xs font-bold text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer flex items-center gap-0.5"
          >
            See All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* DRAGGABLE & AUTO-SCROLLING CAROUSEL */}
        <div className="relative overflow-hidden w-full rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/70 dark:border-white/5 py-3">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-100 dark:from-slate-900 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-100 dark:from-slate-900 to-transparent z-10" />

          <div
            ref={carouselRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={handleMouseLeaveOrUp}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseLeaveOrUp}
            onMouseMove={handleMouseMove}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="flex gap-3 px-3 overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing select-none"
          >
            {companies.map((company, index) => (
              <div
                key={`${company.id}-${index}`}
                onClick={() => !isDragging && setSelectedCompany(company)}
                className="w-48 shrink-0 p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-xl shadow-xs hover:border-sky-500/30 dark:hover:border-sky-400/30 transition-all cursor-pointer flex items-center gap-3"
              >
                <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center font-black text-xs border border-slate-100 dark:border-white/5 ${company.logoBg}`}>
                  {company.logoText}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                      {company.name}
                    </p>
                    {company.isVerified && (
                      <CheckCircle2 className="w-3 h-3 text-sky-500 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHARED PAYMENT MODAL INSTANCE */}
      {selectedCompany && (
        <SharedPaymentModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </>
  );
};