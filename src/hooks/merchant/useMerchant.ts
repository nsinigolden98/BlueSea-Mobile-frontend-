import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantApi } from '../../api/merchant.api';

export const useMerchantProducts = () => {
  return useQuery({
    queryKey: ['merchant', 'products'],
    queryFn: () => merchantApi.getProducts(),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: merchantApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Refresh marketplace
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => merchantApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); 
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: merchantApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useLocations = (selectedState?: string) => {
  const statesQuery = useQuery({
    queryKey: ['locations', 'states'],
    queryFn: () => merchantApi.getStates(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours cache
  });

  const lgasQuery = useQuery({
    queryKey: ['locations', 'lgas', selectedState],
    queryFn: () => merchantApi.getLgas(selectedState!),
    enabled: !!selectedState,
    staleTime: 1000 * 60 * 60 * 24,
  });

  return { statesQuery, lgasQuery };
};
