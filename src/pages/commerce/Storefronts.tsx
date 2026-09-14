import { useState, useEffect } from 'react';
import { Header, Toast } from '@/components/ui-custom';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { Store, Plus, X, ShoppingBag, TrendingUp, Eye, Heart, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const THEMES = [
  { id: 'modern', label: 'Modern', color: 'bg-slate-900' },
  { id: 'minimal', label: 'Minimal', color: 'bg-white border-2 border-slate-200' },
  { id: 'vibrant', label: 'Vibrant', color: 'bg-sky-500' },
  { id: 'elegant', label: 'Elegant', color: 'bg-amber-900' },
];

export function Storefronts() {
  const { storefronts, addStorefront } = useBlueSeaEngine();
  const { ToastComponent, showToast } = Toast();
  
  // State Management
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', theme: 'modern', primaryColor: '#0ea5e9' });
  const [isLoading, setIsLoading] = useState(false);

  // Backend Connection Readiness: Async fetch simulation
  useEffect(() => {
    const fetchStorefronts = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual backend GET request 
        // e.g., const data = await api.get('/storefronts');
        
        // Simulating network latency
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (error) {
        showToast('Failed to load storefronts', 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStorefronts();
  }, [showToast]);

  // Handlers
  const handleCreate = async () => {
    if (!form.name || !form.slug) { 
      // Fixed TS2345: Passed a number (duration) instead of a boolean
      showToast('Name and slug are required', 3000); 
      return; 
    }

    try {
      // TODO: Replace with actual backend POST request
      // e.g., await api.post('/storefronts', form);

      addStorefront({ 
        name: form.name, 
        slug: form.slug, 
        description: form.description, 
        theme: form.theme, 
        primaryColor: form.primaryColor, 
        categories: [], 
        products: [], 
        status: 'active', 
        ownerId: 'demo-001' 
      });

      showToast(`Storefront "${form.name}" created!`);
      setShowCreate(false);
      setForm({ name: '', slug: '', description: '', theme: 'modern', primaryColor: '#0ea5e9' });
    } catch (error) {
      showToast('Failed to create storefront', 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Storefronts" subtitle="Your online store builder" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-teal-500/5 border border-teal-500/20 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-teal-500 uppercase tracking-wider flex items-center gap-1">
                {/* Implemented the unused Store icon here */}
                <Store className="w-3 h-3" /> Stores
              </p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{storefronts.length}</p>
            </div>
            <div className="bg-pink-500/5 border border-pink-500/20 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-pink-500 uppercase tracking-wider flex items-center gap-1">
                {/* Moved ShoppingBag icon here */}
                <ShoppingBag className="w-3 h-3" /> Products
              </p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-1">
                {storefronts.reduce((s, st) => s + (st.products?.length || 0), 0)}
              </p>
            </div>
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1">
                {/* Implemented TrendingUp icon here */}
                <TrendingUp className="w-3 h-3" /> Revenue
              </p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-1">₦{storefronts.reduce((s, st) => s + st.analytics.totalRevenue, 0).toLocaleString()}</p>
            </div>
          </div>

          <button onClick={() => setShowCreate(true)} className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl hover:border-teal-500/50 transition-all flex items-center gap-3 group">
            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-teal-500" />
            </div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-teal-500 transition-colors">Create New Storefront</span>
          </button>

          {/* Store List with Loading State applied */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading your storefronts...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {storefronts.map(store => (
                <div key={store.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg" style={{ backgroundColor: store.primaryColor }}>
                        {store.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          {store.name} <Heart className="w-3 h-3 text-pink-500" />
                        </p>
                        <p className="text-[10px] text-slate-400">blueseamobile.com.ng/store/{store.slug}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Settings className="w-4 h-4 text-slate-400" /></button>
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><ExternalLink className="w-4 h-4 text-slate-400" /></button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-xl">
                      <p className="text-sm font-black text-slate-800 dark:text-white">{store.products.length}</p>
                      <p className="text-[9px] text-slate-400">Products</p>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-xl">
                      <p className="text-sm font-black text-slate-800 dark:text-white">{store.analytics.totalSales}</p>
                      <p className="text-[9px] text-slate-400">Sales</p>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-xl">
                      <p className="text-sm font-black text-slate-800 dark:text-white flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" /> {store.analytics.visitors}
                      </p>
                      <p className="text-[9px] text-slate-400">Visitors</p>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-xl">
                      <p className="text-sm font-black text-emerald-500">₦{store.analytics.totalRevenue.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-400">Revenue</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Create Storefront</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Store Name" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.replace(/\s/g, '-').toLowerCase() })} placeholder="Store URL (e.g. mystore)" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              
              {/* Implemented the THEMES array here to allow selection */}
              <div className="space-y-2 pb-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Theme</p>
                <div className="flex gap-3">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setForm({ ...form, theme: theme.id })}
                      className={`flex-1 p-2 rounded-xl border-2 transition-all ${
                        form.theme === theme.id ? 'border-teal-500 shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-full h-8 rounded-lg mb-2 ${theme.color}`} />
                      <p className="text-[10px] text-center font-bold text-slate-600 dark:text-slate-400">{theme.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleCreate} disabled={!form.name || !form.slug} className="w-full bg-teal-500 hover:bg-teal-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl">Create Storefront</Button>
            </div>
          </div>
        </div>
      )}
      <ToastComponent />
    </div>
  );
}
