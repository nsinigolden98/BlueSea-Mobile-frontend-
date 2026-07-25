import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '@/components/ui-custom';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { LegalFooter } from '@/components/legal/LegalFooter';
import { ShieldCheck, FileText, Lock, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';

export function LegalIndex() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const legalDocuments = [
    {
      title: 'Terms & Conditions',
      shortDescription: 'Operational rules and user rights governing BlueSea platform services.',
      category: 'User Agreements',
      version: 'v2.4',
      path: '/legal/terms',
      icon: <FileText className="w-6 h-6 text-sky-500" />,
    },
    {
      title: 'Privacy Policy',
      shortDescription: 'How we collect, encrypt, store, and process your financial & personal data.',
      category: 'Privacy & Data',
      version: 'v3.1',
      path: '/legal/privacy',
      icon: <Lock className="w-6 h-6 text-emerald-500" />,
    },
    {
      title: 'Refund & Dispute Policy',
      shortDescription: 'Detailed guidelines regarding failed transactions, chargebacks, and reversals.',
      category: 'Financial & Services',
      version: 'v1.8',
      path: '/legal/refund',
      icon: <ShieldCheck className="w-6 h-6 text-amber-500" />,
    },
    {
      title: 'Cookie Policy',
      shortDescription: 'Information about session tracking, cookies, and local browser storage security.',
      category: 'Privacy & Data',
      version: 'v1.2',
      path: '/legal/cookies',
      icon: <BookOpen className="w-6 h-6 text-purple-500" />,
    },
  ];

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header
            title="Legal Center"
            subtitle="Transparency, Trust & Security"
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide z-10">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Hub Banner */}
            <div className="bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 rounded-3xl p-6 md:p-10 text-white shadow-lg shadow-sky-500/25">
              <div className="max-w-2xl space-y-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white uppercase tracking-wider inline-flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-sky-200" />
                  Governance & Compliance Framework
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold">
                  BlueSea Legal Documentation
                </h1>
                <p className="text-sky-100 text-sm md:text-base leading-relaxed">
                  Clear, transparent, and enforceable legal standards designed to protect your assets and build trust.
                </p>
              </div>
            </div>

            {/* Document Index Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {legalDocuments.map((doc) => (
                <div
                  key={doc.path}
                  onClick={() => navigate(doc.path)}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:border-sky-500/50 dark:hover:border-sky-500/50 hover:shadow-md group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        {doc.icon}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full">
                        {doc.version}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-sky-500 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {doc.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-sky-500">
                    <span>Read Documentation</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            <LegalFooter />
          </div>
        </main>

        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900">
          <MobileBottomNavigation />
        </div>
      </div>
    </div>
  );
}