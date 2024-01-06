import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RegisterUserBodyType,
  RegisterUserCreatedResponseType,
} from '@shared/types/auth';
import { MutationHookOptions } from '../../types/utils';
import { api } from '../../utils/api';

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
      const json = await api.post<RegisterUserCreatedResponseType>(
        '/auth/register',
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
