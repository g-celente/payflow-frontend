import type { Fees, PaymentMethod, PaymentSummary } from '@payflow/api-client';
import { Card, CardHeader, formatPercent, Money, StatusBadge } from '@payflow/ui';
import { Link } from 'react-router';

import { METHOD_LABEL, MethodIcon, STATUS_ORDER } from '../../shared/payment';

const METHODS: readonly PaymentMethod[] = ['CARD', 'PIX'];

export function MethodBreakdown({ summary, fees }: { readonly summary: PaymentSummary; readonly fees: Fees | null }) {
  const total = METHODS.reduce((sum, method) => sum + (summary.byMethod[method] ?? 0), 0);
  return (
    <Card aria-labelledby="by-method-title">
      <CardHeader id="by-method-title" title="Volume por método" action={<span className="muted" style={{ fontSize: 13 }}>Prazo de recebimento</span>} />
      <div className="card-body method-bars">
        {total === 0 ? <p className="muted" style={{ fontSize: 14 }}>Nenhum volume aprovado ainda.</p> : METHODS.map((method) => {
          const gross = summary.byMethod[method] ?? 0;
          const share = Math.round((gross / total) * 100);
          const line = fees?.byMethod.find((item) => item.method === method);
          return (
            <div key={method}>
              <div className="method-bar-head">
                <span className="method-bar-name"><MethodIcon method={method} />{METHOD_LABEL[method]}</span>
                <span className="num"><strong><Money cents={gross} /></strong> <span className="muted">· {share}%</span></span>
              </div>
              <div className="method-bar-track" role="img" aria-label={`${METHOD_LABEL[method]}: ${share}% do volume`}>
                <div className={`method-bar-fill ${method === 'PIX' ? 'pix' : ''}`.trim()} style={{ width: `${share}%` }} />
              </div>
              <div className="method-bar-foot">
                {line ? (
                  <>
                    <span>Taxa {formatPercent(line.rate)} · <Money cents={line.fee} /></span>
                    <span>Recebe em {line.settlement}</span>
                  </>
                ) : <span>Taxas indisponíveis agora</span>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function StatusBreakdown({ summary }: { readonly summary: PaymentSummary }) {
  const lines = STATUS_ORDER.filter((status) => (summary.byStatus[status] ?? 0) > 0);
  return (
    <Card aria-labelledby="by-status-title">
      <CardHeader id="by-status-title" title="Pagamentos por status" />
      <div className="card-body status-list">
        {lines.map((status) => (
          <Link key={status} className="status-line" to={`/pagamentos?status=${status}`} style={{ color: 'inherit' }}>
            <StatusBadge status={status} />
            <span className="num"><strong>{summary.byStatus[status]}</strong></span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
