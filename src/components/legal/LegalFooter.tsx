import { ShieldCheck, Lock, Globe, 
    ExternalLink  } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LegalFooter() {
  const navigate = useNavigate();

  const legalLinks = [
    { name: 'Terms & Conditions', path: '/legal/terms' },
    { name: 'Privacy Policy', path: '/legal/privacy' },
    { name: 'Refund & Dispute Policy', path: '/legal/refund' },
    { name: 'Cookie Policy', path: '/legal/cookies' },
  ];

  return (
    <footer className="mt-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-black text-sm">
              B
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-white">
              BlueSea <span className="text-sky-500">Legal</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md">
            BlueSea Mobile is a financial technology platform licensed and compliant under applicable regulatory frameworks.
          </p>
        </div>

        {/* Legal Quick Links */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium">
          {legalLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="text-slate-600 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
            >
              {link.name}
            </button>
          ))}
        </div>
      </div>

      {/* Compliance Badges & Disclaimer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            CBN Compliant Infrastructure
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-sky-500" />
            256-bit Bank Grade Encryption
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-purple-500" />
            NDPR Compliant
          </span>
        </div>

        <p className="text-[11px]">
          &copy; {new Date().getFullYear()} BlueSea Mobile Technologies Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}