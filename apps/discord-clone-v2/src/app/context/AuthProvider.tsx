import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '@prisma/client';
import { api } from '../utils/api';

export function useUserQuery() {
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
      const { user }: { user: Pick<User, 'id' | 'username'> } =
        await res.json();
      return user;
    },
  });

  return {
    user,
    isLoadingUser,
    userError,
  };
}

function useGetAuthValue() {
  const userQuery = useUserQuery();

  return { ...userQuery };
}

type AuthProviderValue = ReturnType<typeof useGetAuthValue>;

const AuthContext = React.createContext<AuthProviderValue | null>(null);

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useGetAuthValue();

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
