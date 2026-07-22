import React, { useContext, ReactNode } from 'react';
import { RefreshContext } from './RefreshContext';
import { AuthLoader } from '@/components/ui-custom'; // Uses your official Loader component

interface PullToRefreshProps {
  children: ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children }) => {
  const context = useContext(RefreshContext);

  if (!context) {
    throw new Error('PullToRefresh must be rendered within a RefreshProvider');
  }

  const { state } = context;
  const { pullDistance, isPulling, isRefreshing } = state;

  // Calculate sliding position for your Loader:
  // - While pulling: slides down smoothly based on swipe distance
  // - While refreshing: holds steady near the top
  const translateY = isRefreshing ? 20 : Math.min(pullDistance, 70);
  const opacity = isRefreshing ? 1 : Math.min(pullDistance / 30, 1);
  const isVisible = isRefreshing || isPulling || pullDistance > 0;

  return (
    <div className="relative w-full min-h-screen">
      {/* 
        1. OFFICIAL LOADER CONTAINER
        Renders your imported AuthLoader and slides it down/up from the top edge.
      */}
      {isVisible && (
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
          style={{
            transform: `translate3d(-50%, ${translateY - 80}px, 0)`,
            opacity: opacity,
            transition: isPulling
              ? 'none'
              : 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1), opacity 300ms ease',
          }}
        >
          <AuthLoader />
        </div>
      )}

      {/* 
        2. STATIONARY PAGE CONTENT
        Your page stays 100% still with no movement or dark background shift.
      */}
      <div className="w-full min-h-screen">{children}</div>
    </div>
  );
};
