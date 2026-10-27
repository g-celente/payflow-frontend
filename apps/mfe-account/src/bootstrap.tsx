import '@payflow/ui/styles.css';

import { session } from '@payflow/api-client';
import { StandaloneSession, ToastRegion } from '@payflow/ui';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import AccountApp from './AccountApp';

// Só em `npm run dev -w @payflow/mfe-account`: o remote roda sozinho, montado em /conta como no Shell.
function Standalone() {
  const [hasKey, setHasKey] = useState(() => session.key() !== null);
  return (
    <StandaloneSession hasKey={hasKey} onKey={(key) => { session.save(key); setHasKey(true); }}>
      <main className="content" id="main" tabIndex={-1}>
        <Routes>
          <Route path="/conta/*" element={<AccountApp />} />
          <Route path="*" element={<Navigate to="/conta" replace />} />
        </Routes>
      </main>
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
