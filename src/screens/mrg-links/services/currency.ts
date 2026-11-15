import type { MrGCurrency } from '../types';

export const CURRENCY_META: Record<MrGCurrency, { label: string; symbol: string; locale: string }> = {
  NGN: { label: 'Nigerian Naira', symbol: '₦', locale: 'en-NG' },
  USD: { label: 'US Dollar', symbol: '$', locale: 'en-US' },
  EUR: { label: 'Euro', symbol: '€', locale: 'de-DE' },
  GBP: { label: 'British Pound', symbol: '£', locale: 'en-GB' },
};

// Reference fallback rates only. The live display rate is fetched from the public
// exchange-rate endpoint; wallet settlement remains denominated in NGN.
const FALLBACK_NGN_PER_UNIT: Record<MrGCurrency, number> = {
  NGN: 1,
  USD: 1354.97,
  EUR: 1496.68,
  GBP: 1791.44,
};

export interface MrGRates {
  NGN: number;
  USD: number;
  EUR: number;
  GBP: number;
  updatedAt: string;
  source: 'live reference' | 'fallback reference';
}

export const FALLBACK_RATES: MrGRates = {
  ...FALLBACK_NGN_PER_UNIT,
  updatedAt: 'Reference fallback',
  source: 'fallback reference',
};

export async function fetchMrGRates(): Promise<MrGRates> {
  const response = await fetch('https://open.er-api.com/v6/latest/NGN');
  if (!response.ok) throw new Error('Exchange-rate service is unavailable.');
  const data = await response.json() as { result?: string; rates?: Record<string, number>; time_last_update_utc?: string };
  if (data.result !== 'success' || !data.rates) throw new Error('Exchange-rate response was invalid.');
  const usd = data.rates.USD;
  const eur = data.rates.EUR;
  const gbp = data.rates.GBP;
  if (!usd || !eur || !gbp) throw new Error('Required currency rates were not returned.');
  return {
    NGN: 1,
    USD: 1 / usd,
    EUR: 1 / eur,
    GBP: 1 / gbp,
    updatedAt: data.time_last_update_utc ?? new Date().toISOString(),
    source: 'live reference',
  };
}

export function formatMrGPrice(amountNgn: number, currency: MrGCurrency, rates: MrGRates): string {
  const converted = amountNgn / rates[currency];
  const fractionDigits = currency === 'NGN' ? 0 : 2;
  return new Intl.NumberFormat(CURRENCY_META[currency].locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(converted);
}

export function convertNgn(amountNgn: number, currency: MrGCurrency, rates: MrGRates): number {
  return amountNgn / rates[currency];
}
