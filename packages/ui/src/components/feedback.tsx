import { CircleAlert, CircleCheck, Copy, RefreshCw, TriangleAlert, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { TOAST_EVENT, toast, type ToastMessage } from '../events';
import { Button } from './primitives';

// Mostra os toasts de qualquer app (evento payflow:toast). Fica no Shell; some em 4 s.
export function ToastRegion() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  useEffect(() => {
    const onToast = (event: Event) => {
      const message = (event as CustomEvent<ToastMessage>).detail;
      setToasts((current) => [...current, message]);
      window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== message.id)), 4000);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);
  return (
    <div className="toast-region" aria-live="polite">
      {toasts.map((item) => (
        <div key={item.id} className="toast">
          {item.tone === 'error' ? <CircleAlert aria-hidden="true" className="lucide" style={{ color: '#ff9b90' }} /> : <CircleCheck aria-hidden="true" className="lucide" />}
          {item.message}
        </div>
      ))}
    </div>
  );
}

export function CopyField({ value, display, copiedMessage = 'Copiado', label = 'Copiar' }: {
  readonly value: string;
  readonly display?: string;
  readonly copiedMessage?: string;
  readonly label?: string;
}) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast(copiedMessage);
    } catch {
      toast('Não foi possível copiar; selecione e copie manualmente', 'error');
    }
  };
  return (
    <div className="copy-field">
      <code>{display ?? value}</code>
      <Button variant="soft" icon={<Copy aria-hidden="true" className="lucide" />} onClick={copy}>{label}</Button>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children, action }: {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly children?: ReactNode;
  readonly action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="circle"><Icon aria-hidden="true" className="lucide" /></span>
      <h3>{title}</h3>
      {children ? <p className="muted">{children}</p> : null}
      {action ? <div style={{ marginTop: 8 }}>{action}</div> : null}
    </div>
  );
}

// Falha ao carregar: diz o motivo e oferece tentar de novo.
export function ErrorState({ title = 'Não foi possível carregar', detail, onRetry }: {
  readonly title?: string;
  readonly detail: string;
  readonly onRetry?: () => void;
}) {
  return (
    <div className="alert alert-error" role="alert">
      <CircleAlert aria-hidden="true" className="lucide" />
      <div className="grow"><strong>{title}.</strong> {detail}</div>
      {onRetry ? <Button variant="soft" icon={<RefreshCw aria-hidden="true" className="lucide" />} onClick={onRetry}>Tentar de novo</Button> : null}
    </div>
  );
}

export function Notice({ children, action }: { readonly children: ReactNode; readonly action?: ReactNode }) {
  return (
    <div className="notice" role="status">
      <TriangleAlert aria-hidden="true" className="lucide" />
      <div className="grow">{children}</div>
      {action}
    </div>
  );
}

export function Callout({ icon: Icon = TriangleAlert, children, tone = 'warning' }: {
  readonly icon?: LucideIcon;
  readonly children: ReactNode;
  readonly tone?: 'warning' | 'info';
}) {
  return (
    <div className={tone === 'info' ? 'callout alert-info' : 'callout'}>
      <Icon aria-hidden="true" className="lucide" />
      <span>{children}</span>
    </div>
  );
}

// Diálogo modal: foco no primeiro controle, Esc fecha e o foco volta para quem abriu.
export function Modal({ title, children, actions, onClose }: {
  readonly title: string;
  readonly children: ReactNode;
  readonly actions: ReactNode;
  readonly onClose: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector<HTMLElement>('input, textarea, select, button')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={dialog}>
        <h2 id="modal-title">{title}</h2>
        {children}
        <div className="modal-actions">{actions}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, children, confirmLabel, danger, loading, onConfirm, onCancel }: {
  readonly title: string;
  readonly children: ReactNode;
  readonly confirmLabel: string;
  readonly danger?: boolean;
  readonly loading?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      actions={(
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Voltar</Button>
          <Button variant={danger ? 'danger-solid' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      )}
    >
      <div className="muted" style={{ fontSize: 14 }}>{children}</div>
    </Modal>
  );
}
