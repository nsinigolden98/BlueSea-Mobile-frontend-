/**
 * BlueSea Mobile floating glass bottom navigation.
 * Brand accent: BlueSea sky blue (#1DA1F2).
 * Responsive width and safe-area spacing; no drag/arrow controls.
 */

const join = (...classes: string[]) => classes.join(' ');

export const navStyles = {
  wrapper: join(
    'fixed z-[100] left-1/2 -translate-x-1/2',
    'bottom-[calc(env(safe-area-inset-bottom,0px)+12px)]',
    'flex items-center justify-between',
    'w-[calc(100vw-24px)] max-w-[460px]',
    'min-h-[72px] px-2 py-2',
    'rounded-full border border-white/65',
    'bg-[rgba(244,250,255,0.78)]',
    'backdrop-blur-2xl [-webkit-backdrop-filter:blur(24px)]',
    'shadow-[0_8px_30px_rgba(29,161,242,0.16)]',
    'select-none',
    'dark:border-white/15 dark:bg-[rgba(15,30,45,0.78)]',
    'dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]',
  ),

  link: join(
    'flex flex-1 min-w-0 flex-col items-center justify-center',
    'gap-1 min-h-[56px] px-0.5 rounded-full',
    'outline-none transition-transform duration-200',
    'active:scale-[0.96]',
    'focus-visible:ring-2 focus-visible:ring-sky-500',
  ),

  activeLink: 'text-[#1DA1F2]',

  iconCircle: join(
    'flex items-center justify-center',
    'w-[42px] h-[42px] rounded-full border',
    'transition-[background-color,border-color,box-shadow] duration-200',
  ),

  activeIconCircle: join(
    'bg-[#1DA1F2]/[0.16] border-[#1DA1F2]/25',
    'shadow-[0_0_14px_rgba(29,161,242,0.16)]',
  ),

  inactiveIconCircle: 'bg-transparent border-transparent',

  navIcon: 'w-[22px] h-[22px] shrink-0',

  activeIcon: 'text-[#1DA1F2]',

  inactiveIcon: 'text-slate-500 dark:text-slate-300',

  label: join(
    'text-[10px] font-medium leading-none whitespace-nowrap',
    'transition-colors duration-200',
  ),

  activeLabel: 'text-[#168FE0] dark:text-[#55B8FF] font-semibold',

  inactiveLabel: 'text-slate-600 dark:text-slate-300',
};
