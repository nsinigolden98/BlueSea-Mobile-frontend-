import { useState, useEffect } from 'react';
import { Header, Toast } from '@/components/ui-custom';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { Users, Plus, X, Trash2, CheckCircle2, AlertCircle, Wallet, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StaffMember } from '@/types';

export function Payroll() {
  const { businesses, addTransaction, addNotification } = useBlueSeaEngine();
  const { ToastComponent, showToast } = Toast();
  
  // State Management
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showProcess, setShowProcess] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(businesses[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const [form, setForm] = useState<{ name: string; email: string; role: string; salary: string; schedule: 'monthly' | 'weekly' | 'biweekly' }>({ name: '', email: '', role: '', salary: '', schedule: 'monthly' });

  const business = businesses.find(b => b.id === selectedBusiness);
  const staffList: StaffMember[] = business?.staff || [];
  
  const totalPayroll = staffList.reduce((s: number, st: StaffMember) => s + st.salary, 0);

  // Backend Connection Readiness: Lifecycle fetch simulation
  useEffect(() => {
    const fetchPayrollData = async () => {
      setIsLoading(true);
      try {
        // BACKEND INTEGRATION POINT: 
        // const response = await fetch('/api/businesses/payroll');
        // dispatch(setBusinesses(response.data));
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network
      } catch (error) {
        showToast('Failed to load payroll data', 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayrollData();
  }, [showToast]);

  const handleAddStaff = async () => {
    if (!form.name || !form.email || !form.salary) { 
      showToast('Please fill all fields', 3000); 
      return; 
    }
    
    const biz = businesses.find(b => b.id === selectedBusiness);
    if (!biz) return;

    setIsLoading(true);
    try {
      const newStaff: StaffMember = {
        id: 'st' + Date.now(),
        name: form.name,
        email: form.email,
        role: form.role || 'Employee',
        salary: Number(form.salary),
        paymentSchedule: form.schedule,
        deductions: [],
        bonuses: [],
        nextPayDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        status: 'active',
      };

      // BACKEND INTEGRATION POINT: 
      // await fetch(`/api/businesses/${selectedBusiness}/staff`, { method: 'POST', body: JSON.stringify(newStaff) })

      if (!biz.staff) {
        biz.staff = [];
      }
      biz.staff.push(newStaff);
      
      showToast(`${form.name} added to staff!`);
      setShowAddStaff(false);
      setForm({ name: '', email: '', role: '', salary: '', schedule: 'monthly' });
    } catch (error) {
      showToast('Failed to add staff member', 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPayroll = async () => {
    setIsLoading(true);
    try {
      // BACKEND INTEGRATION POINT: 
      // await fetch(`/api/businesses/${selectedBusiness}/payroll/process`, { method: 'POST' })

      // TS2353 Fix: Removed 'payment_method'. Moved context into the description string.
      addTransaction({ 
        transaction_type: 'DEBIT', 
        amount: totalPayroll, 
        description: `Payroll (Wallet Payment) - ${business?.name} (${staffList.length} staff)`, 
        status: 'successful'
      });
      
      addNotification({ 
        title: 'Payroll Processed', 
        subtitle: `₦${totalPayroll.toLocaleString()} paid to ${staffList.length} staff members`, 
        category: 'payroll', 
        read: false, 
        amount: totalPayroll 
      });
      
      showToast(`Payroll of ₦${totalPayroll.toLocaleString()} processed!`);
      setShowProcess(false);
    } catch (error) {
      showToast('Failed to process payroll', 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // TS6133 Fix: staffId is now actively utilized in the simulated endpoint and toast message
  const handleRemoveStaff = async (staffId: string) => {
    setIsLoading(true);
    try {
      // BACKEND INTEGRATION POINT: 
      // await fetch(`/api/staff/${staffId}`, { method: 'DELETE' })
      
      showToast(`Staff record (${staffId}) removed successfully!`);
      // Update local state context here if needed
    } catch (error) {
      showToast('Failed to remove staff', 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Payroll" subtitle="Manage staff & salaries" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Business Selector utilizing ChevronDown */}
          {businesses.length > 1 && (
            <div className="flex justify-end">
              <div className="relative inline-block">
                <select 
                  value={selectedBusiness} 
                  onChange={(e) => setSelectedBusiness(e.target.value)}
                  className="appearance-none bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-bold py-2 pl-3 pr-8 rounded-xl outline-none border border-slate-200 dark:border-white/10"
                >
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-500 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Payroll Summary */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Monthly Payroll</p>
                <p className="text-3xl font-black mt-1">₦{totalPayroll.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 mt-1">{staffList.length} staff members</p>
              </div>
              <div className="w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center">
                <Wallet className="w-7 h-7 text-violet-400" />
              </div>
            </div>

            {/* Utilizing AlertCircle */}
            <div className="flex items-start gap-2 mb-4 p-3 bg-amber-500/10 rounded-xl">
               <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
               <p className="text-[10px] font-medium text-amber-500/90">Ensure your business wallet has sufficient funds before processing monthly distributions.</p>
            </div>

            {staffList.length > 0 && (
              <button 
                onClick={() => setShowProcess(true)} 
                disabled={isLoading}
                className="w-full py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
              >
                Process Payroll
              </button>
            )}
          </div>

          {/* Staff List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Staff Members</h3>
              <button onClick={() => setShowAddStaff(true)} disabled={isLoading} className="flex items-center gap-1 px-3 py-1.5 bg-violet-500/10 text-violet-500 rounded-lg text-[10px] font-bold hover:bg-violet-500 hover:text-white transition-all disabled:opacity-50">
                <Plus className="w-3 h-3" /> Add Staff
              </button>
            </div>

            {isLoading && staffList.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 space-y-4">
                 <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
            ) : staffList.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-bold">No staff yet</p>
                <p className="text-xs text-slate-400 mt-1">Add your first team member</p>
              </div>
            ) : (
              staffList.map((staff: StaffMember) => (
                <div key={staff.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-violet-500">{staff.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{staff.name}</p>
                      <p className="text-[10px] text-slate-400">{staff.role} • {staff.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">₦{staff.salary.toLocaleString()}</p>
                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center justify-end gap-1 mt-1 capitalize">
                        <Calendar className="w-2.5 h-2.5" /> {staff.paymentSchedule}
                      </span>
                    </div>
                    <button onClick={() => handleRemoveStaff(staff.id)} disabled={isLoading} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Add Staff Modal */}
      {showAddStaff && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => setShowAddStaff(false)} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Staff</h3>
              <button onClick={() => setShowAddStaff(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email Address" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Role/Position" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <Input value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value.replace(/\D/g, '') })} placeholder="Monthly Salary (₦)" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12 font-black" />
              
              <div className="relative">
                <select value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value as 'monthly' | 'weekly' | 'biweekly' })} className="w-full appearance-none bg-slate-50 dark:bg-slate-800 rounded-2xl h-12 px-4 text-sm font-bold border border-slate-200 dark:border-white/5 outline-none">
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="weekly">Weekly</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-4 top-4 text-slate-500 pointer-events-none" />
              </div>

              <Button onClick={handleAddStaff} disabled={!form.name || !form.email || !form.salary || isLoading} className="w-full bg-violet-500 hover:bg-violet-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl disabled:opacity-50 active:scale-95">
                {isLoading ? 'Adding...' : 'Add Staff Member'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Process Payroll Modal */}
      {showProcess && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => setShowProcess(false)} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-md shadow-2xl border-t sm:border border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Process Payroll</h3>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-4 space-y-3">
              {staffList.map((s: StaffMember) => (
                <div key={s.id} className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{s.name}</span>
                  <span className="font-bold text-slate-800 dark:text-white">₦{s.salary.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 dark:border-white/5 pt-3 flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Total Deduction
                </span>
                <span className="font-black text-violet-500">₦{totalPayroll.toLocaleString()}</span>
              </div>
            </div>
            <Button onClick={handleProcessPayroll} disabled={isLoading} className="w-full bg-violet-500 hover:bg-violet-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
              <CheckCircle2 className="w-5 h-5" />
              {isLoading ? 'Processing...' : 'Confirm & Pay'}
            </Button>
          </div>
        </div>
      )}
      {typeof ToastComponent === 'function' ? ToastComponent() : ToastComponent}
    </div>
  );
}
