import { createBrowserRouter, Navigate } from 'react-router';

import { LoginPage, ProtectedRoute, RequireRole } from '@farabitech/auth';
import { NotFound } from '@farabitech/ui';

import Template from './components/Template';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage title="پنل مدیریت" hint="admin@farabi.test / admin123" />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RequireRole roles={['admin']} />,
        children: [
          {
            element: <Template />,
            children: [
              { index: true, element: <Navigate to="/users" replace /> },
              {
                path: '/users',
                lazy: async () => ({ Component: (await import('./pages/UsersListPage')).default }),
              },
              {
                path: '/users/:id',
                lazy: async () => ({ Component: (await import('./pages/UserEditPage')).default }),
              },
              { path: '*', element: <NotFound /> },
            ],
          },
        ],
      },
    ],
  },
]);
