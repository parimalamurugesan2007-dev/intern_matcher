import { motion } from 'framer-motion';
import { Send, FileText, Building2, Calendar, CheckCircle2 } from 'lucide-react';
import { PageTransition, GlassCard, EmptyState, GradientButton, CardSkeleton } from '@/components/shared';
import { useAppliedInternships, getErrorMessage } from '@/hooks';
import { toast } from '@/hooks/use-toast';
import type { LucideIcon } from 'lucide-react';

export default function ApplicationsPage() {
  const { data: applied, isLoading, isError, error, refetch } = useAppliedInternships();

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Applications</h1>
            <p className="mt-1 text-sm text-slate-400">Track internships you've applied to.</p>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  if (isError) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Applications</h1>
            <p className="mt-1 text-sm text-slate-400">Track internships you've applied to.</p>
          </div>
          <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-base font-semibold text-white">Failed to load applications</p>
            <p className="mt-1 text-sm text-slate-400">{getErrorMessage(error)}</p>
            <button onClick={() => refetch()} className="mt-4 text-sm font-medium text-blue-400 hover:text-blue-300">
              Try again
            </button>
          </GlassCard>
        </div>
      </PageTransition>
    );
  }

  if (!applied || applied.length === 0) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Applications</h1>
            <p className="mt-1 text-sm text-slate-400">Track internships you've applied to.</p>
          </div>
          <EmptyState
            icon={Send}
            title="No applications yet"
            description="Apply to internships from your recommendations. They'll show up here so you can track your progress."
            action={<GradientButton to="/recommendations" size="lg"><FileText className="h-4.5 w-4.5" />View Recommendations</GradientButton>}
          />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Applications</h1>
            <p className="mt-1 text-sm text-slate-400">Track internships you've applied to.</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
            {applied.length} applied
          </span>
        </div>

        <div className="space-y-3">
          {applied.map((item, i) => (
            <ApplicationRow key={item.id} index={i} role={item.role} company={item.company} appliedAt={item.applied_at} status={item.status} />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

function ApplicationRow({
  index,
  role,
  company,
  appliedAt,
  status,
}: {
  index: number;
  role: string;
  company: string;
  appliedAt: string;
  status: string;
}) {
  const formattedDate = new Date(appliedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const statusColor =
    /applied/i.test(status)
      ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
      : /review|pending/i.test(status)
        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
        : /accepted|offer/i.test(status)
          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          : /rejected|declined/i.test(status)
            ? 'bg-red-500/15 text-red-300 border-red-500/30'
            : 'bg-slate-500/15 text-slate-300 border-slate-500/30';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="glass flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-white/[0.04]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 text-base font-bold text-white ring-1 ring-white/10">
        {company[0]}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-white">{role}</h3>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {company}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
        </div>
      </div>

      <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${statusColor}`}>
        <CheckCircle2 className="mr-1 inline h-3 w-3" />
        {status}
      </span>
    </motion.div>
  );
}

void CardSkeleton;
