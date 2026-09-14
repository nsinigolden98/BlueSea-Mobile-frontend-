export type RefreshCallback = () => Promise<void> | void;

export interface RefreshConfig {
  /** Distance in pixels required to trigger refresh. Default: 80 */
  refreshThreshold: number;
  /** Maximum downward pull distance in pixels. Default: 120 */
  maxPullDistance: number;
  /** Resistance divisor for pulling feel. Default: 2.5 */
  gestureResistance: number;
  /** Duration in ms for resting return animation. Default: 300 */
  animationDuration: number;
}

export interface RefreshState {
  isRefreshing: boolean;
  isPulling: boolean;
  pullDistance: number;
  canRefresh: boolean;
}

export interface RefreshContextType {
  state: RefreshState;
  registerCallback: (id: string, callback: RefreshCallback) => void;
  unregisterCallback: (id: string) => void;
  triggerRefresh: () => Promise<void>;
}