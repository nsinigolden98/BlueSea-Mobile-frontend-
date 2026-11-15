import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getRequest, ENDPOINTS, type VendorStatus } from '@/types';
import type {
  MrGCampaign, MrGCurrency, MrGLink, MrGLandingPage, MrGQrCode,
  MrGReport, MrGRoutingRule, MrGStore,
} from './types';
import { createId, createShortCode, loadMrGStore, normaliseUrl, saveMrGStore } from './services/storage';
import { FALLBACK_RATES, fetchMrGRates, type MrGRates } from './services/currency';

interface CreateLinkInput {
  destinationUrl: string;
  title: string;
  description: string;
  folder?: string;
  customAlias?: string;
  expiresAt?: string;
  password?: string;
  removePassword?: boolean;
  campaignId?: string;
}

interface MrGContextValue {
  store: MrGStore;
  vendorStatus: VendorStatus | null;
  vendorLoading: boolean;
  rates: MrGRates;
  ratesLoading: boolean;
  rateError: boolean;
  createLink: (input: CreateLinkInput) => MrGLink;
  updateLink: (id: string, input: Partial<CreateLinkInput>) => void;
  toggleLink: (id: string) => void;
  deleteLink: (id: string) => void;
  setCurrency: (currency: MrGCurrency) => void;
  addCampaign: (input: Omit<MrGCampaign, 'id' | 'createdAt' | 'linkIds'>) => void;
  deleteCampaign: (id: string) => void;
  addQrCode: (input: Omit<MrGQrCode, 'id' | 'createdAt'>) => void;
  addLandingPage: (input: Omit<MrGLandingPage, 'id' | 'createdAt'>) => void;
  updateLandingPage: (id: string, input: Partial<MrGLandingPage>) => void;
  addRoutingRule: (input: Omit<MrGRoutingRule, 'id'>) => void;
  toggleRoutingRule: (id: string) => void;
  deleteRoutingRule: (id: string) => void;
  addReport: (input: Omit<MrGReport, 'id' | 'createdAt' | 'status'>) => void;
  refreshRates: () => Promise<void>;
  setSecurityPreference: (key: 'warningPage' | 'reviewReports', enabled: boolean) => void;
}

const MrGLinksContext = createContext<MrGContextValue | null>(null);

export function MrGLinksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const storageScope = String(user?.id ?? user?.email ?? 'anonymous').toLowerCase().replace(/[^a-z0-9@._-]/g, '_');
  const [store, setStore] = useState<MrGStore>(() => loadMrGStore(storageScope));
  const [rates, setRates] = useState<MrGRates>(FALLBACK_RATES);
  const [vendorStatus, setVendorStatus] = useState<VendorStatus | null>(null);
  const [vendorLoading, setVendorLoading] = useState(true);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [rateError, setRateError] = useState(false);

  useEffect(() => saveMrGStore(store, storageScope), [store, storageScope]);

  const refreshRates = useCallback(async () => {
    setRatesLoading(true);
    try {
      const latest = await fetchMrGRates();
      setRates(latest);
      setRateError(false);
    } catch {
      setRateError(true);
    } finally {
      setRatesLoading(false);
    }
  }, []);

  useEffect(() => { void refreshRates(); }, [refreshRates]);

  useEffect(() => {
    let active = true;
    const loadVendorStatus = async () => {
      try {
        const response = await getRequest(ENDPOINTS.vendor_status);
        if (active && response?.vendor) setVendorStatus(response.vendor as VendorStatus);
      } catch {
        if (active) setVendorStatus(null);
      } finally {
        if (active) setVendorLoading(false);
      }
    };
    void loadVendorStatus();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const verified = vendorStatus?.is_verified === true || vendorStatus?.verification_status === 'approved';
    if (verified && !store.vendorAliasAllowanceGranted) {
      setStore((current) => current.vendorAliasAllowanceGranted ? current : { ...current, verifiedVendorAliasCredits: 3, vendorAliasAllowanceGranted: true });
    }
  }, [vendorStatus, store.vendorAliasAllowanceGranted]);

  const createLink = useCallback((input: CreateLinkInput) => {
    const destinationUrl = normaliseUrl(input.destinationUrl);
    if (store.credits < 1) throw new Error('You have used all available link credits. Choose a link package to continue.');
    const customAlias = input.customAlias?.trim();
    const vendorAliasAvailable = store.verifiedVendorAliasCredits > 0 && (vendorStatus?.is_verified === true || vendorStatus?.verification_status === 'approved');
    if (customAlias && !vendorAliasAvailable && store.customAliasCredits < 1) {
      throw new Error('Custom aliases require an allowance. Verified BlueSea vendors receive 3 complimentary aliases; other users can unlock aliases with a paid package.');
    }
    if (customAlias && !/^[a-zA-Z0-9_-]{3,40}$/.test(customAlias)) {
      throw new Error('Custom aliases must be 3–40 characters and use letters, numbers, hyphens or underscores.');
    }
    if (customAlias && store.links.some((link) => link.shortCode.toLowerCase() === customAlias.toLowerCase())) {
      throw new Error('That custom alias is already in use. Try another name.');
    }
    const link: MrGLink = {
      id: createId('link'),
      destinationUrl,
      shortCode: customAlias || createShortCode(),
      title: input.title.trim() || new URL(destinationUrl).hostname,
      description: input.description.trim(),
      folder: input.folder?.trim() || 'Unfiled',
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: input.expiresAt || undefined,
      passwordProtected: Boolean(input.password),
      campaignId: input.campaignId || undefined,
      clicks: 0,
      isCustomAlias: Boolean(customAlias),
    };
    setStore((current) => ({
      ...current,
      links: [link, ...current.links],
      credits: Math.max(0, current.credits - 1),
      customAliasCredits: customAlias && !(current.verifiedVendorAliasCredits > 0 && (vendorStatus?.is_verified === true || vendorStatus?.verification_status === 'approved')) ? Math.max(0, current.customAliasCredits - 1) : current.customAliasCredits,
      verifiedVendorAliasCredits: customAlias && current.verifiedVendorAliasCredits > 0 && (vendorStatus?.is_verified === true || vendorStatus?.verification_status === 'approved') ? Math.max(0, current.verifiedVendorAliasCredits - 1) : current.verifiedVendorAliasCredits,
    }));
    return link;
  }, [store.credits, store.customAliasCredits, store.verifiedVendorAliasCredits, store.links, vendorStatus]);

  const updateLink = useCallback((id: string, input: Partial<CreateLinkInput>) => {
    setStore((current) => ({
      ...current,
      links: current.links.map((link) => {
        if (link.id !== id) return link;
        const destinationUrl = input.destinationUrl ? normaliseUrl(input.destinationUrl) : link.destinationUrl;
        return {
          ...link,
          destinationUrl,
          title: input.title !== undefined ? input.title.trim() : link.title,
          description: input.description !== undefined ? input.description.trim() : link.description,
          folder: input.folder !== undefined ? (input.folder.trim() || 'Unfiled') : link.folder,
          expiresAt: input.expiresAt !== undefined ? (input.expiresAt || undefined) : link.expiresAt,
          passwordProtected: input.removePassword ? false : (input.password ? true : link.passwordProtected),
          campaignId: input.campaignId !== undefined ? (input.campaignId || undefined) : link.campaignId,
        };
      }),
    }));
  }, []);

  const toggleLink = useCallback((id: string) => setStore((current) => ({
    ...current,
    links: current.links.map((link) => link.id === id ? { ...link, status: link.status === 'active' ? 'paused' : 'active' } : link),
  })), []);

  const deleteLink = useCallback((id: string) => setStore((current) => ({
    ...current,
    links: current.links.filter((link) => link.id !== id),
  })), []);

  const setCurrency = useCallback((currency: MrGCurrency) => setStore((current) => ({ ...current, currency })), []);

  const addCampaign = useCallback((input: Omit<MrGCampaign, 'id' | 'createdAt' | 'linkIds'>) => {
    const campaign: MrGCampaign = { ...input, id: createId('campaign'), createdAt: new Date().toISOString(), linkIds: [] };
    setStore((current) => ({ ...current, campaigns: [campaign, ...current.campaigns] }));
  }, []);

  const deleteCampaign = useCallback((id: string) => setStore((current) => ({
    ...current,
    campaigns: current.campaigns.filter((campaign) => campaign.id !== id),
    links: current.links.map((link) => link.campaignId === id ? { ...link, campaignId: undefined } : link),
  })), []);

  const addQrCode = useCallback((input: Omit<MrGQrCode, 'id' | 'createdAt'>) => {
    const qr: MrGQrCode = { ...input, id: createId('qr'), createdAt: new Date().toISOString() };
    setStore((current) => ({ ...current, qrCodes: [qr, ...current.qrCodes] }));
  }, []);

  const addLandingPage = useCallback((input: Omit<MrGLandingPage, 'id' | 'createdAt'>) => {
    const page: MrGLandingPage = { ...input, id: createId('page'), createdAt: new Date().toISOString() };
    setStore((current) => ({ ...current, landingPages: [page, ...current.landingPages] }));
  }, []);

  const updateLandingPage = useCallback((id: string, input: Partial<MrGLandingPage>) => setStore((current) => ({
    ...current,
    landingPages: current.landingPages.map((page) => page.id === id ? { ...page, ...input } : page),
  })), []);

  const addRoutingRule = useCallback((input: Omit<MrGRoutingRule, 'id'>) => {
    const rule: MrGRoutingRule = { ...input, id: createId('route') };
    setStore((current) => ({ ...current, routingRules: [rule, ...current.routingRules] }));
  }, []);

  const toggleRoutingRule = useCallback((id: string) => setStore((current) => ({
    ...current,
    routingRules: current.routingRules.map((rule) => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule),
  })), []);

  const deleteRoutingRule = useCallback((id: string) => setStore((current) => ({
    ...current,
    routingRules: current.routingRules.filter((rule) => rule.id !== id),
  })), []);

  const addReport = useCallback((input: Omit<MrGReport, 'id' | 'createdAt' | 'status'>) => {
    const report: MrGReport = { ...input, id: createId('report'), createdAt: new Date().toISOString(), status: 'Received locally' };
    setStore((current) => ({ ...current, reports: [report, ...current.reports] }));
  }, []);

  const setSecurityPreference = useCallback((key: 'warningPage' | 'reviewReports', enabled: boolean) => {
    setStore((current) => ({ ...current, securityPreferences: { ...current.securityPreferences, [key]: enabled } }));
  }, []);

  const value = useMemo<MrGContextValue>(() => ({
    store, vendorStatus, vendorLoading, rates, ratesLoading, rateError, createLink, updateLink, toggleLink, deleteLink,
    setCurrency, addCampaign, deleteCampaign, addQrCode, addLandingPage, updateLandingPage,
    addRoutingRule, toggleRoutingRule, deleteRoutingRule, addReport, refreshRates, setSecurityPreference,
  }), [store, vendorStatus, vendorLoading, rates, ratesLoading, rateError, createLink, updateLink, toggleLink, deleteLink,
    setCurrency, addCampaign, deleteCampaign, addQrCode, addLandingPage, updateLandingPage,
    addRoutingRule, toggleRoutingRule, deleteRoutingRule, addReport, refreshRates, setSecurityPreference]);

  return <MrGLinksContext.Provider value={value}>{children}</MrGLinksContext.Provider>;
}

export function useMrGLinks(): MrGContextValue {
  const context = useContext(MrGLinksContext);
  if (!context) throw new Error('useMrGLinks must be used within MrGLinksProvider.');
  return context;
}
