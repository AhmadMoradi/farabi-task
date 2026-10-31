import { createFetchTransport, createHttpClient } from '@farabitech/api-client';
import { tokenStore } from '@farabitech/auth';
import type { UpdateProfileInput, User } from '@farabitech/contracts';

const httpClient = createHttpClient({
  transport: createFetchTransport('/api'),
  getToken: tokenStore.get,
  onUnauthorized: tokenStore.clear,
});

export const api = {
  profile: {
    update: (input: UpdateProfileInput) =>
      httpClient.request<User>({
        method: 'PATCH',
        path: '/profile',
        body: input,
      }),
  },
};
