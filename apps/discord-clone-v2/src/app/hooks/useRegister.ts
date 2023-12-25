import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthUser } from '@shared-types/user';
import { AuthRegisterRequestBody } from '@api/types/auth';
import { MutationHookOptions } from '../types/utils';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

type RegisterMutationOptions = MutationHookOptions<
  AuthUser,
  Error,
  AuthRegisterRequestBody
>;

export function useRegister(options?: RegisterMutationOptions) {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async (data) => {
      const res = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message ?? "Couldn't register");
      }

      return json.user;
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(['user'], data);
      navigate('/home/friends');
      options?.onSuccess?.(data, variables, context);
    },
  });
}
