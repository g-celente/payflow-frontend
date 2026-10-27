import { payflowApi, type Payment } from '@payflow/api-client';
import {
  Badge,
  Button,
  buttonClass,
  Card,
  CardHeader,
  ConfirmDialog,
  ErrorState,
  formatDateTime,
  Money,
  PageHeader,
  Skeleton,
  StatusBadge,
  toast,
} from '@payflow/ui';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Ban, CheckCheck, Copy, Pencil, QrCode, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { NotFound } from '../../shared/NotFound';
import { errorMessage, isNotFound, methodLabel, MethodIcon, REFUNDABLE, refundableAmount } from '../../shared/payment';
import { usePayment, usePaymentChanged } from '../../shared/queries';
import { EditPaymentDialog } from './EditPaymentDialog';
import { Timeline } from './Timeline';

export function PaymentDetailPage() {
  const { id = '' } = useParams();
  const payment = usePayment(id);

  if (payment.isPending) {
    return <DetailSkeleton />;
  }
  if (payment.isError) {
    if (isNotFound(payment.error)) {
      return <NotFound title="Pagamento não encontrado" detail="Ele não existe ou é de outra loja." />;
    }
    return (
      <div className="page">
        <PageHeader title="Pagamento" back={<BackLink />} />
        <ErrorState title="Não foi possível carregar o pagamento" detail={errorMessage(payment.error)} onRetry={() => void payment.refetch()} />
      </div>
    );
  }
  return <PaymentDetail payment={payment.data} />;
}

function PaymentDetail({ payment }: { readonly payment: Payment }) {
  const [dialog, setDialog] = useState<'cancel' | 'edit' | null>(null);
  const changed = usePaymentChanged();

  const confirmPix = useMutation({
    mutationFn: () => payflowApi.confirmPix(payment.id),
    onSuccess: (updated) => {
      changed(updated);
      toast('PIX confirmado');
    },
    onError: (error) => toast(errorMessage(error), 'error'),
  });
  const cancel = useMutation({
    mutationFn: () => payflowApi.cancelPayment(payment.id),
    onSuccess: (updated) => {
      changed(updated);
      setDialog(null);
      toast('Pagamento cancelado');
    },
    onError: (error) => {
      setDialog(null);
      toast(errorMessage(error), 'error');
    },
  });

  const refundable = refundableAmount(payment);
  const pending = payment.status === 'PENDING';
  const canRefund = REFUNDABLE.includes(payment.status) && refundable > 0;
  const metadata = Object.entries(payment.metadata);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(payment.id);
      toast('ID copiado');
    } catch {
      toast('Não foi possível copiar; selecione e copie manualmente', 'error');
    }
  };

  return (
    <div className="page">
      <PageHeader title="Pagamento" back={<BackLink />} />
      <section className="card card-pad" aria-label="Resumo do pagamento">
        <div className="detail-hero">
          <div>
            <div className="muted" style={{ fontSize: 14 }}>{payment.description || 'Sem descrição'}</div>
            <div className="detail-amount"><Money cents={payment.amount} always /></div>
            <div className="row" style={{ marginTop: 6 }}>
              <StatusBadge status={payment.status} />
              <span className="muted" style={{ fontSize: 14 }}>{methodLabel(payment)} · {formatDateTime(payment.createdAt)}</span>
            </div>
            {payment.refundedAmount > 0 ? (
              <div className="muted num" style={{ fontSize: 14, marginTop: 8 }}>
                Estornado <Money cents={payment.refundedAmount} always />
                {refundable > 0 ? <> · pode estornar mais <Money cents={refundable} always /></> : null}
              </div>
            ) : null}
          </div>
          <div className="detail-actions">
            {pending && payment.method === 'PIX' ? (
              <>
                <Link className={buttonClass('secondary')} to={`/pix/${payment.id}`}><QrCode aria-hidden="true" className="lucide" />Ver QR Code</Link>
                <Button loading={confirmPix.isPending} icon={<CheckCheck aria-hidden="true" className="lucide" />} onClick={() => confirmPix.mutate()}>
                  Simular confirmação do PIX
                </Button>
              </>
            ) : null}
            {pending ? (
              <Button variant="danger" icon={<Ban aria-hidden="true" className="lucide" />} onClick={() => setDialog('cancel')}>Cancelar</Button>
            ) : null}
            {canRefund ? (
              <Link className={buttonClass('secondary')} to={`/pagamentos/${payment.id}/estornar`}><Undo2 aria-hidden="true" className="lucide" />Estornar</Link>
            ) : null}
            <Button variant="soft" icon={<Copy aria-hidden="true" className="lucide" />} onClick={copyId}>Copiar ID</Button>
          </div>
        </div>
      </section>

      <div className="grid grid-main">
        <Card aria-labelledby="details-title">
          <CardHeader
            id="details-title"
            title="Detalhes"
            action={<Button variant="ghost" icon={<Pencil aria-hidden="true" className="lucide icon-sm" />} onClick={() => setDialog('edit')}>Editar</Button>}
          />
          <div className="card-body">
            <dl className="dl">
              <dt>ID do pagamento</dt>
              <dd><code className="code">{payment.id}</code></dd>
              <dt>Método</dt>
              <dd><MethodIcon method={payment.method} small />{methodLabel(payment)}</dd>
              <dt>Referência do gateway</dt>
              <dd>{payment.gatewayReference ? <code className="code">{payment.gatewayReference}</code> : <span className="muted">Nenhuma</span>}</dd>
              <dt>Descrição</dt>
              <dd>{payment.description || <span className="muted">Nenhuma</span>}</dd>
              <dt>Metadados</dt>
              <dd className="row">
                {metadata.length ? metadata.map(([key, value]) => <Badge key={key} tone="neutral">{key}: {value}</Badge>) : <span className="muted">Nenhum</span>}
              </dd>
              <dt>Atualizado em</dt>
              <dd className="num">{formatDateTime(payment.updatedAt)}</dd>
            </dl>
          </div>
        </Card>
        <Card aria-labelledby="timeline-title">
          <CardHeader id="timeline-title" title="Linha do tempo" />
          <div className="card-body"><Timeline payment={payment} /></div>
        </Card>
      </div>

      {dialog === 'cancel' ? (
        <ConfirmDialog
          title="Cancelar este pagamento?"
          confirmLabel="Cancelar pagamento"
          danger
          loading={cancel.isPending}
          onConfirm={() => cancel.mutate()}
          onCancel={() => setDialog(null)}
        >
          O PIX deixa de valer e o cliente não consegue mais pagar. O registro continua na lista como <strong>Cancelado</strong>.
        </ConfirmDialog>
      ) : null}
      {dialog === 'edit' ? <EditPaymentDialog payment={payment} onClose={() => setDialog(null)} /> : null}
    </div>
  );
}

function BackLink() {
  return (
    <Link className="back" to="/pagamentos" aria-label="Voltar para pagamentos">
      <ArrowLeft aria-hidden="true" className="lucide" />
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div className="page" aria-busy="true" aria-label="Carregando pagamento">
      <Skeleton height={28} width={200} />
      <div className="card card-pad stack">
        <Skeleton height={14} width="40%" />
        <Skeleton height={36} width="30%" />
        <Skeleton height={20} width="50%" />
      </div>
      <div className="grid grid-main">
        <div className="card card-pad"><Skeleton height={200} /></div>
        <div className="card card-pad"><Skeleton height={200} /></div>
      </div>
    </div>
  );
}
