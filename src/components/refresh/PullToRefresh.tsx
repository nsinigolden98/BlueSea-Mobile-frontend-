import React, { useContext, ReactNode } from 'react';
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
  const { pullDistance, isPulling } = state;

  return (
    <div
      className="bluesea-pull-content"
      style={{
        transform: `translate3d(0, ${pullDistance}px, 0)`,
        transition: isPulling ? 'none' : 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
};