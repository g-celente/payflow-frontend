// Respostas do payflow-bff (veja o OpenAPI em <BFF>/docs/). Valores em centavos.

export type MerchantStatus = 'ACTIVE' | 'SUSPENDED';

export interface Merchant {
  id: string;
  name: string;
  email: string;
  document: string;
  status: MerchantStatus;
  webhookConfigured: boolean;
  webhook: { url: string; events: string[] } | null;
}

export type PaymentMethod = 'CARD' | 'PIX';

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'DECLINED'
  | 'CONFIRMED'
  | 'CANCELED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED';

export interface Refund {
  id: string;
  amount: number;
  reason: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  refundedAmount: number;
  card: { last4: string } | null;
  pix: { qrCode: string } | null;
  gatewayReference: string | null;
  description: string | null;
  metadata: Record<string, string>;
  refunds: Refund[];
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface PaymentSummary {
  currency: string;
  totalAmount: number;
  count: number;
  byStatus: Partial<Record<PaymentStatus, number>>;
  byMethod: Partial<Record<PaymentMethod, number>>;
}

export interface RecentPayment {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
}

export interface FeeLine {
  method: PaymentMethod;
  gross: number;
  rate: number;
  fee: number;
  settlement: string;
}

export interface Fees {
  totalFees: number;
  netAmount: number;
  byMethod: FeeLine[];
}

export interface DashboardWarning {
  part: 'summary' | 'recentPayments' | 'fees';
  dependency: string;
  reason: 'timeout' | 'unreachable' | 'not-configured' | 'bad-response' | 'skipped';
  message: string;
}

export interface Dashboard {
  merchant: { id: string; name: string; webhookConfigured: boolean };
  summary: PaymentSummary | null;
  recentPayments: RecentPayment[] | null;
  fees: Fees | null;
  warnings: DashboardWarning[];
  generatedAt: string;
}

export interface NewPayment {
  amount: number;
  method: PaymentMethod;
  cardToken?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentQuery {
  status?: PaymentStatus;
  method?: PaymentMethod;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface WebhookSettings {
  url: string;
  secret?: string;
  events: string[];
}

export interface WebhookConfigured {
  merchantId: string;
  url: string;
  secret: string;
  events: string[];
}

export interface IssuedKey {
  merchantId: string;
  apiKey: string;
}

export interface SignUpResult {
  merchant: Merchant;
  apiKey: string;
}
