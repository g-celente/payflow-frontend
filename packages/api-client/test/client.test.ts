import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { ApiError, payflowApi, session, UNAUTHORIZED_EVENT } from '../src';

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function lastCall(fetchMock: Mock): { url: string; init: RequestInit & { headers: Record<string, string> } } {
  const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit & { headers: Record<string, string> }];
  return { url, init };
}

describe('api-client', () => {
  let fetchMock: Mock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('calls the BFF under /api with the merchant key from the session and only the filled filters', async () => {
    session.save('pf_session');
    fetchMock.mockResolvedValue(json(200, { items: [], page: 0, size: 20, totalItems: 0, totalPages: 0 }));

    await payflowApi.listPayments({ status: 'PENDING', method: undefined, page: 0, size: 20 });

    const { url, init } = lastCall(fetchMock);
    expect(url).toBe('/api/payments?status=PENDING&page=0&size=20');
    expect(init.method).toBe('GET');
    expect(init.headers['x-merchant-key']).toBe('pf_session');
    expect(init.headers['x-api-key']).toBeUndefined();
  });

  it('sends the gateway key and the configured base URL', async () => {
    vi.stubEnv('VITE_GATEWAY_API_KEY', 'gw-portal');
    vi.stubEnv('VITE_API_BASE_URL', 'https://abc.execute-api.sa-east-1.amazonaws.com/prod/api/');
    fetchMock.mockResolvedValue(json(200, {}));

    await payflowApi.dashboard();

    const { url, init } = lastCall(fetchMock);
    expect(url).toBe('https://abc.execute-api.sa-east-1.amazonaws.com/prod/api/aggregated-data');
    expect(init.headers['x-api-key']).toBe('gw-portal');
  });

  it('sends the Idempotency-Key and a JSON body when creating a payment', async () => {
    session.save('pf_session');
    fetchMock.mockResolvedValue(json(201, { id: 'p1' }));

    await payflowApi.createPayment({ amount: 1990, method: 'CARD', cardToken: 'tok_approved' }, 'key-123');

    const { url, init } = lastCall(fetchMock);
    expect(url).toBe('/api/payments');
    expect(init.method).toBe('POST');
    expect(init.headers['idempotency-key']).toBe('key-123');
    expect(init.headers['content-type']).toBe('application/json');
    expect(JSON.parse(init.body as string)).toEqual({ amount: 1990, method: 'CARD', cardToken: 'tok_approved' });
  });

  it('checks a key on the login screen without using or touching the session', async () => {
    session.save('pf_old');
    fetchMock.mockResolvedValue(json(200, { id: 'm1' }));

    await payflowApi.checkKey('pf_typed');

    expect(lastCall(fetchMock).init.headers['x-merchant-key']).toBe('pf_typed');
    expect(session.key()).toBe('pf_old');
  });

  it('signs up without any merchant key', async () => {
    session.save('pf_session');
    fetchMock.mockResolvedValue(json(201, { merchant: {}, apiKey: 'pf_new' }));

    await payflowApi.signUp({ name: 'Loja', email: 'a@b.co', document: '11222333000181' });

    expect(lastCall(fetchMock).init.headers['x-merchant-key']).toBeUndefined();
  });

  it('turns Problem Details into an ApiError', async () => {
    fetchMock.mockResolvedValue(json(409, { title: 'Conflict', detail: 'Only PENDING payments can be canceled' }));

    const error = await payflowApi.cancelPayment('p1').catch((failure: unknown) => failure);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, title: 'Conflict', detail: 'Only PENDING payments can be canceled' });
  });

  it('announces a 401 so the Shell can end the session', async () => {
    session.save('pf_revoked');
    fetchMock.mockResolvedValue(json(401, { title: 'Unauthorized', detail: 'Invalid merchant key' }));
    const listener = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, listener);

    await expect(payflowApi.me()).rejects.toMatchObject({ status: 401 });

    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
  });

  it('does not announce a 401 for a wrong key typed on the login screen', async () => {
    fetchMock.mockResolvedValue(json(401, { title: 'Unauthorized', detail: 'Invalid merchant key' }));
    const listener = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, listener);

    await expect(payflowApi.checkKey('pf_wrong')).rejects.toMatchObject({ status: 401 });

    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
  });

  it('reports a network failure as status 0 with a readable message', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(payflowApi.me()).rejects.toMatchObject({ status: 0, title: 'Sem conexão' });
  });

  it('keeps a generic message when the error body is not JSON', async () => {
    fetchMock.mockResolvedValue(new Response('Bad Gateway', { status: 502, statusText: 'Bad Gateway' }));

    await expect(payflowApi.me()).rejects.toMatchObject({ status: 502, title: 'Bad Gateway', detail: 'O servidor respondeu 502.' });
  });

  it('returns undefined for 204 No Content', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(payflowApi.cancelPayment('p1')).resolves.toBeUndefined();
  });
});
