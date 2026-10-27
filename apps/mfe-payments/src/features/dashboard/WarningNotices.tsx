import type { DashboardWarning } from '@payflow/api-client';
import { Button, Notice } from '@payflow/ui';

const PART: Record<DashboardWarning['part'], string> = {
  summary: 'Não foi possível carregar o resumo dos pagamentos agora.',
  recentPayments: 'Não foi possível carregar os últimos pagamentos agora.',
  fees: 'Não foi possível calcular as taxas agora.',
};

const REASON: Record<DashboardWarning['reason'], string> = {
  timeout: 'O serviço demorou demais para responder.',
  unreachable: 'O serviço não está respondendo.',
  'not-configured': 'O serviço ainda não foi ligado neste ambiente.',
  'bad-response': 'O serviço respondeu algo inesperado.',
  skipped: 'Elas dependem do resumo, que não carregou.',
};

// Os avisos do BFF vêm em inglês e técnicos; aqui viram uma frase para o lojista.
export function WarningNotices({ warnings, onRetry }: { readonly warnings: readonly DashboardWarning[]; readonly onRetry: () => void }) {
  return (
    <>
      {warnings.map((warning) => (
        <Notice key={warning.part} action={<Button variant="soft" onClick={onRetry}>Tentar de novo</Button>}>
          <strong>{PART[warning.part]}</strong> {REASON[warning.reason]} O resto do painel está atualizado.
        </Notice>
      ))}
    </>
  );
}
