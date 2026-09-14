import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  Share2,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { affiliateApi } from '@/services/affiliateApi';

export function AffiliateRegistration() {
  const navigate = useNavigate();

  const [affiliateName, setAffiliateName] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // Prevent state updates after the page/component has been unmounted.
    };
  }, []);

  // Strictly enforce: 6-13 chars, letters and numbers only, NO spaces/symbols
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    const sanitizedValue = rawValue
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 13);

    setAffiliateName(sanitizedValue);
    setErrorMessage(null);
  };

  const isNameValid = useMemo(() => {
    return (
      affiliateName.length >= 6 &&
      affiliateName.length <= 13 &&
      /^[A-Za-z0-9]+$/.test(affiliateName)
    );
  }, [affiliateName]);

  const canSubmit =
    isNameValid &&
    agreedToTerms &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await affiliateApi.apply({
        affiliate_name: affiliateName.trim(),
        facebook: facebook.trim() || null,
        instagram: instagram.trim() || null,
        twitter: twitter.trim() || null,
        tiktok: tiktok.trim() || null,
        agreement: agreedToTerms,
      });

      if (response.status === 'approved' || response.is_approved) {
        navigate('/affiliate/dashboard', { replace: true });
        return;
      }

      if (response.status === 'pending') {
        navigate('/affiliate/pending', { replace: true });
        return;
      }

      if (response.status === 'rejected') {
        setErrorMessage(
          response.rejected_reason ||
            'Your affiliate application was not approved.'
        );
        return;
      }

      setErrorMessage(
        'Your application was submitted, but its current status could not be determined. Please check your affiliate status.'
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to submit affiliate application. Please verify your details and try again.';

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 md:p-8 my-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <button
          type="button"
          onClick={() => navigate('/marketplace')}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          aria-label="Return to Marketplace"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">
            Become a Partner Affiliate
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Promote events and earn commissions directly to your wallet.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Affiliate Name Input */}
        <div className="space-y-2">
          <label
            htmlFor="affiliate-name"
            className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
          >
            Affiliate Name
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>

            <input
              id="affiliate-name"
              type="text"
              value={affiliateName}
              onChange={handleNameChange}
              placeholder="e.g. JohnPartner01"
              maxLength={13}
              minLength={6}
              autoComplete="username"
              required
              aria-invalid={affiliateName.length > 0 && !isNameValid}
              className="w-full pl-10 pr-16 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />

            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[10px] font-bold text-slate-400">
              {affiliateName.length}/13
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            6–13 characters • Letters and numbers only (no spaces or special characters).
          </p>
        </div>

        {/* Social Accounts */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-sky-500" />

            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Social Media Channels (Optional)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="url"
              placeholder="Facebook URL"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              autoComplete="url"
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />

            <input
              type="url"
              placeholder="Instagram URL"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              autoComplete="url"
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />

            <input
              type="url"
              placeholder="Twitter / X URL"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              autoComplete="url"
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />

            <input
              type="url"
              placeholder="TikTok URL"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              autoComplete="url"
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700">
          <input
            type="checkbox"
            id="agreement"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-sky-500 rounded border-slate-300 focus:ring-sky-500"
          />

          <label
            htmlFor="agreement"
            className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
          >
            I agree to BlueSea Mobile&apos;s Affiliate Partner terms and
            conditions, and understand that referral attribution is verified
            by the server.
          </label>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-500/20 disabled:opacity-50 disabled:shadow-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting Application...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Submit Application
            </>
          )}
        </button>
      </form>
    </div>
  );
}