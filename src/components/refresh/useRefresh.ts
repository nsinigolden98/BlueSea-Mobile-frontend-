import { useContext, useEffect, useId, useRef } from 'react';
import { RefreshContext } from './RefreshContext';
import { RefreshCallback } from './types';

/**
 * Hook to register page-level refresh callbacks or trigger programmatic refresh.
 * @param onRefresh Optional async callback function executed when pull-to-refresh occurs.
 */
export function useRefresh(onRefresh?: RefreshCallback) {
  const context = useContext(RefreshContext);
  const id = useId();
  const callbackRef = useRef<RefreshCallback | undefined>(onRefresh);

  useEffect(() => {
    callbackRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!context || !callbackRef.current) return;

    const currentCallback: RefreshCallback = () => {
      if (callbackRef.current) {
        return callbackRef.current();
      }
    };

    context.registerCallback(id, currentCallback);

    return () => {
      context.unregisterCallback(id);
    };
  }, [context, id]);

  if (!context) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }

  return {
    isRefreshing: context.state.isRefreshing,
    triggerRefresh: context.triggerRefresh,
  };
}