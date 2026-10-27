import { ApiError, payflowApi, session } from '@payflow/api-client';
import { Button, Callout, ErrorState, SecretField } from '@payflow/ui';
import { useMutation } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router';

import { AuthLayout } from '../../layout/AuthLayout';

// Entrar = conferir a chave no BFF (GET /merchants/me) e guardá-la na sessão.
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [key, setKey] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  useEffect(() => {
    document.title = 'Entrar · PayFlow';
  }, []);

  const login = useMutation({
    mutationFn: (merchantKey: string) => payflowApi.checkKey(merchantKey),
    onSuccess: (_merchant, merchantKey) => {
      session.save(merchantKey);
      navigate(from, { replace: true });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        setFieldError('Chave não reconhecida. Confira se copiou a chave inteira.');
        document.getElementById('merchant-key')?.focus();
      }
    },
  });

  if (session.key()) {
    return <Navigate to="/" replace />;
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = key.trim();
    if (!value) {
      setFieldError('Informe a sua chave de acesso.');
      document.getElementById('merchant-key')?.focus();
      return;
    }
    setFieldError(null);
    login.mutate(value);
  };

  const failure = login.error instanceof ApiError && login.error.status !== 401 ? login.error : null;

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={submit} noValidate>
        <div>
          <h2>Entrar no portal</h2>
          <p className="muted" style={{ marginTop: 6 }}>Use a chave de acesso que você recebeu ao criar a conta.</p>
        </div>
        {params.get('sessao') === 'expirada' ? (
          <Callout icon={Clock} tone="info">Sua sessão terminou (a chave mudou ou deixou de valer). Entre de novo.</Callout>
        ) : null}
        {failure ? <ErrorState title="Não foi possível entrar" detail={failure.detail} /> : null}
        <SecretField
          id="merchant-key"
          label="Chave de acesso"
          autoComplete="current-password"
          placeholder="pf_…"
          value={key}
          error={fieldError}
          help={<>Começa com <strong>pf_</strong>. Nunca compartilhe sua chave.</>}
          onChange={(event) => {
            setKey(event.target.value);
            if (fieldError) setFieldError(null);
          }}
        />
        <Button type="submit" large block loading={login.isPending}>Entrar</Button>
        <p className="muted" style={{ textAlign: 'center', fontSize: 14 }}>
          Ainda não tem conta? <Link to="/criar-conta">Criar conta</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
