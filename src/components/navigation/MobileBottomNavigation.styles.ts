/**
 * BlueSea Mobile floating glass bottom navigation.
 * Brand accent: BlueSea sky blue (#1DA1F2).
 *
 * The dock uses a single translucent glass surface. Its perimeter highlight
 * is drawn with an SVG stroke so the animated light follows the pill shape
 * consistently in Android WebView without CSS mask/composite artifacts.
 */

const join = (...classes: string[]) => classes.join(' ');

export const navMotionStyles = `
  @keyframes blueSeaDrop {
    0% { transform: scale(0.86); }
    48% { transform: scale(1.13); }
    72% { transform: scale(0.97); }
    100% { transform: scale(1.06); }
  }

  .bluesea-nav-active-drop {
    animation: blueSeaDrop 560ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  @media (prefers-reduced-motion: reduce) {
    .bluesea-nav-active-drop {
      animation: none !important;
    }
  }
`;

export const navStyles = {
  wrapper: join(
    'fixed z-[100] isolate left-1/2 -translate-x-1/2',
    'bottom-[calc(env(safe-area-inset-bottom,0px)+12px)]',
    'flex items-center justify-between',
    'w-[calc(100vw-36px)] max-w-[460px]',
    'min-h-[76px] px-2.5 py-2',
    'rounded-full',
    'bg-[rgba(244,250,255,0.48)]',
    'backdrop-blur-2xl [-webkit-backdrop-filter:blur(24px)]',
    'shadow-[0_7px_26px_rgba(29,161,242,0.10)]',
    'select-none',
    'dark:bg-[rgba(15,30,45,0.52)]',
    'dark:shadow-[0_7px_26px_rgba(0,0,0,0.24)]',
    // Only navigation links sit above the animated SVG perimeter.
    '[&>a]:relative [&>a]:z-10',
  ),

  link: join(
    'flex flex-1 min-w-0 flex-col items-center justify-center',
    'gap-1 min-h-[58px] px-0.5 rounded-full',
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

  // Keep the existing water-drop click/selection animation unchanged.
  activeIconCircle: join(
    'bluesea-nav-active-drop scale-[1.06]',
    'bg-[#1DA1F2]/[0.19] border-[#1DA1F2]/40',
    'shadow-[0_0_16px_rgba(29,161,242,0.28),inset_0_0_8px_rgba(29,161,242,0.08)]',
  ),

  inactiveIconCircle: 'bg-transparent border-transparent',

  navIcon: 'w-[22px] h-[22px] shrink-0 transition-all duration-300',

  activeIcon: 'text-[#078FE0] dark:text-[#69C5FF]',

  inactiveIcon: 'text-slate-500 dark:text-slate-300',

  label: join(
    'text-[10px] font-medium leading-none whitespace-nowrap',
    'transition-colors duration-300',
  ),

  activeLabel: 'text-[#168FE0] dark:text-[#69C5FF] font-semibold',

  inactiveLabel: 'text-slate-600 dark:text-slate-300',
};
