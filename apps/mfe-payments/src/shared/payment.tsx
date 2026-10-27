import { ApiError, type PaymentMethod, type PaymentStatus } from '@payflow/api-client';
import { CreditCard, QrCode } from 'lucide-react';

export const METHOD_LABEL: Record<PaymentMethod, string> = { CARD: 'Cartão', PIX: 'PIX' };

// Ordem em que os status aparecem em filtros e no painel.
export const STATUS_ORDER: readonly PaymentStatus[] = [
  'AUTHORIZED',
  'CONFIRMED',
  'PENDING',
  'DECLINED',
  'CANCELED',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
];

export const REFUNDABLE: readonly PaymentStatus[] = ['AUTHORIZED', 'CONFIRMED', 'PARTIALLY_REFUNDED'];

// Mesmas taxas da Function calculate-fees; aqui só para o resumo antes de cobrar.
export const ESTIMATED_RATES: Record<PaymentMethod, { rate: number; settlement: string }> = {
  CARD: { rate: 0.0349, settlement: 'Em 30 dias (D+30)' },
  PIX: { rate: 0.0099, settlement: 'Na hora (D+0)' },
};

export function methodLabel(payment: { readonly method: PaymentMethod; readonly card?: { last4: string } | null }): string {
  if (payment.method === 'CARD' && payment.card?.last4) {
    return `Cartão •••• ${payment.card.last4}`;
  }
  return METHOD_LABEL[payment.method];
}

export function MethodIcon({ method, small = false }: { readonly method: PaymentMethod; readonly small?: boolean }) {
  const Icon = method === 'CARD' ? CreditCard : QrCode;
  return <Icon aria-hidden="true" className={small ? 'lucide icon-sm' : 'lucide'} />;
}

export function shortId(id: string): string {
  return id.slice(0, 8);
}

export function refundableAmount(payment: { readonly amount: number; readonly refundedAmount: number }): number {
  return Math.max(payment.amount - payment.refundedAmount, 0);
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.detail : 'Algo deu errado. Tente de novo em instantes.';
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}
