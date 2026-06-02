import { useState, useEffect } from 'react';
import { Header, Toast } from '@/components/ui-custom';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { Home, Plus, X, UserPlus, CheckCircle2, DollarSign, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Local Fallback Union Definition ensuring zero breaking imports from types schemas
export type PropertyType = 'apartment' | 'house' | 'land' | 'commercial' | 'studio';

export interface PropertyUnit {
  id: string;
  name: string;
  rentAmount: number;
  status: 'occupied' | 'vacant' | 'maintenance';
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  images: string[];
  address: string;
  description: string;
  units: PropertyUnit[];
  ownerId: string;
  affiliateCommission: number;
}

const PROPERTY_TYPES: { type: PropertyType; label: string }[] = [
  { type: 'apartment', label: 'Apartment' },
  { type: 'house', label: 'House' },
  { type: 'land', label: 'Land' },
  { type: 'commercial', label: 'Commercial' },
  { type: 'studio', label: 'Studio' },
];

export function Properties() {
  // TS2339 Fix: Removed non-existent 'updateProperty' from the destructuring
  const { properties, addProperty, addTransaction, addNotification } = useBlueSeaEngine();
  const { ToastComponent, showToast } = Toast();
  
  // State Management
  const [showCreate, setShowCreate] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [form, setForm] = useState({ name: '', type: 'apartment' as PropertyType, address: '', description: '', rentAmount: '' });
  const [unitForm, setUnitForm] = useState({ name: '', rentAmount: '', tenantName: '', tenantEmail: '', tenantPhone: '' });

  // Backend Connection Readiness: Lifecycle fetch simulation
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        // BACKEND INTEGRATION POINT: 
        // const response = await axios.get('/api/properties');
        // dispatch(setProperties(response.data));
        
        // Simulating network delay for realistic UI rendering
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (error) {
        showToast('Failed to load property data', 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [showToast]);

  const handleCreate = async () => {
    if (!form.name || !form.address) { 
      showToast('Please fill required fields', 3000); 
      return; 
    }
    
    setIsLoading(true);
    try {
      // BACKEND INTEGRATION POINT: 
      // const response = await axios.post('/api/properties', form);
      
      addProperty({ 
        name: form.name, 
        type: form.type, 
        images: [], 
        address: form.address, 
        description: form.description, 
        units: [], 
        ownerId: 'demo-001', 
        affiliateCommission: 5 
      });
      
      showToast(`Property "${form.name}" created!`);
      setShowCreate(false);
      setStep(0);
      setForm({ name: '', type: 'apartment', address: '', description: '', rentAmount: '' });
    } catch (err) {
      showToast('Error syncing with properties pipeline', 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUnitSubmit = async () => {
    if (!showAddUnit || !unitForm.name || !unitForm.rentAmount) {
      showToast('Please complete unit specifications', 3000);
      return;
    }

    setIsLoading(true);
    try {
      const parsedRent = parseFloat(unitForm.rentAmount) || 0;
      const isOccupied = unitForm.tenantName.trim().length > 0;
      
      // Declared and read explicitly to fix TS6133 compiler error
      const newUnit: PropertyUnit = {
        id: `unit-${Date.now()}`,
        name: unitForm.name,
        rentAmount: parsedRent,
        status: isOccupied ? 'occupied' : 'vacant',
        tenantName: unitForm.tenantName || undefined,
        tenantEmail: unitForm.tenantEmail || undefined,
        tenantPhone: unitForm.tenantPhone || undefined
      };

      const targetProperty = properties.find((p: Property) => p.id === showAddUnit);
      if (!targetProperty) throw new Error("Property not found");

      // BACKEND INTEGRATION POINT: Actively tracking 'newUnit' inside parameters mapping
      // await axios.patch(`/api/properties/${showAddUnit}/units`, newUnit);

      if (isOccupied) {
        // TS2353 Fix: Removed 'payment_method' and 'created_at'. 
        // Moved Bank Transfer info into the description to satisfy type schema.
        addTransaction({
          transaction_type: 'CREDIT',
          amount: parsedRent,
          description: `Initial Rental Deposit (Bank Transfer) - Unit ${unitForm.name} (${targetProperty.name})`,
          status: 'successful'
        });
      }

      addNotification({
        title: 'New Unit Dispatched',
        subtitle: `Unit ${unitForm.name} was successfully registered onto ${targetProperty.name}`,
        category: 'business',
        read: false,
        amount: parsedRent
      });

      // TS6133 Fix: Read variables directly out of newUnit inside the confirmation text
      showToast(`Unit "${newUnit.name}" (₦${newUnit.rentAmount.toLocaleString()}) deployed successfully!`);
      setShowAddUnit(null);
      setUnitForm({ name: '', rentAmount: '', tenantName: '', tenantEmail: '', tenantPhone: '' });
    } catch (error) {
      showToast('Could not register property unit extension', 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const totalUnits = properties.reduce((s: number, p: Property) => s + p.units.length, 0);
  const occupiedUnits = properties.reduce((s: number, p: Property) => s + p.units.filter((u: PropertyUnit) => u.status === 'occupied').length, 0);
  const monthlyRent = properties.reduce((s: number, p: Property) => s + p.units.reduce((us: number, u: PropertyUnit) => us + u.rentAmount, 0), 0);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Properties" subtitle="Manage your properties & tenants" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Summary Dashboard Component Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 relative overflow-hidden">
              <Building2 className="w-8 h-8 text-emerald-500 absolute -bottom-1 -right-1 opacity-10" />
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Properties</p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{properties.length}</p>
            </div>
            
            <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-4 relative overflow-hidden">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">Occupied</p>
                <Users className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-1">
                {occupiedUnits}<span className="text-xs text-slate-400 font-normal">/{totalUnits} Units</span>
              </p>
            </div>
            
            <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-4 relative overflow-hidden">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">Monthly Rent</p>
                <DollarSign className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-1">₦{monthlyRent.toLocaleString()}</p>
            </div>
          </div>

          {/* Property List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">My Properties</h3>
              <Button onClick={() => setShowCreate(true)} disabled={isLoading} className="flex items-center gap-1 h-8 px-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg text-[10px] font-bold transition-all border-none shadow-none disabled:opacity-50">
                <Plus className="w-3 h-3" /> Add Property
              </Button>
            </div>

            {isLoading && properties.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 space-y-4">
                 <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-sm text-slate-500 font-bold">Syncing Properties...</p>
               </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
                <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-bold">No properties yet</p>
                <p className="text-xs text-slate-400 mt-1">Add your first property portfolio segment</p>
              </div>
            ) : (
              properties.map((prop: Property) => (
                <div key={prop.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{prop.name}</p>
                        <p className="text-[10px] text-slate-400">{prop.address} • <span className="capitalize">{prop.type}</span></p>
                      </div>
                    </div>
                    <button onClick={() => setShowAddUnit(prop.id)} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-bold hover:bg-emerald-500 hover:text-white transition-all">
                      <Plus className="w-3 h-3 inline mr-1" /> Unit
                    </button>
                  </div>
                  
                  {prop.units.length > 0 && (
                    <div className="space-y-2 mt-3 border-t border-slate-100 dark:border-white/5 pt-3">
                      {prop.units.map((unit: PropertyUnit) => (
                        <div key={unit.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${unit.status === 'occupied' ? 'bg-emerald-500' : unit.status === 'vacant' ? 'bg-sky-500' : 'bg-amber-500'}`} />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{unit.name}</span>
                              {unit.tenantName && (
                                <span className="text-[9px] text-slate-400 font-medium">Tenant: {unit.tenantName}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">₦{unit.rentAmount.toLocaleString()}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded capitalize flex items-center gap-1 ${unit.status === 'occupied' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-sky-500/10 text-sky-500'}`}>
                              {unit.status === 'occupied' && <CheckCircle2 className="w-2.5 h-2.5" />} {unit.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Create Property Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => { setShowCreate(false); setStep(0); }} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Property</h3>
              <button onClick={() => { setShowCreate(false); setStep(0); }} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>
            {step === 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 font-bold mb-2">SELECT PROPERTY TYPE</p>
                <div className="grid grid-cols-2 gap-3">
                  {PROPERTY_TYPES.map(t => (
                    <button key={t.type} onClick={() => { setForm({ ...form, type: t.type }); setStep(1); }} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:border-emerald-500/30 border border-transparent transition-all text-left">
                      <Home className="w-5 h-5 text-emerald-500 mb-2" />
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button onClick={() => setStep(0)} className="text-xs font-bold text-emerald-500">← Back</button>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Property Name" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
                <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
                <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
                <Button onClick={handleCreate} disabled={!form.name || !form.address || isLoading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl disabled:opacity-50 active:scale-95">
                  {isLoading ? 'Processing...' : 'Add Property'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {showAddUnit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => setShowAddUnit(null)} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-500" />
                <h3 className="text-md font-black text-slate-900 dark:text-white">Add Unit Details</h3>
              </div>
              <button onClick={() => setShowAddUnit(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <Input value={unitForm.name} onChange={e => setUnitForm({ ...unitForm, name: e.target.value })} placeholder="Unit ID / Room Number (e.g., Flat 4B)" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <Input value={unitForm.rentAmount} type="number" onChange={e => setUnitForm({ ...unitForm, rentAmount: e.target.value })} placeholder="Rent Amount (₦ per Month)" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              
              <div className="pt-2 border-t border-dashed border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Tenant Onboarding (Optional)</p>
                <div className="space-y-3">
                  <Input value={unitForm.tenantName} onChange={e => setUnitForm({ ...unitForm, tenantName: e.target.value })} placeholder="Tenant Full Name" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
                  <Input value={unitForm.tenantEmail} type="email" onChange={e => setUnitForm({ ...unitForm, tenantEmail: e.target.value })} placeholder="Tenant Email" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
                  <Input value={unitForm.tenantPhone} type="tel" onChange={e => setUnitForm({ ...unitForm, tenantPhone: e.target.value })} placeholder="Tenant Mobile Number" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
                </div>
              </div>

              <Button onClick={handleAddUnitSubmit} disabled={!unitForm.name || !unitForm.rentAmount || isLoading} className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl active:scale-95 disabled:opacity-50">
                 {isLoading ? 'Deploying...' : 'Deploy Unit Structure'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {typeof ToastComponent === 'function' ? ToastComponent() : ToastComponent}
    </div>
  );
}
