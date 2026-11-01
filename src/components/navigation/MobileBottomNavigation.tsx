import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import {
  Home,
  Gift,
  Store,
  Settings,
  ChevronLeft,
  ChevronRight,
  Grip,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { navStyles } from './MobileBottomNavigation.styles';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

interface DockPosition {
  left: number;
  top: number;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'home', label: 'Home', path: '/dashboard', icon: Home },
  { id: 'rewards', label: 'Rewards', path: '/rewards', icon: Gift },
  { id: 'tickets', label: 'BlueTickets', path: '/marketplace', icon: Store },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
];

const POSITION_STORAGE_KEY = 'bluesea-mobile-nav-position';
const DOUBLE_TAP_WINDOW_MS = 320;
const EDGE_TUCK_DISTANCE = 34;
const VIEWPORT_GUTTER = 8;

function isItemActive(pathname: string, itemPath: string): boolean {
  if (itemPath === '/dashboard') {
    return pathname === '/' || pathname === '/dashboard' ||
      pathname.startsWith('/dashboard/');
  }

  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

function readSavedPosition(): DockPosition | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(POSITION_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'left' in parsed &&
      'top' in parsed &&
      typeof parsed.left === 'number' &&
      typeof parsed.top === 'number' &&
      Number.isFinite(parsed.left) &&
      Number.isFinite(parsed.top)
    ) {
      return { left: parsed.left, top: parsed.top };
    }
  } catch {
    // Storage may be unavailable; the dock still works with its default position.
  }

  return null;
}

export function MobileBottomNavigation() {
  const location = useLocation();
  const dockRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const lastHandleTapRef = useRef(0);
  const dragOriginRef = useRef<DockPosition>({ left: 0, top: 0 });
  const activePointerRef = useRef<number | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const movedDuringDragRef = useRef(false);

  const [position, setPosition] = useState<DockPosition | null>(() => readSavedPosition());
  const [dragMode, setDragMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTucked, setIsTucked] = useState(false);
  const [handleExpanded, setHandleExpanded] = useState(false);

  useEffect(() => {
    if (!position || isTucked) return;

    try {
      window.localStorage.setItem(
        POSITION_STORAGE_KEY,
        JSON.stringify(position),
      );
    } catch {
      // Ignore storage restrictions without affecting navigation.
    }
  }, [position, isTucked]);

  const stopDrag = useCallback(() => {
    activePointerRef.current = null;
    setIsDragging(false);
    setDragMode(false);

    const dock = dockRef.current;
    if (!dock) return;

    const rect = dock.getBoundingClientRect();
    if (window.innerWidth - rect.right <= EDGE_TUCK_DISTANCE) {
      setIsTucked(true);
    }
  }, []);

  const onHandleClick = useCallback(() => {
    const now = Date.now();
    const isDoubleTap =
      lastHandleTapRef.current > 0 &&
      now - lastHandleTapRef.current <= DOUBLE_TAP_WINDOW_MS;

    lastHandleTapRef.current = isDoubleTap ? 0 : now;
    setHandleExpanded(true);

    if (isDoubleTap) {
      setDragMode((current) => !current);
    }
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!dragMode || isTucked || !dockRef.current) return;

      const rect = dockRef.current.getBoundingClientRect();
      activePointerRef.current = event.pointerId;
      movedDuringDragRef.current = false;
      dragOriginRef.current = {
        left: rect.left,
        top: rect.top,
      };

      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
    },
    [dragMode, isTucked],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (
        !isDragging ||
        activePointerRef.current !== event.pointerId ||
        !dockRef.current
      ) {
        return;
      }

      const deltaX = event.clientX - dragOriginRef.current.left -
        (dragOriginRef.current.left === 0 ? 0 : 0);
      const deltaY = event.clientY - dragOriginRef.current.top -
        (dragOriginRef.current.top === 0 ? 0 : 0);

      // The pointer's initial position is stored separately so dragging remains
      // stable regardless of where the user touches the handle.
      const rect = dockRef.current.getBoundingClientRect();
      const start = pointerStartRef.current;
      if (!start) return;

      const nextLeft = Math.max(
        VIEWPORT_GUTTER,
        Math.min(
          window.innerWidth - rect.width - VIEWPORT_GUTTER,
          dragOriginRef.current.left + (event.clientX - start.x),
        ),
      );
      const nextTop = Math.max(
        VIEWPORT_GUTTER,
        Math.min(
          window.innerHeight - rect.height - VIEWPORT_GUTTER,
          dragOriginRef.current.top + (event.clientY - start.y),
        ),
      );

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        movedDuringDragRef.current = true;
      }

      setPosition({ left: nextLeft, top: nextTop });
    },
    [isDragging],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (activePointerRef.current !== event.pointerId) return;

      try {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Pointer capture may already have been released by the browser.
      }

      stopDrag();
    },
    [stopDrag],
  );

  const restoreDock = useCallback(() => {
    setIsTucked(false);
    setDragMode(false);
    setHandleExpanded(false);
  }, []);

  useEffect(() => {
    if (!dragMode) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDragMode(false);
        setIsDragging(false);
        activePointerRef.current = null;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dragMode]);

  useEffect(() => {
    const onResize = () => {
      if (!position || isTucked || !dockRef.current) return;

      const rect = dockRef.current.getBoundingClientRect();
      setPosition({
        left: Math.max(
          VIEWPORT_GUTTER,
          Math.min(position.left, window.innerWidth - rect.width - VIEWPORT_GUTTER),
        ),
        top: Math.max(
          VIEWPORT_GUTTER,
          Math.min(position.top, window.innerHeight - rect.height - VIEWPORT_GUTTER),
        ),
      });
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [position, isTucked]);

  if (!Capacitor.isNativePlatform()) return null;

  const dockStyle: CSSProperties = isTucked
    ? {
        left: 'auto',
        right: 0,
        top: '50%',
        bottom: 'auto',
        transform: 'translateY(-50%)',
      }
    : position
      ? {
          left: `${position.left}px`,
          top: `${position.top}px`,
          right: 'auto',
          bottom: 'auto',
          transform: 'none',
        }
      : {};

  return (
    <>
      <div
        ref={dockRef}
        className={cn(
          navStyles.wrapper,
          position && !isTucked && navStyles.positionedWrapper,
          isTucked && navStyles.tuckedWrapper,
          isDragging && navStyles.draggingWrapper,
        )}
        style={dockStyle}
        aria-label="BlueSea Mobile navigation"
      >
        {!isTucked && (
          <button
            ref={handleRef}
            type="button"
            className={cn(
              navStyles.handle,
              handleExpanded && navStyles.handleExpanded,
              dragMode && navStyles.handleDragMode,
            )}
            aria-label={
              dragMode
                ? 'Drag navigation dock'
                : 'Double-tap to move navigation dock'
            }
            aria-pressed={dragMode}
            title={dragMode ? 'Drag to reposition' : 'Double-tap to move'}
            onClick={onHandleClick}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {dragMode ? (
              <Grip className={navStyles.handleIcon} aria-hidden />
            ) : handleExpanded ? (
              <ChevronLeft className={navStyles.handleIcon} aria-hidden />
            ) : (
              <ChevronRight className={navStyles.handleIcon} aria-hidden />
            )}
          </button>
        )}

        {isTucked ? (
          <div className={navStyles.tuckedContent}>
            <NavLink
              to="/dashboard"
              aria-label="Go to Home"
              className={navStyles.tuckedHome}
            >
              <Home className={navStyles.homeIcon} aria-hidden />
            </NavLink>
            <button
              type="button"
              onClick={restoreDock}
              className={navStyles.restoreButton}
              aria-label="Expand navigation"
              title="Expand navigation"
            >
              <ChevronLeft className={navStyles.handleIcon} aria-hidden />
            </button>
          </div>
        ) : (
          <nav className={navStyles.container} aria-label="Primary">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(location.pathname, item.path);

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  title={item.label}
                  className={({ isActive }) =>
                    cn(
                      navStyles.link,
                      (active || isActive) && navStyles.activeLink,
                    )
                  }
                >
                  <span
                    className={cn(
                      navStyles.iconCircle,
                      active
                        ? navStyles.activeIconCircle
                        : navStyles.inactiveIconCircle,
                    )}
                  >
                    <Icon
                      className={cn(
                        navStyles.navIcon,
                        active
                          ? navStyles.activeIcon
                          : navStyles.inactiveIcon,
                      )}
                      aria-hidden
                    />
                  </span>
                  <span
                    className={cn(
                      navStyles.label,
                      active ? navStyles.activeLabel : navStyles.inactiveLabel,
                    )}
                  >
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        )}
      </div>

      {dragMode && !isTucked && (
        <div className={navStyles.dragHint} role="status">
          Drag the handle to reposition · Tap the handle to finish
        </div>
      )}
    </>
  );
}
