import { createHttpClient, createFetchTransport } from '@farabitech/api-client';
import type { LoginInput, Session, User } from '@farabitech/contracts';
import { tokenStore } from './tokenStore';

const httpClient = createHttpClient({
  transport: createFetchTransport('/api'),
  getToken: tokenStore.get,
  onUnauthorized: tokenStore.clear,
});

export const authApi = {
  login: (input: LoginInput) =>
    httpClient.request<Session>({ method: 'POST', path: '/auth/login', body: input }),
  me: () => httpClient.request<User>({ method: 'GET', path: '/auth/me' }),
  logout: () => httpClient.request<void>({ method: 'POST', path: '/auth/logout' }),
};
