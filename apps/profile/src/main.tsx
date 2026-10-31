import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppUIProvider } from '@farabitech/ui';
import '@farabitech/ui/styles.css';
import { AuthProvider } from '@farabitech/auth';

import { router } from './router';

const queryClient = new QueryClient();

async function enableMocking() {
  if (!import.meta.env.DEV) return;
  const { worker } = await import('@farabitech/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppUIProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryClientProvider>
      </AppUIProvider>
    </StrictMode>,
  );
});
