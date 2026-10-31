import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authKeys } from '@farabitech/auth';
import type { UpdateProfileInput } from '@farabitech/contracts';

import { api } from './api';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api.profile.update(input),
    onSuccess: (user) => {
      // The signed-in user comes from the auth `me` query; keep it in sync.
      queryClient.setQueryData(authKeys.me, user);
    },
  });
}
