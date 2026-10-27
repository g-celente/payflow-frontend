import { apiBaseUrl } from '@payflow/api-client';
import { buttonClass, ErrorState, PageHeader, Skeleton } from '@payflow/ui';
import { ExternalLink } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { errorMessage, useMerchant } from '../../shared/merchant';
import { ApiKeyCard } from './ApiKeyCard';
import { WebhookCard } from './WebhookCard';

// Webhook (PUT /merchants/me/webhook) e chave de acesso (POST /merchants/me/api-key).
export function IntegrationPage() {
  const merchant = useMerchant();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash === '#chave' && merchant.data) {
      document.getElementById('chave')?.scrollIntoView({ block: 'start' });
    }
  }, [hash, merchant.data]);

  const docs = (
    <a className={buttonClass('secondary')} href={`${apiBaseUrl().replace(/\/$/, '')}/docs/`} target="_blank" rel="noreferrer">
      <ExternalLink aria-hidden="true" className="lucide" />Documentação da API<span className="sr-only"> (abre em nova aba)</span>
    </a>
  );

  return (
    <div className="page">
      <PageHeader title="Integração" subtitle="Webhook e chave de acesso da sua loja" actions={docs} />
      {merchant.isPending ? (
        <div className="card card-pad stack" aria-busy="true" aria-label="Carregando integração">
          <Skeleton height={24} width={160} />
          <Skeleton height={44} />
          <Skeleton height={120} />
        </div>
      ) : merchant.isError ? (
        <ErrorState title="Não foi possível carregar a integração" detail={errorMessage(merchant.error)} onRetry={() => void merchant.refetch()} />
      ) : (
        <WebhookCard key={merchant.data.id} merchant={merchant.data} />
      )}
      <ApiKeyCard />
    </div>
  );
}
