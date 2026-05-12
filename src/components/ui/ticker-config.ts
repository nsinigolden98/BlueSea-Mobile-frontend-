export const TICKER_CONFIG = {
  // Animation settings
  speed: 45, // Seconds for one full rotation
  pauseOnHover: true,
  
  // Dimensions
  height: {
    mobile: 'h-9',
    desktop: 'h-10',
  },
  
  // Visuals
  containerClass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50',
  textClass: 'text-[11px] md:text-xs font-medium tracking-tight text-slate-600 dark:text-slate-300',
  badgeClass: 'px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider',
  
  // Gradients for the edge fade effect
  edgeFadeWidth: 'w-16 md:w-32',
  edgeFadeColor: 'from-white dark:from-slate-950',
  
  // Spacing
  itemGap: 'gap-12 md:gap-20',
  
  // Z-index should be just below the main navigation/header dropdowns
  zIndex: 'z-[40]',
};
