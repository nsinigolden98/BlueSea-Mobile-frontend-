import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  color?: 'sky' | 'success' | 'warning' | 'danger' | 'purple';
  onClick?: () => void;
}

const colorMap = {
  sky: { bg: 'var(--tm-sky-light)', icon: 'var(--tm-sky-main)' },
  success: { bg: 'var(--tm-success-light)', icon: 'var(--tm-success)' },
  warning: { bg: 'var(--tm-warning-light)', icon: 'var(--tm-warning)' },
  danger: { bg: 'var(--tm-danger-light)', icon: 'var(--tm-danger)' },
  purple: { bg: 'var(--tm-purple-light)', icon: 'var(--tm-purple)' },
};

export default function MetricCard({ title, value, icon: Icon, trend, color = 'sky', onClick }: MetricCardProps) {
  const colors = colorMap[color];

  return (
    <div 
      onClick={onClick}
      className={`tm-metric-card ${onClick ? 'cursor-pointer tm-card-hover' : ''} animate-slide-up`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: colors.bg }}>
          <Icon className="w-5 h-5" style={{ color: colors.icon }} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend.positive ? 'text-[var(--tm-success)] bg-[var(--tm-success-light)]' : 'text-[var(--tm-danger)] bg-[var(--tm-danger-light)]'}`}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p className="tm-metric-value">{value}</p>
      <p className="tm-metric-label">{title}</p>
    </div>
  );
}
