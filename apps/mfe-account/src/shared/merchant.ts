import { ApiError, payflowApi, type Merchant } from '@payflow/api-client';
import { notifyMerchantUpdated } from '@payflow/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const MERCHANT_KEY = ['merchant'] as const;

export function useMerchant() {
  return useQuery({ queryKey: MERCHANT_KEY, queryFn: () => payflowApi.me() });
}

// Guarda a versão nova do lojista e avisa o Shell (nome no topo) e o painel (banner do webhook).
export function useMerchantChanged(): (change: (merchant: Merchant) => Merchant) => void {
  const queryClient = useQueryClient();
  return (change) => {
    queryClient.setQueryData<Merchant>(MERCHANT_KEY, (current) => (current ? change(current) : current));
    notifyMerchantUpdated();
  };
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.detail : 'Algo deu errado. Tente de novo em instantes.';
}
