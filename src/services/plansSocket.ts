// Live data/cable plans over `/ws/plans/` (JWT in `?token=`).
// Keys: mtn, airtel, glo, 9mobile, dstv, gotv, startimes, showmax.
// `get_all` returns everything (`plans_all`); `get_plans {key}` refreshes
// one list (`plans`). Same auth semantics as the wallet socket.

import { ReconnectWS, toWebSocketBase, type CloseHandler } from './reconnectWs';
import { getSessionToken } from '@/lib/session';

export const PLAN_KEYS = [
  'mtn',
  'airtel',
  'glo',
  '9mobile',
  'dstv',
  'gotv',
  'startimes',
  'showmax',
] as const;

export type PlanKey = (typeof PLAN_KEYS)[number];

export interface PlanItem {
  [key: string]: unknown;
}

export type PlansMap = Partial<Record<PlanKey, PlanItem[]>>;

interface Handlers {
  onPlans: (plans: PlansMap) => void;
}

function extractList(message: any): PlanItem[] {
  const raw = message?.plans ?? message?.data ?? message?.products ?? message?.items;
  return Array.isArray(raw) ? (raw as PlanItem[]) : [];
}

export function createPlansSocket(
  base: string,
  handlers: Handlers,
  onCloseCode?: CloseHandler,
) {
  const socket = new ReconnectWS(
    () => {
      const token = getSessionToken() ?? '';
      return `${toWebSocketBase(base)}/ws/plans/?token=${encodeURIComponent(token)}`;
    },
    (message: any) => {
      console.log('[plans] rx:', message?.type, 'key=', message?.key, 'count=', extractList(message).length);
      if (message?.type === 'plans_all' && message?.plans && typeof message.plans === 'object') {
        const out: PlansMap = {};
        const shapes: Record<string, string> = {};
        for (const key of PLAN_KEYS) {
          const v: any = (message.plans as Record<string, unknown>)[key];
          shapes[key] = Array.isArray(v) ? `array(${v.length})` : typeof v;
          // Raw array (new backend) or envelope `{..., plans:[...]}` (old):
          // accept either so plans survive backend/frontend version skew.
          const list = Array.isArray(v) ? v : extractList(v);
          if (list.length > 0) out[key] = list as PlanItem[];
        }
        console.log('[plans] rx plans_all shapes:', shapes);
        handlers.onPlans(out);
        return;
      }
      if (message?.type === 'plans' && typeof message?.key === 'string') {
        const key = message.key as string;
        if ((PLAN_KEYS as readonly string[]).includes(key)) {
          handlers.onPlans({ [key]: extractList(message) } as PlansMap);
        }
      }
    },
    {
      label: 'Plans WebSocket',
      pingMs: 25_000,
      init: { type: 'get_all' },
      onCloseCode: (code, reason, wasClean) => {
        if (code === 4401) {
          console.warn('Plans WebSocket authentication expired (4401). Waiting for re-login.');
        }
        onCloseCode?.(code, reason, wasClean);
      },
    },
  );
  return {
    refresh: (key: PlanKey) => socket.send({ type: 'get_plans', key }),
    refreshAll: () => socket.send({ type: 'get_all' }),
    close: () => socket.close(),
  };
}
