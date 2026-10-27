import type { Dashboard, Page, Payment } from '@payflow/api-client';
import { formatMoney } from '@payflow/ui';

// O Testing Library normaliza espaços (o não separável do Intl vira espaço comum).
export const moneyText = (cents: number) => formatMoney(cents).replace(/\s/g, ' ');

export function aPayment(change: Partial<Payment> = {}): Payment {
  return {
    id: '9f8e7d6c-5b4a-4321-8765-0fedcba98765',
    merchantId: 'm1',
    amount: 10000,
    currency: 'BRL',
    method: 'CARD',
    status: 'AUTHORIZED',
    refundedAmount: 0,
    card: { last4: '4242' },
    pix: null,
    gatewayReference: 'gw_ch_7f3a91c2',
    description: 'Pedido #1042 — Camiseta',
    metadata: { order_id: '1042' },
    refunds: [],
    createdAt: '2026-10-26T13:41:00Z',
    updatedAt: '2026-10-26T13:41:00Z',
    ...change,
  };
}

export function aPixPayment(change: Partial<Payment> = {}): Payment {
  return aPayment({
    id: '5a1c2b3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d',
    amount: 3000,
    method: 'PIX',
    status: 'PENDING',
    card: null,
    pix: { qrCode: '00020126580014br.gov.bcb.pix0136payflow-demo6304A1F3' },
    gatewayReference: null,
    description: 'Pedido #1043 — Caneca',
    metadata: {},
    ...change,
  });
}

export function aPage(items: Payment[], change: Partial<Page<Payment>> = {}): Page<Payment> {
  return { items, page: 0, size: 20, totalItems: items.length, totalPages: items.length ? 1 : 0, ...change };
}

export function aDashboard(change: Partial<Dashboard> = {}): Dashboard {
  return {
    merchant: { id: 'm1', name: 'Loja Exemplo', webhookConfigured: true },
    summary: {
      currency: 'BRL',
      totalAmount: 125000,
      count: 42,
      byStatus: { AUTHORIZED: 26, CONFIRMED: 6, PENDING: 4, DECLINED: 3, CANCELED: 1, PARTIALLY_REFUNDED: 1, REFUNDED: 1 },
      byMethod: { CARD: 90000, PIX: 35000 },
    },
    recentPayments: [{ id: 'p1', amount: 10000, currency: 'BRL', method: 'CARD', status: 'AUTHORIZED', createdAt: '2026-10-26T13:41:00Z' }],
    fees: {
      totalFees: 3488,
      netAmount: 121512,
      byMethod: [
        { method: 'CARD', gross: 90000, rate: 0.0349, fee: 3141, settlement: 'D+30' },
        { method: 'PIX', gross: 35000, rate: 0.0099, fee: 347, settlement: 'D+0' },
      ],
    },
    warnings: [],
    generatedAt: '2026-10-26T14:00:00Z',
    ...change,
  };
}
