import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { saveAffiliateProfile, getOrGenerateAffiliateId } from '@/utils/affiliateStorage';
import type { SocialAccountInput } from '@/types/affiliate';

const CATEGORY_OPTIONS = [
  'Music', 'Technology', 'Business', 'Comedy', 'Education', 
  'Church', 'Festival', 'Networking', 'Sports', 'Fashion', 'Health'
];

const PLATFORM_OPTIONS = [
  'Facebook', 'Instagram', 'TikTok', 'WhatsApp', 'Telegram', 'X', 'LinkedIn', 'Website'
];

const PROMOTION_METHODS = [
  'Social Media', 'WhatsApp Broadcast', 'Telegram Community', 
  'Email Marketing', 'Physical Promotion', 'Community Groups', 'Website / Blog'
];

export function AffiliateRegistration() {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<string, boolean>>({});
  const [socialUrls, setSocialUrls] = useState<Record<string, string>>({});
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const togglePlatform = (plat: string) => {
    setSelectedPlatforms(prev => ({ ...prev, [plat]: !prev[plat] }));
  };

  const toggleMethod = (method: string) => {
    setSelectedMethods(prev => 
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !agreedToTerms) return;

    const formattedSocials: SocialAccountInput[] = Object.keys(selectedPlatforms)
      .filter(plat => selectedPlatforms[plat])
      .map(plat => ({ platform: plat, url: socialUrls[plat] || '' }));

    const newProfile = {
      id: `aff_prof_${Date.now()}`,
      displayName,
      status: 'pending' as const,
      affiliateId: getOrGenerateAffiliateId(),
      categories: selectedCategories,
      socialAccounts: formattedSocials,
      promotionMethods: selectedMethods,
      agreedToTerms,
      createdAt: new Date().toISOString(),
      level: 'Standard' as const,
    };

    saveAffiliateProfile(newProfile);
    navigate('/affiliate/pending');
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">
          Become a BlueSea Affiliate Partner
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Promote events, earn referral commissions, and gain access to high-converting branded marketing tools.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
        {/* Display Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Public Display Name
          </label>
          <Input 
            type="text" 
            required 
            placeholder="e.g. Alex Promos or Lagos Event Plug" 
            value={displayName} 
            onChange={(e) => setDisplayName(e.target.value)} 
            className="rounded-2xl"
          />
        </div>

        {/* Promotion Categories */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Preferred Promotion Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Social Platforms */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Social Media Handles & Channels
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORM_OPTIONS.map((plat) => (
              <div key={plat} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-slate-800 dark:text-white">
                  <input 
                    type="checkbox" 
                    checked={!!selectedPlatforms[plat]} 
                    onChange={() => togglePlatform(plat)} 
                    className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400"
                  />
                  <span>{plat}</span>
                </label>
                {selectedPlatforms[plat] && (
                  <Input 
                    type="url" 
                    placeholder={`Enter your ${plat} Profile URL`} 
                    value={socialUrls[plat] || ''} 
                    onChange={(e) => setSocialUrls({ ...socialUrls, [plat]: e.target.value })} 
                    className="text-xs rounded-xl"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Promotion Methods */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Promotion Methods
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PROMOTION_METHODS.map((method) => {
              const isSelected = selectedMethods.includes(method);
              return (
                <button
                  type="button"
                  key={method}
                  onClick={() => toggleMethod(method)}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>{method}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-600 dark:text-slate-300">
            <input 
              type="checkbox" 
              required 
              checked={agreedToTerms} 
              onChange={(e) => setAgreedToTerms(e.target.checked)} 
              className="w-4 h-4 rounded text-sky-500 mt-0.5"
            />
            <span>
              I agree to the <strong className="text-slate-800 dark:text-white">BlueSea Affiliate Terms & Conditions</strong> and understand commissions are tracked automatically based on ticket purchases.
            </span>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={!displayName || !agreedToTerms}
          className="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          Submit Application <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}