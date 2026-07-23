import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import { RefreshContext } from './RefreshContext';
import type { RefreshCallback, RefreshConfig, RefreshState } from './types';
import { DEFAULT_REFRESH_CONFIG } from './constants';
import { Loader } from '@/components/ui-custom/Loader';
import { queryClient } from '@/lib/queryClient';

interface RefreshProviderProps {
  children: ReactNode;
  config?: Partial<RefreshConfig>;
}

/**
 * Checks scroll position across window and any active nested scroll containers.
 */
const getScrollTop = (target?: EventTarget | null): number => {
  const winScroll =
    window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  if (winScroll > 0) return winScroll;

  let node = target as HTMLElement | null;
  while (node && node !== document.body && node !== document.documentElement) {
    if (node.scrollTop > 0) {
      return node.scrollTop;
    }
    node = node.parentElement;
  }
  return 0;
};

export const RefreshProvider: React.FC<RefreshProviderProps> = ({
  children,
  config: customConfig,
}) => {
  const { showLoader, hideLoader, LoaderComponent } = Loader();

  const mergedConfig = useMemo(
    () => ({ ...DEFAULT_REFRESH_CONFIG, ...customConfig }),
    [customConfig]
  );

  const [state, setState] = useState<RefreshState>({
    isRefreshing: false,
    isPulling: false,
    pullDistance: 0,
    canRefresh: false,
  });

  // Global key to force re-mounting of the active route's components on refresh
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const callbacksRef = useRef<Map<string, RefreshCallback>>(new Map());
  const isRefreshingRef = useRef<boolean>(false);
  const touchStartYRef = useRef<number>(0);

  const registerCallback = useCallback((id: string, callback: RefreshCallback) => {
    callbacksRef.current.set(id, callback);
  }, []);

  const unregisterCallback = useCallback((id: string) => {
    callbacksRef.current.delete(id);
  }, []);

  const triggerRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    showLoader();

    setState((prev) => ({
      ...prev,
      isRefreshing: true,
      isPulling: false,
      pullDistance: 0,
      canRefresh: false,
    }));

    try {
      // 1. Run any explicitly registered callbacks
      const activeCallbacks = Array.from(callbacksRef.current.values());
      const callbackPromises = activeCallbacks.map((cb) => Promise.resolve(cb()));

      // 2. Refetch active React Query subscriptions
      const queryPromise = queryClient
        .refetchQueries({ type: 'active' })
        .catch((err) => {
          console.error('[BlueSea RefreshProvider] Query refetch error:', err);
        });

      // 3. Dispatch global custom event for legacy/custom listeners
      window.dispatchEvent(new CustomEvent('app:refresh'));

      await Promise.all([...callbackPromises, queryPromise]);

      // 4. Increment key to force remount of active route (re-runs all page useEffects)
      setRefreshKey((prev) => prev + 1);

      // Brief delay to allow initial fetch promises to initialize
      await new Promise((resolve) => setTimeout(resolve, 400));
    } catch (error) {
      console.error('[BlueSea RefreshProvider] Error during refresh:', error);
    } finally {
      hideLoader();
      isRefreshingRef.current = false;
      setState((prev) => ({
        ...prev,
        isRefreshing: false,
        pullDistance: 0,
      }));
    }
  }, [showLoader, hideLoader]);

  useEffect(() => {
    let isTracking = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;
      const scrollTop = getScrollTop(e.target);

      if (scrollTop <= 0 && e.touches.length === 1) {
        touchStartYRef.current = e.touches[0].clientY;
        isTracking = true;
      } else {
        isTracking = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTracking || isRefreshingRef.current) return;

      const scrollTop = getScrollTop(e.target);
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartYRef.current;

      if (scrollTop > 0 || deltaY <= 0) {
        isTracking = false;
        setState((prev) =>
          prev.isPulling ? { ...prev, isPulling: false, pullDistance: 0 } : prev
        );
        return;
      }

      if (e.cancelable) {
        e.preventDefault();
      }

      const calculatedDistance = Math.min(
        deltaY / mergedConfig.gestureResistance,
        mergedConfig.maxPullDistance
      );

      const canRefresh = calculatedDistance >= mergedConfig.refreshThreshold;

      setState({
        isRefreshing: false,
        isPulling: true,
        pullDistance: calculatedDistance,
        canRefresh,
      });
    };

    const handleTouchEnd = () => {
      if (!isTracking || isRefreshingRef.current) return;
      isTracking = false;

      setState((prev) => {
        if (prev.canRefresh) {
          triggerRefresh();
        }
        return {
          ...prev,
          isPulling: false,
          pullDistance: 0,
          canRefresh: false,
        };
      });
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [mergedConfig, triggerRefresh]);

  const contextValue = useMemo(
    () => ({
      state,
      registerCallback,
      unregisterCallback,
      triggerRefresh,
    }),
    [state, registerCallback, unregisterCallback, triggerRefresh]
  );

  return (
    <RefreshContext.Provider value={contextValue}>
      <LoaderComponent />
      <div key={refreshKey} className="w-full min-h-screen">
        {children}
      </div>
    </RefreshContext.Provider>
  );
};
