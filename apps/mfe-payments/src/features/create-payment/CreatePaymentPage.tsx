import { ApiError, payflowApi, type NewPayment, type PaymentMethod } from '@payflow/api-client';
import { Button, Callout, ErrorState, formatMoney, formatPercent, MoneyInput, PageHeader, Segmented, TextField, toast } from '@payflow/ui';
import { useMutation } from '@tanstack/react-query';
import { CircleCheck, CircleX, CreditCard, FlaskConical, Info, QrCode, TimerOff, type LucideIcon } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { ESTIMATED_RATES, errorMessage } from '../../shared/payment';
import { usePaymentChanged } from '../../shared/queries';
import { useIdempotencyKey } from '../../shared/useIdempotencyKey';

type CardToken = 'tok_approved' | 'tok_declined' | 'tok_timeout';

// Tokens do gateway simulado: o cartão de verdade nunca passa pelo PayFlow, só o token.
const TEST_CARDS: readonly { token: CardToken; title: string; description: string; icon: LucideIcon }[] = [
  { token: 'tok_approved', title: 'Aprovado', description: 'O gateway aprova na hora.', icon: CircleCheck },
  { token: 'tok_declined', title: 'Recusado', description: 'O banco recusa a compra.', icon: CircleX },
  { token: 'tok_timeout', title: 'Sem resposta', description: 'O gateway não responde; nada é cobrado.', icon: TimerOff },
];

const METHOD_OPTIONS = [
  { value: 'CARD', label: 'Cartão', icon: CreditCard },
  { value: 'PIX', label: 'PIX', icon: QrCode },
] as const;

// POST /payments com Idempotency-Key. Cartão aprovado ou recusado vai para o detalhe; PIX vai para o QR Code.
export function CreatePaymentPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const method: PaymentMethod = params.get('metodo') === 'pix' ? 'PIX' : 'CARD';
  const [amount, setAmount] = useState(0);
  const [token, setToken] = useState<CardToken>('tok_approved');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const idempotencyKey = useIdempotencyKey();
  const changed = usePaymentChanged();

  const create = useMutation({
    mutationFn: (payment: NewPayment) => payflowApi.createPayment(payment, idempotencyKey.current()),
    onSuccess: (payment) => {
      changed(payment);
      idempotencyKey.reset();
      if (payment.status === 'PENDING') {
        navigate(`/pix/${payment.id}`);
        return;
      }
      if (payment.status === 'DECLINED') {
        toast('Pagamento recusado pelo banco', 'error');
      } else {
        toast(`Pagamento de ${formatMoney(payment.amount)} aprovado`);
      }
      navigate(`/pagamentos/${payment.id}`);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) idempotencyKey.reset();
    },
  });

  // Qualquer mudança no formulário é uma cobrança diferente: nova Idempotency-Key.
  const edit = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    idempotencyKey.reset();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (amount < 1) {
      setAmountError('Informe um valor maior que zero.');
      document.getElementById('payment-amount')?.focus();
      return;
    }
    create.mutate({
      amount,
      method,
      ...(method === 'CARD' ? { cardToken: token } : {}),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(order.trim() ? { metadata: { order_id: order.trim() } } : {}),
    });
  };

  const { rate, settlement } = ESTIMATED_RATES[method];
  const fee = Math.round(amount * rate);
  const card = method === 'CARD';

  return (
    <div className="page">
      <PageHeader title="Nova cobrança" subtitle="Crie um pagamento de teste no cartão ou com PIX" />
      <div className="grid grid-main" style={{ alignItems: 'start' }}>
        <form className="card card-pad form" onSubmit={submit} noValidate aria-label="Dados da cobrança">
          {create.isError ? <ErrorState title="A cobrança não foi criada" detail={failureDetail(create.error)} /> : null}
          <MoneyInput
            id="payment-amount"
            label="Valor"
            cents={amount}
            error={amountError}
            onCents={edit((cents: number) => {
              setAmount(cents);
              setAmountError(null);
            })}
          />
          <div className="field">
            <span className="label" aria-hidden="true">Forma de pagamento</span>
            <Segmented<PaymentMethod>
              label="Forma de pagamento"
              options={METHOD_OPTIONS}
              value={method}
              onChange={edit((value: PaymentMethod) => setParams({ metodo: value === 'PIX' ? 'pix' : 'cartao' }, { replace: true }))}
            />
          </div>
          {card ? (
            <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="label" style={{ marginBottom: 6 }}>Cartão de teste</legend>
              <div className="option-cards">
                {TEST_CARDS.map(({ token: value, title, description: text, icon: Icon }) => (
                  <label key={value} className="option-card">
                    <input type="radio" name="card-token" value={value} checked={token === value} onChange={() => edit(setToken)(value)} />
                    <span className="option-title"><Icon aria-hidden="true" className="lucide icon-sm" />{title}</span>
                    <span className="option-desc">{text}</span>
                    <span className="option-code">{value}</span>
                  </label>
                ))}
              </div>
              <span className="help" style={{ marginTop: 6 }}>Os dados do cartão nunca passam pelo PayFlow: a loja envia só o token.</span>
            </fieldset>
          ) : (
            <Callout icon={Info} tone="info">
              Vamos gerar um QR Code e um código <strong>copia e cola</strong>. O pagamento fica <strong>Aguardando PIX</strong> até o cliente pagar.
            </Callout>
          )}
          <TextField
            id="payment-description"
            label={<>Descrição <span className="muted" style={{ fontWeight: 400 }}>(opcional)</span></>}
            maxLength={255}
            value={description}
            help="Aparece na lista de pagamentos e no webhook."
            onChange={(event) => edit(setDescription)(event.target.value)}
          />
          <TextField
            id="payment-order"
            label={<>Número do pedido na sua loja <span className="muted" style={{ fontWeight: 400 }}>(opcional)</span></>}
            value={order}
            onChange={(event) => edit(setOrder)(event.target.value)}
          />
          <div>
            <Button type="submit" large loading={create.isPending} icon={card ? <CreditCard aria-hidden="true" className="lucide" /> : <QrCode aria-hidden="true" className="lucide" />}>
              {card ? `Cobrar ${formatMoney(amount)}` : `Gerar PIX de ${formatMoney(amount)}`}
            </Button>
          </div>
        </form>
        <aside className="card card-pad" aria-label="Resumo">
          <h2 className="section-title">Resumo</h2>
          <dl className="dl" style={{ marginTop: 8, gridTemplateColumns: '1fr auto' }}>
            <dt>Valor</dt>
            <dd className="num" style={{ justifyContent: 'flex-end' }}>{formatMoney(amount)}</dd>
            <dt>Taxa {card ? 'do cartão' : 'do PIX'} ({formatPercent(rate)})</dt>
            <dd className="num" style={{ justifyContent: 'flex-end' }}>− {formatMoney(fee)}</dd>
            <dt><strong style={{ color: 'var(--text)' }}>Você recebe</strong></dt>
            <dd className="num" style={{ justifyContent: 'flex-end' }}><strong>{formatMoney(amount - fee)}</strong></dd>
            <dt>Quando</dt>
            <dd style={{ justifyContent: 'flex-end' }}>{settlement}</dd>
          </dl>
          <div style={{ marginTop: 16 }}>
            <Callout icon={FlaskConical}>Ambiente de testes: nenhum valor real é cobrado.</Callout>
          </div>
        </aside>
      </div>
    </div>
  );
}

function failureDetail(error: unknown): string {
  if (error instanceof ApiError && error.status === 504) {
    return 'O gateway não respondeu a tempo e nada foi cobrado. Tente de novo.';
  }
  return errorMessage(error);
}
