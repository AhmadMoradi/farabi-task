import { http, HttpResponse, delay } from 'msw';
import {
  UpdateProfileInputSchema,
  UpdateUserInputSchema,
  type Page,
  type User,
} from '@farabitech/contracts';
import { users, toUser, userFromRequest } from './db';

const unauthorized = () =>
  HttpResponse.json({ message: 'Unauthorized', code: 'unauthorized' }, { status: 401 });
const forbidden = () =>
  HttpResponse.json({ message: 'Forbidden', code: 'forbidden' }, { status: 403 });
const invalid = (message: string) =>
  HttpResponse.json({ message, code: 'validation_error' }, { status: 422 });
const emailTaken = () =>
  HttpResponse.json({ message: 'Email is already in use', code: 'email_taken' }, { status: 409 });

const isEmailTaken = (email: string, exceptId: string) =>
  users.some((u) => u.id !== exceptId && u.email.toLowerCase() === email.toLowerCase());

export const usersHandlers = [
  http.get('/api/users', async ({ request }) => {
    const caller = userFromRequest(request);
    if (!caller) return unauthorized();
    if (caller.role !== 'admin') return forbidden();

    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10);
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';

    const filtered = users.filter(
      (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search),
    );
    await delay(300);
    const body: Page<User> = {
      items: filtered.slice((page - 1) * pageSize, page * pageSize).map(toUser),
      total: filtered.length,
      page,
      pageSize,
    };
    return HttpResponse.json(body);
  }),

  http.get('/api/users/:id', ({ request, params }) => {
    const caller = userFromRequest(request);
    if (!caller) return unauthorized();
    if (caller.role !== 'admin') return forbidden();

    const user = users.find((u) => u.id === params.id);
    return user
      ? HttpResponse.json(toUser(user))
      : HttpResponse.json({ message: 'User not found', code: 'not_found' }, { status: 404 });
  }),

  http.patch('/api/users/:id', async ({ request, params }) => {
    const caller = userFromRequest(request);
    if (!caller) return unauthorized();
    if (caller.role !== 'admin') return forbidden();

    const user = users.find((u) => u.id === params.id);
    if (!user) {
      return HttpResponse.json({ message: 'User not found', code: 'not_found' }, { status: 404 });
    }

    const parsed = UpdateUserInputSchema.safeParse(await request.json());
    if (!parsed.success) return invalid(parsed.error.issues[0].message);
    if (isEmailTaken(parsed.data.email, user.id)) return emailTaken();

    await delay(300);
    Object.assign(user, parsed.data);
    return HttpResponse.json(toUser(user));
  }),

  // A signed-in user may only change their own name and email.
  http.patch('/api/profile', async ({ request }) => {
    const caller = userFromRequest(request);
    if (!caller) return unauthorized();

    const parsed = UpdateProfileInputSchema.safeParse(await request.json());
    if (!parsed.success) return invalid(parsed.error.issues[0].message);
    if (isEmailTaken(parsed.data.email, caller.id)) return emailTaken();

    await delay(300);
    Object.assign(caller, parsed.data);
    return HttpResponse.json(toUser(caller));
  }),
];
