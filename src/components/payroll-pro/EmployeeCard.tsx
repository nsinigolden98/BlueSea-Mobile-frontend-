import { useNavigate } from 'react-router';
import { Mail, MapPin, ChevronRight, Briefcase } from 'lucide-react';
import type { Employee } from '@/types/payroll-pro';
import StatusBadge from './StatusBadge';

interface EmployeeCardProps {
  employee: Employee;
  showBranch?: boolean;
}

export default function EmployeeCard({ employee, showBranch = true }: EmployeeCardProps) {
  const navigate = useNavigate();

  const initials = employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div 
      onClick={() => navigate(`/payroll-pro/employee/${employee.id}`)}
      className="tm-card p-4 tm-card-hover cursor-pointer animate-slide-up"
    >
      <div className="flex items-start gap-3">
        <div className="tm-avatar">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-[var(--tm-text-main)] truncate">{employee.fullName}</h3>
            <StatusBadge status={employee.status} size="sm" />
          </div>
          <p className="text-xs text-[var(--tm-text-muted)] mb-2 flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            {employee.role.replace('_', ' ')} · {employee.department.replace('_', ' ')}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--tm-text-muted)]">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span className="truncate max-w-[140px]">{employee.email}</span>
            </span>
            {showBranch && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {employee.branchName}
              </span>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-[var(--tm-border-light)] flex items-center justify-between">
            <span className="text-xs text-[var(--tm-text-muted)]">{employee.employeeId}</span>
            <span className="text-sm font-bold text-[var(--tm-sky-dark)]">
              &#8358;{employee.salary.toLocaleString()}
              <span className="text-[0.65rem] font-medium text-[var(--tm-text-muted)]">/mo</span>
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[var(--tm-text-muted)] flex-shrink-0 self-center" />
      </div>
    </div>
  );
}
