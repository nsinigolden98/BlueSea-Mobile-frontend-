import React, { useMemo, useEffect, useState } from 'react';
import { getShuffledTickerData, TickerItem } from './ticker-data';
import { TICKER_CONFIG } from './ticker-config';

const LiveTicker: React.FC = () => {
  // Use state to handle shuffle only on client-side to prevent hydration mismatch
  const [shuffledItems, setShuffledItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    setShuffledItems(getShuffledTickerData());
  }, []);

  // Duplicate items for the infinite marquee effect
  const displayItems = useMemo(() => {
    if (shuffledItems.length === 0) return [];
    return [...shuffledItems, ...shuffledItems];
  }, [shuffledItems]);

  if (shuffledItems.length === 0) return <div className={`${TICKER_CONFIG.height.mobile} md:${TICKER_CONFIG.height.desktop}`} />;

  return (
    <div 
      role="complementary"
      aria-label="Live Activity Ticker"
      className={`relative w-full overflow-hidden select-none ${TICKER_CONFIG.containerClass} ${TICKER_CONFIG.height.mobile} md:${TICKER_CONFIG.height.desktop} ${TICKER_CONFIG.zIndex} flex items-center transition-all duration-300`}
    >
      {/* Left Edge Fade */}
      <div className={`absolute left-0 top-0 bottom-0 ${TICKER_CONFIG.edgeFadeWidth} z-10 bg-gradient-to-r ${TICKER_CONFIG.edgeFadeColor} to-transparent pointer-events-none`} />
      
      {/* Marquee Container */}
      <div 
        className={`flex items-center whitespace-nowrap animate-ticker-scroll hover:[animation-play-state:paused] ${TICKER_CONFIG.itemGap}`}
        style={{
          animationDuration: `${TICKER_CONFIG.speed}s`,
        }}
      >
        {displayItems.map((item, index) => (
          <TickerMessage key={`${item.id}-${index}`} item={item} />
        ))}
      </div>

      {/* Right Edge Fade */}
      <div className={`absolute right-0 top-0 bottom-0 ${TICKER_CONFIG.edgeFadeWidth} z-10 bg-gradient-to-l ${TICKER_CONFIG.edgeFadeColor} to-transparent pointer-events-none`} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker-scroll {
          animation: ticker-scroll linear infinite;
        }
      `}} />
    </div>
  );
};

const TickerMessage: React.FC<{ item: TickerItem }> = ({ item }) => {
  const Icon = item.icon;
  
  return (
    <div className="flex items-center gap-2.5 group cursor-default">
      {/* Icon with Glow Effect */}
      <div className="relative flex items-center justify-center">
        <Icon 
          size={14} 
          style={{ color: item.accentColor }} 
          className={`relative z-20 transition-transform group-hover:scale-110 duration-300 ${item.upcoming ? 'opacity-70' : 'opacity-100'}`}
        />
        {!item.upcoming && (
          <div 
            className="absolute inset-0 blur-[6px] opacity-20 group-hover:opacity-40 transition-opacity" 
            style={{ backgroundColor: item.accentColor }} 
          />
        )}
      </div>

      {/* Text Content */}
      <span className={`${TICKER_CONFIG.textClass} flex items-center gap-2`}>
        {item.text}
        {item.badge && (
          <span 
            className={`${TICKER_CONFIG.badgeClass} ${
              item.upcoming 
                ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700' 
                : 'bg-opacity-10 text-opacity-100'
            }`}
            style={!item.upcoming ? { 
              backgroundColor: `${item.accentColor}15`, 
              color: item.accentColor,
              border: `1px solid ${item.accentColor}30`
            } : {}}
          >
            {item.badge}
          </span>
        )}
      </span>
    </div>
  );
};

export default React.memo(LiveTicker);
