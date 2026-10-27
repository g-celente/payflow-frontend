import { ApiError, payflowApi } from '@payflow/api-client';
import { screen, within } from '@testing-library/react';
import { Route } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { PaymentDetailPage } from '../src/features/payment-detail/PaymentDetailPage';
import { timelineOf } from '../src/features/payment-detail/Timeline';
import { PixChargePage } from '../src/features/pix-charge/PixChargePage';
import { aPayment, aPixPayment } from './fixtures';
import { renderRoutes } from './render';

function renderAt(path: string) {
  return renderRoutes(path, (
    <>
      <Route path="/pagamentos/:id" element={<PaymentDetailPage />} />
      <Route path="/pagamentos/:id/estornar" element={<p>Tela de estorno</p>} />
      <Route path="/pix/:id" element={<PixChargePage />} />
    </>
  ));
}

describe('payment detail (GET, PATCH, DELETE /payments/{id})', () => {
  it('offers a refund for an approved card payment', async () => {
    const payment = aPayment();
    vi.spyOn(payflowApi, 'getPayment').mockResolvedValue(payment);
    renderAt(`/pagamentos/${payment.id}`);

    expect(await screen.findAllByText('Pedido #1042 — Camiseta')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Estornar' })).toHaveAttribute('href', `/pagamentos/${payment.id}/estornar`);
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
    expect(screen.getByText('order_id: 1042')).toBeInTheDocument();
  });

  it('cancels a pending PIX after confirmation', async () => {
    const payment = aPixPayment();
    vi.spyOn(payflowApi, 'getPayment').mockResolvedValue(payment);
    const cancelPayment = vi.spyOn(payflowApi, 'cancelPayment').mockResolvedValue({ ...payment, status: 'CANCELED' });
    const { user } = renderAt(`/pagamentos/${payment.id}`);

    await user.click(await screen.findByRole('button', { name: 'Cancelar' }));
    const dialog = screen.getByRole('dialog', { name: 'Cancelar este pagamento?' });
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar pagamento' }));

    expect(cancelPayment).toHaveBeenCalledWith(payment.id);
    expect(await screen.findByText('Cancelado', { selector: '.badge' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('edits the description and order number', async () => {
    const payment = aPayment();
    vi.spyOn(payflowApi, 'getPayment').mockResolvedValue(payment);
    const updatePayment = vi.spyOn(payflowApi, 'updatePayment').mockResolvedValue({ ...payment, description: 'Pedido #1042 — Camiseta azul' });
    const { user } = renderAt(`/pagamentos/${payment.id}`);

    await user.click(await screen.findByRole('button', { name: 'Editar' }));
    const description = screen.getByLabelText('Descrição');
    await user.clear(description);
    await user.type(description, 'Pedido #1042 — Camiseta azul');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(updatePayment).toHaveBeenCalledWith(payment.id, { description: 'Pedido #1042 — Camiseta azul', metadata: { order_id: '1042' } });
    expect((await screen.findAllByText('Pedido #1042 — Camiseta azul')).length).toBeGreaterThan(0);
  });

  it('says so when the payment does not exist', async () => {
    vi.spyOn(payflowApi, 'getPayment').mockRejectedValue(new ApiError(404, 'Not Found', 'Payment not found'));
    renderAt('/pagamentos/00000000-0000-0000-0000-000000000000');

    expect(await screen.findByRole('heading', { name: 'Pagamento não encontrado', level: 1 })).toBeInTheDocument();
  });

  it('builds the timeline from the payment and its refunds', () => {
    const steps = timelineOf(aPayment({
      status: 'PARTIALLY_REFUNDED',
      refundedAmount: 2500,
      refunds: [{ id: 'r1', amount: 2500, reason: 'avaria', createdAt: '2026-10-26T15:02:00Z' }],
    }));
    expect(steps.map((step) => step.title)).toEqual(['Pagamento criado', 'Aprovado pelo gateway', expect.stringMatching(/^Estorno de R\$\s25,00 · avaria$/)]);
  });
});

describe('PIX charge', () => {
  it('shows the QR Code and the copy-and-paste code, then the confirmation', async () => {
    const payment = aPixPayment();
    vi.spyOn(payflowApi, 'getPayment').mockResolvedValue(payment);
    const confirmPix = vi.spyOn(payflowApi, 'confirmPix').mockResolvedValue({ ...payment, status: 'CONFIRMED' });
    const { user } = renderAt(`/pix/${payment.id}`);

    expect(await screen.findByTitle('QR Code do PIX')).toBeInTheDocument();
    expect(screen.getByText(payment.pix!.qrCode)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Simular pagamento' }));

    expect(confirmPix).toHaveBeenCalledWith(payment.id);
    expect(await screen.findByRole('heading', { name: 'PIX recebido' })).toBeInTheDocument();
  });
});
