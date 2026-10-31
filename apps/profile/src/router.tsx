import { createBrowserRouter } from 'react-router';

import { LoginPage, ProtectedRoute } from '@farabitech/auth';
import { NotFound } from '@farabitech/ui';

import Template from './components/Template';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage title="پروفایل" hint="member@farabi.test / member123" />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Template />,
        children: [
          {
            index: true,
            lazy: async () => ({ Component: (await import('./pages/ProfilePage')).default }),
          },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]);
