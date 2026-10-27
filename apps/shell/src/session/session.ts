import { payflowApi, session } from '@payflow/api-client';

export const merchantQuery = { queryKey: ['merchant'], queryFn: () => payflowApi.me() } as const;
// Só para o saldo da barra lateral; o painel completo é do mfe-payments.
export const balanceQuery = { queryKey: ['balance'], queryFn: () => payflowApi.dashboard(), staleTime: 60_000 } as const;

// Sair recarrega a página: os caches em memória do Shell e dos remotes vão embora junto com a chave,
// e o próximo lojista que entrar nesta aba não vê dados do anterior.
export function endSession(expired = false): void {
  session.clear();
  window.location.replace(`${import.meta.env.BASE_URL}entrar${expired ? '?sessao=expirada' : ''}`);
}
