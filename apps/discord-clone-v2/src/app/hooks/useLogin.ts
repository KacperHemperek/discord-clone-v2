import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

import type {
  LoginUserSuccessfullyResponseType,
  LoginUserBodyType,
} from '@shared-types/auth';

import type { ErrorBaseResponseType } from '@shared-types/error-response';
import { MutationHookOptions } from '../types/utils';
import { useNavigate } from 'react-router-dom';

type AuthLoginMutationOptions = MutationHookOptions<
  LoginUserSuccessfullyResponseType['user'],
  Error,
  LoginUserBodyType
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

      if (!res.ok) {
        const json = (await res.json()) as ErrorBaseResponseType;
        throw new Error(json.message);
      }

      const json = (await res.json()) as LoginUserSuccessfullyResponseType;

      return json.user;
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(['user'], data);
      navigate('/home/friends');
      options?.onSuccess?.(data, variables, context);
    },
  });
}
