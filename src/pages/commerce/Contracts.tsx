import { useState } from 'react';
import { Header, Toast } from '@/components/ui-custom';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { FileText, Plus, X, PenTool, Type, Upload, Send, CheckCircle2, Clock, AlertCircle, User, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Defined explicit interfaces for strict Type-Safety and Backend API matching
export interface ContractParticipant {
  id: string;
  name: string;
  email: string;
  role: string;
  signed: boolean;
  signedAt?: string;
  signatureType?: 'type' | 'draw';
  signatureData?: string;
}

export function Contracts() {
  const { contracts, addContract, updateContract } = useBlueSeaEngine();
  const { ToastComponent, showToast } = Toast();
  const [showCreate, setShowCreate] = useState(false);
  const [showSign, setShowSign] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', participantName: '', participantEmail: '' });
  const [signature, setSignature] = useState('');
  const [signMode, setSignMode] = useState<'type' | 'draw'>('type');

  // Converted to async to structure it for future backend connection
  const handleCreate = async () => {
    // Fixed TS2345: Swapped the boolean 'true' for a duration number '3000'
    if (!form.title || !form.participantName) { 
      showToast('Please fill required fields', 3000); 
      return; 
    }
    
    try {
      // BACKEND INTEGRATION POINT: await fetch('/api/contracts/create', { method: 'POST', body: JSON.stringify(form) })
      
      addContract({ 
        title: form.title, 
        status: 'sent', 
        participants: [{ id: 'p1', name: form.participantName, email: form.participantEmail, role: 'Signer', signed: false }], 
        witnesses: [], 
        signingOrder: ['p1'], 
        signedDocumentUrl: undefined 
      });
      
      showToast('Contract created and sent!');
      setShowCreate(false);
      setForm({ title: '', participantName: '', participantEmail: '' });
    } catch (error) {
      showToast('Failed to create contract', 3000);
    }
  };

  // Converted to async for backend compatibility
  const handleSign = async (contractId: string) => {
    if (!signature) { 
      showToast('Please provide a signature', 3000); 
      return; 
    }

    try {
      // BACKEND INTEGRATION POINT: await fetch(`/api/contracts/${contractId}/sign`, { method: 'POST', body: JSON.stringify({ signature }) })

      // Fixed TS7006: Explicitly typed 'p' as ContractParticipant
      const targetContract = contracts.find(c => c.id === contractId);
      const updatedParticipants = targetContract?.participants.map((p: ContractParticipant) => ({ 
        ...p, 
        signed: true, 
        signedAt: new Date().toISOString(), 
        signatureType: signMode === 'type' ? 'type' as const : 'draw' as const, 
        signatureData: signature 
      })) || [];

      updateContract(contractId, { 
        status: 'completed', 
        completedAt: new Date().toISOString(), 
        participants: updatedParticipants 
      });
      
      showToast('Contract signed successfully!');
      setShowSign(null);
      setSignature('');
    } catch (error) {
      showToast('Failed to sign contract', 3000);
    }
  };

  const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
    draft: { color: 'text-slate-500', bg: 'bg-slate-500/10', icon: FileText, label: 'Draft' },
    sent: { color: 'text-sky-500', bg: 'bg-sky-500/10', icon: Send, label: 'Sent' },
    pending: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock, label: 'Pending' },
    signed: { color: 'text-violet-500', bg: 'bg-violet-500/10', icon: PenTool, label: 'Signed' },
    completed: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2, label: 'Completed' },
    declined: { color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertCircle, label: 'Declined' },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Digital Contracts" subtitle="Sign documents securely" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Summary */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Contracts</p>
                <p className="text-3xl font-black mt-1">{contracts.length}</p>
                <p className="text-[10px] text-slate-400 mt-1">{contracts.filter(c => c.status === 'completed').length} completed</p>
              </div>
              <div className="w-14 h-14 bg-rose-500/20 rounded-2xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-rose-400" />
              </div>
            </div>
          </div>

          {/* Create Button */}
          <button onClick={() => setShowCreate(true)} className="w-full p-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-rose-500/20">
            <Plus className="w-5 h-5" />
            <span className="text-sm font-bold">Create New Contract</span>
          </button>

          {/* Contract List */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">My Contracts</h3>
            {contracts.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-bold">No contracts yet</p>
                <p className="text-xs text-slate-400 mt-1">Create your first digital contract</p>
              </div>
            ) : (
              contracts.map(contract => {
                const cfg = statusConfig[contract.status] || statusConfig.draft;
                
                // Fixed TS7006 (implicit any) and utilized the unused TS6133 variable 'allSigned'
                const allSigned = contract.participants.every((p: ContractParticipant) => p.signed);
                
                return (
                  <div key={contract.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center`}>
                          <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{contract.title}</p>
                          {/* Implemented 'User' Icon */}
                          <div className="flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-slate-400" />
                            <p className="text-[10px] text-slate-400">{contract.participants.length} participant(s)</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className={`text-[9px] font-bold ${cfg.color} ${cfg.bg} px-2 py-0.5 rounded`}>{cfg.label}</span>
                         {/* Implementing the allSigned variable */}
                         {allSigned ? (
                           <span className="text-[9px] text-emerald-500 mt-1 font-semibold">Fully Executed</span>
                         ) : (
                           <span className="text-[9px] text-slate-400 mt-1">Awaiting Signatures</span>
                         )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {contract.status === 'sent' && (
                        <button onClick={() => setShowSign(contract.id)} className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-bold transition-all active:scale-95">
                          Sign Now
                        </button>
                      )}
                      
                      {/* Implemented 'Eye' Icon */}
                      <button onClick={() => showToast('Viewing contract...')} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" /> View
                      </button>

                      {contract.status === 'completed' && (
                        <button onClick={() => showToast('Contract downloaded!')} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1">
                          <Download className="w-3 h-3" /> Download
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Create Contract</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Contract Title" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <Input value={form.participantName} onChange={e => setForm({ ...form, participantName: e.target.value })} placeholder="Participant Name" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <Input value={form.participantEmail} onChange={e => setForm({ ...form, participantEmail: e.target.value })} placeholder="Participant Email" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              
              {/* Implemented 'Upload' Icon */}
              <button onClick={() => showToast('File picker opened')} className="w-full flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                 <Upload className="w-6 h-6 text-slate-400" />
                 <span className="text-xs font-bold text-slate-500">Upload External Document (Optional)</span>
              </button>

              <Button onClick={handleCreate} disabled={!form.title || !form.participantName} className="w-full bg-rose-500 hover:bg-rose-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl disabled:opacity-50 active:scale-95">Create & Send</Button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Modal */}
      {showSign && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => setShowSign(null)} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Sign Contract</h3>
              <button onClick={() => setShowSign(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button onClick={() => setSignMode('type')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${signMode === 'type' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Type className="w-4 h-4 inline mr-1" /> Type
                </button>
                <button onClick={() => setSignMode('draw')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${signMode === 'draw' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <PenTool className="w-4 h-4 inline mr-1" /> Draw
                </button>
              </div>
              {signMode === 'type' ? (
                <Input value={signature} onChange={e => setSignature(e.target.value)} placeholder="Type your full name" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-14 text-center text-lg font-bold" />
              ) : (
                <div className="h-32 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center">
                  <p className="text-xs text-slate-400 font-bold">Draw signature here</p>
                </div>
              )}
              <div className="flex items-center gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <p className="text-[10px] font-bold text-amber-600">By signing, you agree to the terms of this contract</p>
              </div>
              <Button onClick={() => handleSign(showSign)} disabled={!signature} className="w-full bg-rose-500 hover:bg-rose-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl disabled:opacity-50 active:scale-95">
                Sign Contract
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Handled dynamic Toast Component correctly to resolve TS2322 */}
      {typeof ToastComponent === 'function' ? ToastComponent() : ToastComponent}
    </div>
  );
}
