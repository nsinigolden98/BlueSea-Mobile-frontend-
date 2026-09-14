import { useQuery } from '@tanstack/react-query';
import { historyApi } from '../../api/history.api';

export const useHistory = (filters: { type?: string; status?: string; search?: string }) => {
  return useQuery({
    queryKey: ['history', filters],
    queryFn: () => historyApi.getHistory(filters),
  });
};
