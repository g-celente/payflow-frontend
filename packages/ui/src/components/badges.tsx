import { Ban, Check, CheckCheck, Clock, Undo2, X, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export function Badge({ tone, icon: Icon, children }: { readonly tone: Tone; readonly icon?: LucideIcon; readonly children: ReactNode }) {
  return (
    <span className={`badge badge-${tone}`}>
      {Icon ? <Icon aria-hidden="true" className="lucide" /> : null}
      {children}
    </span>
  );
}

export function NewBadge() {
  return <span className="new-badge">Novo</span>;
}

// Status do pagamento: sempre cor + texto + ícone (nunca só cor).
export const PAYMENT_STATUS: Record<string, { label: string; tone: Tone; icon: LucideIcon }> = {
  AUTHORIZED: { label: 'Aprovado', tone: 'success', icon: Check },
  CONFIRMED: { label: 'PIX confirmado', tone: 'success', icon: CheckCheck },
  PENDING: { label: 'Aguardando PIX', tone: 'warning', icon: Clock },
  DECLINED: { label: 'Recusado', tone: 'danger', icon: X },
  CANCELED: { label: 'Cancelado', tone: 'neutral', icon: Ban },
  PARTIALLY_REFUNDED: { label: 'Estorno parcial', tone: 'info', icon: Undo2 },
  REFUNDED: { label: 'Estornado', tone: 'neutral', icon: Undo2 },
};

export function StatusBadge({ status }: { readonly status: string }) {
  const info = PAYMENT_STATUS[status] ?? { label: status, tone: 'neutral' as const, icon: undefined };
  return <Badge tone={info.tone} icon={info.icon}>{info.label}</Badge>;
}
