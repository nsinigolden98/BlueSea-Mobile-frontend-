// src/pages/vault/views/VaultMissions.tsx
import { Button } from '@/components/ui/button';

export function VaultMissions({ showToast }: { showToast: (msg: string) => void }) {
  const missions = [
    { id: '1', name: 'Follow X (Twitter) Account', points: 4, desc: 'Follow official @BlueSeaMobile' },
    { id: '2', name: 'Watch YouTube Tutorial', points: 8, desc: 'Find reward code in latest video' },
    { id: '3', name: 'Complete KYC Verification', points: 50, desc: 'Verify ID for tier 2 limit' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
      <div>
        <h3 className="text-lg font-black text-slate-800 dark:text-white">Mission Center</h3>
        <p className="text-xs text-slate-500">Complete tasks to earn BSP Reward Assets.</p>
      </div>

      <div className="space-y-3">
        {missions.map((m) => (
          <div key={m.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-xs">
                +{m.points}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">{m.name}</p>
                <p className="text-[10px] text-slate-400">{m.desc}</p>
              </div>
            </div>
            <Button size="sm" onClick={() => showToast(`Started: ${m.name}`)} className="bg-sky-500 text-white rounded-xl text-xs">
              Start
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}