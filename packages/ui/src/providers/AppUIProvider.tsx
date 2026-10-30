import type { ReactNode } from 'react';
import { CacheProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { rtlCache } from '../theme/rtlCache';
import { theme } from '../theme';

interface AppUIProviderProps {
  children: ReactNode;
}

export function AppUIProvider({ children }: AppUIProviderProps) {
  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div dir="rtl">{children}</div>
      </ThemeProvider>
    </CacheProvider>
  );
}
