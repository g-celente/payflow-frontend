import { useQuery, useQueryClient } from '@tanstack/react-query';
import { onMerchantUpdated, onPaymentsChanged } from '@payflow/ui';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Outlet, useLocation } from 'react-router';

import { balanceQuery, merchantQuery } from '../session/session';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const MOBILE = '(max-width: 1023px)';

export function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const mobile = useMediaQuery(MOBILE);
  const queryClient = useQueryClient();
  const merchant = useQuery(merchantQuery);

  useEffect(() => {
    const stopMerchant = onMerchantUpdated(() => void queryClient.invalidateQueries({ queryKey: merchantQuery.queryKey }));
    const stopPayments = onPaymentsChanged(() => void queryClient.invalidateQueries({ queryKey: balanceQuery.queryKey }));
    return () => {
      stopMerchant();
      stopPayments();
    };
  }, [queryClient]);

  useEffect(() => {
    document.body.classList.toggle('nav-open', navOpen);
    if (!navOpen) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('nav-open');
    };
  }, [navOpen]);

  useFocusOnNavigation();

  return (
    <>
      <a className="skip-link" href="#main">Pular para o conteúdo</a>
      <Topbar merchant={merchant.data} navOpen={navOpen} onToggleNav={() => setNavOpen(!navOpen)} />
      <div className="layout">
        {/* No celular a barra lateral fechada fica fora da tela e fora da ordem de tabulação. */}
        <Sidebar merchant={merchant.data} hidden={mobile && !navOpen} onNavigate={() => setNavOpen(false)} />
        <div className="nav-backdrop" aria-hidden="true" onClick={() => setNavOpen(false)} />
        <main className="content" id="main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </>
  );
}

// Ao trocar de tela, leva o foco para o título da nova página (ou para o <main>, se o remote ainda carrega).
// Com âncora (#chave), quem rola até a seção é a própria página.
function useFocusOnNavigation() {
  const { pathname, hash } = useLocation();
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (hash) return;
    window.scrollTo(0, 0);
    const main = document.getElementById('main');
    const target = main?.querySelector<HTMLElement>('[data-page-title]') ?? main;
    target?.focus({ preventScroll: true });
  }, [pathname, hash]);
}

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
