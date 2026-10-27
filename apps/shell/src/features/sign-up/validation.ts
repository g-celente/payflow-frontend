import { onlyDigits } from '@payflow/ui';

export interface SignUpForm {
  readonly name: string;
  readonly email: string;
  readonly document: string;
}

export type SignUpErrors = Partial<Record<keyof SignUpForm, string>>;

// As mesmas regras do merchant-service, para a pessoa saber o que corrigir antes de enviar.
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validateSignUp(form: SignUpForm): SignUpErrors {
  const errors: SignUpErrors = {};
  const name = form.name.trim();
  if (!name) {
    errors.name = 'Informe o nome da loja.';
  } else if (name.length > 120) {
    errors.name = 'Use até 120 caracteres.';
  }
  if (!EMAIL.test(form.email.trim())) {
    errors.email = 'Informe um e-mail válido, como contato@sualoja.com.br.';
  }
  const digits = onlyDigits(form.document);
  if (digits.length !== 11 && digits.length !== 14) {
    errors.document = digits.length > 11
      ? 'O CNPJ tem 14 dígitos. Confira o número.'
      : 'O CPF tem 11 dígitos e o CNPJ, 14. Confira o número.';
  }
  return errors;
}
