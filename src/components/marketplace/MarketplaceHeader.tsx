import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, Sparkles, Shield, Plus, Ticket, MoreHorizontal, QrCode, History 
} from 'lucide-react';

interface MarketplaceHeaderProps {
  vendorStatus: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showMenu: boolean;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

export const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({
  vendorStatus,
  setSidebarOpen,
  showMenu,
  setShowMenu,
  menuRef,
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 md:hidden hover:bg-slate-200"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-white tracking-tight">BlueTickets</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Discover experiences worth attending</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate('/affiliate')}
          className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 text-xs font-bold transition-colors"
        >
          <Sparkles className="w-4 h-4 text-sky-500" />
          Join Affiliate
        </button>

        {!vendorStatus ? (
          <button 
            onClick={() => navigate('/vendor-verification')}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold transition-colors"
          >
            <Shield className="w-4 h-4" />
            Become Organizer
          </button>
        ) : (
          <button 
            onClick={() => navigate('/event-manager')}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-600 text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        )}

        <button 
          onClick={() => navigate('/my-tickets')}
          className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
        >
          <Ticket className="w-4 h-4 text-sky-500" />
          My Tickets
        </button>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu((prev) => !prev)} 
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors flex items-center gap-1 font-bold text-xs"
            aria-label="Toggle Navigation Menu"
          >
            <MoreHorizontal className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50">
              <button 
                onClick={() => { setShowMenu(false); navigate('/affiliate'); }} 
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700/60 hover:text-sky-600 flex items-center gap-2.5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-sky-500" /> 
                Join Affiliate
              </button>

              {!vendorStatus ? (
                <button 
                  onClick={() => { navigate('/vendor-verification'); setShowMenu(false); }} 
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700/60 hover:text-sky-600 flex items-center gap-2.5 transition-colors"
                >
                  <Shield className="w-4 h-4 text-sky-500" /> 
                  Become Verified Organizer
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => { navigate('/event-manager'); setShowMenu(false); }} 
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700/60 hover:text-sky-600 flex items-center gap-2.5 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-sky-500" /> 
                    Create Event
                  </button>
                  <button 
                    onClick={() => { navigate('/scanner'); setShowMenu(false); }} 
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700/60 hover:text-sky-600 flex items-center gap-2.5 transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-sky-500" /> 
                    Ticket Scanner
                  </button>
                </>
              )}

              <button 
                onClick={() => { navigate('/my-tickets'); setShowMenu(false); }} 
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700/60 hover:text-sky-600 flex items-center gap-2.5 transition-colors"
              >
                <Ticket className="w-4 h-4 text-sky-500" /> 
                My Tickets
              </button>

              <button 
                onClick={() => { navigate('/history'); setShowMenu(false); }} 
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700/60 hover:text-sky-600 flex items-center gap-2.5 transition-colors"
              >
                <History className="w-4 h-4 text-sky-500" /> 
                Transaction History
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};