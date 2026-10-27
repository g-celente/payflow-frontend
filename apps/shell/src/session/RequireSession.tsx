import { session, UNAUTHORIZED_EVENT } from '@payflow/api-client';
import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { endSession } from './session';

// Sem chave na sessão, vai para /entrar e volta para a mesma tela depois.
// Qualquer 401 do BFF (chave trocada ou revogada) encerra a sessão.
export function RequireSession({ children }: { readonly children: ReactNode }) {
  const location = useLocation();
  useEffect(() => {
    const onUnauthorized = () => endSession(true);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);
  if (!session.key()) {
    return <Navigate to="/entrar" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return <>{children}</>;
}
