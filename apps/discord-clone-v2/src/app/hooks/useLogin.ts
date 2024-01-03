import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

import type {
  LoginUserSuccessfullyResponseType,
  LoginUserBodyType,
} from '@shared/types/auth';
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
      const json = await api.post<LoginUserSuccessfullyResponseType>(
        '/auth/login',
        {
          body: JSON.stringify(data),
        }
      );

      return json.user;
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(['user'], data);
      navigate('/home/friends/');
      options?.onSuccess?.(data, variables, context);
    },
  });
}
