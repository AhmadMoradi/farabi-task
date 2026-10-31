import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authKeys } from '@farabitech/auth';
import type { UpdateUserInput } from '@farabitech/contracts';

import type { ListUsersParams } from './types';

import { api } from './api';

export const usersKeys = {
  lists: ['users', 'list'] as const,
  list: (params: ListUsersParams) => ['users', 'list', params] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
};

export function useUsersList(params: ListUsersParams) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => api.users.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => api.users.get(id),
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserInput) => api.users.update(id, input),
    onSuccess: (user) => {
      queryClient.setQueryData(usersKeys.detail(id), user);
      queryClient.invalidateQueries({ queryKey: usersKeys.lists });
      // The admin may have edited their own account.
      const me = queryClient.getQueryData<{ id: string }>(authKeys.me);
      if (me?.id === id) queryClient.setQueryData(authKeys.me, user);
    },
  });
}
