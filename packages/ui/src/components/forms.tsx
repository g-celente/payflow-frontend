import { CircleAlert, Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { useState, type InputHTMLAttributes, type ReactNode } from 'react';

import { formatMoney, onlyDigits } from '../format';
import { IconButton } from './primitives';

export interface FieldProps {
  readonly id: string;
  readonly label: ReactNode;
  readonly help?: ReactNode;
  readonly error?: string | null;
  readonly children: ReactNode;
}

// Rótulo sempre visível; ajuda e erro logo abaixo do campo.
export function Field({ id, label, help, error, children }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <span className="error" id={`${id}-error`} role="alert">
          <CircleAlert aria-hidden="true" className="lucide icon-sm" />
          {error}
        </span>
      ) : help ? (
        <span className="help" id={`${id}-help`}>{help}</span>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, error?: string | null, help?: ReactNode): string | undefined {
  if (error) return `${id}-error`;
  return help ? `${id}-help` : undefined;
}

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  readonly id: string;
  readonly label: ReactNode;
  readonly help?: ReactNode;
  readonly error?: string | null;
}

export function TextField({ id, label, help, error, className = '', ...input }: TextFieldProps) {
  return (
    <Field id={id} label={label} help={help} error={error}>
      <input
        id={id}
        className={`input ${error ? 'invalid' : ''} ${className}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, help)}
        {...input}
      />
    </Field>
  );
}

// Campo de segredo com mostrar/ocultar.
export function SecretField({ id, label, help, error, ...input }: TextFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Field id={id} label={label} help={help} error={error}>
      <div className="input-group">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`input ${error ? 'invalid' : ''}`.trim()}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, help)}
          {...input}
        />
        <IconButton label={visible ? 'Ocultar' : 'Mostrar'} onClick={() => setVisible(!visible)}>
          {visible ? <EyeOff aria-hidden="true" className="lucide" /> : <Eye aria-hidden="true" className="lucide" />}
        </IconButton>
      </div>
    </Field>
  );
}

// Valor em reais: a pessoa digita só números e o campo formata (1990 → R$ 19,90). O valor é em centavos.
export function MoneyInput({ id, label, help, error, cents, onCents }: {
  readonly id: string;
  readonly label: ReactNode;
  readonly help?: ReactNode;
  readonly error?: string | null;
  readonly cents: number;
  readonly onCents: (cents: number) => void;
}) {
  return (
    <Field id={id} label={label} help={help} error={error}>
      <input
        id={id}
        className={`input input-money num ${error ? 'invalid' : ''}`.trim()}
        inputMode="numeric"
        autoComplete="off"
        value={formatMoney(cents)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, help)}
        onChange={(event) => onCents(Math.min(Number(onlyDigits(event.target.value) || '0'), 100_000_000))}
      />
    </Field>
  );
}

export interface SegmentOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly icon?: LucideIcon;
}

export function Segmented<T extends string>({ label, options, value, onChange }: {
  readonly label: string;
  readonly options: readonly SegmentOption<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map(({ value: option, label: text, icon: Icon }) => (
        <button key={option} type="button" aria-pressed={option === value} onClick={() => onChange(option)}>
          {Icon ? <Icon aria-hidden="true" className="lucide icon-sm" /> : null}
          {text}
        </button>
      ))}
    </div>
  );
}
