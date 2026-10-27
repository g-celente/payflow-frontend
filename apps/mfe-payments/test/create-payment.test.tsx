import { ApiError, payflowApi } from '@payflow/api-client';
import { screen } from '@testing-library/react';
import { Route } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { CreatePaymentPage } from '../src/features/create-payment/CreatePaymentPage';
import { aPayment, aPixPayment } from './fixtures';
import { renderRoutes } from './render';

function renderCreate(path = '/nova-cobranca') {
  return renderRoutes(path, (
    <>
      <Route path="/nova-cobranca" element={<CreatePaymentPage />} />
      <Route path="/pagamentos/:id" element={<p>Detalhe do pagamento</p>} />
      <Route path="/pix/:id" element={<p>QR Code do PIX</p>} />
    </>
  ));
}

describe('create payment (POST /payments)', () => {
  it('charges a test card with an Idempotency-Key and opens the payment', async () => {
    const createPayment = vi.spyOn(payflowApi, 'createPayment').mockResolvedValue(aPayment({ amount: 1990 }));
    const { user } = renderCreate();

    await user.type(screen.getByLabelText('Valor'), '1990');
    await user.type(screen.getByLabelText(/Descrição/), 'Pedido #1044');
    await user.type(screen.getByLabelText(/Número do pedido/), '1044');
    await user.click(screen.getByRole('button', { name: /Cobrar R\$/ }));

    expect(await screen.findByText('Detalhe do pagamento')).toBeInTheDocument();
    expect(createPayment).toHaveBeenCalledWith(
      { amount: 1990, method: 'CARD', cardToken: 'tok_approved', description: 'Pedido #1044', metadata: { order_id: '1044' } },
      expect.stringMatching(/^[0-9a-f-]{36}$/),
    );
  });

  it('uses the chosen test card', async () => {
    const createPayment = vi.spyOn(payflowApi, 'createPayment').mockResolvedValue(aPayment({ status: 'DECLINED' }));
    const { user } = renderCreate();

    await user.type(screen.getByLabelText('Valor'), '500');
    await user.click(screen.getByLabelText(/Recusado/));
    await user.click(screen.getByRole('button', { name: /Cobrar R\$/ }));

    await screen.findByText('Detalhe do pagamento');
    expect(createPayment.mock.calls[0]?.[0]).toMatchObject({ cardToken: 'tok_declined' });
  });

  it('creates a PIX charge (link from the sidebar) and opens the QR Code', async () => {
    const createPayment = vi.spyOn(payflowApi, 'createPayment').mockResolvedValue(aPixPayment());
    const { user } = renderCreate('/nova-cobranca?metodo=pix');

    await user.type(screen.getByLabelText('Valor'), '3000');
    await user.click(screen.getByRole('button', { name: /Gerar PIX de/ }));

    expect(await screen.findByText('QR Code do PIX')).toBeInTheDocument();
    expect(createPayment.mock.calls[0]?.[0]).toEqual({ amount: 3000, method: 'PIX' });
  });

  it('requires an amount', async () => {
    const createPayment = vi.spyOn(payflowApi, 'createPayment');
    const { user } = renderCreate();

    await user.click(screen.getByRole('button', { name: /Cobrar R\$/ }));

    expect(screen.getByText('Informe um valor maior que zero.')).toBeInTheDocument();
    expect(createPayment).not.toHaveBeenCalled();
  });

  it('retries a gateway timeout with the same key, so the customer is never charged twice', async () => {
    const createPayment = vi.spyOn(payflowApi, 'createPayment')
      .mockRejectedValueOnce(new ApiError(504, 'Gateway Timeout', 'The payment gateway did not answer in time'))
      .mockResolvedValueOnce(aPayment());
    const { user } = renderCreate();

    await user.type(screen.getByLabelText('Valor'), '1000');
    await user.click(screen.getByRole('button', { name: /Cobrar R\$/ }));
    expect(await screen.findByText(/O gateway não respondeu a tempo e nada foi cobrado/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Cobrar R\$/ }));

    await screen.findByText('Detalhe do pagamento');
    expect(createPayment.mock.calls[1]?.[1]).toBe(createPayment.mock.calls[0]?.[1]);
  });

  it('uses a new key when the form changes after a failure', async () => {
    const createPayment = vi.spyOn(payflowApi, 'createPayment')
      .mockRejectedValueOnce(new ApiError(504, 'Gateway Timeout', 'The payment gateway did not answer in time'))
      .mockResolvedValueOnce(aPayment());
    const { user } = renderCreate();

    await user.type(screen.getByLabelText('Valor'), '1000');
    await user.click(screen.getByRole('button', { name: /Cobrar R\$/ }));
    await screen.findByText(/O gateway não respondeu a tempo/);
    await user.type(screen.getByLabelText('Valor'), '0');
    await user.click(screen.getByRole('button', { name: /Cobrar R\$/ }));

    await screen.findByText('Detalhe do pagamento');
    expect(createPayment.mock.calls[1]?.[0]).toMatchObject({ amount: 10000 });
    expect(createPayment.mock.calls[1]?.[1]).not.toBe(createPayment.mock.calls[0]?.[1]);
  });
});
