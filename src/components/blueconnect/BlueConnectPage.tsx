import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  Header
} from '@/components/ui-custom';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { SearchBar } from './SearchBar';
import { CategoryTabs } from './CategoryTabs';
import { CompanyGrid } from './CompanyGrid';
import { SharedPaymentModal } from './SharedPaymentModal';
import { useBlueConnect } from '@/hooks/useBlueConnect';
//import type { Company } from '@/types/blueconnect';
import { Zap, Code2, 
    //PlusCircle,
     Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BlueConnectPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const {
    loading,
    companies,
    selectedCompany,
    activeConfig,
    fetchCompanies,
    selectCompanyForPayment,
    clearSelection
  } = useBlueConnect();

  useEffect(() => {
    fetchCompanies(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory, fetchCompanies]);

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* REUSED SIDEBAR OVERLAY COMPONENT */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* CORE VIEWPORT CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* FIXED APP HEADER LAYER */}
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-white/5">
          <Header
            title="BlueConnect"
            subtitle="Private Payment Gateway"
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-none z-10">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* HERO BANNER & API DEVELOPER CTA */}
            <div className="bg-gradient-to-br from-sky-500 via-sky-600 to-sky-800 rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-sky-500/10">
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-sky-100 border border-white/20">
                    <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                    <span>Direct Merchant Settlement</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
                    Instant payments for verified organization infrastructure.
                  </h2>
                  <p className="text-xs text-sky-100/80 font-medium leading-relaxed">
                    Connect directly to enterprise systems with native verification, customized package plans, and real-time ledger settlement.
                  </p>
                </div>

                {/* Apply for BlueConnect API Button */}
                <div className="shrink-0">
                  <Button
                    onClick={() => {
                      // TODO: Implement developer onboarding modal & API documentation portal link
                      alert('BlueConnect Developer Portal & API onboarding coming soon.');
                    }}
                    className="bg-white hover:bg-slate-100 text-sky-600 rounded-2xl h-12 px-5 text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer border border-white/20"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Apply for BlueConnect API</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* CONTROLS: SEARCH & CATEGORY FILTER TABS */}
            <div className="space-y-4">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              <CategoryTabs
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            {/* PARTNER COMPANY GRID */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  Verified Merchants ({companies.length})
                </h3>
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Real-time Gateway Sync</span>
                </div>
              </div>

              <CompanyGrid
                companies={companies}
                onSelectCompany={selectCompanyForPayment}
                loading={loading}
              />
            </div>
          </div>
        </main>

        {/* FIXED MOBILE BOTTOM NAVIGATION LAYER */}
        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5">
          <MobileBottomNavigation />
        </div>
      </div>

      {/* SHARED DYNAMIC PAYMENT MODAL */}
      {selectedCompany && activeConfig && (
        <SharedPaymentModal
          company={selectedCompany}
          config={activeConfig}
          onClose={clearSelection}
        />
      )}
    </div>
  );
};