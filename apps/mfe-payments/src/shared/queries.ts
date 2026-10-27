import { payflowApi, type Payment, type PaymentQuery } from '@payflow/api-client';
import { notifyPaymentsChanged } from '@payflow/ui';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

// Chaves de cache usadas por mais de uma fatia (o detalhe e o estorno leem o mesmo pagamento).
export const queryKeys = {
  dashboard: ['dashboard'] as const,
  payments: ['payments'] as const,
  paymentList: (query: PaymentQuery) => ['payments', query] as const,
  payment: (id: string) => ['payment', id] as const,
};

// pollWhilePending: consulta de novo a cada N ms enquanto o pagamento estiver PENDING (tela do PIX).
export function usePayment(id: string, options: { readonly pollWhilePending?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.payment(id),
    queryFn: () => payflowApi.getPayment(id),
    refetchInterval: (query) => (options.pollWhilePending && query.state.data?.status === 'PENDING' ? options.pollWhilePending : false),
  });
}

// Depois de mudar um pagamento: guarda a versão nova e marca lista, painel e saldo do Shell para recarregar.
export function usePaymentChanged(): (payment: Payment) => void {
  const queryClient = useQueryClient();
  return (payment) => paymentChanged(queryClient, payment);
}

function paymentChanged(queryClient: QueryClient, payment: Payment): void {
  queryClient.setQueryData(queryKeys.payment(payment.id), payment);
  void queryClient.invalidateQueries({ queryKey: queryKeys.payments });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  notifyPaymentsChanged();
}
