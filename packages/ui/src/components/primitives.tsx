import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger' | 'danger-solid';

// Para usar o visual de botão em links (o <Link> do roteador vive nos apps).
export function buttonClass(variant: ButtonVariant = 'primary', options: { large?: boolean; block?: boolean } = {}): string {
  return ['btn', `btn-${variant}`, options.large ? 'btn-lg' : '', options.block ? 'btn-block' : ''].filter(Boolean).join(' ');
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly large?: boolean;
  readonly block?: boolean;
  readonly loading?: boolean;
  readonly icon?: ReactNode;
}

export function Button({ variant = 'primary', large, block, loading, icon, children, disabled, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, { large, block })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="spinner" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly label: string;
  readonly children: ReactNode;
}

// Botão só com ícone: o rótulo é obrigatório para leitores de tela.
export function IconButton({ label, children, className = '', type = 'button', ...rest }: IconButtonProps) {
  return (
    <button type={type} className={`icon-btn ${className}`.trim()} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  );
}

export function Card({ children, className = '', as: Tag = 'section', ...rest }: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: 'section' | 'div' | 'aside' | 'form';
  readonly 'aria-label'?: string;
  readonly 'aria-labelledby'?: string;
}) {
  return <Tag className={`card ${className}`.trim()} {...rest}>{children}</Tag>;
}

export function CardHeader({ title, action, id }: { readonly title: ReactNode; readonly action?: ReactNode; readonly id?: string }) {
  return (
    <div className="card-header">
      <h2 className="section-title" id={id}>{title}</h2>
      {action}
    </div>
  );
}

// Título da página (h1) e da aba do navegador.
export function PageHeader({ title, documentTitle, subtitle, back, actions }: {
  readonly title: ReactNode;
  readonly documentTitle?: string;
  readonly subtitle?: ReactNode;
  readonly back?: ReactNode;
  readonly actions?: ReactNode;
}) {
  const tabTitle = documentTitle ?? (typeof title === 'string' ? title : undefined);
  useEffect(() => {
    if (tabTitle) document.title = `${tabTitle} · PayFlow`;
  }, [tabTitle]);
  return (
    <div className="page-header">
      {back}
      <div className="grow">
        <h1 tabIndex={-1} data-page-title>{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function Skeleton({ height, width = '100%' }: { readonly height: number; readonly width?: number | string }) {
  return <div className="skeleton" style={{ height, width }} />;
}

export function Spinner({ label = 'Carregando' }: { readonly label?: string }) {
  return <span className="spinner" role="status" aria-label={label} />;
}
