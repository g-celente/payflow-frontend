import { ApiError, payflowApi, session } from '@payflow/api-client';
import { screen } from '@testing-library/react';
import { Route } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { SignUpPage } from '../src/features/sign-up/SignUpPage';
import { validateSignUp } from '../src/features/sign-up/validation';
import { renderRoutes } from './render';

function renderSignUp() {
  return renderRoutes('/criar-conta', <Route path="/criar-conta" element={<SignUpPage />} />);
}

describe('sign-up validation', () => {
  it('accepts a CPF or a CNPJ', () => {
    expect(validateSignUp({ name: 'Loja', email: 'a@loja.com', document: '123.456.789-01' })).toEqual({});
    expect(validateSignUp({ name: 'Loja', email: 'a@loja.com', document: '11.222.333/0001-81' })).toEqual({});
  });

  it('explains each problem', () => {
    expect(validateSignUp({ name: ' ', email: 'sem-arroba', document: '11.222.333/0001-8' })).toEqual({
      name: 'Informe o nome da loja.',
      email: 'Informe um e-mail válido, como contato@sualoja.com.br.',
      document: 'O CNPJ tem 14 dígitos. Confira o número.',
    });
  });
});

describe('sign-up page', () => {
  it('creates the account, starts the session and shows the key once', async () => {
    const signUp = vi.spyOn(payflowApi, 'signUp').mockResolvedValue({
      merchant: { id: 'm1', name: 'Loja Exemplo', email: 'contato@loja.com.br', document: '11222333000181', status: 'ACTIVE', webhookConfigured: false, webhook: null },
      apiKey: 'pf_new_key',
    });
    const { user } = renderSignUp();

    await user.type(screen.getByLabelText('Nome da loja'), 'Loja Exemplo');
    await user.type(screen.getByLabelText('E-mail'), 'contato@loja.com.br');
    await user.type(screen.getByLabelText('CPF ou CNPJ'), '11222333000181');
    expect(screen.getByLabelText('CPF ou CNPJ')).toHaveValue('11.222.333/0001-81');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByRole('heading', { name: 'Conta criada!' })).toBeInTheDocument();
    expect(screen.getByText('pf_new_key')).toBeInTheDocument();
    expect(signUp).toHaveBeenCalledWith({ name: 'Loja Exemplo', email: 'contato@loja.com.br', document: '11222333000181' });
    expect(session.key()).toBe('pf_new_key');
  });

  it('does not call the BFF while the form has errors and focuses the first one', async () => {
    const signUp = vi.spyOn(payflowApi, 'signUp');
    const { user } = renderSignUp();

    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(screen.getByText('Informe o nome da loja.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome da loja')).toHaveFocus();
    expect(signUp).not.toHaveBeenCalled();
  });

  it('points to the document when it already has an account', async () => {
    vi.spyOn(payflowApi, 'signUp').mockRejectedValue(new ApiError(409, 'Conflict', 'Document already registered'));
    const { user } = renderSignUp();

    await user.type(screen.getByLabelText('Nome da loja'), 'Loja');
    await user.type(screen.getByLabelText('E-mail'), 'a@loja.com');
    await user.type(screen.getByLabelText('CPF ou CNPJ'), '12345678901');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByText('Este CPF/CNPJ já tem conta. Entre com a sua chave.')).toBeInTheDocument();
  });
});
