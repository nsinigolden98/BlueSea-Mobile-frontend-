import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Logo } from '@/components/ui-custom';
import {
  ArrowRight,
  ChevronDown,
  Gift,
  Headphones,
  Bell,
  Eye,
  LockKeyhole,
  Coins,
  Pencil,
  ArrowDownLeft,
  ArrowUpRight,
  Link2,
  Lightbulb,
  Tv,
  LayoutGrid,
  House,
  Store,
  Settings,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Star,
  Ticket,
  Wallet,
  Wifi,
 } from 'lucide-react';

type Release = {
  version: string;
  versionCode?: number;
  releaseDate: string;
  file: string;
  fileSize?: string;
  minimumAndroidVersion?: string;
  releaseNotes?: string[];
  sha256?: string;
};

type DownloadManifest = {
  platform: "android";
  version: string;
  versionCode?: number;
  releaseDate: string;
  file: string;
  fileSize?: string;
  minimumAndroidVersion?: string;
  releaseNotes?: string[];
  sha256?: string;
  releases?: Release[];
};

const MANIFEST_URL = "/downloads/android/latest.json";
const FALLBACK_MANIFEST: DownloadManifest = {
  platform: "android",
  version: "REPLACE_WITH_VERSION",
  releaseDate: "REPLACE_WITH_RELEASE_DATE",
  file: "/downloads/android/versions/REPLACE_WITH_APK_FILENAME.apk",
  fileSize: "See APK file",
  minimumAndroidVersion: "REPLACE_WITH_MINIMUM_ANDROID_VERSION",
  releaseNotes: ["Add the release notes for this version."],
  releases: [],
};

function Icon({
  name,
  size = 20,
}: {
  name: "download" | "android" | "apple" | "windows" | "laptop" | "shield" | "chevron" | "external" | "check" | "file" | "info" | "arrow";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "download":
      return <svg {...common}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></svg>;
    case "android":
      return <svg {...common}><path d="M5 9a7 7 0 0 1 14 0v7H5z" /><path d="M8 3 6.5 1.5M16 3l1.5-1.5M8 11v.01M16 11v.01M3 10v5M21 10v5M8 16v5M16 16v5" /></svg>;
    case "apple":
      return <svg {...common}><path d="M16.5 13.5c0 3.2-2.6 7-4.5 7-1 0-1.5-.7-2.5-.7s-1.6.7-2.5.7c-2 0-4.5-3.8-4.5-7.2 0-3.1 2-5.2 4.5-5.2 1.1 0 1.8.6 2.5.6s1.5-.6 2.8-.6c1 0 2.2.4 3.1 1.4-2.7 1.5-2.4 4.7 1.1 6Z" /><path d="M13.5 5.5c.6-1 1.8-1.8 3-2-.1 1.3-.7 2.4-1.7 3.2-.8.6-1.8 1-2.7.9 0-.8.5-1.6 1.4-2.1Z" /></svg>;
    case "windows":
      return <svg {...common}><path d="m3 5 8-1v7H3zM13 3.7 21 2.5V11h-8zM3 13h8v7l-8-1zM13 13h8v8.5l-8-1.2z" /></svg>;
    case "laptop":
      return <svg {...common}><rect x="4" y="4" width="16" height="12" rx="1.5" /><path d="M2 20h20l-2-4H4z" /></svg>;
    case "shield":
      return <svg {...common}><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></svg>;
    case "chevron":
      return <svg {...common}><path d="m6 9 6 6 6-6" /></svg>;
    case "external":
      return <svg {...common}><path d="M14 3h7v7M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>;
    case "check":
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
    case "file":
      return <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></svg>;
    case "info":
      return <svg {...common}><circle cx="12" cy="12" r="10" /><path d="M12 11v5M12 7h.01" /></svg>;
    case "arrow":
      return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
  }
}

function formatDate(value?: string) {
  if (!value || value.startsWith("REPLACE_")) return "Release date to be added";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isConfigured(value?: string) {
  return Boolean(value && value.trim() && !value.includes("REPLACE_"));
}

export default function Download() {
  const [manifest, setManifest] = useState<DownloadManifest>(FALLBACK_MANIFEST);
  const [loading, setLoading] = useState(true);
  const [manifestError, setManifestError] = useState(false);
  const [showOlder, setShowOlder] = useState(false);

  useEffect(() => {
    let active = true;

    fetch(`${MANIFEST_URL}?t=${Date.now()}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load release information.");
        return response.json() as Promise<DownloadManifest>;
      })
      .then((data) => {
        if (!active) return;
        setManifest(data);
        setManifestError(false);
      })
      .catch(() => {
        if (!active) return;
        setManifestError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const olderReleases = useMemo(
    () => (manifest.releases ?? []).filter((release) => release.version !== manifest.version),
    [manifest.releases, manifest.version],
  );

  const currentDownloadReady = isConfigured(manifest.file);
  const currentFileUrl = currentDownloadReady ? manifest.file : undefined;

  return (
    <main className="bs-download min-h-screen overflow-x-hidden bg-[#071426] text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#1DA1F2]/20 blur-[110px]" />
        <div className="absolute -right-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-[#1479C9]/15 blur-[120px]" />
        <div className="absolute bottom-[-12rem] left-1/3 h-[25rem] w-[25rem] rounded-full bg-sky-400/10 blur-[110px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Logo />
          <a href="/" className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-300/60 hover:text-white sm:text-sm">
            Back to website
          </a>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:py-12">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1.5 text-xs font-semibold text-sky-200">
              <span className="h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_12px_#7DD3FC]" />
              One platform. More possibilities.
            </div>

            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.65rem]">
              Your financial world,
              <span className="block bg-gradient-to-r from-[#7DD3FC] via-[#1DA1F2] to-white bg-clip-text text-transparent">
                all in one place.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Get the official BlueSea Mobile app for convenient access to essential payments,
              digital services and tools designed to keep you moving.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Icon name="android" size={19} />
                    BlueSea Mobile for Android
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Official Android installation package</p>
                </div>
                <span className="rounded-full border border-sky-300/25 bg-sky-300/10 px-3 py-1 text-[11px] font-bold text-sky-200">
                  Available
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-black/20 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Version</p>
                  <p className="mt-1 text-sm font-bold">{loading ? "Loading…" : manifest.version}</p>
                </div>
                <div className="rounded-2xl bg-black/20 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">File size</p>
                  <p className="mt-1 text-sm font-bold">{manifest.fileSize || "Not specified"}</p>
                </div>
                <div className="col-span-2 rounded-2xl bg-black/20 p-3 sm:col-span-1">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Released</p>
                  <p className="mt-1 text-sm font-bold">{formatDate(manifest.releaseDate)}</p>
                </div>
              </div>

              {currentFileUrl ? (
                <a
                  href={currentFileUrl}
                  download
                  className="mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#1DA1F2] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:bg-[#168FE0] focus:outline-none focus:ring-4 focus:ring-sky-300/30"
                >
                  <Icon name="download" size={21} />
                  Download for Android
                </a>
              ) : (
                <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                  The Android APK location has not been configured yet. Add the APK and update
                  <code className="mx-1 rounded bg-black/20 px-1.5 py-0.5">latest.json</code>
                  before publishing.
                </div>
              )}

              <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                Download only from the official BlueSea Mobile website. Android may ask you to
                approve installation from your browser.
              </p>

              {manifestError && (
                <p className="mt-3 flex items-start gap-2 text-xs text-amber-200">
                  <Icon name="info" size={15} />
                  Release information could not be loaded. Check the public manifest file.
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5"><Icon name="shield" size={15} /> Official distribution</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="check" size={15} /> Release information</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[490px]">
            <div className="absolute inset-8 rounded-full bg-[#1DA1F2]/20 blur-[75px]" />
            <div className="pointer-events-none absolute inset-0 -z-0 flex items-center justify-center overflow-hidden opacity-[0.15] sm:opacity-[0.18] lg:pointer-events-auto lg:relative lg:inset-auto lg:z-10 lg:justify-end lg:overflow-visible lg:opacity-100">
            <div className="relative h-[590px] w-[300px] translate-x-14 scale-[0.88] overflow-hidden rounded-[36px] border border-slate-700/70 bg-[#0d172b] p-0 shadow-2xl shadow-slate-950/50 sm:translate-x-16 sm:scale-95 lg:h-[690px] lg:w-[340px] lg:translate-x-0 lg:scale-100">
              <div className="absolute inset-x-0 top-0 z-20 h-2 bg-slate-700/70" />
              <div className="flex h-full flex-col overflow-hidden bg-[#0d172b] text-slate-200">
                {/* Profile header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 px-4 pb-4 pt-6">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-sky-400 bg-gradient-to-br from-sky-300 to-blue-600 text-[10px] font-bold text-white">NS</div>
                    <div className="leading-tight">
                      <p className="text-[8px] uppercase tracking-wider text-slate-400">Hi,</p>
                      <p className="mt-1 text-[12px] font-semibold text-white">NSINI <span>👋</span></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80"><Headphones className="h-4 w-4 text-slate-300" /></span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80"><Bell className="h-4 w-4 text-slate-300" /></span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-hidden px-2.5 pt-2.5">
                  {/* Available balance card */}
                  <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 px-4 py-4 text-white shadow-lg shadow-sky-900/20">
                    <div className="absolute -right-8 -top-7 h-28 w-28 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-7 h-24 w-24 rounded-full bg-white/10" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium">Available Balance</span>
                        <Eye className="h-3.5 w-3.5 opacity-80" />
                      </div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20"><RefreshCw className="h-4 w-4" /></span>
                    </div>
                    <p className="relative mt-2 text-[20px] font-bold tracking-wider">******</p>
                    <div className="relative mt-5 flex items-center gap-2">
                      <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1.5 text-[8px]"><LockKeyhole className="h-3 w-3" /> Locked: ******</span>
                      <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1.5 text-[8px]"><Coins className="h-3 w-3 text-amber-200" /> *** BSP</span>
                      <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1.5 text-[8px]"><ShieldCheck className="h-3 w-3 text-emerald-200" /> Verified</span>
                    </div>
                    <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-700/30"><Wallet className="h-5 w-5" /></span>
                  </div>

                  {/* Activity strip */}
                  <div className="-mt-3 flex items-center justify-between rounded-b-2xl border border-slate-800 px-4 py-2.5 text-[9px] text-slate-400">
                    <span><span className="mr-2 text-sky-400">●</span>•••••• spent · 0 txns</span><ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                  </div>

                  {/* Transfer shortcuts */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-2 py-3 text-[9px] font-medium text-white"><ArrowRight className="h-3.5 w-3.5" /> Internal Transfer</div>
                    <div className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-800 px-2 py-3 text-[9px]"><ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" /> Deposit</div>
                    <div className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-800 px-2 py-3 text-[9px]"><ArrowUpRight className="h-3.5 w-3.5 text-sky-400" /> Transfer</div>
                  </div>

                  {/* Quick actions panel */}
                  <div className="rounded-[24px] border border-slate-800/80 bg-[#091225] px-3.5 py-3.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-white">Quick Actions</p>
                        <p className="mt-1 text-[8px] text-slate-400">Your frequently used services</p>
                      </div>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-700"><Pencil className="h-3.5 w-3.5" /></span>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-x-2 gap-y-4">
                      {[
                        { label: 'Tickets', Icon: Ticket },
                        { label: 'Airtime', Icon: Smartphone },
                        { label: 'Data', Icon: Wifi },
                        { label: 'Affiliate', Icon: Link2 },
                        { label: 'Transfer', Icon: RefreshCw },
                        { label: 'Electricity', Icon: Lightbulb },
                        { label: 'TV Subscription', Icon: Tv },
                        { label: 'Wallet', Icon: Wallet },
                      ].map(({ label, Icon }) => (
                        <div key={label} className="flex flex-col items-center gap-1.5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/80 bg-[#0b162a]"><Icon className="h-4 w-4 text-slate-300" /></span>
                          <span className="text-center text-[8px] text-slate-300">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exclusive and service rows */}
                  <p className="px-1 pt-1 text-[8px] font-medium tracking-[0.18em] text-slate-500">BLUESEA EXCLUSIVES</p>
                  <div className="flex w-[44%] items-center gap-2 rounded-2xl border border-slate-800 px-3 py-3 text-[9px]"><Ticket className="h-4 w-4 text-slate-400" /> Scan Events</div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-800 px-3 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800"><LayoutGrid className="h-4 w-4" /></span>
                    <div className="flex-1">
                      <p className="text-[10px] font-medium">Explore All Services</p>
                      <p className="mt-1 text-[8px] text-slate-400">Airtime, data, bills & utilities</p>
                    </div>
                    <ChevronDown className="h-4 w-4 -rotate-90" />
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-700 px-3 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20"><Star className="h-4 w-4 text-amber-200" /></span>
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold">BluePoints Reward</p>
                      <p className="mt-1 text-[8px] text-white/80">Check your loyalty progress</p>
                    </div>
                    <ChevronDown className="h-4 w-4 -rotate-90" />
                  </div>
                </div>

                {/* Bottom navigation */}
                <div className="mt-2 grid grid-cols-4 border-t border-slate-800 bg-[#0d172b] px-2 py-3">
                  {[
                    { label: 'Home', Icon: House, active: true },
                    { label: 'Rewards', Icon: Gift },
                    { label: 'BlueTickets', Icon: Store },
                    { label: 'Settings', Icon: Settings },
                  ].map(({ label, Icon, active }) => (
                    <div key={label} className={`flex flex-col items-center gap-1 ${active ? 'text-sky-400' : 'text-slate-500'}`}>
                      <Icon className="h-5 w-5" />
                      <span className="text-[8px]">{label}</span>
                      {active && <span className="h-1 w-1 rounded-full bg-sky-400" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-7">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">Choose your platform</h2>
              <p className="mt-1 text-xs text-slate-400">More ways to experience BlueSea Mobile.</p>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">Platform availability</span>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <PlatformCard icon={<Icon name="android" size={21} />} title="Android" status="Available" active />
            <PlatformCard icon={<Icon name="apple" size={21} />} title="iOS" status="Coming soon" />
            <PlatformCard icon={<Icon name="windows" size={21} />} title="Windows" status="Coming soon" />
            <PlatformCard icon={<Icon name="laptop" size={21} />} title="macOS" status="Coming soon" />
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-sky-200"><Icon name="file" size={19} /></span>
              <div>
                <p className="text-sm font-semibold">Looking for an earlier Android release?</p>
                <p className="mt-1 text-xs text-slate-400">Older releases are listed below when they have been added to the release manifest.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowOlder((value) => !value)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:border-sky-300/50 hover:text-white"
              aria-expanded={showOlder}
            >
              {showOlder ? "Hide previous versions" : "View previous versions"}
              <span className={`transition-transform ${showOlder ? "rotate-180" : ""}`}><Icon name="chevron" size={15} /></span>
            </button>
          </div>

          {showOlder && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              {olderReleases.length > 0 ? (
                <div className="divide-y divide-white/10">
                  {olderReleases.map((release) => (
                    <div key={`${release.version}-${release.file}`} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div>
                        <p className="text-sm font-semibold">Version {release.version}</p>
                        <p className="mt-1 text-xs text-slate-400">{formatDate(release.releaseDate)}{release.fileSize ? ` · ${release.fileSize}` : ""}</p>
                      </div>
                      {isConfigured(release.file) ? (
                        <a href={release.file} download className="inline-flex items-center gap-2 rounded-xl border border-sky-300/25 px-3 py-2 text-xs font-bold text-sky-200 hover:bg-sky-300/10">
                          <Icon name="download" size={15} /> Download
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">File not configured</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs leading-6 text-slate-400">No previous releases have been published yet. Add older release entries to <code className="rounded bg-black/20 px-1 py-0.5">latest.json</code> when they are available.</p>
              )}
            </div>
          )}
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/10 py-5 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BlueSea Mobile. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <a href="/privacy-policy" className="transition hover:text-slate-200">Privacy policy</a>
            <a href="/contact" className="transition hover:text-slate-200">Contact support</a>
            <a href="/" className="transition hover:text-slate-200">blueseamobile.com</a>
          </div>
        </footer>
      </div>
    </main>
  );
}

function PlatformCard({
  icon,
  title,
  status,
  active = false,
}: {
  icon: ReactNode;
  title: string;
  status: string;
  active?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${active ? "border-sky-300/25 bg-sky-300/[0.08]" : "border-white/10 bg-white/[0.035]"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={active ? "text-sky-200" : "text-slate-300"}>{icon}</span>
        {active ? (
          <span className="rounded-full bg-sky-300/10 px-2 py-1 text-[9px] font-bold text-sky-200">AVAILABLE</span>
        ) : (
          <span className="rounded-full bg-white/[0.07] px-2 py-1 text-[9px] font-bold text-slate-400">COMING SOON</span>
        )}
      </div>
      <p className="mt-3 text-sm font-bold">{title}</p>
      <p className="mt-1 text-[11px] text-slate-400">{status}</p>
    </div>
  );
}
