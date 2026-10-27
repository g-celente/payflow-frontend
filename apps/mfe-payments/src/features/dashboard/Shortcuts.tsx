import { apiBaseUrl } from '@payflow/api-client';
import { Card, CardHeader, NewBadge } from '@payflow/ui';
import { CreditCard, FileCode2, KeyRound, QrCode, Undo2, Webhook, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

export function Shortcuts() {
  return (
    <Card aria-labelledby="shortcuts-title">
      <CardHeader id="shortcuts-title" title="Acesso rápido" />
      <div className="card-body shortcuts">
        <Shortcut to="/nova-cobranca?metodo=cartao" icon={CreditCard}>Cobrar no cartão</Shortcut>
        <Shortcut to="/nova-cobranca?metodo=pix" icon={QrCode}>Cobrar com PIX</Shortcut>
        <Shortcut to="/conta/integracao" icon={Webhook} isNew>Configurar webhook</Shortcut>
        <Shortcut to="/conta/integracao#chave" icon={KeyRound}>Trocar chave</Shortcut>
        <Shortcut to="/pagamentos?status=AUTHORIZED" icon={Undo2}>Fazer estorno</Shortcut>
        <a className="shortcut" href={`${apiBaseUrl().replace(/\/$/, '')}/docs/`} target="_blank" rel="noreferrer">
          <span className="circle"><FileCode2 aria-hidden="true" className="lucide" /></span>
          Documentação da API
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      </div>
    </Card>
  );
}

function Shortcut({ to, icon: Icon, isNew = false, children }: {
  readonly to: string;
  readonly icon: LucideIcon;
  readonly isNew?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <Link className="shortcut" to={to}>
      {isNew ? <NewBadge /> : null}
      <span className="circle"><Icon aria-hidden="true" className="lucide" /></span>
      {children}
    </Link>
  );
}
