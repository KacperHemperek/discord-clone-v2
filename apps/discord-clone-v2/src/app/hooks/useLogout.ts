import { useMutation } from '@tanstack/react-query';
import { api } from '../utils/api';
import { MutationHookOptions } from '../types/utils';

type LogoutMutationOptions = MutationHookOptions;

export function useLogout(options?: LogoutMutationOptions) {
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
  });
}
