import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn('animate-shimmer rounded-md', className)} style={style} />;
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-2/3" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-md" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5">
      <Skeleton className="h-9 w-9 rounded-lg" />
      <Skeleton className="mt-4 h-7 w-20" />
      <Skeleton className="mt-2 h-3 w-24" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass rounded-2xl p-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-1 h-3 w-48" />
      <div className="mt-6 flex h-[260px] items-end justify-between gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="w-full rounded-t-md" style={{ height: `${30 + ((i * 37) % 70)}%` }} />
        ))}
      </div>
    </div>
  );
}
