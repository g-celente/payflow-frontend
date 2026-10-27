// Módulos expostos pelos remotes (Module Federation), resolvidos em tempo de execução.
declare module 'mfe_payments/PaymentsApp' {
  import type { ComponentType } from 'react';

  const PaymentsApp: ComponentType;
  export default PaymentsApp;
}

declare module 'mfe_account/AccountApp' {
  import type { ComponentType } from 'react';

  const AccountApp: ComponentType;
  export default AccountApp;
}
