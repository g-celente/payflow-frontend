import { KeyRound, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { useHideValues } from '../events';
import { formatMoney, HIDDEN_MONEY } from '../format';
import { SecretField } from './forms';
import { Button } from './primitives';

// Valor em reais que obedece ao "ocultar valores" da barra lateral.
export function Money({ cents, always = false }: { readonly cents: number; readonly always?: boolean }) {
  const hidden = useHideValues();
  return <span className="num">{hidden && !always ? HIDDEN_MONEY : formatMoney(cents)}</span>;
}

export function KpiCard({ icon: Icon, label, value, hint }: {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: ReactNode;
  readonly hint: ReactNode;
}) {
  return (
    <div className="card kpi">
      <span className="kpi-label"><span className="kpi-icon"><Icon aria-hidden="true" className="lucide" /></span>{label}</span>
      <span className="kpi-value num">{value}</span>
      <span className="kpi-hint">{hint}</span>
    </div>
  );
}

// Só para rodar um microfrontend sozinho em desenvolvimento (a sessão de verdade é do Shell).
export function StandaloneSession({ hasKey, onKey, children }: {
  readonly hasKey: boolean;
  readonly onKey: (key: string) => void;
  readonly children: ReactNode;
}) {
  const [key, setKey] = useState('');
  if (hasKey) {
    return <>{children}</>;
  }
  return (
    <div className="full-page">
      <form
        className="card card-pad form"
        style={{ width: 'min(420px, 100%)' }}
        onSubmit={(event) => {
          event.preventDefault();
          if (key.trim()) onKey(key.trim());
        }}
      >
        <h1 className="section-title">Microfrontend isolado</h1>
        <p className="muted" style={{ fontSize: 14 }}>Fora do Shell não há sessão. Informe uma chave de lojista para testar.</p>
        <SecretField id="standalone-key" label="Chave de acesso" value={key} onChange={(event) => setKey(event.target.value)} />
        <Button type="submit" icon={<KeyRound aria-hidden="true" className="lucide" />}>Usar esta chave</Button>
      </form>
    </div>
  );
}
