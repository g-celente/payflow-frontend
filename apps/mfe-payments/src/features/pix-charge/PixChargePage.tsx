import { payflowApi, type Payment } from '@payflow/api-client';
import { Button, buttonClass, CopyField, ErrorState, Money, Notice, PageHeader, Skeleton, StatusBadge, toast } from '@payflow/ui';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, BadgeCheck, CheckCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Link, Navigate, useParams } from 'react-router';

import { NotFound } from '../../shared/NotFound';
import { errorMessage, isNotFound } from '../../shared/payment';
import { usePayment, usePaymentChanged } from '../../shared/queries';

// Enquanto o PIX está pendente, a tela consulta o pagamento a cada 5 s para mostrar quando o cliente pagar.
const POLL_MS = 5_000;

export function PixChargePage() {
  const { id = '' } = useParams();
  const payment = usePayment(id, { pollWhilePending: POLL_MS });

  if (payment.isPending) {
    return (
      <div className="page" aria-busy="true" aria-label="Carregando PIX">
        <Skeleton height={28} width={200} />
        <div className="card card-pad"><Skeleton height={240} /></div>
      </div>
    );
  }
  if (payment.isError) {
    if (isNotFound(payment.error)) {
      return <NotFound title="PIX não encontrado" detail="Ele não existe ou é de outra loja." />;
    }
    return (
      <div className="page">
        <PageHeader title="PIX" back={<BackLink />} />
        <ErrorState detail={errorMessage(payment.error)} onRetry={() => void payment.refetch()} />
      </div>
    );
  }
  if (payment.data.method !== 'PIX' || !payment.data.pix) {
    return <Navigate to={`/pagamentos/${id}`} replace />;
  }
  return <PixCharge payment={payment.data} qrCode={payment.data.pix.qrCode} />;
}

function PixCharge({ payment, qrCode }: { readonly payment: Payment; readonly qrCode: string }) {
  const changed = usePaymentChanged();
  const confirm = useMutation({
    mutationFn: () => payflowApi.confirmPix(payment.id),
    onSuccess: (updated) => {
      changed(updated);
      toast('PIX confirmado');
    },
    onError: (error) => toast(errorMessage(error), 'error'),
  });

  if (payment.status !== 'PENDING') {
    return <PixFinished payment={payment} />;
  }
  return (
    <div className="page">
      <PageHeader
        title="PIX gerado"
        subtitle="Mostre o QR Code ou envie o código para o seu cliente"
        back={<BackLink />}
        actions={<StatusBadge status={payment.status} />}
      />
      <section className="card card-pad" aria-label="Cobrança PIX">
        <div className="pix-box">
          <QRCodeSVG className="qr" value={qrCode} size={220} marginSize={0} title="QR Code do PIX" />
          <div className="stack" style={{ minWidth: 0 }}>
            <div>
              <div className="muted" style={{ fontSize: 14 }}>{payment.description || 'Cobrança PIX'}</div>
              <div className="detail-amount"><Money cents={payment.amount} always /></div>
            </div>
            <div className="field">
              <span className="label">PIX copia e cola</span>
              <CopyField value={qrCode} copiedMessage="Código PIX copiado" />
            </div>
            <ol className="steps">
              <li>O cliente abre o app do banco e escolhe pagar com PIX.</li>
              <li>Escaneia o QR Code ou cola o código.</li>
              <li>O status muda para <strong>PIX confirmado</strong> e sua loja recebe o webhook.</li>
            </ol>
            <div className="row">
              <Button loading={confirm.isPending} icon={<CheckCheck aria-hidden="true" className="lucide" />} onClick={() => confirm.mutate()}>
                Simular pagamento
              </Button>
              <Link className={buttonClass('secondary')} to={`/pagamentos/${payment.id}`}>Ver pagamento</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PixFinished({ payment }: { readonly payment: Payment }) {
  const paid = payment.status !== 'CANCELED';
  return (
    <div className="page">
      <PageHeader title={paid ? 'PIX recebido' : 'PIX cancelado'} back={<BackLink />} actions={<StatusBadge status={payment.status} />} />
      {paid ? (
        <section className="card card-pad stack" aria-live="polite" style={{ alignItems: 'flex-start' }}>
          <span className="success-icon"><BadgeCheck aria-hidden="true" className="lucide" /></span>
          <div>
            <h2 className="section-title">O cliente pagou <Money cents={payment.amount} always /></h2>
            <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>O dinheiro entra na hora (D+0) e a sua loja recebe o webhook payment.confirmed.</p>
          </div>
          <Link className={buttonClass('primary')} to={`/pagamentos/${payment.id}`}>Ver pagamento</Link>
        </section>
      ) : (
        <Notice action={<Link className={buttonClass('soft')} to="/nova-cobranca?metodo=pix">Gerar outro PIX</Link>}>
          <strong>Esta cobrança foi cancelada.</strong> O código não vale mais.
        </Notice>
      )}
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
