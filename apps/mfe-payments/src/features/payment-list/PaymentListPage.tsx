import { payflowApi, type Payment, type PaymentMethod, type PaymentStatus } from '@payflow/api-client';
import {
  Button,
  buttonClass,
  EmptyState,
  ErrorState,
  formatDateTime,
  Money,
  PageHeader,
  PAYMENT_STATUS,
  Segmented,
  Skeleton,
  StatusBadge,
} from '@payflow/ui';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, CreditCard, Plus, QrCode, ReceiptText, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { errorMessage, methodLabel, MethodIcon, shortId, STATUS_ORDER } from '../../shared/payment';
import { queryKeys } from '../../shared/queries';
import { hasFilters, PAGE_SIZE, PERIODS, readFilters, toQuery, writeFilters, type Filters, type Period } from './filters';

type MethodFilter = PaymentMethod | 'ALL';

const METHOD_OPTIONS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'CARD', label: 'Cartão', icon: CreditCard },
  { value: 'PIX', label: 'PIX', icon: QrCode },
] as const;

export function PaymentListPage() {
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const query = toQuery(filters);
  const payments = useQuery({
    queryKey: queryKeys.paymentList(query),
    queryFn: () => payflowApi.listPayments(query),
    placeholderData: keepPreviousData,
  });

  // Mudar um filtro volta para a primeira página.
  const update = (change: Partial<Filters>) => setParams(writeFilters({ ...filters, page: 1, ...change }));

  return (
    <div className="page">
      <PageHeader
        title="Pagamentos"
        subtitle="Todos os pagamentos da sua loja, mais recentes primeiro"
        actions={<Link className={buttonClass('primary')} to="/nova-cobranca"><Plus aria-hidden="true" className="lucide" />Nova cobrança</Link>}
      />
      <section className="card" style={{ overflow: 'hidden' }} aria-label="Lista de pagamentos">
        <div className="filters">
          <label className="sr-only" htmlFor="filter-status">Status</label>
          <select
            className="select"
            id="filter-status"
            value={filters.status ?? ''}
            onChange={(event) => update({ status: (event.target.value || undefined) as PaymentStatus | undefined })}
          >
            <option value="">Todos os status</option>
            {STATUS_ORDER.map((status) => <option key={status} value={status}>{PAYMENT_STATUS[status]?.label}</option>)}
          </select>
          <Segmented<MethodFilter>
            label="Método"
            options={METHOD_OPTIONS}
            value={filters.method ?? 'ALL'}
            onChange={(method) => update({ method: method === 'ALL' ? undefined : method })}
          />
          <label className="sr-only" htmlFor="filter-period">Período</label>
          <select className="select" id="filter-period" value={filters.period} onChange={(event) => update({ period: event.target.value as Period })}>
            {PERIODS.map((period) => <option key={period.value} value={period.value}>{period.label}</option>)}
          </select>
          <span className="topbar-spacer" />
          {hasFilters(filters) ? (
            <Button variant="ghost" icon={<X aria-hidden="true" className="lucide icon-sm" />} onClick={() => setParams(new URLSearchParams())}>
              Limpar filtros
            </Button>
          ) : null}
        </div>
        {payments.isPending ? (
          <TableSkeleton />
        ) : payments.isError ? (
          <div className="card-body">
            <ErrorState title="Não foi possível carregar os pagamentos" detail={errorMessage(payments.error)} onRetry={() => void payments.refetch()} />
          </div>
        ) : payments.data.items.length === 0 ? (
          <EmptyList filtered={hasFilters(filters)} onClear={() => setParams(new URLSearchParams())} />
        ) : (
          <>
            <PaymentTable items={payments.data.items} busy={payments.isPlaceholderData} />
            <Pagination
              page={filters.page}
              totalItems={payments.data.totalItems}
              totalPages={payments.data.totalPages}
              onPage={(page) => setParams(writeFilters({ ...filters, page }))}
            />
          </>
        )}
      </section>
    </div>
  );
}

function PaymentTable({ items, busy }: { readonly items: readonly Payment[]; readonly busy: boolean }) {
  const navigate = useNavigate();
  return (
    <div className="table-wrap" aria-busy={busy || undefined} style={busy ? { opacity: 0.6 } : undefined}>
      <table>
        <thead>
          <tr>
            <th scope="col">Data</th>
            <th scope="col">Descrição</th>
            <th scope="col">Método</th>
            <th scope="col">Status</th>
            <th scope="col" className="right">Valor</th>
          </tr>
        </thead>
        <tbody>
          {items.map((payment) => (
            // A linha inteira é clicável com o mouse; pelo teclado, o link da descrição leva ao mesmo lugar.
            <tr key={payment.id} className="clickable" onClick={() => navigate(`/pagamentos/${payment.id}`)}>
              <td className="muted num" style={{ whiteSpace: 'nowrap' }}>{formatDateTime(payment.createdAt)}</td>
              <td>
                <Link to={`/pagamentos/${payment.id}`} style={{ color: 'var(--text)', fontWeight: 600 }} onClick={(event) => event.stopPropagation()}>
                  {payment.description || 'Sem descrição'}
                </Link>
                <div className="pay-meta">ID {shortId(payment.id)}</div>
              </td>
              <td><span className="cell-method"><MethodIcon method={payment.method} small />{methodLabel(payment)}</span></td>
              <td><StatusBadge status={payment.status} /></td>
              <td className="right num">
                <strong><Money cents={payment.amount} /></strong>
                {payment.refundedAmount > 0 ? <div className="pay-meta">−<Money cents={payment.refundedAmount} /> estornado</div> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ page, totalItems, totalPages, onPage }: {
  readonly page: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly onPage: (page: number) => void;
}) {
  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, totalItems);
  return (
    <nav className="pagination" aria-label="Paginação">
      <span className="num">{first}–{last} de {totalItems} {totalItems === 1 ? 'pagamento' : 'pagamentos'}</span>
      <span className="pages">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)} icon={<ChevronLeft aria-hidden="true" className="lucide icon-sm" />}>
          Anterior
        </Button>
        <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          Próxima<ChevronRight aria-hidden="true" className="lucide icon-sm" />
        </Button>
      </span>
    </nav>
  );
}

function EmptyList({ filtered, onClear }: { readonly filtered: boolean; readonly onClear: () => void }) {
  if (filtered) {
    return (
      <EmptyState icon={ReceiptText} title="Nenhum pagamento com esses filtros" action={<Button variant="secondary" onClick={onClear}>Limpar filtros</Button>}>
        Tente outro status, método ou período.
      </EmptyState>
    );
  }
  return (
    <EmptyState
      icon={ReceiptText}
      title="Nenhum pagamento por aqui"
      action={<Link className={buttonClass('primary')} to="/nova-cobranca"><Plus aria-hidden="true" className="lucide" />Criar cobrança</Link>}
    >
      Quando sua loja receber pagamentos, eles aparecem nesta lista.
    </EmptyState>
  );
}

function TableSkeleton() {
  return (
    <div className="card-body stack" aria-busy="true" aria-label="Carregando pagamentos">
      {[1, 2, 3, 4, 5].map((row) => <Skeleton key={row} height={44} />)}
    </div>
  );
}
