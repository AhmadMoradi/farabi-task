import { createFetchTransport, createHttpClient } from '@farabitech/api-client';
import { tokenStore } from '@farabitech/auth';
import type { Page, UpdateUserInput, User } from '@farabitech/contracts';

import type { ListUsersParams } from './types';

const httpClient = createHttpClient({
  transport: createFetchTransport('/api'),
  getToken: tokenStore.get,
  onUnauthorized: tokenStore.clear,
});

export const api = {
  users: {
    list: (params: ListUsersParams) =>
      httpClient.request<Page<User>>({
        method: 'GET',
        path: '/users',
        query: { ...params },
      }),
    get: (id: string) =>
      httpClient.request<User>({
        method: 'GET',
        path: `/users/${id}`,
      }),
    update: (id: string, input: UpdateUserInput) =>
      httpClient.request<User>({
        method: 'PATCH',
        path: `/users/${id}`,
        body: input,
      }),
  },
};
