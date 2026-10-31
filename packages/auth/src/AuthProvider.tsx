import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { LoginInput, User } from '@farabitech/contracts';

import { authApi } from './api';
import { tokenStore } from './tokenStore';

export const authKeys = { me: ['auth', 'me'] as const };

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const token = useSyncExternalStore(tokenStore.subscribe, tokenStore.get);

  const me = useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.me,
    enabled: token !== null,
    retry: false,
    staleTime: Infinity,
  });

  const value = useMemo<AuthContextValue>(() => {
    const status: AuthStatus =
      token === null
        ? 'unauthenticated'
        : me.isPending
          ? 'loading'
          : me.data
            ? 'authenticated'
            : 'unauthenticated';

    return {
      status,
      user: status === 'authenticated' ? (me.data ?? null) : null,
      async login(input) {
        const session = await authApi.login(input);
        queryClient.setQueryData(authKeys.me, session.user);
        tokenStore.set(session.token);
      },
      async logout() {
        try {
          await authApi.logout();
        } catch {
          /* the session is dropped locally either way */
        }
        tokenStore.clear();
        queryClient.clear();
      },
    };
  }, [authApi, queryClient, token, me.isPending, me.data]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function useCurrentUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error('useCurrentUser used outside an authenticated route');
  return user;
}
