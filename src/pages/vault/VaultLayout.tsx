// src/pages/vault/VaultLayout.tsx
import { useState } from 'react';
import { Sidebar, Header, Toast, Loader, PinModal } from '@/components/ui-custom';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';

// View Components
import { VaultOverview } from './views/VaultOverview';
import { VaultReceive } from './views/VaultReceive';
import { VaultSend } from './views/VaultSend';
import { VaultConvert } from './views/VaultConvert';
import { VaultAddressBook } from './views/VaultAddressBook';
import { VaultHistory } from './views/VaultHistory';
import { VaultMissions } from './views/VaultMissions';
import { VaultReferral } from './views/VaultReferral';
import { VaultCards } from './views/VaultCards';

export type VaultViewMode = 
  | 'overview' 
  | 'receive' 
  | 'send' 
  | 'convert' 
  | 'address_book' 
  | 'history' 
  | 'missions' 
  | 'referral' 
  | 'cards';

export function VaultLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<VaultViewMode>('overview');

  const { showToast, ToastComponent } = Toast();
  const { LoaderComponent, showLoader, hideLoader } = Loader();
  const { showPinModal, PinComponent } = PinModal();

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <VaultOverview onNavigate={setActiveView} showToast={showToast} />;
      case 'receive':
        return <VaultReceive showToast={showToast} />;
      case 'send':
        return <VaultSend showToast={showToast} onRequestPin={showPinModal} />;
      case 'convert':
        return <VaultConvert showToast={showToast} onRequestPin={showPinModal} />;
      case 'address_book':
        return <VaultAddressBook showToast={showToast} />;
      case 'history':
        return <VaultHistory showToast={showToast} />;
      case 'missions':
        return <VaultMissions showToast={showToast} />;
      case 'referral':
        return <VaultReferral showToast={showToast} />;
      case 'cards':
        return <VaultCards />;
      default:
        return <VaultOverview onNavigate={setActiveView} showToast={showToast} />;
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title={activeView === 'overview' ? 'Vault' : activeView.replace('_', ' ').toUpperCase()} 
            subtitle="BlueSea Digital Asset Center"
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden z-10">
          <div className="max-w-4xl mx-auto space-y-6">
            {activeView !== 'overview' && (
              <button 
                onClick={() => setActiveView('overview')}
                className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 px-3 py-1.5 rounded-full hover:bg-sky-100 transition-all cursor-pointer"
              >
                ← Back to Overview
              </button>
            )}

            {renderActiveView()}
          </div>
        </main>

        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <MobileBottomNavigation />
        </div>
      </div>

      <ToastComponent />
      <LoaderComponent />
      <PinComponent type="vault_action" value={{}} />
    </div>
  );
}