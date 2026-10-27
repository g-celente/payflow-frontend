import { ApiError, payflowApi, session, type Merchant } from '@payflow/api-client';
import { MERCHANT_UPDATED_EVENT } from '@payflow/ui';
import { screen, within } from '@testing-library/react';
import { Route } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { IntegrationPage } from '../src/features/integration/IntegrationPage';
import { validateWebhook } from '../src/features/integration/webhook';
import { ProfilePage } from '../src/features/profile/ProfilePage';
import { renderRoutes } from './render';

function aMerchant(change: Partial<Merchant> = {}): Merchant {
  return {
    id: 'm1',
    name: 'Loja Exemplo',
    email: 'contato@loja.com.br',
    document: '11222333000181',
    status: 'ACTIVE',
    webhookConfigured: false,
    webhook: null,
    ...change,
  };
}

function renderAccount(path: string) {
  return renderRoutes(path, (
    <>
      <Route path="/conta" element={<ProfilePage />} />
      <Route path="/conta/integracao" element={<IntegrationPage />} />
    </>
  ));
}

describe('profile (GET/PUT /merchants/me)', () => {
  it('shows the store data with the document locked', async () => {
    vi.spyOn(payflowApi, 'me').mockResolvedValue(aMerchant());
    renderAccount('/conta');

    expect(await screen.findByLabelText('Nome da loja')).toHaveValue('Loja Exemplo');
    expect(screen.getByLabelText('CNPJ')).toHaveValue('11.222.333/0001-81');
    expect(screen.getByLabelText('CNPJ')).toHaveAttribute('readonly');
    expect(screen.getByText('Ativa')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
  });

  it('saves name and e-mail and tells the Shell', async () => {
    vi.spyOn(payflowApi, 'me').mockResolvedValue(aMerchant());
    const updateMe = vi.spyOn(payflowApi, 'updateMe').mockResolvedValue(aMerchant({ name: 'Loja Nova' }));
    const announced = vi.fn();
    window.addEventListener(MERCHANT_UPDATED_EVENT, announced);
    const { user } = renderAccount('/conta');

    const name = await screen.findByLabelText('Nome da loja');
    await user.clear(name);
    await user.type(name, 'Loja Nova');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(updateMe).toHaveBeenCalledWith({ name: 'Loja Nova', email: 'contato@loja.com.br' });
    expect(await screen.findByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
    expect(announced).toHaveBeenCalled();
    window.removeEventListener(MERCHANT_UPDATED_EVENT, announced);
  });

  it('validates the e-mail before calling the BFF', async () => {
    vi.spyOn(payflowApi, 'me').mockResolvedValue(aMerchant());
    const updateMe = vi.spyOn(payflowApi, 'updateMe');
    const { user } = renderAccount('/conta');

    const email = await screen.findByLabelText('E-mail');
    await user.clear(email);
    await user.type(email, 'sem-arroba');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(screen.getByText(/Informe um e-mail válido/)).toBeInTheDocument();
    expect(updateMe).not.toHaveBeenCalled();
  });
});

describe('webhook (PUT /merchants/me/webhook)', () => {
  it('accepts only absolute http(s) URLs and at least one event', () => {
    expect(validateWebhook({ url: 'https://loja.com.br/webhooks', events: ['payment.authorized'] })).toEqual({});
    expect(validateWebhook({ url: 'loja.com.br', events: [] })).toEqual({
      url: 'Use uma URL completa, começando com https://.',
      events: 'Escolha pelo menos um evento.',
    });
    expect(validateWebhook({ url: 'ftp://loja.com.br', events: ['payment.authorized'] }).url).toBeDefined();
  });

  it('saves the webhook and shows the generated secret once', async () => {
    vi.spyOn(payflowApi, 'me').mockResolvedValue(aMerchant());
    const configureWebhook = vi.spyOn(payflowApi, 'configureWebhook').mockResolvedValue({
      merchantId: 'm1',
      url: 'https://loja.com.br/webhooks/payflow',
      secret: 'whsec_generated_secret',
      events: ['payment.authorized', 'payment.confirmed'],
    });
    const { user } = renderAccount('/conta/integracao');

    await user.type(await screen.findByLabelText('URL que recebe os avisos'), 'https://loja.com.br/webhooks/payflow');
    for (const label of [/Cartão recusado/, /PIX criado/, /Estorno registrado/, /Pagamento cancelado/]) {
      await user.click(screen.getByLabelText(label));
    }
    await user.click(screen.getByRole('button', { name: 'Salvar webhook' }));

    expect(configureWebhook).toHaveBeenCalledWith({
      url: 'https://loja.com.br/webhooks/payflow',
      events: ['payment.authorized', 'payment.confirmed'],
    });
    const dialog = await screen.findByRole('dialog', { name: 'Segredo do webhook' });
    expect(within(dialog).getByText('whsec_generated_secret')).toBeInTheDocument();
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('shows the BFF message when the URL is refused', async () => {
    vi.spyOn(payflowApi, 'me').mockResolvedValue(aMerchant());
    vi.spyOn(payflowApi, 'configureWebhook').mockRejectedValue(new ApiError(400, 'Bad Request', 'Webhook URL must be an absolute http or https URL'));
    const { user } = renderAccount('/conta/integracao');

    await user.type(await screen.findByLabelText('URL que recebe os avisos'), 'https://loja.com.br/webhooks');
    await user.click(screen.getByRole('button', { name: 'Salvar webhook' }));

    expect(await screen.findByText(/Webhook URL must be an absolute/)).toBeInTheDocument();
  });
});

describe('api key (POST /merchants/me/api-key)', () => {
  it('rotates the key after confirmation and keeps the portal signed in with the new one', async () => {
    session.save('pf_old_key_1234');
    vi.spyOn(payflowApi, 'me').mockResolvedValue(aMerchant());
    const rotateApiKey = vi.spyOn(payflowApi, 'rotateApiKey').mockResolvedValue({ merchantId: 'm1', apiKey: 'pf_new_key_9876' });
    const { user } = renderAccount('/conta/integracao');

    expect(await screen.findByText(/1234$/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Gerar nova chave' }));
    await user.click(within(screen.getByRole('dialog', { name: 'Gerar nova chave?' })).getByRole('button', { name: 'Gerar nova chave' }));

    expect(rotateApiKey).toHaveBeenCalledOnce();
    const dialog = await screen.findByRole('dialog', { name: 'Sua nova chave' });
    expect(within(dialog).getByText('pf_new_key_9876')).toBeInTheDocument();
    expect(session.key()).toBe('pf_new_key_9876');
  });
});
