import { http, HttpResponse, delay } from 'msw';
import type { LoginInput, Session } from '@farabitech/contracts';
import { users, toUser, tokenFor, userFromRequest } from './db';

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = (await request.json()) as LoginInput;
    await delay(300);
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return HttpResponse.json(
        { message: 'Invalid email or password', code: 'invalid_credentials' },
        { status: 401 },
      );
    }
    if (user.status === 'suspended') {
      return HttpResponse.json(
        { message: 'Account suspended', code: 'suspended' },
        { status: 403 },
      );
    }
    const session: Session = { token: tokenFor(user.id), user: toUser(user) };
    return HttpResponse.json(session);
  }),

  http.get('/api/auth/me', ({ request }) => {
    const user = userFromRequest(request);
    return user
      ? HttpResponse.json(toUser(user))
      : HttpResponse.json({ message: 'Unauthorized', code: 'unauthorized' }, { status: 401 });
  }),

  http.post('/api/auth/logout', () => new HttpResponse(null, { status: 204 })),
];
