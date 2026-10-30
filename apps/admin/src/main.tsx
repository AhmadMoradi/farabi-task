import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppUIProvider } from '@farabitech/ui';
import '@farabitech/ui/styles.css';

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppUIProvider>
      <App />
    </AppUIProvider>
  </StrictMode>,
);
