import { ApiError, payflowApi, session, type Merchant } from '@payflow/api-client';
import { screen } from '@testing-library/react';
import { Route } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { LoginPage } from '../src/features/login/LoginPage';
import { renderRoutes } from './render';

const merchant: Merchant = {
  id: 'm1',
  name: 'Loja Exemplo',
  email: 'contato@loja.com.br',
  document: '11222333000181',
  status: 'ACTIVE',
  webhookConfigured: false,
  webhook: null,
};

function renderLogin(entry: Parameters<typeof renderRoutes>[0] = '/entrar') {
  return renderRoutes(entry, (
    <>
      <Route path="/entrar" element={<LoginPage />} />
      <Route path="/" element={<p>Painel</p>} />
      <Route path="/pagamentos" element={<p>Lista de pagamentos</p>} />
    </>
  ));
}

describe('login', () => {
  it('asks for the key when the field is empty', async () => {
    const checkKey = vi.spyOn(payflowApi, 'checkKey');
    const { user } = renderLogin();

    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(screen.getByText('Informe a sua chave de acesso.')).toBeInTheDocument();
    expect(checkKey).not.toHaveBeenCalled();
  });

  it('keeps the person out when the BFF does not recognize the key', async () => {
    vi.spyOn(payflowApi, 'checkKey').mockRejectedValue(new ApiError(401, 'Unauthorized', 'Invalid merchant key'));
    const { user } = renderLogin();

    await user.type(screen.getByLabelText('Chave de acesso'), 'pf_wrong');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Chave não reconhecida. Confira se copiou a chave inteira.')).toBeInTheDocument();
    expect(session.key()).toBeNull();
  });

  it('saves a valid key and returns to the screen the person tried to open', async () => {
    const checkKey = vi.spyOn(payflowApi, 'checkKey').mockResolvedValue(merchant);
    const { user } = renderLogin({ pathname: '/entrar', state: { from: '/pagamentos' } });

    await user.type(screen.getByLabelText('Chave de acesso'), '  pf_valid  ');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Lista de pagamentos')).toBeInTheDocument();
    expect(checkKey).toHaveBeenCalledWith('pf_valid');
    expect(session.key()).toBe('pf_valid');
  });

  it('shows the BFF message when it is not a key problem', async () => {
    vi.spyOn(payflowApi, 'checkKey').mockRejectedValue(new ApiError(0, 'Sem conexão', 'Não foi possível falar com o PayFlow.'));
    const { user } = renderLogin();

    await user.type(screen.getByLabelText('Chave de acesso'), 'pf_valid');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível falar com o PayFlow.');
  });

  it('explains why the person was sent back after the session ended', () => {
    renderLogin('/entrar?sessao=expirada');
    expect(screen.getByText(/Sua sessão terminou/)).toBeInTheDocument();
  });

  it('skips the form when there is already a session', () => {
    session.save('pf_valid');
    renderLogin();
    expect(screen.getByText('Painel')).toBeInTheDocument();
  });
});
