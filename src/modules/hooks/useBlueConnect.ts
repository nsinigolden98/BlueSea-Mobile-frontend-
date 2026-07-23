import { useState, useEffect, useCallback } from 'react';
import type { Company, VerifiedCustomer } from '@/modules/blueconnect/types';
import { BlueConnectService } from '@/modules/blueconnect/services/blueconnect.service';

export function useBlueConnect() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Payment Modal State
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [verifiedCustomer, setVerifiedCustomer] = useState<VerifiedCustomer | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await BlueConnectService.getCompanies(selectedCategory, searchQuery);
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load BlueConnect companies', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const selectCompanyForPayment = (company: Company) => {
    setSelectedCompany(company);
    setVerifiedCustomer(null);
    setVerificationError(null);
  };

  const closeModal = () => {
    setSelectedCompany(null);
    setVerifiedCustomer(null);
    setVerificationError(null);
  };

  const verifyCustomer = async (identifier: string) => {
    if (!selectedCompany) return;
    setIsVerifying(true);
    setVerificationError(null);
    try {
      const customer = await BlueConnectService.verifyCustomer(selectedCompany.id, identifier);
      setVerifiedCustomer(customer);
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    companies,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedCompany,
    verifiedCustomer,
    isVerifying,
    verificationError,
    selectCompanyForPayment,
    closeModal,
    verifyCustomer
  };
}