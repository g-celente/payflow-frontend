import { payflowApi } from '@payflow/api-client';
import { screen } from '@testing-library/react';
import { Route } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { readFilters, toQuery, writeFilters } from '../src/features/payment-list/filters';
import { PaymentListPage } from '../src/features/payment-list/PaymentListPage';
import { aPage, aPayment, aPixPayment, moneyText } from './fixtures';
import { renderRoutes } from './render';

describe('payment list filters', () => {
  it('reads the filters from the URL and ignores unknown values', () => {
    expect(readFilters(new URLSearchParams('status=PENDING&metodo=pix&periodo=7d&pagina=3'))).toEqual({
      status: 'PENDING',
      method: 'PIX',
      period: '7d',
      page: 3,
    });
    expect(readFilters(new URLSearchParams('status=PAID&metodo=boleto&periodo=ano&pagina=-1'))).toEqual({
      status: undefined,
      method: undefined,
      period: 'todos',
      page: 1,
    });
  });

  it('writes only what differs from the defaults', () => {
    expect(writeFilters({ status: undefined, method: 'CARD', period: 'todos', page: 1 }).toString()).toBe('metodo=cartao');
  });

  it('turns the period into a stable start date and the page into the zero-based BFF page', () => {
    const now = new Date(2026, 9, 26, 15, 30);
    const query = toQuery({ status: 'AUTHORIZED', method: undefined, period: '7d', page: 2 }, now);
    expect(query).toEqual({ status: 'AUTHORIZED', method: undefined, from: new Date(2026, 9, 20).toISOString(), page: 1, size: 20 });
    expect(toQuery({ status: undefined, method: undefined, period: 'mes', page: 1 }, now).from).toBe(new Date(2026, 9, 1).toISOString());
  });
});

describe('payment list page', () => {
  function renderList(path = '/pagamentos') {
    return renderRoutes(path, (
      <>
        <Route path="/pagamentos" element={<PaymentListPage />} />
        <Route path="/pagamentos/:id" element={<p>Detalhe do pagamento</p>} />
      </>
    ));
  }

  it('lists payments with status, method and refunded amount', async () => {
    vi.spyOn(payflowApi, 'listPayments').mockResolvedValue(aPage([
      aPayment({ status: 'PARTIALLY_REFUNDED', refundedAmount: 2500 }),
      aPixPayment(),
    ]));
    renderList();

    expect(await screen.findByRole('link', { name: 'Pedido #1042 — Camiseta' })).toBeInTheDocument();
    expect(screen.getByText('Cartão •••• 4242')).toBeInTheDocument();
    expect(screen.getByText('Estorno parcial', { selector: '.badge' })).toBeInTheDocument();
    expect(screen.getByText(moneyText(2500))).toBeInTheDocument();
    expect(screen.getByText('Aguardando PIX', { selector: '.badge' })).toBeInTheDocument();
    expect(screen.getByText('1–2 de 2 pagamentos')).toBeInTheDocument();
  });

  it('sends the chosen filters to the BFF', async () => {
    const listPayments = vi.spyOn(payflowApi, 'listPayments').mockResolvedValue(aPage([aPayment()]));
    const { user } = renderList();
    await screen.findByRole('link', { name: 'Pedido #1042 — Camiseta' });

    await user.selectOptions(screen.getByLabelText('Status'), 'PENDING');
    await user.click(screen.getByRole('button', { name: 'PIX' }));

    expect(listPayments).toHaveBeenLastCalledWith({ status: 'PENDING', method: 'PIX', from: undefined, page: 0, size: 20 });
  });

  it('opens the detail when a row is clicked', async () => {
    vi.spyOn(payflowApi, 'listPayments').mockResolvedValue(aPage([aPayment()]));
    const { user } = renderList();

    await user.click(await screen.findByText('Cartão •••• 4242'));

    expect(await screen.findByText('Detalhe do pagamento')).toBeInTheDocument();
  });

  it('suggests clearing the filters when nothing matches', async () => {
    vi.spyOn(payflowApi, 'listPayments').mockResolvedValue(aPage([]));
    renderList('/pagamentos?status=REFUNDED');

    expect(await screen.findByText('Nenhum pagamento com esses filtros')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Limpar filtros/ }).length).toBeGreaterThan(0);
  });
});
