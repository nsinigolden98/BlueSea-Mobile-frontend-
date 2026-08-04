// src/pages/vault/views/VaultAddressBook.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Copy, Trash2 } from 'lucide-react';

interface VaultAddressBookProps {
  showToast: (msg: string) => void;
}

export function VaultAddressBook({ showToast }: VaultAddressBookProps) {
  const [search, setSearch] = useState('');
  const [addresses, setAddresses] = useState([
    { id: '1', name: 'Personal Binance Wallet', address: 'TYD4k9A1zL2mN3pQ4rS5tU6vW7xY8z1234', network: 'TRC20' },
  ]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white">Saved Address Book</h3>
          <p className="text-xs text-slate-500">Manage trusted wallet destinations.</p>
        </div>
        <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs h-9 px-3 font-bold">
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        <Input 
          placeholder="Search address book..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none h-11 text-xs"
        />
      </div>

      <div className="space-y-3">
        {addresses.map((item) => (
          <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-800 dark:text-white">{item.name}</span>
                <span className="text-[9px] font-bold bg-sky-500/10 text-sky-500 px-2 py-0.5 rounded-full">{item.network}</span>
              </div>
              <p className="text-xs font-mono text-slate-400 truncate mt-1">{item.address}</p>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(item.address);
                  showToast('Address copied!');
                }}
                className="p-2 text-slate-500 hover:bg-slate-200 rounded-xl"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setAddresses(addresses.filter(a => a.id !== item.id))}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}