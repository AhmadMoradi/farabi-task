export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, message: string, code = 'error') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpRequest {
  method: HttpMethod;
  path: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  token?: string | null;
}

export interface HttpResponse {
  status: number;
  data: unknown;
}

export type Transport = (req: HttpRequest) => Promise<HttpResponse>;

export interface HttpClientOptions {
  transport: Transport;
  getToken: () => string | null;
  onUnauthorized?: () => void;
}

export interface HttpClient {
  request<T>(req: Omit<HttpRequest, 'token'>): Promise<T>;
}

export function createFetchTransport(baseUrl: string): Transport {
  return async ({ method, path, query, body, token }) => {
    const url = new URL(baseUrl.replace(/\/$/, '') + path, window.location.origin);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
    }

    const headers: Record<string, string> = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    return { status: res.status, data: text ? JSON.parse(text) : null };
  };
}

export function createHttpClient({
  transport,
  getToken,
  onUnauthorized,
}: HttpClientOptions): HttpClient {
  return {
    async request<T>(req: Omit<HttpRequest, 'token'>): Promise<T> {
      const res = await transport({ ...req, token: getToken() });
      if (res.status >= 400) {
        if (res.status === 401) onUnauthorized?.();
        const err = res.data as { message?: string; code?: string } | null;
        throw new ApiError(res.status, err?.message ?? `Request failed (${res.status})`, err?.code);
      }
      return res.data as T;
    },
  };
}

interface MockRequestConfig<TBody = unknown> {
  url: string;
  method: HttpMethod;
  params: Record<string, string>;
  query: Record<string, string>;
  body?: TBody;
  headers: Record<string, string>;
}

type MockReply<TData = unknown> = readonly [status: number, data: TData];

type MockHandler<TBody = unknown, TData = unknown> = (
  config: MockRequestConfig<TBody>,
) => MockReply<TData> | Promise<MockReply<TData>>;

interface MockResponse<TData = unknown> extends HttpResponse {
  data: TData;
}

interface RequestOptions<TBody = unknown> {
  body?: TBody;
  headers?: Record<string, string>;
}

interface Route {
  method: HttpMethod;
  regex: RegExp;
  keys: string[];
  handler: MockHandler;
}

interface RouteBuilder<TBody> {
  reply: <TData = unknown>(handler: MockHandler<TBody, TData>) => void;
}

export function createMock() {
  const routes: Route[] = [];

  const compile = (path: string): { regex: RegExp; keys: string[] } => {
    const keys: string[] = [];
    const pattern = path.replace(/^\//, '').replace(/:(\w+)/g, (_match: string, key: string) => {
      keys.push(key);
      return '([^/]+)';
    });
    return { regex: new RegExp(`^/?${pattern}/?$`), keys };
  };

  const on =
    (method: HttpMethod) =>
    <TBody = unknown>(path: string): RouteBuilder<TBody> => ({
      reply: (handler) => {
        const { regex, keys } = compile(path);
        routes.push({ method, regex, keys, handler: handler as MockHandler });
      },
    });

  async function request<TData = unknown, TBody = unknown>(
    method: HttpMethod | Lowercase<HttpMethod>,
    rawUrl: string,
    { body, headers = {} }: RequestOptions<TBody> = {},
  ): Promise<MockResponse<TData | { ok: false; error: string }>> {
    const url = new URL(rawUrl, 'http://localhost');
    const upperMethod = method.toUpperCase() as HttpMethod;

    for (const route of routes) {
      if (route.method !== upperMethod) continue;
      const m = url.pathname.match(route.regex);
      if (!m) continue;

      const params: Record<string, string> = Object.fromEntries(
        route.keys.map((k, i): [string, string] => [k, m[i + 1]]),
      );
      const query: Record<string, string> = Object.fromEntries(url.searchParams);

      const [status, data] = await route.handler({
        url: url.pathname,
        method: upperMethod,
        params,
        query,
        body,
        headers,
      });
      return { status, data: data as TData };
    }

    return { status: 404, data: { ok: false, error: 'No mock matched' } };
  }

  return {
    onGet: on('GET'),
    onPost: on('POST'),
    onPut: on('PUT'),
    onPatch: on('PATCH'),
    onDelete: on('DELETE'),
    request,
  };
}
