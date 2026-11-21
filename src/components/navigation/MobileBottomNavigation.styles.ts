/**
 * BlueSea Mobile floating glass bottom navigation.
 * The dock is the only glass surface: the page around it remains transparent.
 */

const join = (...classes: string[]) => classes.join(' ');

export const navMotionStyles = `
  @keyframes blueSeaDrop {
    0% { transform: translateY(0) scale(0.94); }
    42% { transform: translateY(-10px) scale(1.14); }
    68% { transform: translateY(-5px) scale(1.08); }
    100% { transform: translateY(-6px) scale(1.08); }
  }

  .bluesea-nav-selected .bluesea-nav-active-drop {
    animation: blueSeaDrop 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .bluesea-nav-selected .bluesea-nav-active-drop {
    box-shadow:
      0 0 18px rgba(29,161,242,0.34),
      0 8px 18px rgba(29,161,242,0.16),
      inset 0 0 10px rgba(255,255,255,0.10);
  }

  .bluesea-nav-home:active {
    transform: scale(0.96);
  }

  @media (prefers-reduced-motion: reduce) {
    .bluesea-nav-selected .bluesea-nav-active-drop {
      animation: none !important;
    }
  }
`;

export const navStyles = {
  wrapper: join(
    'fixed z-[100] isolate left-1/2 -translate-x-1/2',
    'bottom-[calc(env(safe-area-inset-bottom,0px)+12px)]',
    'flex items-center justify-between',
    'w-[calc(100vw-28px)] max-w-[460px]',
    'min-h-[84px] px-2.5 py-2',
    'rounded-[30px]',
    'border border-white/[0.13]',
    'bg-[rgba(15,22,32,0.58)]',
    'backdrop-blur-2xl [-webkit-backdrop-filter:blur(24px)]',
    'shadow-[0_12px_34px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.08)]',
    'select-none',
    'dark:bg-[rgba(12,19,29,0.62)]',
    '[&>a]:relative [&>a]:z-10',
  ),

  link: join(
    'flex flex-1 min-w-0 flex-col items-center justify-center',
    'gap-1 min-h-[68px] px-0.5 rounded-2xl',
    'outline-none transition-[transform,color] duration-300',
    '[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
    'active:scale-[0.96]',
    'focus-visible:ring-2 focus-visible:ring-sky-500',
  ),

  activeLink: 'text-[#1DA1F2]',

  iconCircle: join(
    'flex items-center justify-center',
    'w-[42px] h-[42px] rounded-full border',
    'transition-[background-color,border-color,box-shadow,transform] duration-500',
    '[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
  ),

  activeIconCircle: join(
    'bluesea-nav-active-drop scale-[1.06]',
    'bg-[#1DA1F2]/[0.22] border-[#1DA1F2]/55',
  ),

  inactiveIconCircle: 'bg-transparent border-transparent',

  navIcon: 'w-[22px] h-[22px] shrink-0 transition-all duration-300',

  activeIcon: 'text-[#078FE0] dark:text-[#69C5FF]',

  inactiveIcon: 'text-slate-400 dark:text-slate-300',

  label: join(
    'text-[10px] font-medium leading-none whitespace-nowrap',
    'transition-colors duration-300',
  ),

  activeLabel: 'text-[#168FE0] dark:text-[#69C5FF] font-semibold',

  inactiveLabel: 'text-slate-300/75 dark:text-slate-300',
};
