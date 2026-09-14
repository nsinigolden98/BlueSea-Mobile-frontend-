import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header, AuthLoader } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { paylinkService } from '@/services/paylinkService';
import type { BusinessProduct } from '@/types/paylink';
import { Package, Plus, ArrowLeft, ChevronRight } from 'lucide-react';

export function ProductsManager() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    paylinkService.getProducts().then((data) => {
      setProducts(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title="Products & Services Catalog" 
            subtitle="Reusable commerce items"
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto z-10 max-w-3xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/paylink')}
              className="flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
            </button>

            <Button
              onClick={() => navigate('/paylink/create?type=PRODUCT')}
              className="h-9 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <AuthLoader />
              <p className="text-xs font-bold text-slate-400">Loading catalog items...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl text-center space-y-3 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Products Found</h3>
                <p className="text-xs text-slate-400 mt-0.5">Add items to your catalog to instantly link them to PayLink checkouts.</p>
              </div>
              <Button
                onClick={() => navigate('/paylink/create?type=PRODUCT')}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Your First Item
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => navigate(`/paylink/create?productId=${p.id}`)}
                  className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-xs hover:border-emerald-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {p.imageUrl ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 border border-slate-200/60 dark:border-slate-700">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</h3>
                      <p className="text-[11px] text-slate-400 truncate">
                        <span className="font-extrabold text-slate-700 dark:text-slate-300">₦{p.price.toLocaleString()}</span>
                        {p.category && ` • ${p.category}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/50 px-2 py-1 rounded-lg">
                      Create Link
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}