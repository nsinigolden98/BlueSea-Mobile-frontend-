// src/pages/vault/views/VaultMissions.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, CheckCircle, Play, ExternalLink, ShieldCheck, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MissionTask {
  id: string;
  title: string;
  points: number;
  category: 'social' | 'video' | 'app' | 'daily';
  actionUrl?: string;
  status: 'available' | 'pending' | 'completed';
  verifyType: 'code' | 'handle' | 'instant';
}

export function VaultMissions({ showToast }: { showToast: (msg: string) => void }) {
  const [tasks, setTasks] = useState<MissionTask[]>([
    { id: '1', title: 'Follow X (@BlueSeaApp)', points: 50, category: 'social', actionUrl: 'https://x.com', status: 'available', verifyType: 'handle' },
    { id: '2', title: 'Join Official Telegram Community', points: 50, category: 'social', actionUrl: 'https://t.me', status: 'available', verifyType: 'handle' },
    { id: '3', title: 'Watch YouTube Tutorial & Find Code', points: 100, category: 'video', actionUrl: 'https://youtube.com', status: 'available', verifyType: 'code' },
    { id: '4', title: 'Daily Check-in Bonus', points: 20, category: 'daily', status: 'available', verifyType: 'instant' }
  ]);

  const [activeTask, setActiveTask] = useState<MissionTask | null>(null);
  const [proofInput, setProofInput] = useState('');

  const handleVerifySubmit = () => {
    if (!activeTask) return;
    if (activeTask.verifyType !== 'instant' && !proofInput.trim()) {
      showToast('Please provide verification details');
      return;
    }

    setTasks(tasks.map(t => t.id === activeTask.id ? { ...t, status: 'completed' } : t));
    showToast(`Verification submitted! +${activeTask.points} BSP earned.`);
    setActiveTask(null);
    setProofInput('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white">Mission Center</h3>
          <p className="text-xs text-slate-500">Complete tasks to earn BSP points directly into your vault.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 text-sky-500 rounded-xl font-black text-xs">
          <Gift className="w-4 h-4" /> Earn Points
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center font-bold",
                task.category === 'video' ? "bg-purple-500/10 text-purple-500" : "bg-sky-500/10 text-sky-500"
              )}>
                {task.category === 'video' ? <Play className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white text-xs">{task.title}</p>
                <p className="text-[10px] font-black text-sky-500 uppercase">+{task.points} BSP Points</p>
              </div>
            </div>

            {task.status === 'completed' ? (
              <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl">
                <CheckCircle className="w-3.5 h-3.5" /> Claimed
              </span>
            ) : (
              <Button 
                onClick={() => setActiveTask(task)} 
                className={cn(
                  "rounded-xl text-xs font-bold cursor-pointer h-9 px-4 text-white",
                  task.category === 'video' ? "bg-purple-500 hover:bg-purple-600" : "bg-sky-500 hover:bg-sky-600"
                )}
              >
                Perform & Verify
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* TASK VERIFICATION MODAL */}
      {activeTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Task Verification</h4>
              <button onClick={() => setActiveTask(null)} className="text-slate-400 text-xs cursor-pointer">Close</button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
              <p className="text-xs font-bold text-slate-800 dark:text-white">{activeTask.title}</p>
              <p className="text-[10px] text-sky-500 font-bold">Reward: +{activeTask.points} BSP</p>
            </div>

            {activeTask.actionUrl && (
              <a 
                href={activeTask.actionUrl} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                Visit Link / Perform Task <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {activeTask.verifyType !== 'instant' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">
                  {activeTask.verifyType === 'code' ? 'Enter Secret Video Code' : 'Enter Handle / Profile Name'}
                </label>
                <Input 
                  placeholder={activeTask.verifyType === 'code' ? 'e.g. BLUE2026' : '@username'} 
                  value={proofInput}
                  onChange={(e) => setProofInput(e.target.value)}
                  className="rounded-xl dark:text-white text-xs font-bold"
                />
              </div>
            )}

            <Button onClick={handleVerifySubmit} className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl h-11 font-bold text-xs cursor-pointer">
              <ShieldCheck className="w-4 h-4 mr-1" /> Submit for Verification
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
