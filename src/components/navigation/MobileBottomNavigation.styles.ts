// /src/components/navigation/MobileBottomNavigation.styles.ts

/**
 * Styling configurations for BlueSea Mobile Bottom Navigation.
 * Follows the existing design system guidelines, color palette, and layout requirements.
 */
export const navStyles = {
  // Mobile-only block layout that naturally flows with page content
  wrapper: "md:hidden w-full bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_12px_rgba(0,0,0,0.02)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.12)]",
  
  // Grid layout split into 5 equal segments to fit all primary pages on one row
  container: "grid grid-cols-5 h-[74px] w-full items-center px-1",
  
  // Navigation links - provides vertical centering & satisfies the 44px minimum target
  link: "flex flex-col items-center justify-center h-full w-full gap-1.5 transition-all duration-300 select-none relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
  
  // Icons styling mapping
  iconContainer: "relative flex items-center justify-center w-7 h-7 transition-all duration-300",
  activeIcon: "text-sky-500 dark:text-sky-400 scale-110 transition-transform duration-300 ease-out",
  inactiveIcon: "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-200",
  
  // Labels styling mapping
  label: "text-[11px] font-medium tracking-normal transition-all duration-300 text-center leading-none",
  activeLabel: "text-sky-500 dark:text-sky-400 font-bold",
  inactiveLabel: "text-slate-500 dark:text-slate-400",
  
  // Profile specific stylings
  avatarWrapper: "w-7 h-7 rounded-full overflow-hidden flex items-center justify-center border-2 transition-all duration-300 ease-out",
  activeAvatar: "border-sky-500 dark:border-sky-400 scale-110 shadow-sm",
  inactiveAvatar: "border-slate-200 dark:border-slate-700 scale-100",
  avatarInitials: "text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 w-full h-full flex items-center justify-center",
  
  // Active Indicator Dot (Subtle bottom bar/dot for native-app-like feel)
  indicator: "absolute bottom-1 w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 transition-all duration-300 scale-100 opacity-100 ease-out",
  hiddenIndicator: "absolute bottom-1 w-1.5 h-1.5 rounded-full bg-transparent scale-0 opacity-0 transition-all duration-200"
};
