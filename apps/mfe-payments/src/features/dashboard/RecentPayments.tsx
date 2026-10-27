import type { RecentPayment } from '@payflow/api-client';
import { Card, CardHeader, formatDateTime, Money, StatusBadge } from '@payflow/ui';
import { Link } from 'react-router';

import { MethodIcon, shortId } from '../../shared/payment';

export function RecentPayments({ payments }: { readonly payments: readonly RecentPayment[] | null }) {
  return (
    <Card aria-labelledby="recent-title">
      <CardHeader id="recent-title" title="Últimos pagamentos" action={<Link to="/pagamentos">Ver todos</Link>} />
      {payments === null ? (
        <p className="card-body muted" style={{ fontSize: 14 }}>Os últimos pagamentos não carregaram agora. Veja a lista completa em Pagamentos.</p>
      ) : payments.length === 0 ? (
        <p className="card-body muted" style={{ fontSize: 14 }}>Nenhum pagamento ainda.</p>
      ) : (
        <ul className="row-list" style={{ marginTop: 8 }}>
          {payments.map((payment) => (
            <li key={payment.id}>
              <Link className="pay-row" to={`/pagamentos/${payment.id}`}>
                <span className="method-icon"><MethodIcon method={payment.method} /></span>
                <span style={{ minWidth: 0 }}>
                  <span className="pay-title" style={{ display: 'block' }}>{payment.method === 'CARD' ? 'Pagamento no cartão' : 'Pagamento com PIX'}</span>
                  <span className="pay-meta">ID {shortId(payment.id)} · {formatDateTime(payment.createdAt)}</span>
                </span>
                <StatusBadge status={payment.status} />
                <span className="pay-amount"><Money cents={payment.amount} /></span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
