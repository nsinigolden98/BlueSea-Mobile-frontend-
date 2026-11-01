/**
 * BlueSea Mobile floating glass navigation styles.
 * Brand accent: BlueSea sky blue (#1DA1F2). No green states.
 */
const join = (...classes: string[]) => classes.join(' ');

export const navStyles = {
  wrapper: join(
    'fixed z-[100] left-1/2',
    'bottom-[calc(env(safe-area-inset-bottom,0px)+18px)]',
    '-translate-x-1/2 flex items-center gap-2',
    'max-w-[calc(100vw-16px)] select-none',
    'transition-[left,top,transform] duration-300 ease-out',
  ),

  positionedWrapper: 'translate-x-0',

  container: join(
    'flex items-center justify-between gap-0.5',
    'w-max max-w-[calc(100vw-54px)] min-h-[68px]',
    'rounded-full px-2 py-2',
    'border border-white/65',
    'bg-[rgba(244,250,255,0.76)]',
    'backdrop-blur-2xl [-webkit-backdrop-filter:blur(24px)]',
    'shadow-[0_8px_30px_rgba(29,161,242,0.16)]',
    'dark:border-white/15 dark:bg-[rgba(15,30,45,0.76)]',
    'dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]',
  ),

  link: join(
    'relative flex flex-1 flex-col items-center justify-center',
    'gap-1 min-w-[54px] min-h-[52px] px-1 rounded-full',
    'outline-none select-none transition-transform duration-200',
    'active:scale-[0.96]',
    'focus-visible:ring-2 focus-visible:ring-sky-500',
  ),

  activeLink: 'text-[#1DA1F2]',

  iconCircle: join(
    'flex items-center justify-center',
    'w-[42px] h-[42px] rounded-full border',
    'transition-[background-color,border-color,box-shadow,transform] duration-200',
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

  handle: join(
    'flex items-center justify-center shrink-0',
    'w-[30px] h-[30px] rounded-full border',
    'border-white/70 bg-[rgba(244,250,255,0.78)]',
    'text-[#1DA1F2] backdrop-blur-xl',
    'shadow-[0_3px_12px_rgba(29,161,242,0.14)]',
    'transition-all duration-200 touch-none',
    'cursor-pointer active:scale-90',
    'dark:border-white/15 dark:bg-[rgba(15,30,45,0.78)]',
  ),

  handleExpanded: 'w-[34px] h-[34px] bg-[#1DA1F2]/15',

  handleDragMode: join(
    'bg-[#1DA1F2]/20 border-[#1DA1F2]/45',
    'ring-2 ring-[#1DA1F2]/20 cursor-grab',
  ),

  handleIcon: 'w-4 h-4 shrink-0',

  tuckedWrapper: join(
    'left-auto right-0 top-1/2 bottom-auto',
    'translate-x-0 -translate-y-1/2 max-w-none',
  ),

  tuckedContent: join(
    'flex items-center gap-1 pl-2 pr-1 py-2',
    'rounded-l-full rounded-r-none border border-r-0',
    'border-white/65 bg-[rgba(244,250,255,0.80)]',
    'backdrop-blur-2xl [-webkit-backdrop-filter:blur(24px)]',
    'shadow-[-4px_0_24px_rgba(29,161,242,0.15)]',
    'dark:border-white/15 dark:bg-[rgba(15,30,45,0.82)]',
  ),

  tuckedHome: join(
    'flex items-center justify-center',
    'w-[44px] h-[44px] rounded-full',
    'bg-[#1DA1F2]/[0.14] text-[#1DA1F2]',
    'transition-transform duration-200 active:scale-90',
  ),

  homeIcon: 'w-[22px] h-[22px]',

  restoreButton: join(
    'flex items-center justify-center',
    'w-[28px] h-[40px] rounded-full',
    'text-[#1DA1F2] active:scale-90 transition-transform',
  ),

  draggingWrapper: 'scale-[1.02] opacity-95 transition-none',

  dragHint: join(
    'fixed z-[101] left-1/2',
    'bottom-[calc(env(safe-area-inset-bottom,0px)+96px)]',
    '-translate-x-1/2 whitespace-nowrap',
    'rounded-full border border-white/60',
    'bg-[rgba(244,250,255,0.86)] px-3 py-2',
    'text-[11px] font-medium text-sky-700',
    'backdrop-blur-xl shadow-lg',
    'dark:border-white/10 dark:bg-[rgba(15,30,45,0.86)]',
    'dark:text-sky-300',
  ),
};
