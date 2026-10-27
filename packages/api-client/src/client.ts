// O único lugar que conhece o endereço do BFF (VITE_API_BASE_URL) e os cabeçalhos que ele exige.
// Em produção o endereço é o API Gateway (/prod/api); localmente, /api passa pelo proxy do Vite.

export const MERCHANT_KEY_STORAGE = 'payflow.merchantKey';
// Disparado quando o BFF responde 401: o Shell volta para a tela de entrada.
export const UNAUTHORIZED_EVENT = 'payflow:unauthorized';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly title: string,
    readonly detail: string,
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

export interface RequestOptions {
  readonly method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly body?: unknown;
  readonly query?: Readonly<Record<string, string | number | undefined>>;
  readonly idempotencyKey?: string;
  // Chave usada só nesta chamada (tela de entrada), sem tocar a sessão.
  readonly merchantKey?: string;
  readonly anonymous?: boolean;
  readonly signal?: AbortSignal;
}

export const session = {
  key(): string | null {
    return sessionStorage.getItem(MERCHANT_KEY_STORAGE);
  },
  save(key: string): void {
    sessionStorage.setItem(MERCHANT_KEY_STORAGE, key);
  },
  clear(): void {
    sessionStorage.removeItem(MERCHANT_KEY_STORAGE);
  },
};

export function apiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { accept: 'application/json' };
  const gatewayKey = import.meta.env.VITE_GATEWAY_API_KEY as string | undefined;
  if (gatewayKey) {
    headers['x-api-key'] = gatewayKey;
  }
  const merchantKey = options.merchantKey ?? (options.anonymous ? null : session.key());
  if (merchantKey) {
    headers['x-merchant-key'] = merchantKey;
  }
  if (options.idempotencyKey) {
    headers['idempotency-key'] = options.idempotencyKey;
  }
  if (options.body !== undefined) {
    headers['content-type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? null : JSON.stringify(options.body),
      signal: options.signal ?? null,
    });
  } catch (failure) {
    if ((failure as Error).name === 'AbortError') {
      throw failure;
    }
    throw new ApiError(0, 'Sem conexão', 'Não foi possível falar com o PayFlow. Verifique sua conexão e tente de novo.');
  }

  if (response.status === 401 && options.merchantKey === undefined && !options.anonymous) {
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
  }
  if (!response.ok) {
    throw await toApiError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

function buildUrl(path: string, query: RequestOptions['query']): string {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== '') {
      params.set(name, String(value));
    }
  }
  const search = params.toString();
  return `${apiBaseUrl().replace(/\/$/, '')}${path}${search ? `?${search}` : ''}`;
}

async function toApiError(response: Response): Promise<ApiError> {
  let title = response.statusText || 'Erro';
  let detail = `O servidor respondeu ${response.status}.`;
  try {
    const problem = (await response.json()) as { title?: string; detail?: string };
    title = problem.title ?? title;
    detail = problem.detail ?? detail;
  } catch {
    // Corpo vazio ou não JSON: fica a mensagem genérica.
  }
  return new ApiError(response.status, title, detail);
}
