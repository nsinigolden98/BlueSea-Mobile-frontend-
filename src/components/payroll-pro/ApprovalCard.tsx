import { User, Clock, Banknote, FileText } from 'lucide-react';
import type { ApprovalRequest } from '@/types/payroll-pro';
import StatusBadge from './StatusBadge';

interface ApprovalCardProps {
  approval: ApprovalRequest;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (approval: ApprovalRequest) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  bonus: <Banknote className="w-4 h-4" />,
  deduction: <Banknote className="w-4 h-4" />,
  leave_request: <FileText className="w-4 h-4" />,
  salary_change: <Banknote className="w-4 h-4" />,
  branch_request: <FileText className="w-4 h-4" />,
  employee_change: <User className="w-4 h-4" />,
  payroll_run: <Banknote className="w-4 h-4" />,
};

export default function ApprovalCard({ approval, onApprove, onReject, onView }: ApprovalCardProps) {
  return (
    <div className="tm-card p-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--tm-sky-light)] flex items-center justify-center text-[var(--tm-sky-main)] flex-shrink-0">
          {typeIcons[approval.type] || <FileText className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-[var(--tm-text-main)] text-sm truncate">{approval.title}</h3>
            <StatusBadge status={approval.status} size="sm" />
          </div>
          <p className="text-xs text-[var(--tm-text-muted)] mb-2">{approval.description}</p>
          <div className="flex items-center gap-3 text-xs text-[var(--tm-text-muted)]">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {approval.requestedByName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(approval.requestedAt).toLocaleDateString()}
            </span>
          </div>
          {approval.amount && (
            <div className="mt-2 pt-2 border-t border-[var(--tm-border-light)]">
              <span className="text-sm font-bold text-[var(--tm-text-main)]">
                &#8358;{approval.amount.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
      {approval.status === 'pending' && (onApprove || onReject) && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--tm-border-light)]">
          {onApprove && (
            <button onClick={() => onApprove(approval.id)} className="tm-btn-primary flex-1 py-2.5 text-sm">
              Approve
            </button>
          )}
          {onReject && (
            <button onClick={() => onReject(approval.id)} className="tm-btn-secondary flex-1 py-2.5 text-sm">
              Reject
            </button>
          )}
          {onView && (
            <button onClick={() => onView(approval)} className="tm-btn-secondary py-2.5 text-sm px-4">
              Details
            </button>
          )}
        </div>
      )}
    </div>
  );
}
