import { useQuery } from '@tanstack/react-query';
import { User } from '@prisma/client';
import { api } from '../utils/api';

export function useAuth() {
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await api('/auth/me');
      if (!res.ok) {
        return null;
      }
      const data: Pick<User, 'id' | 'username'> = await res.json();
      return data;
    },
  });

  return {
    user,
    isLoadingUser,
    userError,
  };
}
