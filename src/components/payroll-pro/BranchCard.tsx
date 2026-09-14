import { useNavigate } from 'react-router';
import { MapPin, Users, ChevronRight, UserCog } from 'lucide-react';
import type { Branch } from '@/types/payroll-pro';
import StatusBadge from './StatusBadge';

interface BranchCardProps {
  branch: Branch;
}

export default function BranchCard({ branch }: BranchCardProps) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/payroll-pro/branch/${branch.id}`)}
      className="tm-card p-4 tm-card-hover cursor-pointer animate-slide-up"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-[var(--tm-text-main)] truncate">{branch.name}</h3>
            <StatusBadge status={branch.status} size="sm" />
          </div>
          <p className="text-xs text-[var(--tm-text-muted)] mb-2 line-clamp-1">{branch.address}</p>
          <div className="flex items-center gap-4 text-xs text-[var(--tm-text-muted)]">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {branch.employeeCount} staff
            </span>
            {branch.managerName && (
              <span className="flex items-center gap-1">
                <UserCog className="w-3.5 h-3.5" />
                {branch.managerName}
              </span>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-[var(--tm-border-light)] flex items-center justify-between">
            <span className="text-xs text-[var(--tm-text-muted)]">Monthly Estimate</span>
            <span className="text-sm font-bold text-[var(--tm-sky-dark)]">
              &#8358;{branch.monthlyPayrollEstimate.toLocaleString()}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[var(--tm-text-muted)] flex-shrink-0 self-center" />
      </div>
    </div>
  );
}
