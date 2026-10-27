import { QueryClient } from '@tanstack/react-query';

// Cada microfrontend tem o próprio cache: nada de estado compartilhado com o Shell.
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 } },
});
