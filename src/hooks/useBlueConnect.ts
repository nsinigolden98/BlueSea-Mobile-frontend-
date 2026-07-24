import { useState, useCallback } from 'react';
import type { Company, CompanyConfiguration, CustomerProfile } from '@/types/blueconnect';
import { blueConnectApi } from '@/services/blueconnectService';

export function useBlueConnect() {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [activeConfig, setActiveConfig] = useState<CompanyConfiguration | null>(null);
  const [verifiedProfile, setVerifiedProfile] = useState<CustomerProfile | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async (search?: string, category?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await blueConnectApi.getCompanies(search, category);
      setCompanies(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load partners.');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectCompanyForPayment = useCallback(async (company: Company) => {
    setSelectedCompany(company);
    setVerifiedProfile(null);
    setError(null);
    setLoading(true);
    try {
      const config = await blueConnectApi.getCompanyConfiguration(company.id);
      setActiveConfig(config);
    } catch (err: any) {
      setError('Could not load organization payment rules.');
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyCustomer = useCallback(async (companyId: string, identifier: string) => {
    setVerifying(true);
    setError(null);
    try {
      const profile = await blueConnectApi.verifyCustomer(companyId, identifier);
      setVerifiedProfile(profile);
      return profile;
    } catch (err: any) {
      setVerifiedProfile(null);
      setError(err.message || 'Verification failed. Please check identifier.');
      return null;
    } finally {
      setVerifying(false);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCompany(null);
    setActiveConfig(null);
    setVerifiedProfile(null);
    setError(null);
  }, []);

  return {
    loading,
    verifying,
    error,
    companies,
    selectedCompany,
    activeConfig,
    verifiedProfile,
    fetchCompanies,
    selectCompanyForPayment,
    verifyCustomer,
    clearSelection
  };
}