import { payflowApi, type Merchant, type WebhookConfigured } from '@payflow/api-client';
import { Badge, Button, Callout, CopyField, ErrorState, Modal, TextField, toast } from '@payflow/ui';
import { useMutation } from '@tanstack/react-query';
import { Check, CircleAlert, CircleDashed, KeyRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { errorMessage, useMerchantChanged } from '../../shared/merchant';
import { validateWebhook, WEBHOOK_EVENTS, type WebhookErrors } from './webhook';

export function WebhookCard({ merchant }: { readonly merchant: Merchant }) {
  const [url, setUrl] = useState(merchant.webhook?.url ?? '');
  const [events, setEvents] = useState<readonly string[]>(merchant.webhook?.events ?? WEBHOOK_EVENTS.map(({ event }) => event));
  const [errors, setErrors] = useState<WebhookErrors>({});
  const [saved, setSaved] = useState<WebhookConfigured | null>(null);
  const changed = useMerchantChanged();
  const configured = merchant.webhookConfigured;

  const save = useMutation({
    mutationFn: () => payflowApi.configureWebhook({ url: url.trim(), events: [...events] }),
    onSuccess: (result) => {
      changed((current) => ({ ...current, webhookConfigured: true, webhook: { url: result.url, events: result.events } }));
      setSaved(result);
      toast('Webhook salvo');
    },
  });

  const toggle = (event: string, checked: boolean) => {
    setEvents((current) => (checked ? [...current, event] : current.filter((item) => item !== event)));
    setErrors((current) => ({ ...current, events: undefined }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateWebhook({ url, events });
    setErrors(found);
    if (found.url) {
      document.getElementById('webhook-url')?.focus();
      return;
    }
    if (found.events) {
      document.querySelector<HTMLInputElement>('input[name="webhook-event"]')?.focus();
      return;
    }
    save.mutate();
  };

  return (
    <section className="card card-pad" aria-labelledby="webhook-title">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <h2 className="section-title" id="webhook-title">Webhook</h2>
          <p className="muted" style={{ fontSize: 14 }}>Enviamos um POST assinado (HMAC-SHA256) para esta URL a cada evento escolhido.</p>
        </div>
        {configured ? <Badge tone="success" icon={Check}>Ativo</Badge> : <Badge tone="neutral" icon={CircleDashed}>Não configurado</Badge>}
      </div>
      <form className="form" style={{ marginTop: 18 }} onSubmit={submit} noValidate aria-labelledby="webhook-title">
        {save.isError ? <ErrorState title="Não foi possível salvar o webhook" detail={errorMessage(save.error)} /> : null}
        <TextField
          id="webhook-url"
          label="URL que recebe os avisos"
          type="url"
          inputMode="url"
          placeholder="https://sua-loja.com.br/webhooks/payflow"
          value={url}
          error={errors.url}
          help="Use HTTPS. Sua loja deve responder 2xx; se falhar, tentamos de novo."
          onChange={(event) => {
            setUrl(event.target.value);
            setErrors((current) => ({ ...current, url: undefined }));
          }}
        />
        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }} aria-describedby={errors.events ? 'webhook-events-error' : undefined}>
          <legend className="label" style={{ marginBottom: 8 }}>Eventos</legend>
          <div className="check-grid">
            {WEBHOOK_EVENTS.map(({ event, label }) => (
              <label key={event} className="check">
                <input type="checkbox" name="webhook-event" checked={events.includes(event)} onChange={(change) => toggle(event, change.target.checked)} />
                <span>{label} <span className="option-code">{event}</span></span>
              </label>
            ))}
          </div>
          {errors.events ? (
            <span className="error" id="webhook-events-error" role="alert"><CircleAlert aria-hidden="true" className="lucide icon-sm" />{errors.events}</span>
          ) : null}
        </fieldset>
        <div className="field">
          <span className="label">Segredo da assinatura</span>
          <span className="help">
            {configured ? 'Ao salvar, geramos um segredo novo e mostramos uma única vez. O anterior deixa de valer.' : 'Geramos um segredo ao salvar. Use para conferir o cabeçalho X-PayFlow-Signature.'}
          </span>
        </div>
        <div>
          <Button type="submit" loading={save.isPending}>Salvar webhook</Button>
        </div>
      </form>
      {saved ? (
        <Modal title="Segredo do webhook" onClose={() => setSaved(null)} actions={<Button onClick={() => setSaved(null)}>Já guardei</Button>}>
          <span className="success-icon"><KeyRound aria-hidden="true" className="lucide" /></span>
          <p className="muted" style={{ fontSize: 14 }}>Use este segredo na sua loja para conferir a assinatura de cada aviso.</p>
          <CopyField value={saved.secret} copiedMessage="Segredo copiado" />
          <Callout><span><strong>Guarde agora.</strong> Ele não aparece de novo.</span></Callout>
        </Modal>
      ) : null}
    </section>
  );
}
