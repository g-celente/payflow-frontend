import { payflowApi } from '@payflow/api-client';
import { screen } from '@testing-library/react';
import { Route } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { RefundPage } from '../src/features/refund/RefundPage';
import { aPayment, aPixPayment } from './fixtures';
import { renderRoutes } from './render';

const PAYMENT_ID = '9f8e7d6c-5b4a-4321-8765-0fedcba98765';

function renderRefund() {
  return renderRoutes(`/pagamentos/${PAYMENT_ID}/estornar`, (
    <>
      <Route path="/pagamentos/:id/estornar" element={<RefundPage />} />
      <Route path="/pagamentos/:id" element={<p>Detalhe do pagamento</p>} />
    </>
  ));
}

describe('refund (POST /payments/{id}/refunds)', () => {
  it('suggests the remaining balance and refunds part of it', async () => {
    vi.spyOn(payflowApi, 'getPayment').mockResolvedValue(aPayment({ status: 'PARTIALLY_REFUNDED', refundedAmount: 2500 }));
    const refundPayment = vi.spyOn(payflowApi, 'refundPayment').mockResolvedValue(aPayment({ status: 'PARTIALLY_REFUNDED', refundedAmount: 7500 }));
    const { user } = renderRefund();

    const amount = await screen.findByLabelText('Valor do estorno');
    expect(amount).toHaveValue(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(75));
    await user.clear(amount);
    await user.type(amount, '5000');
    await user.type(screen.getByLabelText(/Motivo/), 'Produto com avaria');
    await user.click(screen.getByRole('button', { name: /Estornar R\$/ }));

    expect(await screen.findByText('Detalhe do pagamento')).toBeInTheDocument();
    expect(refundPayment).toHaveBeenCalledWith(PAYMENT_ID, { amount: 5000, reason: 'Produto com avaria' }, expect.any(String));
  });

  it('does not refund more than the remaining balance', async () => {
    vi.spyOn(payflowApi, 'getPayment').mockResolvedValue(aPayment({ status: 'PARTIALLY_REFUNDED', refundedAmount: 2500 }));
    const refundPayment = vi.spyOn(payflowApi, 'refundPayment');
    const { user } = renderRefund();

    const amount = await screen.findByLabelText('Valor do estorno');
    await user.clear(amount);
    await user.type(amount, '9000');
    await user.click(screen.getByRole('button', { name: /Estornar R\$/ }));

    expect(screen.getByText(/O máximo para estornar é R\$\s75,00\./)).toBeInTheDocument();
    expect(refundPayment).not.toHaveBeenCalled();
  });

  it('explains when the payment cannot be refunded', async () => {
    vi.spyOn(payflowApi, 'getPayment').mockResolvedValue(aPixPayment({ id: PAYMENT_ID }));
    renderRefund();

    expect(await screen.findByText('Este pagamento não pode ser estornado.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Valor do estorno')).not.toBeInTheDocument();
  });
});
