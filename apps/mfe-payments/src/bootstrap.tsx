import '@payflow/ui/styles.css';

import { session } from '@payflow/api-client';
import { StandaloneSession, ToastRegion } from '@payflow/ui';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import PaymentsApp from './PaymentsApp';

// Só em `npm run dev -w @payflow/mfe-payments`: o remote roda sozinho, sem o Shell.
function Standalone() {
  const [hasKey, setHasKey] = useState(() => session.key() !== null);
  return (
    <StandaloneSession hasKey={hasKey} onKey={(key) => { session.save(key); setHasKey(true); }}>
      <main className="content" id="main" tabIndex={-1}><PaymentsApp /></main>
    </StandaloneSession>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Standalone />
    </BrowserRouter>
    <ToastRegion />
  </StrictMode>,
);
