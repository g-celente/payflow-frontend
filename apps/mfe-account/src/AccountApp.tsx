import { QueryClientProvider } from '@tanstack/react-query';
import { Navigate, Route, Routes } from 'react-router';

import { IntegrationPage } from './features/integration/IntegrationPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { queryClient } from './shared/queryClient';

// Componente exposto ao Shell (./AccountApp), montado em /conta/*.
export default function AccountApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route index element={<ProfilePage />} />
        <Route path="integracao" element={<IntegrationPage />} />
        <Route path="*" element={<Navigate to="/conta" replace />} />
      </Routes>
    </QueryClientProvider>
  );
}
