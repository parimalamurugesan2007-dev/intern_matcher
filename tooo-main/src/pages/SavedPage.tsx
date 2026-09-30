import { useNavigate } from 'react-router-dom';
import { Bookmark, Trash2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition, GlassCard, EmptyState, GradientButton, CardSkeleton } from '@/components/shared';
import { useSavedInternships, useDeleteSavedInternship, getErrorMessage } from '@/hooks';
import { toast } from '@/hooks/use-toast';
import type { SavedInternshipItem } from '@/types';
import type { Internship } from '@/types';
import type { LucideIcon } from 'lucide-react';

export default function SavedPage() {
  const navigate = useNavigate();
  const { data: saved, isLoading, isError, error, refetch } = useSavedInternships();
  const deleteMutation = useDeleteSavedInternship();

  const handleDelete = (id: number, role: string, company: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: 'Removed', description: `${role} at ${company} removed from saved.` });
        refetch();
      },
      onError: (err) => {
        toast({ title: 'Failed to remove', description: getErrorMessage(err), variant: 'destructive' });
      },
    });
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Saved Internships</h1>
            <p className="mt-1 text-sm text-slate-400">Internships you've bookmarked for later.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Saved Internships</h1>
            <p className="mt-1 text-sm text-slate-400">Internships you've bookmarked for later.</p>
          </div>
          <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-base font-semibold text-white">Failed to load saved internships</p>
            <p className="mt-1 text-sm text-slate-400">{getErrorMessage(error)}</p>
            <button onClick={() => refetch()} className="mt-4 text-sm font-medium text-blue-400 hover:text-blue-300">
              Try again
            </button>
          </GlassCard>
        </div>
      </PageTransition>
    );
  }

  if (!saved || saved.length === 0) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Saved Internships</h1>
            <p className="mt-1 text-sm text-slate-400">Internships you've bookmarked for later.</p>
          </div>
          <EmptyState
            icon={Bookmark}
            title="No saved internships yet"
            description="Browse recommendations and save the ones you like. They'll appear here."
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Saved Internships</h1>
            <p className="mt-1 text-sm text-slate-400">Internships you've bookmarked for later.</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
            {saved.length} saved
          </span>
        </div>

        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((item, i) => (
            <SavedCard
              key={item.id}
              item={item}
              delay={i * 0.05}
              onDelete={() => handleDelete(item.id, item.role, item.company)}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </motion.div>
      </div>
    </PageTransition>
  );
}

function SavedCard({
  item,
  delay,
  onDelete,
  isDeleting,
}: {
  item: SavedInternshipItem;
  delay: number;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const internship: Internship = {
    id: item.internship_id,
    company: item.company,
    role: item.role,
    location: item.location || 'Not specified',
    remote: /remote|wfh/i.test(item.location),
    duration: 'Not specified',
    stipend: item.stipend || 'Not specified',
    technologies: [],
    matchPercentage: 0,
    recommendationLevel: '',
    description: `Saved internship at ${item.company}.`,
    postedAt: item.saved_at,
    url: item.website_link || undefined,
    matchedSkills: [],
    missingSkills: [],
    learningResources: {},
    raw: item as unknown as Record<string, unknown>,
  };

  return (
    <div className="group glass relative flex flex-col overflow-hidden rounded-2xl p-5 transition-shadow duration-300 hover:shadow-[0_20px_60px_-20px_rgba(59,130,246,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 text-base font-bold text-white ring-1 ring-white/10">
            {item.company[0]}
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight text-white">{item.role}</h3>
            <p className="mt-0.5 text-xs text-slate-400">{item.company}</p>
          </div>
        </div>
        {item.domain && (
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-300">
            {item.domain}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400">
        {item.location && (
          <span>{item.location}</span>
        )}
        {item.stipend && (
          <span>{item.stipend}</span>
        )}
      </div>

      {item.website_link && (
        <a
          href={item.website_link}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
        >
          View listing
        </a>
      )}

      <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-all hover:border-red-500/40 hover:bg-red-500/15 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>
    </div>
  );
}

void CardSkeleton;
