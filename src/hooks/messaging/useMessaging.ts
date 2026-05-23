import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagingApi, Message } from '../../api/messaging.api';

export const useConversations = () => {
  return useQuery({
    queryKey: ['messaging', 'conversations'],
    queryFn: () => messagingApi.getConversations(),
  });
};

export const useMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: ['messaging', 'messages', conversationId],
    queryFn: () => messagingApi.getMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 5000, // Fallback polling if WebSockets disconnect
  });
};

export const useSendMessage = (conversationId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => messagingApi.sendMessage(formData),
    onMutate: async (formData: any) => {
      if (!conversationId) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messaging', 'messages', conversationId] });

      const previousMessages = queryClient.getQueryData(['messaging', 'messages', conversationId]);

      // Optimistically update UI
      const optimisticMessage: Message = {
        id: `temp_${Date.now()}`,
        conversation_id: conversationId,
        text: formData.get('message') as string,
        sender_id: 'me',
        is_mine: true,
        role: 'buyer',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sending',
      };

      queryClient.setQueryData(['messaging', 'messages', conversationId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: [...old.data, optimisticMessage],
        };
      });

      return { previousMessages };
    },
    onError: (err: any, newTodo: any, context: any) => {
      // Rollback on failure
      if (context?.previousMessages && conversationId) {
        queryClient.setQueryData(['messaging', 'messages', conversationId], context.previousMessages);
      }
    },
    onSettled: () => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ['messaging', 'messages', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['messaging', 'conversations'] });
      }
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: messagingApi.markAsRead,
    onSuccess: (_: any, conversationId: any) => {
      queryClient.invalidateQueries({ queryKey: ['messaging', 'conversations'] });
    }
  });
};
