export interface ProfileForm {
  readonly name: string;
  readonly email: string;
}

export type ProfileErrors = Partial<Record<keyof ProfileForm, string>>;

// As mesmas regras do merchant-service.
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validateProfile(form: ProfileForm): ProfileErrors {
  const errors: ProfileErrors = {};
  const name = form.name.trim();
  if (!name) {
    errors.name = 'Informe o nome da loja.';
  } else if (name.length > 120) {
    errors.name = 'Use até 120 caracteres.';
  }
  if (!EMAIL.test(form.email.trim())) {
    errors.email = 'Informe um e-mail válido, como contato@sualoja.com.br.';
  }
  return errors;
}
