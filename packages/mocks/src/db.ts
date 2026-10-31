import type { User } from '@farabitech/contracts';

export const users: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@farabi.test',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Member',
    email: 'member@farabi.test',
    password: 'member123',
    role: 'member',
    status: 'active',
    createdAt: '2026-01-02T00:00:00Z',
  },
];

export const toUser = ({ password: _p, ...user }: (typeof users)[number]): User => user;

for (let i = 3; i <= 40; i++) {
  users.push({
    id: String(i),
    name: `User ${i}`,
    email: `user${i}@farabi.test`,
    password: 'user123',
    role: 'member',
    status: i % 7 === 0 ? 'suspended' : 'active',
    createdAt: new Date(Date.UTC(2026, 0, i)).toISOString(),
  });
}

export const tokenFor = (id: string) => `mock-token-${id}`;

export const userFromRequest = (req: Request) => {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  return users.find((u) => tokenFor(u.id) === token);
};
