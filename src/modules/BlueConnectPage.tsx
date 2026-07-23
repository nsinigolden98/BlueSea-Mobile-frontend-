import React from 'react';
import { useBlueConnect } from './hooks/useBlueConnect';
import { SearchBar } from './components/SearchBar';
import { CategoryTabs } from './components/CategoryTabs';
import { CompanyGrid } from './components/CompanyGrid';
import { ApiApplicationBanner } from './components/ApiApplicationBanner';
import { SharedPaymentModal } from './SharedPaymentModal';
import { ShieldCheck } from 'lucide-react';

export const BlueConnectPage: React.FC = () => {
  const {
    companies,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedCompany,
    selectCompanyForPayment,
    closeModal
  } = useBlueConnect();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 pb-20">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* HEADER SECTION */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
              BlueConnect
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Private payment gateway for verified institutions and services.
          </p>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="space-y-3">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <CategoryTabs activeCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        </div>

        {/* MERCHANT INTEGRATION PROMO */}
        <ApiApplicationBanner />

        {/* ORGANIZATIONS GRID */}
        <div className="space-y-2 pt-2">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">
            Verified Organizations ({companies.length})
          </h3>
          <CompanyGrid
            companies={companies}
            onSelectCompany={selectCompanyForPayment}
            isLoading={isLoading}
          />
        </div>

      </div>

      {/* SHARED PAYMENT MODAL INSTANCE */}
      {selectedCompany && (
        <SharedPaymentModal company={selectedCompany} onClose={closeModal} />
      )}
    </div>
  );
};