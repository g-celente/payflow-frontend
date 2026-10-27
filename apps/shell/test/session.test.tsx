import { session, UNAUTHORIZED_EVENT } from '@payflow/api-client';
import { act, screen } from '@testing-library/react';
import { Route } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { RequireSession } from '../src/session/RequireSession';
import type * as sessionModule from '../src/session/session';
import { endSession } from '../src/session/session';
import { renderRoutes } from './render';

vi.mock('../src/session/session', async (importOriginal) => ({
  ...(await importOriginal<typeof sessionModule>()),
  endSession: vi.fn(),
}));

function renderProtected() {
  return renderRoutes('/pagamentos?status=PENDING', (
    <>
      <Route path="/entrar" element={<p>Tela de entrada</p>} />
      <Route path="/pagamentos" element={<RequireSession><p>Conteúdo protegido</p></RequireSession>} />
    </>
  ));
}

describe('session', () => {
  it('sends a visitor without a key to the login screen', () => {
    renderProtected();
    expect(screen.getByText('Tela de entrada')).toBeInTheDocument();
  });

  it('shows the protected screen when there is a key', () => {
    session.save('pf_valid');
    renderProtected();
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();
  });

  it('ends the session when any app gets a 401 from the BFF', () => {
    session.save('pf_revoked');
    renderProtected();

    act(() => {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    });

    expect(endSession).toHaveBeenCalledWith(true);
  });
});
