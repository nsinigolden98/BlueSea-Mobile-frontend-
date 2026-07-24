import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck, ChevronRight } from 'lucide-react';
import { FEATURED_COMPANIES } from '@/constants/blueconnect';
import type { Company } from '@/types/blueconnect';

export const BlueConnectPreview: React.FC = () => {
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef(false);

  // Exactly seven placeholder companies
  const previewCompanies: Company[] = FEATURED_COMPANIES.slice(0, 7);

  // Smooth infinite auto-scroll logic with interaction listeners
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    let animationFrameId: number;

    const scroll = () => {
      if (!isPaused && !isInteracting.current && container) {
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += 0.8;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-[2rem] p-5 shadow-xs transition-all duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500 rounded-xl shadow-md shadow-sky-500/20 text-white">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                BlueSea Connect
              </h3>
              <span className="bg-sky-500/10 text-sky-500 text-[9px] font-black px-2 py-0.5 rounded-md">
                DIRECT
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Private gateway for verified partner settlements
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/blueconnect')}
          className="flex items-center gap-1 text-[11px] font-bold text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer"
        >
          <span>See All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Infinite Scrollable Carousel Container */}
      <div
        ref={carouselRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          isInteracting.current = false;
        }}
        onTouchStart={() => {
          isInteracting.current = true;
          setIsPaused(true);
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            isInteracting.current = false;
            setIsPaused(false);
          }, 1000);
        }}
        onMouseDown={() => {
          isInteracting.current = true;
          setIsPaused(true);
        }}
        onMouseUp={() => {
          setTimeout(() => {
            isInteracting.current = false;
            setIsPaused(false);
          }, 1000);
        }}
        className="flex gap-3 overflow-x-auto scrollbar-none py-1.5 cursor-grab active:cursor-grabbing select-none"
      >
        {/* Double array duplicate for continuous seamless loop */}
        {[...previewCompanies, ...previewCompanies].map((company, index) => (
          <div
            key={`${company.id}-${index}`}
            onClick={() => navigate('/blueconnect')}
            className="flex-shrink-0 w-36 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 hover:border-sky-500/40 rounded-2xl p-3.5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md cursor-pointer group active:scale-95"
          >
            <div className="relative mb-2.5">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 p-1.5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      company.name
                    )}&background=0284c7&color=fff`;
                  }}
                />
              </div>
              {company.verified && (
                <div className="absolute -bottom-1 -right-1 bg-sky-500 rounded-full p-0.5 border-2 border-slate-50 dark:border-slate-800">
                  <ShieldCheck className="w-3 h-3 text-white fill-sky-500" />
                </div>
              )}
            </div>

            <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate w-full group-hover:text-sky-500 transition-colors">
              {company.name}
            </p>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
              Verified
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};