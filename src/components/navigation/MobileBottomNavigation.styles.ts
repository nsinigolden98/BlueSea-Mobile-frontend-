/**
 * Styling configurations for BlueSea Mobile Bottom Navigation.
 * Follows the existing design system guidelines, color palette, and layout requirements.
 */
export const navStyles = {
  // Mobile-only block layout that naturally flows with page content
  wrapper: "md:hidden w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300 pb-safe",
  
  // Grid layout split into equal segments for each primary page
  container: "grid grid-cols-4 h-16 w-full items-center px-2",
  
  // Navigation links
  link: "flex flex-col items-center justify-center h-full w-full gap-1 transition-all duration-200 select-none relative",
  
  // Icons styling mapping
  iconContainer: "relative flex items-center justify-center w-6 h-6 transition-all duration-300",
  activeIcon: "text-sky-500 dark:text-sky-400 scale-110",
  inactiveIcon: "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300",
  
  // Labels styling mapping
  label: "text-[10px] font-semibold tracking-wide transition-all duration-200",
  activeLabel: "text-sky-500 dark:text-sky-400 font-bold",
  inactiveLabel: "text-slate-500 dark:text-slate-400",
  
  // Profile specific stylings
  avatarWrapper: "w-6 h-6 rounded-full overflow-hidden flex items-center justify-center border-2 transition-all duration-200",
  activeAvatar: "border-sky-500 dark:border-sky-400 scale-110 shadow-sm",
  inactiveAvatar: "border-slate-200 dark:border-slate-700 scale-100",
  avatarInitials: "text-[9px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 w-full h-full flex items-center justify-center",
  
  // Active Indicator Dot (Subtle bottom bar/dot for native-app-like feel)
  indicator: "absolute bottom-1 w-1 h-1 rounded-full bg-sky-500 dark:bg-sky-400 transition-all duration-300 scale-100 opacity-100",
  hiddenIndicator: "absolute bottom-1 w-1 h-1 rounded-full bg-transparent scale-0 opacity-0"
};
