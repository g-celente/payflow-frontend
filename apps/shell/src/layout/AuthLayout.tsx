import { ArrowRightLeft, BellRing, CreditCard, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

// Telas de fora da sessão (entrar e criar conta): painel verde à esquerda, formulário à direita.
export function AuthLayout({ children }: { readonly children: ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth-aside">
        <span className="logo">
          <span className="logo-mark"><ArrowRightLeft aria-hidden="true" className="lucide" /></span>
          payflow
        </span>
        <div>
          <h1>Seus pagamentos em um painel só.</h1>
          <ul>
            <li><CreditCard aria-hidden="true" className="lucide" />Cartão e PIX na mesma conta</li>
            <li><BellRing aria-hidden="true" className="lucide" />Avisos na sua loja a cada pagamento</li>
            <li><ShieldCheck aria-hidden="true" className="lucide" />Nenhum dado de cartão passa pela sua loja</li>
          </ul>
        </div>
        <span style={{ color: 'rgb(255 255 255 / 75%)', fontSize: 13 }}>Ambiente de testes: nenhum valor real é cobrado.</span>
        <span className="ring" aria-hidden="true" />
      </aside>
      <main className="auth-main" id="main">{children}</main>
    </div>
  );
}
