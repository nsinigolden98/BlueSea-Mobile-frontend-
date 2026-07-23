import React, { useContext, type ReactNode } from 'react';
import { RefreshContext } from './RefreshContext';

interface PullToRefreshProps {
  children: ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children }) => {
  const context = useContext(RefreshContext);

  if (!context) {
    throw new Error('PullToRefresh must be rendered within a RefreshProvider');
  }

  const { state } = context;
  const { pullDistance, isPulling, canRefresh } = state;

  // Calculate rotation angle matching finger pull (0 to 360 degrees)
  const rotation = Math.min((pullDistance / 80) * 360, 360);

  // Calculate opacity as user pulls down
  const opacity = Math.min(pullDistance / 25, 1);
  const showIndicator = isPulling || pullDistance > 0;

  // Translate down from outside top edge (-48px starting position off-screen)
  const translateY = pullDistance - 48;

  return (
    <div className="relative w-full min-h-screen">
      {/* 
        1. FLOATING PULL INDICATOR 
        Begins outside the viewport top edge and slides downward seamlessly.
      */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        style={{
          transform: `translate3d(-50%, ${translateY}px, 0)`,
          opacity: showIndicator ? opacity : 0,
          transition: isPulling
            ? 'none'
            : 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1), opacity 300ms ease',
        }}
      >
        <div
          className={`flex items-center justify-center w-11 h-11 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg border transition-all duration-200 ${
            canRefresh
              ? 'border-sky-400 ring-4 ring-sky-400/20 scale-110 text-sky-400'
              : 'border-gray-200 dark:border-gray-800 scale-100 text-sky-500'
          }`}
        >
          {/* Rotating Spinner Arrow */}
          <svg
            className="w-5 h-5 transition-transform duration-75"
            style={{ transform: `rotate(${rotation}deg)` }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
      </div>

      {/* 
        2. PAGE CONTENT 
        Stays 100% stationary — no layout shift or jumping!
      */}
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
};
