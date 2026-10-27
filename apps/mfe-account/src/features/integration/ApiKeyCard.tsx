import { payflowApi, session } from '@payflow/api-client';
import { Button, Callout, ConfirmDialog, CopyField, ErrorState, Modal, toast } from '@payflow/ui';
import { useMutation } from '@tanstack/react-query';
import { KeyRound, RefreshCcw } from 'lucide-react';
import { useState } from 'react';

import { errorMessage } from '../../shared/merchant';

// A chave antiga para de valer na hora; a sessão do portal passa a usar a nova sem pedir login de novo.
export function ApiKeyCard() {
  const [confirming, setConfirming] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [current, setCurrent] = useState(() => session.key());

  const rotate = useMutation({
    mutationFn: () => payflowApi.rotateApiKey(),
    onSuccess: ({ apiKey }) => {
      session.save(apiKey);
      setCurrent(apiKey);
      setConfirming(false);
      setNewKey(apiKey);
      toast('Nova chave gerada');
    },
    onError: () => setConfirming(false),
  });

  return (
    <section className="card card-pad" id="chave" aria-labelledby="key-title">
      <h2 className="section-title" id="key-title">Chave de acesso</h2>
      <p className="muted" style={{ fontSize: 14 }}>
        Usada para entrar no portal e pela sua loja para criar cobranças. Guardamos só uma versão protegida dela.
      </p>
      {rotate.isError ? <div style={{ marginTop: 16 }}><ErrorState title="A chave não foi trocada" detail={errorMessage(rotate.error)} /></div> : null}
      <div className="row" style={{ gap: 12, marginTop: 16 }}>
        <div className="copy-field" style={{ flex: 1, minWidth: 240 }}>
          <code aria-label="Chave atual, mascarada">{mask(current)}</code>
        </div>
        <Button variant="danger" icon={<RefreshCcw aria-hidden="true" className="lucide" />} onClick={() => setConfirming(true)}>Gerar nova chave</Button>
      </div>
      {confirming ? (
        <ConfirmDialog
          title="Gerar nova chave?"
          confirmLabel="Gerar nova chave"
          danger
          loading={rotate.isPending}
          onConfirm={() => rotate.mutate()}
          onCancel={() => setConfirming(false)}
        >
          A chave atual <strong>para de funcionar na hora</strong>: a integração da sua loja vai precisar da nova chave.
        </ConfirmDialog>
      ) : null}
      {newKey ? (
        <Modal title="Sua nova chave" onClose={() => setNewKey(null)} actions={<Button onClick={() => setNewKey(null)}>Já guardei</Button>}>
          <span className="success-icon"><KeyRound aria-hidden="true" className="lucide" /></span>
          <CopyField value={newKey} copiedMessage="Chave copiada" />
          <Callout><span><strong>Guarde agora.</strong> Ela não aparece de novo. Este portal já está usando a nova chave.</span></Callout>
        </Modal>
      ) : null}
    </section>
  );
}

function mask(key: string | null): string {
  if (!key) return 'pf_••••••••';
  return `pf_${'•'.repeat(28)}${key.slice(-4)}`;
}
