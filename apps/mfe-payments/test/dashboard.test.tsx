import { ApiError, payflowApi } from '@payflow/api-client';
import { setHideValues } from '@payflow/ui';
import { act, screen } from '@testing-library/react';
import { Route } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { DashboardPage } from '../src/features/dashboard/DashboardPage';
import { aDashboard, moneyText } from './fixtures';
import { renderRoutes } from './render';

function renderDashboard() {
  return renderRoutes('/', <Route path="/" element={<DashboardPage />} />);
}

describe('dashboard (GET /aggregated-data)', () => {
  it('shows the aggregated summary, fees and recent payments', async () => {
    vi.spyOn(payflowApi, 'dashboard').mockResolvedValue(aDashboard());
    renderDashboard();

    expect(await screen.findByRole('heading', { name: 'Olá, Loja Exemplo' })).toBeInTheDocument();
    expect(screen.getAllByText(moneyText(125000)).length).toBeGreaterThan(0);
    expect(screen.getByText(moneyText(3488))).toBeInTheDocument();
    expect(screen.getByText(moneyText(121512))).toBeInTheDocument();
    expect(screen.getByText('4 aguardando PIX')).toBeInTheDocument();
    expect(screen.getByText('Recebe em D+30')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Pagamento no cartão/ })).toHaveAttribute('href', '/pagamentos/p1');
    expect(screen.queryByText('Receba avisos de pagamento na sua loja')).not.toBeInTheDocument();
  });

  it('keeps the rest of the panel when the fees function fails', async () => {
    vi.spyOn(payflowApi, 'dashboard').mockResolvedValue(aDashboard({
      fees: null,
      warnings: [{ part: 'fees', dependency: 'fees-function', reason: 'timeout', message: 'fees-function did not answer in 2000 ms' }],
    }));
    renderDashboard();

    expect(await screen.findByText('Não foi possível calcular as taxas agora.')).toBeInTheDocument();
    expect(screen.getByText(/O serviço demorou demais para responder/)).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível agora')).toHaveLength(2);
    expect(screen.getAllByText(moneyText(125000)).length).toBeGreaterThan(0);
  });

  it('invites the merchant to configure the webhook', async () => {
    vi.spyOn(payflowApi, 'dashboard').mockResolvedValue(aDashboard({ merchant: { id: 'm1', name: 'Loja Exemplo', webhookConfigured: false } }));
    renderDashboard();

    expect(await screen.findByText('Receba avisos de pagamento na sua loja')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Configurar agora/ })).toHaveAttribute('href', '/conta/integracao');
  });

  it('welcomes a store without payments', async () => {
    vi.spyOn(payflowApi, 'dashboard').mockResolvedValue(aDashboard({
      summary: { currency: 'BRL', totalAmount: 0, count: 0, byStatus: {}, byMethod: {} },
      recentPayments: [],
    }));
    renderDashboard();

    expect(await screen.findByText('Sua loja ainda não recebeu pagamentos')).toBeInTheDocument();
  });

  it('hides values when the sidebar eye is closed', async () => {
    vi.spyOn(payflowApi, 'dashboard').mockResolvedValue(aDashboard());
    renderDashboard();
    await screen.findByRole('heading', { name: 'Olá, Loja Exemplo' });

    act(() => setHideValues(true));

    expect(screen.queryByText(moneyText(125000))).not.toBeInTheDocument();
  });

  it('offers a retry when the BFF fails', async () => {
    const dashboard = vi.spyOn(payflowApi, 'dashboard').mockRejectedValueOnce(new ApiError(502, 'Bad Gateway', 'O merchant-service não respondeu.'));
    dashboard.mockResolvedValueOnce(aDashboard());
    const { user } = renderDashboard();

    expect(await screen.findByText(/O merchant-service não respondeu/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByRole('heading', { name: 'Olá, Loja Exemplo' })).toBeInTheDocument();
  });
});
