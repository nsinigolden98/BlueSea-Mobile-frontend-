// src/pages/vault/views/VaultAddressBook.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookMarked, Plus, Copy, Trash2, X } from 'lucide-react';

interface SavedAddress {
  id: string;
  label: string;
  network: string;
  address: string;
}

export function VaultAddressBook({ showToast }: { showToast: (msg: string) => void }) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    { id: '1', label: 'My Binance TRC20', network: 'USDT (TRC20)', address: 'TYD4k9A1zL2mN3pQ4rS5tU6vW7xY8z9012' },
    { id: '2', label: 'Trust Wallet BEP20', network: 'USDT (BEP20)', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [label, setLabel] = useState('');
  const [network, setNetwork] = useState('USDT (TRC20)');
  const [address, setAddress] = useState('');

  const handleAddAddress = () => {
    if (!label.trim() || !address.trim()) {
      showToast('Please provide both label and address');
      return;
    }

    const newEntry: SavedAddress = {
      id: Date.now().toString(),
      label: label.trim(),
      network,
      address: address.trim()
    };

    setAddresses([newEntry, ...addresses]);
    setLabel('');
    setAddress('');
    setShowAddModal(false);
    showToast('New address added safely!');
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
    showToast('Address removed');
  };

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    showToast('Address copied to clipboard!');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white">Address Book</h3>
          <p className="text-xs text-slate-500">Save your frequently used withdrawal addresses.</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-10 text-slate-400 space-y-2">
          <BookMarked className="w-10 h-10 mx-auto opacity-50" />
          <p className="text-xs font-bold">No saved addresses yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((item) => (
            <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-800 dark:text-white text-sm">{item.label}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-500 uppercase">{item.network}</span>
                </div>
                <p className="text-xs font-mono font-semibold text-slate-500 truncate">{item.address}</p>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => handleCopy(item.address)} className="p-2 text-slate-400 hover:text-sky-500 rounded-xl hover:bg-white dark:hover:bg-slate-800">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-white dark:hover:bg-slate-800">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD ADDRESS MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-800 dark:text-white">Save New Wallet Address</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs font-bold uppercase text-slate-400">Label / Name</Label>
                <Input 
                  placeholder="e.g. My Binance Wallet" 
                  value={label} 
                  onChange={(e) => setLabel(e.target.value)}
                  className="rounded-xl mt-1 dark:text-white"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase text-slate-400">Asset & Network</Label>
                <select 
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold dark:text-white border border-slate-200 dark:border-slate-700"
                >
                  <option value="USDT (TRC20)">USDT (TRC20)</option>
                  <option value="USDT (BEP20)">USDT (BEP20)</option>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="NGN Bank">NGN Bank Account</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase text-slate-400">Wallet Address</Label>
                <Input 
                  placeholder="Enter recipient address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  className="rounded-xl mt-1 font-mono text-xs dark:text-white"
                />
              </div>
            </div>

            <Button onClick={handleAddAddress} className="w-full bg-sky-500 text-white rounded-2xl h-11 font-bold text-xs">
              Save Address
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
