import { ApiError, payflowApi, session, type SignUpResult } from '@payflow/api-client';
import { Button, buttonClass, Callout, CopyField, ErrorState, maskDocument, onlyDigits, TextField } from '@payflow/ui';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';

import { AuthLayout } from '../../layout/AuthLayout';
import { validateSignUp, type SignUpErrors, type SignUpForm } from './validation';

// Cadastro público (POST /merchants): a chave aparece uma única vez, logo depois de criar a conta.
export function SignUpPage() {
  const [form, setForm] = useState<SignUpForm>({ name: '', email: '', document: '' });
  const [errors, setErrors] = useState<SignUpErrors>({});

  useEffect(() => {
    document.title = 'Criar conta · PayFlow';
  }, []);

  const signUp = useMutation({
    mutationFn: () => payflowApi.signUp({ name: form.name.trim(), email: form.email.trim(), document: onlyDigits(form.document) }),
    onSuccess: (result) => session.save(result.apiKey),
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        setErrors({ document: 'Este CPF/CNPJ já tem conta. Entre com a sua chave.' });
        document.getElementById('signup-document')?.focus();
      }
    },
  });

  if (signUp.data) {
    return <AccountCreated result={signUp.data} />;
  }

  const change = (field: keyof SignUpForm) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateSignUp(form);
    setErrors(found);
    const firstInvalid = (['name', 'email', 'document'] as const).find((field) => found[field]);
    if (firstInvalid) {
      document.getElementById(`signup-${firstInvalid}`)?.focus();
      return;
    }
    signUp.mutate();
  };

  const failure = signUp.error instanceof ApiError && signUp.error.status !== 409 ? signUp.error : null;

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={submit} noValidate>
        <div>
          <Link className="muted" to="/entrar" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <ArrowLeft aria-hidden="true" className="lucide icon-sm" />Voltar
          </Link>
          <h2 style={{ marginTop: 12 }}>Criar conta de lojista</h2>
          <p className="muted" style={{ marginTop: 6 }}>Leva um minuto. Você recebe a chave de acesso na hora.</p>
        </div>
        {failure ? <ErrorState title="Não foi possível criar a conta" detail={failure.detail} /> : null}
        <TextField
          id="signup-name"
          label="Nome da loja"
          autoComplete="organization"
          maxLength={120}
          value={form.name}
          error={errors.name}
          onChange={(event) => change('name')(event.target.value)}
        />
        <TextField
          id="signup-email"
          label="E-mail"
          type="email"
          autoComplete="email"
          value={form.email}
          error={errors.email}
          onChange={(event) => change('email')(event.target.value)}
        />
        <TextField
          id="signup-document"
          label="CPF ou CNPJ"
          inputMode="numeric"
          autoComplete="off"
          value={form.document}
          error={errors.document}
          help="Só números; a máscara aparece sozinha."
          onChange={(event) => change('document')(maskDocument(event.target.value))}
        />
        <Button type="submit" large block loading={signUp.isPending}>Criar conta</Button>
      </form>
    </AuthLayout>
  );
}

function AccountCreated({ result }: { readonly result: SignUpResult }) {
  useEffect(() => {
    document.title = 'Conta criada · PayFlow';
  }, []);
  return (
    <AuthLayout>
      <div className="auth-card">
        <span className="success-icon"><BadgeCheck aria-hidden="true" className="lucide" /></span>
        <div>
          <h2>Conta criada!</h2>
          <p className="muted" style={{ marginTop: 6 }}>
            Esta é a chave de acesso de <strong>{result.merchant.name}</strong>. Use para entrar no portal e para integrar a sua loja.
          </p>
        </div>
        <CopyField value={result.apiKey} copiedMessage="Chave copiada" />
        <Callout>
          <span><strong>Guarde agora.</strong> Por segurança, a chave não aparece de novo. Se perder, gere outra em Integração.</span>
        </Callout>
        <Link className={buttonClass('primary', { large: true, block: true })} to="/">Ir para o painel</Link>
      </div>
    </AuthLayout>
  );
}
