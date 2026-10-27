import { ApiError, payflowApi, type Payment } from '@payflow/api-client';
import {
  Button,
  buttonClass,
  Callout,
  ErrorState,
  formatMoney,
  Money,
  MoneyInput,
  Notice,
  PageHeader,
  Skeleton,
  StatusBadge,
  TextField,
  toast,
} from '@payflow/ui';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Undo2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { NotFound } from '../../shared/NotFound';
import { errorMessage, isNotFound, methodLabel, REFUNDABLE, refundableAmount } from '../../shared/payment';
import { usePayment, usePaymentChanged } from '../../shared/queries';
import { useIdempotencyKey } from '../../shared/useIdempotencyKey';

// POST /payments/{id}/refunds: estorno total ou parcial, até o saldo que ainda não foi estornado.
export function RefundPage() {
  const { id = '' } = useParams();
  const payment = usePayment(id);

  if (payment.isPending) {
    return (
      <div className="page" aria-busy="true" aria-label="Carregando pagamento">
        <Skeleton height={28} width={220} />
        <div className="card card-pad"><Skeleton height={240} /></div>
      </div>
    );
  }
  if (payment.isError) {
    if (isNotFound(payment.error)) {
      return <NotFound title="Pagamento não encontrado" detail="Ele não existe ou é de outra loja." />;
    }
    return (
      <div className="page">
        <PageHeader title="Estornar pagamento" back={<BackLink id={id} />} />
        <ErrorState detail={errorMessage(payment.error)} onRetry={() => void payment.refetch()} />
      </div>
    );
  }
  return <RefundForm payment={payment.data} />;
}

function RefundForm({ payment }: { readonly payment: Payment }) {
  const navigate = useNavigate();
  const changed = usePaymentChanged();
  const idempotencyKey = useIdempotencyKey();
  const max = refundableAmount(payment);
  const [amount, setAmount] = useState(max);
  const [reason, setReason] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);

  const refund = useMutation({
    mutationFn: () => payflowApi.refundPayment(payment.id, { amount, ...(reason.trim() ? { reason: reason.trim() } : {}) }, idempotencyKey.current()),
    onSuccess: (updated) => {
      changed(updated);
      toast(`Estorno de ${formatMoney(amount)} registrado`);
      navigate(`/pagamentos/${payment.id}`, { replace: true });
    },
    onError: (error) => {
      // Recusa definitiva (4xx): a próxima tentativa é outra operação. Falha de rede ou 5xx: repete com a mesma chave.
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) idempotencyKey.reset();
    },
  });

  if (!REFUNDABLE.includes(payment.status) || max === 0) {
    return (
      <div className="page">
        <PageHeader title="Estornar pagamento" back={<BackLink id={payment.id} />} />
        <Notice action={<Link className={buttonClass('soft')} to={`/pagamentos/${payment.id}`}>Ver pagamento</Link>}>
          <strong>Este pagamento não pode ser estornado.</strong> Só pagamentos aprovados ou PIX confirmados, com saldo, aceitam estorno.
        </Notice>
      </div>
    );
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (amount < 1) {
      setAmountError('Informe um valor maior que zero.');
      document.getElementById('refund-amount')?.focus();
      return;
    }
    if (amount > max) {
      setAmountError(`O máximo para estornar é ${formatMoney(max)}.`);
      document.getElementById('refund-amount')?.focus();
      return;
    }
    refund.mutate();
  };

  return (
    <div className="page">
      <PageHeader
        title="Estornar pagamento"
        subtitle={<>{payment.description || 'Sem descrição'} · {methodLabel(payment)}</>}
        back={<BackLink id={payment.id} />}
        actions={<StatusBadge status={payment.status} />}
      />
      <div className="grid grid-main" style={{ alignItems: 'start' }}>
        <form className="card card-pad form" onSubmit={submit} noValidate>
          {refund.isError ? <ErrorState title="O estorno não foi feito" detail={errorMessage(refund.error)} /> : null}
          <MoneyInput
            id="refund-amount"
            label="Valor do estorno"
            cents={amount}
            error={amountError}
            help={<>Pode estornar até <Money cents={max} always />.</>}
            onCents={(cents) => {
              setAmount(cents);
              setAmountError(null);
              idempotencyKey.reset();
            }}
          />
          <TextField
            id="refund-reason"
            label={<>Motivo <span className="muted" style={{ fontWeight: 400 }}>(opcional)</span></>}
            placeholder="Ex.: produto com avaria"
            maxLength={255}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              idempotencyKey.reset();
            }}
          />
          <Callout>O valor volta para o cliente e o estorno não pode ser desfeito.</Callout>
          <div className="row">
            <Button type="submit" large loading={refund.isPending} icon={<Undo2 aria-hidden="true" className="lucide" />}>
              Estornar {formatMoney(amount)}
            </Button>
            <Link className={buttonClass('ghost', { large: true })} to={`/pagamentos/${payment.id}`}>Voltar</Link>
          </div>
        </form>
        <aside className="card card-pad" aria-label="Resumo do pagamento">
          <h2 className="section-title">Pagamento</h2>
          <dl className="dl" style={{ marginTop: 8, gridTemplateColumns: '1fr auto' }}>
            <dt>Valor cobrado</dt>
            <dd className="num" style={{ justifyContent: 'flex-end' }}><Money cents={payment.amount} always /></dd>
            <dt>Já estornado</dt>
            <dd className="num" style={{ justifyContent: 'flex-end' }}><Money cents={payment.refundedAmount} always /></dd>
            <dt><strong style={{ color: 'var(--text)' }}>Disponível para estorno</strong></dt>
            <dd className="num" style={{ justifyContent: 'flex-end' }}><strong><Money cents={max} always /></strong></dd>
          </dl>
        </aside>
      </div>
    </div>
  );
}

function BackLink({ id }: { readonly id: string }) {
  return (
    <Link className="back" to={`/pagamentos/${id}`} aria-label="Voltar para o pagamento">
      <ArrowLeft aria-hidden="true" className="lucide" />
    </Link>
  );
}
