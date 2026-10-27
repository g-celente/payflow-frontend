import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmDialog, formatMoney, HIDDEN_MONEY, Money, MoneyInput, SecretField, setHideValues, StatusBadge, toast, ToastRegion } from '../src';

// O Testing Library normaliza espaços (o não separável do Intl vira espaço comum).
const moneyText = (cents: number) => formatMoney(cents).replace(/\s/g, ' ');

function MoneyForm({ onCents }: { readonly onCents: (cents: number) => void }) {
  const [cents, setCents] = useState(0);
  return <MoneyInput id="amount" label="Valor" cents={cents} onCents={(value) => { setCents(value); onCents(value); }} />;
}

describe('ui components', () => {
  it('money input turns typed digits into cents', async () => {
    const onCents = vi.fn();
    render(<MoneyForm onCents={onCents} />);

    await userEvent.type(screen.getByLabelText('Valor'), '1990');

    expect(screen.getByLabelText('Valor')).toHaveValue(formatMoney(1990));
    expect(onCents).toHaveBeenLastCalledWith(1990);
  });

  it('status badge always shows text, never color alone', () => {
    render(<StatusBadge status="PARTIALLY_REFUNDED" />);
    expect(screen.getByText('Estorno parcial')).toBeInTheDocument();
  });

  it('money hides values in every app when the sidebar eye is closed', () => {
    render(<><Money cents={125000} /><Money cents={1990} always /></>);
    expect(screen.getByText(moneyText(125000))).toBeInTheDocument();

    act(() => setHideValues(true));

    expect(screen.getByText(HIDDEN_MONEY)).toBeInTheDocument();
    expect(screen.getByText(moneyText(1990))).toBeInTheDocument();
  });

  it('secret field toggles between hidden and visible', async () => {
    render(<SecretField id="key" label="Chave" value="pf_123" onChange={() => undefined} />);
    expect(screen.getByLabelText('Chave')).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar' }));

    expect(screen.getByLabelText('Chave')).toHaveAttribute('type', 'text');
  });

  it('confirm dialog closes on Escape and confirms on the main button', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog title="Cancelar?" confirmLabel="Cancelar pagamento" onConfirm={onConfirm} onCancel={onCancel}>Texto</ConfirmDialog>);

    expect(screen.getByRole('dialog', { name: 'Cancelar?' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar pagamento' }));
    await userEvent.keyboard('{Escape}');

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('toast region shows messages sent by any app', () => {
    render(<ToastRegion />);
    act(() => toast('Webhook salvo'));
    expect(screen.getByText('Webhook salvo')).toBeInTheDocument();
  });
});
