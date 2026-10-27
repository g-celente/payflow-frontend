import { Route, Routes } from 'react-router';

import { LoginPage } from './features/login/LoginPage';
import { SignUpPage } from './features/sign-up/SignUpPage';
import { AppLayout } from './layout/AppLayout';
import { AccountRemote, PaymentsRemote } from './remotes';
import { RequireSession } from './session/RequireSession';

// O Shell é dono da URL. O mfe-account atende /conta/*; o mfe-payments atende o resto
// (/, /pagamentos/*, /nova-cobranca, /pix/*) e o próprio "não encontrado".
export function App() {
  return (
    <Routes>
      <Route path="/entrar" element={<LoginPage />} />
      <Route path="/criar-conta" element={<SignUpPage />} />
      <Route element={<RequireSession><AppLayout /></RequireSession>}>
        <Route path="/conta/*" element={<AccountRemote />} />
        <Route path="*" element={<PaymentsRemote />} />
      </Route>
    </Routes>
  );
}
