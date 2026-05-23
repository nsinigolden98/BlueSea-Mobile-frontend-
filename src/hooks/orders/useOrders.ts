import { useMutation, useQuery } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders.api';

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: ordersApi.createOrder,
  });
};

export const usePayOrder = () => {
  return useMutation({
    mutationFn: ordersApi.payOrder,
  });
};
