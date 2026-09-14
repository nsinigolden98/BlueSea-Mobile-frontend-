import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header, Toast } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paylinkService } from '@/services/paylinkService';
import type { BusinessProfile } from '@/types/paylink';
import { Building2, Plus, ArrowLeft } from 'lucide-react';

export function BusinessManager() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');

  const navigate = useNavigate();
  const { ToastComponent, showToast } = Toast();

  useEffect(() => {
    paylinkService.getBusinesses().then(setBusinesses);
  }, []);

  const handleCreateBusiness = async () => {
    if (!name.trim()) return;
    const newBiz = await paylinkService.createBusiness({
      name,
      category: category || 'General',
      description,
      contactEmail: email || 'business@bluec.app',
      identityTag: name.toLowerCase().replace(/\s+/g, ''),
    });
    setBusinesses([...businesses, newBiz]);
    setShowCreate(false);
    setName('');
    setCategory('');
    setDescription('');
    setEmail('');
    showToast('Business profile created!');
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title="Business Profiles" 
            subtitle="Manage multi-business receiving identities"
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto z-10 max-w-3xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/paylink')}
              className="flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
            </button>
            <Button onClick={() => setShowCreate(!showCreate)} className="text-xs bg-sky-600 text-white rounded-xl">
              <Plus className="w-3.5 h-3.5 mr-1" /> New Business
            </Button>
          </div>

          {showCreate && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase">Create Profile</h2>
              <Input placeholder="Business Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-50 dark:bg-slate-900 h-10 text-xs" />
              <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="bg-slate-50 dark:bg-slate-900 h-10 text-xs" />
              <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-slate-50 dark:bg-slate-900 h-10 text-xs" />
              <Input placeholder="Contact Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-50 dark:bg-slate-900 h-10 text-xs" />
              <Button onClick={handleCreateBusiness} className="w-full bg-sky-600 text-white text-xs h-10 rounded-xl">Save Profile</Button>
            </div>
          )}

          <div className="space-y-3">
            {businesses.map((b) => (
              <div key={b.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{b.name}</h3>
                    <p className="text-[11px] text-slate-400">{b.category} • {b.contactEmail}</p>
                    {b.description && <p className="text-[11px] text-slate-500 mt-0.5">{b.description}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <ToastComponent />
    </div>
  );
}