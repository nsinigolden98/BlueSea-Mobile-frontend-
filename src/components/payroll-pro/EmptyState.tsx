import { Users, Building2, Wallet, ClipboardCheck, FileText, Bell, Search, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  type: 'employees' | 'branches' | 'payroll' | 'approvals' | 'reports' | 'notifications' | 'search' | 'documents' | 'general';
  title?: string;
  description?: string;
  actionLabel?: string;
  actionSecondaryLabel?: string;
  onAction?: () => void;
  onSecondaryAction?: () => void;
  className?: string;
}

const iconMap = {
  employees: Users,
  branches: Building2,
  payroll: Wallet,
  approvals: ClipboardCheck,
  reports: FileText,
  notifications: Bell,
  search: Search,
  documents: FolderOpen,
  general: FolderOpen,
};

const defaultMessages: Record<string, { title: string; description: string }> = {
  employees: { title: 'No Employees Yet', description: 'Add your first employee to begin managing your workforce.' },
  branches: { title: 'No Branches Yet', description: 'Create your first branch to organize your staff across locations.' },
  payroll: { title: 'No Payroll Records', description: 'Run your first payroll to start tracking salary payments.' },
  approvals: { title: 'No Pending Approvals', description: 'All caught up! New requests will appear here.' },
  reports: { title: 'No Reports Available', description: 'Generate your first report to see insights.' },
  notifications: { title: 'No Notifications', description: 'You\'re all caught up!' },
  search: { title: 'No Results Found', description: 'Try adjusting your search terms or filters.' },
  documents: { title: 'No Documents', description: 'Upload documents to keep employee records organized.' },
  general: { title: 'Nothing Here Yet', description: 'Get started by creating your first item.' },
};

export default function EmptyState({
  type,
  title,
  description,
  actionLabel,
  actionSecondaryLabel,
  onAction,
  onSecondaryAction,
  className = '',
}: EmptyStateProps) {
  const Icon = iconMap[type];
  const defaults = defaultMessages[type];

  return (
    <div className={`tm-empty-state ${className}`}>
      <div className="tm-empty-icon">
        <Icon className="w-8 h-8 text-[var(--tm-sky-main)]" />
      </div>
      <h3 className="text-lg font-bold text-[var(--tm-text-main)]">{title || defaults.title}</h3>
      <p className="text-sm text-[var(--tm-text-muted)] max-w-[280px]">{description || defaults.description}</p>
      <div className="flex flex-col gap-2 w-full max-w-[280px] mt-2">
        {actionLabel && onAction && (
          <button onClick={onAction} className="tm-btn-primary w-full">
            {actionLabel}
          </button>
        )}
        {actionSecondaryLabel && onSecondaryAction && (
          <button onClick={onSecondaryAction} className="tm-btn-secondary w-full">
            {actionSecondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
