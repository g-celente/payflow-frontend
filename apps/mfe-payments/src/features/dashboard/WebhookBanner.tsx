import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

export function WebhookBanner() {
  return (
    <section className="banner" aria-labelledby="banner-title">
      <div className="grow">
        <h2 id="banner-title">Receba avisos de pagamento na sua loja</h2>
        <p>Configure um webhook e saiba na hora quando um pagamento for aprovado, confirmado ou estornado.</p>
        <Link to="/conta/integracao">Configurar agora <ChevronRight aria-hidden="true" className="lucide icon-sm" /></Link>
      </div>
      <svg className="banner-art" viewBox="0 0 140 96" aria-hidden="true">
        <circle cx="112" cy="20" r="56" fill="rgb(255 255 255 / 10%)" />
        <rect x="44" y="18" width="70" height="60" rx="10" fill="#fff" />
        <rect x="54" y="30" width="34" height="6" rx="3" fill="#cdeedf" />
        <rect x="54" y="42" width="50" height="6" rx="3" fill="#e7f6ef" />
        <circle cx="98" cy="64" r="12" fill="#12a26a" />
        <path d="M92 64l4 4 8-8" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </section>
  );
}
