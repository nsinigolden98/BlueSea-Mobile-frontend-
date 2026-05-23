import { useQuery, useMutation } from '@tanstack/react-query';
import { marketplaceApi } from '../../api/marketplace.api';

export const useMarketplaceProducts = (params?: any) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => marketplaceApi.getProducts(params),
  });
};

export const useProductDetails = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => marketplaceApi.getProduct(productId),
    enabled: !!productId,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: marketplaceApi.getCategories,
  });
};

export const useTrackProductView = () => {
  return useMutation({
    mutationFn: marketplaceApi.trackView,
  });
};