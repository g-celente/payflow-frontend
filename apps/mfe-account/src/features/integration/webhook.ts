// Eventos aceitos pelo merchant-service (nomes no fio).
export const WEBHOOK_EVENTS: readonly { event: string; label: string }[] = [
  { event: 'payment.authorized', label: 'Cartão aprovado' },
  { event: 'payment.declined', label: 'Cartão recusado' },
  { event: 'payment.pending', label: 'PIX criado' },
  { event: 'payment.confirmed', label: 'PIX confirmado' },
  { event: 'payment.refunded', label: 'Estorno registrado' },
  { event: 'payment.canceled', label: 'Pagamento cancelado' },
];

export interface WebhookForm {
  readonly url: string;
  readonly events: readonly string[];
}

export type WebhookErrors = Partial<Record<keyof WebhookForm, string>>;

// Mesma regra do merchant-service: URL absoluta http ou https.
export function validateWebhook(form: WebhookForm): WebhookErrors {
  const errors: WebhookErrors = {};
  const url = parseUrl(form.url.trim());
  if (!form.url.trim()) {
    errors.url = 'Informe a URL que vai receber os avisos.';
  } else if (!url || (url.protocol !== 'https:' && url.protocol !== 'http:') || !url.hostname) {
    errors.url = 'Use uma URL completa, começando com https://.';
  }
  if (form.events.length === 0) {
    errors.events = 'Escolha pelo menos um evento.';
  }
  return errors;
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}
