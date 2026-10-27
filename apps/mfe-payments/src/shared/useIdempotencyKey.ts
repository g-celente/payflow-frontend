import { useRef } from 'react';

// Uma Idempotency-Key por tentativa: repetir o envio depois de uma falha de rede ou 504 reaproveita a
// mesma chave (o BFF devolve o resultado original em vez de cobrar duas vezes); mudar o formulário gera outra.
export function useIdempotencyKey(): { readonly current: () => string; readonly reset: () => void } {
  const key = useRef<string | null>(null);
  return {
    current: () => (key.current ??= crypto.randomUUID()),
    reset: () => {
      key.current = null;
    },
  };
}
