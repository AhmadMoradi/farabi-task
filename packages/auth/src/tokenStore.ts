const KEY = 'farabi.auth.token';

const listeners = new Set<() => void>();

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

let token: string | null = read();

function emit() {
  listeners.forEach((listener) => listener());
}

/**
 * Tiny external store for the session token. Being observable lets the HTTP
 * layer (which has no React) clear the session on a 401 and have React react.
 */
export const tokenStore = {
  get: (): string | null => token,
  set(next: string) {
    token = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable: session lives in memory only */
    }
    emit();
  },
  clear() {
    if (token === null) return;
    token = null;
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
