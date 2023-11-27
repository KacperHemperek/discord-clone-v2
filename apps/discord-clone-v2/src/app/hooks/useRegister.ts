import { useMutation } from '@tanstack/react-query';
import { AuthUser } from '@shared-types/user';
import { AuthRegisterRequestBody } from '@api/types/auth';
import { MutationHookOptions } from '../types/utils';
import { api } from '../utils/api';

type RegisterMutationOptions = MutationHookOptions<
  AuthUser,
  Error,
  AuthRegisterRequestBody
>;

export function useRegister(options?: RegisterMutationOptions) {
  return useMutation({
    ...options,
    mutationFn: async (data) => {
      console.log({ data });
      const res = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();

        throw new Error(error?.message ?? "Couldn't register");
      }

      return res.json();
    },
  });
}
