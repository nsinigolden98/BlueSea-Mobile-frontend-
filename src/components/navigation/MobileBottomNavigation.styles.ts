/**
 * BlueSea Mobile floating glass bottom navigation.
 * Brand accent: BlueSea sky blue (#1DA1F2).
 *
 * The dock keeps its existing floating position and content spacing.
 * Its former static outer border is replaced by a fine animated orbital
 * highlight. The glass surface remains translucent so scrolling content
 * can softly show through it in both themes.
 */

const join = (...classes: string[]) => classes.join(' ');

export const navMotionStyles = `
  @keyframes blueSeaOrbit {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes blueSeaDrop {
    0% { transform: scale(0.86); }
    48% { transform: scale(1.13); }
    72% { transform: scale(0.97); }
    100% { transform: scale(1.06); }
  }

  .bluesea-nav-orbit::before {
    content: "";
    position: absolute;
    inset: -1px;
    z-index: 0;
    padding: 1px;
    border-radius: 9999px;
    pointer-events: none;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      transparent 245deg,
      rgba(29, 161, 242, 0.10) 278deg,
      #1DA1F2 318deg,
      #8BD8FF 338deg,
      transparent 360deg
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: blueSeaOrbit 6s linear infinite;
  }

  .bluesea-nav-active-drop {
    animation: blueSeaDrop 560ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  @media (prefers-reduced-motion: reduce) {
    .bluesea-nav-orbit::before,
    .bluesea-nav-active-drop {
      animation: none !important;
    }
  }
`;

export const navStyles = {
  wrapper: join(
    'bluesea-nav-orbit',
    'fixed z-[100] isolate left-1/2 -translate-x-1/2',
    'bottom-[calc(env(safe-area-inset-bottom,0px)+12px)]',
    'flex items-center justify-between',
    'w-[calc(100vw-24px)] max-w-[460px]',
    'min-h-[72px] px-2 py-2',
    'rounded-full',
    'bg-[rgba(244,250,255,0.56)]',
    'backdrop-blur-2xl [-webkit-backdrop-filter:blur(24px)]',
    'shadow-[0_7px_26px_rgba(29,161,242,0.11)]',
    'select-none',
    'dark:bg-[rgba(15,30,45,0.58)]',
    'dark:shadow-[0_7px_26px_rgba(0,0,0,0.24)]',
    // Fine orbital stroke; no second solid container or static outer edge.
    // Keep dock contents above the animated perimeter.
    '[&>*]:relative [&>*]:z-10',
  ),

  link: join(
    'flex flex-1 min-w-0 flex-col items-center justify-center',
    'gap-1 min-h-[56px] px-0.5 rounded-full',
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
