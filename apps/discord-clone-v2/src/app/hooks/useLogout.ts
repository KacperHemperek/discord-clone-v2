import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';
import { MutationHookOptions } from '../types/utils';
import { useNavigate } from 'react-router-dom';

type LogoutMutationOptions = MutationHookOptions;

export function useLogout(options?: LogoutMutationOptions) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    ...options,
    mutationFn: async () => {
      const res = await api('/auth/logout', { method: 'POST' });

      if (!res.ok) {
        const error = await res.json();

        throw new Error(error?.message ?? "Couldn't log out");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      navigate('/login');
    },
  });
}
