import React, { useState } from 'react';
import { Download, Eye, Copy, Check, Sparkles, X, Image as ImageIcon } from 'lucide-react';
import { getAffiliateProfile } from '@/utils/affiliateStorage';

interface PosterData {
  id: string;
  title: string;
  category: string;
  bgGradient: string;
  badgeBg: string;
  tagline: string;
  date: string;
}

const POSTERS: PosterData[] = [
  {
    id: 'poster-1',
    title: 'Lagos Live Music Fest 2026',
    category: 'Music & Concerts',
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)',
    badgeBg: '#0284c7',
    tagline: 'Get VIP Access & Early Bird Discounts!',
    date: 'DEC 24, 2026',
  },
  {
    id: 'poster-2',
    title: 'Tech & AI Summit Africa',
    category: 'Technology',
    bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%)',
    badgeBg: '#7c3aed',
    tagline: 'Connect with Industry Founders & Investors',
    date: 'NOV 15, 2026',
  },
  {
    id: 'poster-3',
    title: 'Standup Comedy Unplugged',
    category: 'Entertainment',
    bgGradient: 'linear-gradient(135deg, #451a03 0%, #ea580c 100%)',
    badgeBg: '#ea580c',
    tagline: 'An Unforgettable Night of Non-Stop Laughs',
    date: 'OCT 30, 2026',
  },
];

export function AffiliateDashboard(): React.ReactElement {
  const profile = getAffiliateProfile();
  const affiliateId = profile?.affiliateId || 'AFF-DEMO123';
  const referralLink = `${window.location.origin}/signup?ref=${affiliateId}`;

  const [copied, setCopied] = useState(false);
  const [activePreview, setActivePreview] = useState<PosterData | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPosterImage = (poster: PosterData) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fillGradient = ctx.createLinearGradient(0, 0, 1000, 1300);
    fillGradient.addColorStop(0, '#0f172a');
    fillGradient.addColorStop(1, '#0369a1');
    ctx.fillStyle = fillGradient;
    ctx.fillRect(0, 0, 1000, 1300);

    ctx.fillStyle = poster.badgeBg;
    ctx.roundRect(80, 80, 240, 50, 25);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(poster.category.toUpperCase(), 110, 112);

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('BLUESEA EXCLUSIVE EVENT', 80, 200);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 56px sans-serif';
    ctx.fillText(poster.title, 80, 280, 840);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '24px sans-serif';
    ctx.fillText(poster.tagline, 80, 340, 840);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.roundRect(80, 420, 840, 550, 40);
    ctx.fill();

    ctx.fillStyle = poster.badgeBg;
    ctx.beginPath();
    ctx.arc(500, 650, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN / BUY', 500, 662);

    ctx.fillStyle = '#0284c7';
    ctx.roundRect(140, 820, 720, 100, 24);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('REFERRAL CODE FOR DISCOUNT', 500, 855);

    ctx.font = '900 36px sans-serif';
    ctx.fillText(affiliateId, 500, 895);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${poster.id}-${affiliateId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    }, 'image/png');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> ID: {affiliateId}
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Event Marketing Assets</h1>
          <p className="text-slate-400 text-xs md:text-sm">
            Generate and download high-converting promotional banners embedded with your referral code.
          </p>
        </div>

        <div className="bg-slate-800 p-2.5 rounded-2xl border border-slate-700 flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-mono text-slate-300 truncate max-w-[180px] pl-2">{referralLink}</span>
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Posters Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-sky-500 shrink-0" />
          <h2 className="text-lg font-black text-slate-800 dark:text-white">Available Event Posters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {POSTERS.map((poster) => (
            <div key={poster.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md flex flex-col justify-between">
              {/* Visual Graphic Component */}
              <div 
                className="h-64 p-6 flex flex-col justify-between text-white relative overflow-hidden"
                style={{ background: poster.bgGradient }}
              >
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase text-white w-fit" style={{ backgroundColor: poster.badgeBg }}>
                  {poster.category}
                </span>

                <div className="space-y-1">
                  <h3 className="text-xl font-black leading-tight">{poster.title}</h3>
                  <p className="text-xs text-slate-200">{poster.tagline}</p>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold text-[10px]">YOUR CODE</span>
                  <span className="font-black text-sky-400">{affiliateId}</span>
                </div>
              </div>

              {/* Poster Action Bar */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => setActivePreview(poster)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button
                  onClick={() => downloadPosterImage(poster)}
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Save Image
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Preview */}
      {activePreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-4 relative border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActivePreview(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-slate-800 dark:text-white">Poster High-Res Preview</h3>

            <div 
              className="h-80 rounded-2xl p-6 flex flex-col justify-between text-white text-center shadow-inner"
              style={{ background: activePreview.bgGradient }}
            >
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase text-white self-center" style={{ backgroundColor: activePreview.badgeBg }}>
                {activePreview.category}
              </span>

              <div className="space-y-1">
                <h2 className="text-2xl font-black">{activePreview.title}</h2>
                <p className="text-xs text-slate-200">{activePreview.tagline}</p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-white/10 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Referral Code</p>
                <p className="text-base font-black text-sky-400">{affiliateId}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setActivePreview(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  downloadPosterImage(activePreview);
                  setActivePreview(null);
                }}
                className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}