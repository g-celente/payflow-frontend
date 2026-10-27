import { buttonClass, EmptyState, PageHeader } from '@payflow/ui';
import { SearchX } from 'lucide-react';
import { Link } from 'react-router';

export function NotFound({ title = 'Página não encontrada', detail = 'O endereço não existe ou mudou.' }: {
  readonly title?: string;
  readonly detail?: string;
}) {
  return (
    <div className="page">
      <PageHeader title={title} />
      <section className="card">
        <EmptyState icon={SearchX} title={title} action={<Link className={buttonClass('primary')} to="/">Ir para o início</Link>}>
          {detail}
        </EmptyState>
      </section>
    </div>
  );
}
