import type { Company } from '@/types/payroll-pro';
import { useNavigate } from 'react-router';
import { Building2, Users, MapPin, ChevronRight } from 'lucide-react';

interface CompanyCardProps {
  company: Company;
  role?: 'owner' | 'employee';
  showActions?: boolean;
}

export default function CompanyCard({ company, role = 'owner', showActions = true }: CompanyCardProps) {
  const navigate = useNavigate();
  const employeeCount = company.stats.totalEmployees;
  const branchCount = company.stats.totalBranches;

  const handleClick = () => {
    if (role === 'owner') {
      navigate(`/payroll-pro/company/${company.id}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`tm-card p-4 ${role === 'owner' ? 'tm-card-hover cursor-pointer' : ''} animate-slide-up`}
      style={{ animationDelay: '0.1s' }}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--tm-sky-main)] to-[var(--tm-sky-dark)] flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-[var(--tm-text-main)] truncate">{company.name}</h3>
            {company.membershipRole === 'owner' && (
              <span className="tm-status-badge px-2 py-0.5 text-[0.65rem] tm-status-active whitespace-nowrap">Owner</span>
            )}
          </div>
          <p className="text-xs text-[var(--tm-text-muted)] mb-2">{company.address}</p>
          <div className="flex items-center gap-4 text-xs text-[var(--tm-text-muted)]">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {employeeCount} staff
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {branchCount} branches
            </span>
          </div>
        </div>
        {role === 'owner' && showActions && (
          <ChevronRight className="w-5 h-5 text-[var(--tm-text-muted)] flex-shrink-0 self-center" />
        )}
      </div>
    </div>
  );
}
