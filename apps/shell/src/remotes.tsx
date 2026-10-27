import { Component, lazy, Suspense, type ReactNode } from 'react';
import { Button, ErrorState, Skeleton } from '@payflow/ui';

// Carregados em tempo de execução do remoteEntry.js de cada remote: nova versão de um remote não exige rebuild do Shell.
const PaymentsApp = lazy(() => import('mfe_payments/PaymentsApp'));
const AccountApp = lazy(() => import('mfe_account/AccountApp'));

export function PaymentsRemote() {
  return <RemoteBoundary name="pagamentos"><PaymentsApp /></RemoteBoundary>;
}

export function AccountRemote() {
  return <RemoteBoundary name="conta"><AccountApp /></RemoteBoundary>;
}

function RemoteBoundary({ name, children }: { readonly name: string; readonly children: ReactNode }) {
  return (
    <LoadFailure name={name}>
      <Suspense fallback={<RemoteLoading />}>{children}</Suspense>
    </LoadFailure>
  );
}

function RemoteLoading() {
  return (
    <div className="page" aria-busy="true" aria-label="Carregando">
      <Skeleton height={28} width={260} />
      <Skeleton height={120} />
      <Skeleton height={240} />
    </div>
  );
}

// Um remote que não carrega (sem rede, URL errada, deploy em andamento) não derruba o Shell.
class LoadFailure extends Component<{ readonly name: string; readonly children: ReactNode }, { readonly failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    if (!this.state.failed) {
      return this.props.children;
    }
    return (
      <div className="page">
        <ErrorState
          title={`Não foi possível abrir a área de ${this.props.name}`}
          detail="O módulo não carregou. Verifique sua conexão; se continuar, tente mais tarde."
        />
        <div><Button variant="secondary" onClick={() => window.location.reload()}>Recarregar a página</Button></div>
      </div>
    );
  }
}
