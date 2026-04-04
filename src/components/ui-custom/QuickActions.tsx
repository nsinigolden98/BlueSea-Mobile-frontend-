import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Wifi, Users, Lightbulb } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  color: string;
}

const actions: QuickAction[] = [
  { 
    id: 'airtime', 
    label: 'Buy Airtime', 
    icon: Smartphone, 
    path: '/airtime',
    color: 'from-blue-500 to-blue-600'
  },
  { 
    id: 'data', 
    label: 'Buy Data', 
    icon: Wifi, 
    path: '/data',
    color: 'from-sky-500 to-sky-600'
  },
  { 
    id: 'group', 
    label: 'Group Payments', 
    icon: Users, 
    path: '/services',
    color: 'from-cyan-500 to-cyan-600'
  },
  { 
    id: 'bills', 
    label: 'Pay Bills', 
    icon: Lightbulb, 
    path: '/services',
    color: 'from-teal-500 to-teal-600'
  },
];

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const navigate = useNavigate();

  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Quick Actions</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className={cn(
                'group flex flex-col items-center gap-3 p-4 rounded-2xl',
                'bg-gradient-to-br shadow-md hover:shadow-lg transition-all duration-200',
                'hover:-translate-y-0.5',
                action.color
              )}
            >
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-white">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
