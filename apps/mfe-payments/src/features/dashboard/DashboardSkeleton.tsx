import { Skeleton } from '@payflow/ui';

export function DashboardSkeleton() {
  return (
    <div className="page" aria-busy="true" aria-label="Carregando painel">
      <div className="stack" style={{ gap: 8 }}>
        <Skeleton height={28} width={260} />
        <Skeleton height={16} width={340} />
      </div>
      <Skeleton height={108} />
      <div className="grid grid-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="card kpi">
            <Skeleton height={14} width="60%" />
            <Skeleton height={26} width="80%" />
            <Skeleton height={12} width="50%" />
          </div>
        ))}
      </div>
      <div className="grid grid-main">
        <div className="card card-pad"><Skeleton height={160} /></div>
        <div className="card card-pad"><Skeleton height={160} /></div>
      </div>
    </div>
  );
}
