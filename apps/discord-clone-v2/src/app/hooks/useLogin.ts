import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

import type { AuthUser } from '@shared-types/user';
import { MutationHookOptions } from '../types/utils';
import { AuthLoginRequestBody } from '@api/types/auth';
import { useNavigate } from 'react-router-dom';

type AuthLoginMutationOptions = MutationHookOptions<
  AuthUser,
  Error,
  AuthLoginRequestBody
>;

export function useLogin(options?: AuthLoginMutationOptions) {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async (data) => {
      const res = await api('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message);
      }

      return json.user as AuthUser;
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(['user'], data);
      navigate('/friends');
      options?.onSuccess?.(data, variables, context);
    },
  });
}
