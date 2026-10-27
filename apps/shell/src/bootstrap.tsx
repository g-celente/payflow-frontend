import '@payflow/ui/styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastRegion } from '@payflow/ui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { App } from './App';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 } },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
      <ToastRegion />
    </QueryClientProvider>
  </StrictMode>,
);
