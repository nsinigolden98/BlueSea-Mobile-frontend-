import { useState } from 'react';
import { Header, Toast } from '@/components/ui-custom';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { Briefcase, Plus, X, Star, DollarSign, Clock, CheckCircle2, Shield, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Extend Transaction type inline if engine types don't officially support 'category' yet
interface BackendTransactionParams {
  transaction_type: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
  status: 'successful' | 'failed' | 'pending';
  payment_method: string;
  [key: string]: any; // Gracefully allows 'category' for backend routing
}

const DEMO_SERVICES = [
  { id: 'fs1', title: 'Logo Design', description: 'Professional logo design for your brand', pricing: { basic: 15000, standard: 35000, premium: 75000 }, deliveryTime: '3 days', revisions: 3, skills: ['Design', 'Branding'], freelancerName: 'John Designer', rating: 4.9, completedJobs: 127 },
  { id: 'fs2', title: 'Website Development', description: 'Full-stack web development', pricing: { basic: 50000, standard: 120000, premium: 250000 }, deliveryTime: '14 days', revisions: 5, skills: ['React', 'Node.js'], freelancerName: 'Sarah Dev', rating: 4.8, completedJobs: 89 },
  { id: 'fs3', title: 'Social Media Marketing', description: 'Grow your brand on social media', pricing: { basic: 25000, standard: 60000, premium: 120000 }, deliveryTime: '30 days', revisions: 2, skills: ['Marketing', 'Content'], freelancerName: 'Mike Media', rating: 4.7, completedJobs: 203 },
];

export function Freelance() {
  const { freelanceOrders, addFreelanceOrder, addTransaction, addNotification } = useBlueSeaEngine();
  const { ToastComponent, showToast } = Toast();
  const [showOrder, setShowOrder] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium'>('basic');
  const [requirements, setRequirements] = useState('');
  
  // State for search input using the imported Input component
  const [searchQuery, setSearchQuery] = useState('');

  const handleOrder = (serviceId: string) => {
    const service = DEMO_SERVICES.find(s => s.id === serviceId);
    if (!service) return;
    const price = service.pricing[selectedPackage];
    
    // BACKEND INTEGRATION POINT: These engine states can be replaced or connected to async axios/fetch API mutations
    addFreelanceOrder({ 
      serviceId, 
      package: selectedPackage, 
      price, 
      status: 'pending', 
      escrowStatus: 'held', 
      clientId: 'demo-001', 
      freelancerId: service.freelancerName, 
      requirements, 
      revisionsLeft: service.revisions, 
      deliveryFiles: [], 
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString() 
    });

    const transactionData: BackendTransactionParams = { 
      transaction_type: 'DEBIT', 
      amount: price, 
      description: `Freelance Order - ${service.title} (${selectedPackage})`, 
      status: 'successful', 
      category: 'escrow', 
      payment_method: 'Wallet' 
    };
    
    addTransaction(transactionData as any);
    addNotification({ title: 'Order Placed', subtitle: `Your order for ${service.title} is in escrow`, category: 'marketplace', read: false, amount: price });
    
    showToast(`Order placed! ₦${price.toLocaleString()} held in escrow`);
    setShowOrder(null);
    setRequirements('');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Freelance Hub" subtitle="Hire top talent" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header section leveraging the Plus Icon */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Freelance Marketplace</p>
                <p className="text-2xl font-black mt-1">Find Top Talent</p>
                <p className="text-xs text-slate-400 mt-1">Secure escrow payments • Verified freelancers</p>
              </div>
              <div className="flex gap-2">
                <button className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center transition-all">
                  <Plus className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Search bar container implementing the 'Input' and 'Send' component */}
          <div className="relative flex gap-2 items-center">
            <div className="relative flex-1">
              <Input 
                type="text" 
                placeholder="Search custom service requests..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-white/5 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <Button size="icon" className="bg-orange-500 hover:bg-orange-600 rounded-xl h-10 w-10">
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Popular Services</h3>
            {DEMO_SERVICES.map(service => (
              <div key={service.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-400" /> {service.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{service.description}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 rounded-lg">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-bold text-amber-500">{service.rating}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {service.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-white/5">{skill}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.deliveryTime}</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {service.completedJobs} jobs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800 dark:text-white flex items-center">
                      <DollarSign className="w-3.5 h-3.5" />{service.pricing.basic.toLocaleString()}
                    </span>
                    <button onClick={() => { setShowOrder(service.id); setSelectedPackage('basic'); }} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[10px] font-bold transition-all active:scale-95">
                      Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* My Orders */}
          {freelanceOrders.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">My Orders</h3>
              {freelanceOrders.map(order => (
                <div key={order.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{DEMO_SERVICES.find(s => s.id === order.serviceId)?.title || 'Service'}</p>
                      <p className="text-[10px] text-slate-400">{order.package} package • Escrow: {order.escrowStatus}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">₦{order.price.toLocaleString()}</p>
                      <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">{order.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Order Modal */}
      {showOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => setShowOrder(null)} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Place Order</h3>
              <button onClick={() => setShowOrder(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>
            {(() => {
              const service = DEMO_SERVICES.find(s => s.id === showOrder);
              if (!service) return null;
              return (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{service.title}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['basic', 'standard', 'premium'] as const).map(pkg => (
                      <button key={pkg} onClick={() => setSelectedPackage(pkg)} className={`p-3 rounded-xl text-center transition-all ${selectedPackage === pkg ? 'bg-orange-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}>
                        <p className="text-[10px] font-bold uppercase">{pkg}</p>
                        <p className={`text-sm font-black ${selectedPackage === pkg ? 'text-white' : 'text-slate-800 dark:text-white'}`}>₦{service.pricing[pkg].toLocaleString()}</p>
                      </button>
                    ))}
                  </div>
                  <textarea value={requirements} onChange={e => setRequirements(e.target.value)} placeholder="Describe your requirements..." className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border border-slate-200 dark:border-white/5 outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px] resize-none" />
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <p className="text-[10px] font-bold text-emerald-600">₦{service.pricing[selectedPackage].toLocaleString()} will be held in escrow until delivery</p>
                  </div>
                  <Button onClick={() => handleOrder(showOrder)} className="w-full bg-orange-500 hover:bg-orange-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl active:scale-95">
                    Pay & Place Order
                  </Button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
      
      {/* Handled dynamic function/component assignment assignment safely */}
      {typeof ToastComponent === 'function' ? ToastComponent() : ToastComponent}
    </div>
  );
}
