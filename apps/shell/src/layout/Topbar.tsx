import type { Merchant } from '@payflow/api-client';
import { IconButton, initials } from '@payflow/ui';
import { ArrowRightLeft, Menu, X } from 'lucide-react';
import { Link } from 'react-router';

export function Topbar({ merchant, navOpen, onToggleNav }: {
  readonly merchant: Merchant | undefined;
  readonly navOpen: boolean;
  readonly onToggleNav: () => void;
}) {
  return (
    <header className="topbar">
      <IconButton
        className="menu-button"
        label={navOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={navOpen}
        aria-controls="sidebar"
        onClick={onToggleNav}
      >
        {navOpen ? <X aria-hidden="true" className="lucide" /> : <Menu aria-hidden="true" className="lucide" />}
      </IconButton>
      <Link className="logo" to="/" aria-label="PayFlow, início">
        <span className="logo-mark"><ArrowRightLeft aria-hidden="true" className="lucide" /></span>
        payflow
      </Link>
      <span className="env-badge">Ambiente de testes</span>
      <span className="topbar-spacer" />
      {merchant ? (
        <div className="user">
          <div className="user-text">
            <div className="user-name">{merchant.name}</div>
            <div className="user-mail">{merchant.email}</div>
          </div>
          <span className="avatar" aria-hidden="true">{initials(merchant.name)}</span>
        </div>
      ) : null}
    </header>
  );
}
