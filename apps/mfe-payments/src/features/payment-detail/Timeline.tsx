import type { Payment } from '@payflow/api-client';
import { formatDateTime, formatMoney } from '@payflow/ui';
import { Ban, Check, CheckCheck, CreditCard, QrCode, Undo2, X, type LucideIcon } from 'lucide-react';

interface Step {
  readonly key: string;
  readonly icon: LucideIcon;
  readonly title: string;
  readonly at?: string; // só quando o pagamento guarda a data do passo
  readonly tone: '' | 'muted' | 'info';
}

// Montada a partir do próprio pagamento: criação, resultado e cada estorno.
export function timelineOf(payment: Payment): Step[] {
  const pix = payment.method === 'PIX';
  const steps: Step[] = [
    { key: 'created', icon: pix ? QrCode : CreditCard, title: pix ? 'Cobrança PIX criada' : 'Pagamento criado', at: payment.createdAt, tone: '' },
  ];
  if (payment.status === 'DECLINED') {
    steps.push({ key: 'declined', icon: X, title: 'Recusado pelo banco', at: payment.createdAt, tone: 'muted' });
  } else if (payment.status === 'CANCELED') {
    steps.push({ key: 'canceled', icon: Ban, title: 'Cancelado', tone: 'muted' });
  } else if (payment.status !== 'PENDING') {
    steps.push(pix
      ? { key: 'confirmed', icon: CheckCheck, title: 'PIX confirmado', tone: '' }
      : { key: 'authorized', icon: Check, title: 'Aprovado pelo gateway', at: payment.createdAt, tone: '' });
  }
  for (const refund of payment.refunds) {
    steps.push({
      key: refund.id,
      icon: Undo2,
      title: `Estorno de ${formatMoney(refund.amount)}${refund.reason ? ` · ${refund.reason}` : ''}`,
      at: refund.createdAt,
      tone: 'info',
    });
  }
  return steps;
}

export function Timeline({ payment }: { readonly payment: Payment }) {
  return (
    <ol className="timeline">
      {timelineOf(payment).map(({ key, icon: Icon, title, at, tone }) => (
        <li key={key}>
          <span className={`dot ${tone}`.trim()}><Icon aria-hidden="true" className="lucide" /></span>
          <div>
            <div className="timeline-title">{title}</div>
            {at ? <div className="timeline-time num">{formatDateTime(at)}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
