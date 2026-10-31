import { createContext, useContext, type ReactNode } from 'react';

export function createApiContext<T>(name = 'Api') {
  const Ctx = createContext<T | null>(null);

  function Provider({ api, children }: { api: T; children: ReactNode }) {
    return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
  }

  function useApi(): T {
    const api = useContext(Ctx);
    if (api === null) throw new Error(`use${name} must be used inside <${name}Provider>`);
    return api;
  }

  return { Provider, useApi };
}
