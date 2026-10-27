import type { PaymentMethod, PaymentQuery, PaymentStatus } from '@payflow/api-client';

import { STATUS_ORDER } from '../../shared/payment';

export const PAGE_SIZE = 20;

export type Period = 'todos' | 'hoje' | '7d' | '30d' | 'mes';

export const PERIODS: readonly { value: Period; label: string }[] = [
  { value: 'todos', label: 'Todo o período' },
  { value: 'hoje', label: 'Hoje' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: 'mes', label: 'Este mês' },
];

export interface Filters {
  readonly status: PaymentStatus | undefined;
  readonly method: PaymentMethod | undefined;
  readonly period: Period;
  readonly page: number; // 1, 2, 3… na URL; o BFF conta a partir de 0
}

// Os filtros vivem na URL (?status=PENDING&metodo=pix&periodo=7d&pagina=2): dá para voltar, recarregar e compartilhar.
export function readFilters(params: URLSearchParams): Filters {
  const status = params.get('status');
  const method = params.get('metodo');
  const period = params.get('periodo');
  const page = Number(params.get('pagina'));
  return {
    status: STATUS_ORDER.includes(status as PaymentStatus) ? (status as PaymentStatus) : undefined,
    method: method === 'cartao' ? 'CARD' : method === 'pix' ? 'PIX' : undefined,
    period: PERIODS.some((item) => item.value === period) ? (period as Period) : 'todos',
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

export function writeFilters(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.method) params.set('metodo', filters.method === 'CARD' ? 'cartao' : 'pix');
  if (filters.period !== 'todos') params.set('periodo', filters.period);
  if (filters.page > 1) params.set('pagina', String(filters.page));
  return params;
}

export function hasFilters(filters: Filters): boolean {
  return Boolean(filters.status || filters.method || filters.period !== 'todos');
}

// O início do período é sempre meia-noite (local), então a chave de cache não muda a cada render.
export function toQuery(filters: Filters, now: Date = new Date()): PaymentQuery {
  return {
    status: filters.status,
    method: filters.method,
    from: periodStart(filters.period, now)?.toISOString(),
    page: filters.page - 1,
    size: PAGE_SIZE,
  };
}

function periodStart(period: Period, now: Date): Date | undefined {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (period) {
    case 'hoje':
      return midnight;
    case '7d':
      return new Date(midnight.getFullYear(), midnight.getMonth(), midnight.getDate() - 6);
    case '30d':
      return new Date(midnight.getFullYear(), midnight.getMonth(), midnight.getDate() - 29);
    case 'mes':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    default:
      return undefined;
  }
}
