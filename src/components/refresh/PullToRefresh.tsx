import React, { useContext, type ReactNode } from 'react';
import { RefreshContext } from './RefreshContext';
import {Loader} from '@/components/ui-custom/Loader';

interface PullToRefreshProps {
  children: ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children }) => {
  const context = useContext(RefreshContext);

  if (!context) {
    throw new Error('PullToRefresh must be rendered within a RefreshProvider');
  }

  const { state } = context;
  const { pullDistance, isPulling } = state;

  // Calculate top offset (capped at 70px down from top)
  const topOffset = Math.min(pullDistance, 70);
  
  // Calculate opacity as user pulls down
  const opacity = Math.min(pullDistance / 25, 1);
  const showIndicator = isPulling || pullDistance > 0;

  return (
    <div className="relative w-full min-h-screen">
      {/* 
        1. FLOATING PULL INDICATOR 
        Only this element moves down from the top edge.
      */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        style={{
          transform: `translate3d(-50%, ${topOffset}px, 0)`,
          opacity: showIndicator ? opacity : 0,
          transition: isPulling
            ? 'none'
            : 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1), opacity 300ms ease',
        }}
      >
        <Loader />
      </div>

      {/* 
        2. PAGE CONTENT 
        Stays 100% stationary — no movement or shifting!
      */}
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
};
