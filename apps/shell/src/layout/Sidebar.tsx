import type { Merchant } from '@payflow/api-client';
import { IconButton, maskDocument, Money, NewBadge, setHideValues, Skeleton, useHideValues } from '@payflow/ui';
import { useQuery } from '@tanstack/react-query';
import {
  CirclePlus,
  CreditCard,
  Eye,
  EyeOff,
  House,
  LogOut,
  QrCode,
  ReceiptText,
  Store,
  Webhook,
  type LucideIcon,
} from 'lucide-react';
import { Link, NavLink } from 'react-router';

import { balanceQuery, endSession } from '../session/session';

interface NavEntry {
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly end?: boolean;
  readonly isNew?: boolean;
}

const NAV: readonly NavEntry[] = [
  { to: '/', label: 'Início', icon: House, end: true },
  { to: '/pagamentos', label: 'Pagamentos', icon: ReceiptText },
  { to: '/nova-cobranca', label: 'Nova cobrança', icon: CirclePlus },
  { to: '/conta', label: 'Conta', icon: Store, end: true },
  { to: '/conta/integracao', label: 'Integração', icon: Webhook, isNew: true },
];

const QUICK_ACTIONS = [
  { to: '/nova-cobranca?metodo=cartao', label: 'Cartão', icon: CreditCard },
  { to: '/nova-cobranca?metodo=pix', label: 'PIX', icon: QrCode },
  { to: '/conta/integracao', label: 'Webhook', icon: Webhook },
] as const;

export function Sidebar({ merchant, hidden, onNavigate }: {
  readonly merchant: Merchant | undefined;
  readonly hidden: boolean;
  readonly onNavigate: () => void;
}) {
  return (
    <aside className="sidebar" id="sidebar" aria-label="Menu principal" inert={hidden}>
      <div className="merchant-card">
        {merchant ? (
          <>
            <div className="merchant-name">{merchant.name}</div>
            <div className="merchant-doc num">{maskDocument(merchant.document)}</div>
          </>
        ) : (
          <>
            <Skeleton height={18} width="70%" />
            <Skeleton height={12} width="50%" />
          </>
        )}
      </div>
      <Balance />
      <div className="quick-actions">
        {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
          <Link key={label} className="quick-action" to={to} onClick={onNavigate}>
            <span className="circle"><Icon aria-hidden="true" className="lucide" /></span>
            {label}
          </Link>
        ))}
      </div>
      <nav className="nav" aria-label="Seções do portal">
        {NAV.map(({ to, label, icon: Icon, end, isNew }) => (
          <NavLink key={to} className="nav-item" to={to} end={end} onClick={onNavigate}>
            <Icon aria-hidden="true" className="lucide" />
            <span>{label}</span>
            {isNew ? <NewBadge /> : null}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="nav-separator" />
        <button type="button" className="nav-item" onClick={() => endSession()}>
          <LogOut aria-hidden="true" className="lucide" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

function Balance() {
  const hidden = useHideValues();
  const dashboard = useQuery(balanceQuery);
  const total = dashboard.data?.summary?.totalAmount;
  return (
    <div className="balance">
      <div className="balance-label">
        Volume aprovado
        <IconButton label={hidden ? 'Mostrar valores' : 'Ocultar valores'} aria-pressed={hidden} onClick={() => setHideValues(!hidden)}>
          {hidden ? <EyeOff aria-hidden="true" className="lucide" /> : <Eye aria-hidden="true" className="lucide" />}
        </IconButton>
      </div>
      <div className={`balance-value num ${hidden ? 'hidden-value' : ''}`.trim()}>
        {dashboard.isPending ? <Skeleton height={28} width="80%" /> : total === undefined ? '—' : <Money cents={total} />}
      </div>
    </div>
  );
}
