import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MutationHookOptions } from '../types/utils';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import {
  RegisterUserBodyType,
  RegisterUserCreatedResponseType,
} from '@shared-types/auth';
import { ErrorBaseResponseType } from '@shared-types/commonResponses';

type RegisterMutationOptions = MutationHookOptions<
  RegisterUserCreatedResponseType['user'],
  Error,
  RegisterUserBodyType
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

      if (!res.ok) {
        const json = (await res.json()) as ErrorBaseResponseType;
        throw new Error(json?.message ?? "Couldn't register");
      }
      const json = (await res.json()) as RegisterUserCreatedResponseType;

      return json.user;
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(['user'], data);
      navigate('/home/friends/');
      options?.onSuccess?.(data, variables, context);
    },
  });
}
