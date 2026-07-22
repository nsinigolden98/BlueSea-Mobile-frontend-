import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import { RefreshContext } from './RefreshContext';
import type {
  RefreshCallback,
  RefreshConfig,
  RefreshState,
  RefreshContextType,
} from './types';
import { DEFAULT_REFRESH_CONFIG } from './constants';
import {Loader} from '../../components/ui-custom'

interface RefreshProviderProps {
  children: ReactNode;
  config?: Partial<RefreshConfig>;
}

export const RefreshProvider: React.FC<RefreshProviderProps> = ({
  children,
  config: customConfig,
}) => {
  const mergedConfig = useMemo(
    () => ({ ...DEFAULT_REFRESH_CONFIG, ...customConfig }),
    [customConfig]
  );

  const { showLoader, hideLoader, LoaderComponent } = Loader();

  const [state, setState] = useState<RefreshState>({
    isRefreshing: false,
    isPulling: false,
    pullDistance: 0,
    canRefresh: false,
  });

  const callbacksRef = useRef<Map<string, RefreshCallback>>(new Map());
  const isRefreshingRef = useRef<boolean>(false);
  const touchStartYRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Register & Unregister Page Callbacks
  const registerCallback = useCallback((id: string, callback: RefreshCallback) => {
    callbacksRef.current.set(id, callback);
  }, []);

  const unregisterCallback = useCallback((id: string) => {
    callbacksRef.current.delete(id);
  }, []);

  // Execute Refresh
  const triggerRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    setState((prev) => ({
      ...prev,
      isRefreshing: true,
      isPulling: false,
      pullDistance: 0,
      canRefresh: false,
    }));

    showLoader();

    try {
      const activeCallbacks = Array.from(callbacksRef.current.values());
      if (activeCallbacks.length > 0) {
        await Promise.all(activeCallbacks.map((cb) => Promise.resolve(cb())));
      }
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

  // Touch Gesture Listeners
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let isTracking = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      if (scrollTop <= 0 && e.touches.length === 1) {
        touchStartYRef.current = e.touches[0].clientY;
        isTracking = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTracking || isRefreshingRef.current) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartYRef.current;

      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;

      if (deltaY > 0 && scrollTop <= 0) {
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
      } else {
        isTracking = false;
        setState((prev) => ({ ...prev, isPulling: false, pullDistance: 0 }));
      }
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

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [mergedConfig, triggerRefresh]);

  const contextValue = useMemo<RefreshContextType>(
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
      <div ref={containerRef} className="bluesea-refresh-wrapper">
        {children}
        <LoaderComponent />
      </div>
    </RefreshContext.Provider>
  );
};