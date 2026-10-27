// Live plans from `/ws/plans/` with local caching. Replaces the old
// hardcoded dicts (stale VTpass-era prices/codes): when the socket has no
// data the hook reports `unavailable` instead of inventing prices.

import { useEffect, useState } from 'react';
import type { Network } from '@/types';
import { API_BASE } from '@/types';
import { createPlansSocket, PLAN_KEYS, type PlanKey, type PlanItem, type PlansMap } from '@/services/plansSocket';
import { refreshAccessToken } from '@/lib/session';
import { getSessionToken } from '@/lib/session';

export type { PlanKey, PlanItem, PlansMap };
export { PLAN_KEYS };

export interface PlansState {
  plans: PlansMap;
  /** True once at least one list arrived (or the socket settled empty). */
  ready: boolean;
  /** True when the socket holds no usable data (auth/offline/empty cache). */
  unavailable: boolean;
}

const cache: PlansMap = {};
let listeners = new Set<(s: PlansState) => void>();
let socketStarted = false;
let socketHandle: { close: () => void } | null = null;
let current: PlansState = { plans: {}, ready: false, unavailable: false };

function emit(partial: Partial<PlansState>) {
  current = { ...current, ...partial };
  listeners.forEach((fn) => fn(current));
}

let authFailureTimes: number[] = [];

async function restartAfterRefresh() {
  // 4401: rotate, then restart the module socket with the fresh token.
  // Give up after rapid repeated rejections instead of spinning.
  if (await refreshAccessToken(API_BASE)) {
    const now = Date.now();
    authFailureTimes = [...authFailureTimes.filter((t) => now - t < 30_000), now];
    if (authFailureTimes.length >= 3) {
      console.warn('Plans WebSocket authentication repeatedly rejected. Stopping reconnects; re-login required.');
      return;
    }
    socketStarted = false;
    ensureSocket();
  }
}

function ensureSocket() {
  if (socketStarted) return;
  if (!API_BASE) return;
  // Never open with an empty token: the server answers 4401 and the
  // reconnect policy intentionally stops on 4401, which would wedge the
  // module socket for the whole session. AuthContext resets us post-login.
  if (!getSessionToken()) return;
  socketStarted = true;
  const socket = createPlansSocket(
    API_BASE,
    {
      onPlans: (incoming) => {
        Object.assign(cache, incoming);
        console.log('[plans] keys:', Object.fromEntries(Object.entries(cache).map(([k, v]) => [k, (v as unknown[]).length])));
        emit({ plans: { ...cache }, ready: true, unavailable: Object.keys(cache).length === 0 });
      },
    },
    () => {
      // On auth failure the cache stays as-is; pages show stale-or-empty
      // with the unavailable flag rather than fake prices.
      emit({ ready: true, unavailable: Object.keys(cache).length === 0 });
      void restartAfterRefresh();
    },
  );
  socketHandle = socket;
}

/// (Re)start the module socket — call after login/bootstrap so the URL
/// factory picks up the fresh memory token. Safe to call when logged out
/// (no-op until a token exists).
export function resetPlansSocket() {
  socketHandle?.close();
  socketHandle = null;
  socketStarted = false;
  ensureSocket();
}

/// Tear down on logout and drop cached plans so the next user starts clean.
export function stopPlansSocket() {
  socketHandle?.close();
  socketHandle = null;
  socketStarted = false;
  for (const k of Object.keys(cache)) delete cache[k as keyof PlansMap];
  emit({ plans: {}, ready: false, unavailable: false });
}

export function usePlans(): PlansState {
  const [state, setState] = useState<PlansState>(current);

  useEffect(() => {
    listeners.add(setState);
    ensureSocket();
    // If a token arrives after mount (post-login), the socket factory
    // picks it up on its reconnect cycle; force a refresh attempt.
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return state;
}

// ---- adapters: server payloads -> the shapes pages already render ----

export interface DataPlan {
  id: string;
  price: number;
  size: string;
  validity: string;
  planType: string;
  network: Network;
  description: string;
}

const DISPLAY: Record<string, string> = {
  mtn: 'MTN',
  airtel: 'Airtel',
  glo: 'Glo',
  '9mobile': '9mobile',
};

function parsePlanDetails(planName: string): { volume: string; validity: string; type: string } {
  let volume = 'Bundle';
  let validity = 'N/A';
  let type = 'ExtraValue';
  const volumeMatch = planName.match(/(\d+(?:\.\d+)?)\s*(GB|MB|TB)/i);
  if (volumeMatch) {
    volume = volumeMatch[0].toUpperCase();
  } else if (planName.toLowerCase().includes('unlimited')) {
    volume = 'Unlimited';
  } else {
    const priceMatch = planName.match(/N(\d+,?\d*)/);
    if (priceMatch) volume = `₦${priceMatch[1].replace(/,/g, '')} Bundle`;
  }
  const validityMatch = planName.match(/(\d+)\s*(day|days|week|weeks|month|months|year|yrs|hrs)/i);
  if (validityMatch) {
    validity = `${validityMatch[1]} ${validityMatch[2].toLowerCase()}`;
  }
  const lower = planName.toLowerCase();
  if (/(day|daily)/.test(lower)) type = 'Daily';
  else if (/(week|weekly)/.test(lower)) type = 'Weekly';
  else if (/(month|monthly)/.test(lower)) type = 'Monthly';
  return { volume, validity, type };
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function num(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v.replace(/,/g, ''));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/// Server data items `{plan, amount, productId}` -> DataPlan list.
/// `id` is the Nomba product id: that is what the backend prices and vends.
export function toDataPlans(key: PlanKey, items: PlanItem[]): DataPlan[] {
  const network = (DISPLAY[key] ?? key) as Network;
  return items.map((it) => {
    const label = str(it.plan ?? it.name ?? it.description);
    const id = str(it.productId ?? it.product_id ?? it.id ?? it.planId ?? it.code);
    const details = parsePlanDetails(label);
    return {
      id,
      price: num(it.amount ?? it.price),
      size: details.volume,
      validity: details.validity,
      planType: details.type,
      network,
      description: label,
    };
  }).filter((p) => p.id && p.price > 0);
}

export interface CablePlan {
  /** Display label. */
  label: string;
  /** Value sent as the plan (Nomba subscription type). */
  value: string;
  price: number;
}

/// Server cable items `{subScriptionType, amount}` -> selectable plans.
export function toCablePlans(items: PlanItem[]): CablePlan[] {
  return items
    .map((it) => {
      const value = str(it.subScriptionType ?? it.subscriptionType ?? it.id ?? it.code);
      const price = num(it.amount ?? it.price);
      if (!value || price <= 0) return null;
      return { label: `${value} - ₦${price.toLocaleString()}`, value, price };
    })
    .filter((p): p is CablePlan => p !== null);
}

export interface BettingProvider {
  /** Display name (Nomba `name`). */
  name: string;
  /**
   * Code the lookup/vend calls need: Nomba `id` (e.g. `bet9ja`), per the
   * lookup docs example. (`lookup_id` is kept for reference.)
   */
  id: string;
  lookupCode: string;
  label: string;
  placeholder: string;
  maxLength: number;
  /** Input keyboard: phone numbers get `tel`. */
  type: 'phone' | 'id';
  /**
   * Exact identifier length that auto-fires verification (`null` for
   * providers with no known fixed length — those verify on typing pause).
   */
  lookupAt: number | null;
}

/// Fallback list when the socket has no betting providers yet. Only Nomba-
/// supported providers: `1xBet` is absent from Nomba and can never verify.
export const DEFAULT_BETTING_PROVIDERS: BettingProvider[] = [
  { name: 'SportyBet', id: 'sportybet', lookupCode: 'SPORTYBET', label: 'Phone Number', placeholder: 'Enter your SportyBet phone number', maxLength: 11, type: 'phone', lookupAt: 11 },
  { name: 'Bet9ja', id: 'bet9ja', lookupCode: 'BET9JA', label: 'User ID', placeholder: 'Enter your Bet9ja User ID', maxLength: 10, type: 'id', lookupAt: 10 },
  { name: 'NairaBet', id: 'nairabet', lookupCode: 'NAIRABET', label: 'User ID', placeholder: 'Enter your NairaBet ID', maxLength: 10, type: 'id', lookupAt: 10 },
];

/// Backend caps `customer_id` at 50 chars — the input ceiling for providers
/// with no known fixed length.
export const BETTING_MAX_LENGTH = 50;

/** Minimum digits before pause-based verification kicks in (unknown lengths). */
export const BETTING_MIN_LOOKUP_LENGTH = 9;

/// Server betting items `{id, lookup_id, name}` -> selectable providers.
/// Lengths/UX labels come from the fallback table by name match; unknown
/// providers get generic limits (backend caps `customer_id` at 50 chars).
export function toBettingProviders(items: PlanItem[]): BettingProvider[] {
  return items
    .map((it) => {
      const name = str(it.name ?? it.id);
      const id = str(it.id);
      const lookupCode = str(it.lookup_id ?? it.lookupId ?? it.id);
      if (!name || !id) return null;
      const known = DEFAULT_BETTING_PROVIDERS.find(
        (d) => d.name.toLowerCase() === name.toLowerCase(),
      );
      return {
        name,
        id,
        lookupCode,
        label: known?.label ?? 'Customer ID',
        placeholder: known?.placeholder ?? `Enter your ${name} ID`,
        maxLength: known?.maxLength ?? BETTING_MAX_LENGTH,
        type: known?.type ?? 'id',
        lookupAt: known?.lookupAt ?? null,
      } satisfies BettingProvider;
    })
    .filter((p): p is BettingProvider => p !== null);
}

export function sessionTokenPresent(): boolean {
  return getSessionToken() !== null;
}
