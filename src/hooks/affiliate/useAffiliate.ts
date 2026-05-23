import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { affiliateApi } from '../../api/affiliate.api';

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['affiliate', 'campaigns'],
    queryFn: () => affiliateApi.getCampaigns(),
  });
};

export const useEarnings = () => {
  return useQuery({
    queryKey: ['affiliate', 'earnings'],
    queryFn: () => affiliateApi.getEarnings(),
  });
};

export const useGenerateAffiliateLink = () => {
  return useMutation({
    mutationFn: (productId: string) => affiliateApi.generateLink(productId),
  });
};

export const useCampaignComments = (campaignId: string | null) => {
  return useQuery({
    queryKey: ['affiliate', 'comments', campaignId],
    queryFn: () => affiliateApi.getComments(campaignId!),
    enabled: !!campaignId,
  });
};

export const useSubmitComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, text }: { campaignId: string; text: string }) => 
      affiliateApi.submitComment(campaignId, text),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['affiliate', 'comments', variables.campaignId] });
    },
  });
};
