import { payflowApi, type Dashboard } from '@payflow/api-client';
import { Button, buttonClass, Card, EmptyState, ErrorState, formatTime, KpiCard, Money, PageHeader } from '@payflow/ui';
import { useQuery } from '@tanstack/react-query';
import { Percent, Plus, ReceiptText, RefreshCw, TrendingUp, Wallet } from 'lucide-react';
import { Link } from 'react-router';

import { errorMessage } from '../../shared/payment';
import { queryKeys } from '../../shared/queries';
import { DashboardSkeleton } from './DashboardSkeleton';
import { MethodBreakdown, StatusBreakdown } from './Breakdowns';
import { RecentPayments } from './RecentPayments';
import { Shortcuts } from './Shortcuts';
import { WarningNotices } from './WarningNotices';
import { WebhookBanner } from './WebhookBanner';

// Painel: uma chamada ao GET /aggregated-data do BFF (lojista + resumo + últimos pagamentos + taxas).
// Se uma parte falha, o BFF manda o resto e um aviso; a tela mostra o que tem.
export function DashboardPage() {
  const dashboard = useQuery({ queryKey: queryKeys.dashboard, queryFn: () => payflowApi.dashboard() });

  if (dashboard.isPending) {
    return <DashboardSkeleton />;
  }
  if (dashboard.isError) {
    return (
      <div className="page">
        <PageHeader title="Início" />
        <ErrorState title="Não foi possível carregar o painel" detail={errorMessage(dashboard.error)} onRetry={() => void dashboard.refetch()} />
      </div>
    );
  }

  const data = dashboard.data;
  const retry = () => void dashboard.refetch();
  return (
    <div className="page">
      <PageHeader
        title={`Olá, ${data.merchant.name}`}
        documentTitle="Início"
        subtitle={`Resumo de todos os pagamentos · atualizado às ${formatTime(data.generatedAt)}`}
        actions={(
          <>
            <Button variant="secondary" loading={dashboard.isFetching} icon={<RefreshCw aria-hidden="true" className="lucide" />} onClick={retry}>
              Atualizar
            </Button>
            <Link className={buttonClass('primary')} to="/nova-cobranca"><Plus aria-hidden="true" className="lucide" />Nova cobrança</Link>
          </>
        )}
      />
      <WarningNotices warnings={data.warnings} onRetry={retry} />
      {data.merchant.webhookConfigured ? null : <WebhookBanner />}
      {data.summary?.count === 0 ? <FirstSteps /> : <Overview data={data} />}
      <Shortcuts />
      <RecentPayments payments={data.recentPayments} />
    </div>
  );
}

function Overview({ data }: { readonly data: Dashboard }) {
  const { summary, fees } = data;
  const unavailable = 'Indisponível agora';
  return (
    <>
      <section className="grid grid-4" aria-label="Indicadores">
        <KpiCard
          icon={TrendingUp}
          label="Volume aprovado"
          value={summary ? <Money cents={summary.totalAmount} /> : '—'}
          hint={summary ? 'Líquido de estornos' : unavailable}
        />
        <KpiCard
          icon={Percent}
          label="Taxas estimadas"
          value={fees ? <Money cents={fees.totalFees} /> : '—'}
          hint={fees ? 'Cartão e PIX somados' : unavailable}
        />
        <KpiCard icon={Wallet} label="Você recebe" value={fees ? <Money cents={fees.netAmount} /> : '—'} hint={fees ? 'Depois das taxas' : unavailable} />
        <KpiCard
          icon={ReceiptText}
          label="Pagamentos"
          value={summary ? String(summary.count) : '—'}
          hint={summary ? `${summary.byStatus.PENDING ?? 0} aguardando PIX` : unavailable}
        />
      </section>
      {summary ? (
        <div className="grid grid-main">
          <MethodBreakdown summary={summary} fees={fees} />
          <StatusBreakdown summary={summary} />
        </div>
      ) : null}
    </>
  );
}

function FirstSteps() {
  return (
    <Card>
      <EmptyState
        icon={ReceiptText}
        title="Sua loja ainda não recebeu pagamentos"
        action={<Link className={buttonClass('primary')} to="/nova-cobranca"><Plus aria-hidden="true" className="lucide" />Criar a primeira cobrança</Link>}
      >
        Crie uma cobrança de teste no cartão ou com PIX e veja o painel ganhar vida.
      </EmptyState>
    </Card>
  );
}
