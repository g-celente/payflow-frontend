import { payflowApi, type Merchant } from '@payflow/api-client';
import { Badge, Button, ErrorState, Field, maskDocument, PageHeader, Skeleton, TextField, toast } from '@payflow/ui';
import { useMutation } from '@tanstack/react-query';
import { Check, Lock, OctagonPause } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { errorMessage, useMerchant, useMerchantChanged } from '../../shared/merchant';
import { validateProfile, type ProfileErrors } from './validation';

// GET e PUT /merchants/me: nome e e-mail mudam; o documento, não.
export function ProfilePage() {
  const merchant = useMerchant();
  if (merchant.isPending) {
    return (
      <div className="page" aria-busy="true" aria-label="Carregando conta">
        <Skeleton height={28} width={160} />
        <div className="card card-pad stack"><Skeleton height={44} /><Skeleton height={44} /><Skeleton height={44} /></div>
      </div>
    );
  }
  if (merchant.isError) {
    return (
      <div className="page">
        <PageHeader title="Conta" />
        <ErrorState title="Não foi possível carregar a conta" detail={errorMessage(merchant.error)} onRetry={() => void merchant.refetch()} />
      </div>
    );
  }
  // key: se o lojista mudar (outra aba), o formulário recomeça com os dados novos.
  return <ProfileForm key={merchant.data.id} merchant={merchant.data} />;
}

function ProfileForm({ merchant }: { readonly merchant: Merchant }) {
  const [name, setName] = useState(merchant.name);
  const [email, setEmail] = useState(merchant.email);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const changed = useMerchantChanged();

  const save = useMutation({
    mutationFn: () => payflowApi.updateMe({ name: name.trim(), email: email.trim() }),
    onSuccess: (updated) => {
      changed(() => updated);
      toast('Dados salvos');
    },
  });

  const dirty = name.trim() !== merchant.name || email.trim() !== merchant.email;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateProfile({ name, email });
    setErrors(found);
    const firstInvalid = (['name', 'email'] as const).find((field) => found[field]);
    if (firstInvalid) {
      document.getElementById(`profile-${firstInvalid}`)?.focus();
      return;
    }
    save.mutate();
  };

  return (
    <div className="page">
      <PageHeader title="Conta" subtitle="Dados da sua loja" />
      <section className="card card-pad">
        <form className="form" style={{ maxWidth: 560 }} onSubmit={submit} noValidate aria-label="Dados da loja">
          {save.isError ? <ErrorState title="Não foi possível salvar" detail={errorMessage(save.error)} /> : null}
          <TextField
            id="profile-name"
            label="Nome da loja"
            autoComplete="organization"
            maxLength={120}
            value={name}
            error={errors.name}
            onChange={(event) => {
              setName(event.target.value);
              setErrors((current) => ({ ...current, name: undefined }));
            }}
          />
          <TextField
            id="profile-email"
            label="E-mail"
            type="email"
            autoComplete="email"
            value={email}
            error={errors.email}
            help="Usado para avisos sobre a sua conta."
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({ ...current, email: undefined }));
            }}
          />
          <Field id="profile-document" label={merchant.document.length === 14 ? 'CNPJ' : 'CPF'} help="O documento não pode ser alterado. Fale com o suporte se precisar.">
            <div className="input-group">
              <input id="profile-document" className="input num" readOnly value={maskDocument(merchant.document)} aria-describedby="profile-document-help" />
              <span className="icon-btn" aria-hidden="true"><Lock className="lucide icon-sm" /></span>
            </div>
          </Field>
          <div className="field">
            <span className="label">Situação</span>
            <span>
              {merchant.status === 'ACTIVE'
                ? <Badge tone="success" icon={Check}>Ativa</Badge>
                : <Badge tone="danger" icon={OctagonPause}>Suspensa</Badge>}
            </span>
          </div>
          <div>
            <Button type="submit" loading={save.isPending} disabled={!dirty}>Salvar alterações</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
