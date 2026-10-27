import { onMerchantUpdated } from '@payflow/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Route, Routes } from 'react-router';

import { CreatePaymentPage } from './features/create-payment/CreatePaymentPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { PaymentDetailPage } from './features/payment-detail/PaymentDetailPage';
import { PaymentListPage } from './features/payment-list/PaymentListPage';
import { PixChargePage } from './features/pix-charge/PixChargePage';
import { RefundPage } from './features/refund/RefundPage';
import { NotFound } from './shared/NotFound';
import { queryKeys } from './shared/queries';
import { queryClient } from './shared/queryClient';

// Componente exposto ao Shell (./PaymentsApp). Cada rota é uma fatia em features/.
export default function PaymentsApp() {
  // Webhook configurado em mfe-account: o banner do painel precisa sumir.
  useEffect(() => onMerchantUpdated(() => void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })), []);
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="pagamentos" element={<PaymentListPage />} />
        <Route path="pagamentos/:id" element={<PaymentDetailPage />} />
        <Route path="pagamentos/:id/estornar" element={<RefundPage />} />
        <Route path="nova-cobranca" element={<CreatePaymentPage />} />
        <Route path="pix/:id" element={<PixChargePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </QueryClientProvider>
  );
}
