import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { MutationHookOptions } from '../../types/utils';
import { useNavigate } from 'react-router-dom';
import { MessageSuccessResponseType } from '@shared/types/commonResponses';

type LogoutMutationOptions = MutationHookOptions;

export function useLogout(options?: LogoutMutationOptions) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    ...options,
    mutationFn: async () => {
      const data = await api.post<MessageSuccessResponseType>('/auth/logout');

      return data;
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      navigate('/login');
    },
  });
}
