import { request } from './client';
import type {
  Dashboard,
  IssuedKey,
  Merchant,
  NewPayment,
  Page,
  Payment,
  PaymentQuery,
  SignUpResult,
  WebhookConfigured,
  WebhookSettings,
} from './types';

export * from './client';
export * from './types';

// Uma função por rota do BFF; as telas não montam URLs.
export const payflowApi = {
  // Tela de entrada: confere a chave sem gravar na sessão.
  checkKey: (merchantKey: string) => request<Merchant>('/merchants/me', { merchantKey }),
  me: () => request<Merchant>('/merchants/me'),
  updateMe: (profile: { name: string; email: string }) =>
    request<Merchant>('/merchants/me', { method: 'PUT', body: profile }),
  signUp: (merchant: { name: string; email: string; document: string }) =>
    request<SignUpResult>('/merchants', { method: 'POST', body: merchant, anonymous: true }),
  configureWebhook: (settings: WebhookSettings) =>
    request<WebhookConfigured>('/merchants/me/webhook', { method: 'PUT', body: settings }),
  rotateApiKey: () => request<IssuedKey>('/merchants/me/api-key', { method: 'POST' }),

  dashboard: () => request<Dashboard>('/aggregated-data'),

  listPayments: (query: PaymentQuery) => request<Page<Payment>>('/payments', { query: { ...query } }),
  getPayment: (id: string) => request<Payment>(`/payments/${id}`),
  createPayment: (payment: NewPayment, idempotencyKey: string) =>
    request<Payment>('/payments', { method: 'POST', body: payment, idempotencyKey }),
  updatePayment: (id: string, change: { description?: string; metadata?: Record<string, string> }) =>
    request<Payment>(`/payments/${id}`, { method: 'PATCH', body: change }),
  cancelPayment: (id: string) => request<Payment>(`/payments/${id}`, { method: 'DELETE' }),
  refundPayment: (id: string, refund: { amount?: number; reason?: string }, idempotencyKey: string) =>
    request<Payment>(`/payments/${id}/refunds`, { method: 'POST', body: refund, idempotencyKey }),
  confirmPix: (id: string) => request<Payment>(`/payments/${id}/pix-confirmation`, { method: 'POST' }),
};

export type PayflowApi = typeof payflowApi;
