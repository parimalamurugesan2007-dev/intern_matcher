import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Wallet, Briefcase, ArrowLeft, Compass, AlertCircle } from 'lucide-react';
import { PageTransition, GlassCard, InternshipCard, EmptyState, TopDomainsList } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDomainInternships, useInternshipSearch, useRecommendResult, getErrorMessage } from '@/hooks';
import { toast } from '@/hooks/use-toast';
import type { InternshipSearchFilters } from '@/types';

// Canonical domains the backend's normalizer resolves aliases to (see
// src/domain/normalizer.py CANONICAL_DOMAINS). Shown as browse chips when
// the user hasn't uploaded a resume yet (so there's no predicted list).
const FALLBACK_DOMAINS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Backend Development',
  'Frontend Development',
  'Full Stack Development',
  'Mobile Development',
  'DevOps',
  'Cloud Computing',
  'Cyber Security',
  'UI UX',
  'Digital Marketing',
];

export default function BrowsePage() {
  const { result } = useRecommendResult();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDomain = searchParams.get('domain');

  const [filters, setFilters] = useState<InternshipSearchFilters>({});
  const [searchActive, setSearchActive] = useState(false);

  const domainQuery = useDomainInternships(selectedDomain, 12);
  const searchQuery = useInternshipSearch(filters, searchActive);

  const domainChips = useMemo(
    () => (result?.predictedDomains.length ? result.predictedDomains.map((d) => d.domain) : FALLBACK_DOMAINS),
    [result]
  );

  const selectDomain = (domain: string) => setSearchParams({ domain });
  const clearDomain = () => setSearchParams({});

  const runSearch = () => {
    setSearchActive(true);
    // Force a refetch even if filters object reference didn't change enough
    // to bust the query key (e.g. re-clicking Search with the same values).
    searchQuery.refetch();
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
            <Compass className="h-6 w-6 text-blue-400" />
            Browse Internships
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Explore internships by domain, or search the full listing directly.
          </p>
        </div>

        {result?.predictedDomains.length ? (
          <TopDomainsList domains={result.predictedDomains} linkToBrowse />
        ) : null}

        {/* ---------------- Domain browse ---------------- */}
        {!selectedDomain ? (
          <GlassCard className="p-5">
            <p className="text-sm font-medium text-slate-300">Browse by domain</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {domainChips.map((domain) => (
                <button
                  key={domain}
                  onClick={() => selectDomain(domain)}
                  className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-slate-200 transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300"
                >
                  {domain}
                </button>
              ))}
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={clearDomain}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to domains
              </button>
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-sm font-semibold text-violet-300">
                {domainQuery.data?.domain ?? selectedDomain}
              </span>
            </div>

            {domainQuery.isLoading && (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />
              </div>
            )}

            {domainQuery.isError && (
              <GlassCard className="flex flex-col items-center gap-2 py-10 text-center">
                <AlertCircle className="h-6 w-6 text-amber-400" />
                <p className="text-sm text-slate-300">
                  {(domainQuery.error as { response?: { status?: number } })?.response?.status === 404
                    ? `No internships found for this domain.`
                    : getErrorMessage(domainQuery.error)}
                </p>
              </GlassCard>
            )}

            {domainQuery.data && domainQuery.data.internships.length > 0 && (
              <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {domainQuery.data.internships.map((job, i) => (
                  <InternshipCard
                    key={job.id}
                    internship={job}
                    delay={i * 0.05}
                    hideMatch
                    onApply={() => toast({ title: 'Application started', description: `Applying to ${job.role} at ${job.company}.` })}
                    onSave={() => toast({ title: 'Saved', description: `${job.role} at ${job.company} added to your saved list.` })}
                  />
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* ---------------- Manual search ---------------- */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Search className="h-4 w-4 text-blue-400" />
            Manual Search
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="mb-1.5 flex items-center gap-1 text-xs text-slate-400"><MapPin className="h-3 w-3" />Location</Label>
              <Input
                placeholder="e.g. Chennai"
                value={filters.location ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value || undefined }))}
                className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="mb-1.5 flex items-center gap-1 text-xs text-slate-400"><Briefcase className="h-3 w-3" />Domain</Label>
              <Input
                placeholder="e.g. AI, Backend Development"
                value={filters.domain ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, domain: e.target.value || undefined }))}
                className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-slate-400">Mode</Label>
              <Input
                placeholder="Remote / On-site"
                value={filters.mode ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, mode: e.target.value || undefined }))}
                className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="mb-1.5 flex items-center gap-1 text-xs text-slate-400"><Wallet className="h-3 w-3" />Min. Stipend</Label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 10000"
                value={filters.min_stipend ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, min_stipend: e.target.value ? Number(e.target.value) : undefined }))}
                className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-slate-400">Company</Label>
              <Input
                placeholder="e.g. Zoho"
                value={filters.company ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, company: e.target.value || undefined }))}
                className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-slate-400">Skills</Label>
              <Input
                placeholder="Python, SQL"
                value={filters.skills ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, skills: e.target.value || undefined }))}
                className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <Label className="mb-1.5 block text-xs text-slate-400">Keyword</Label>
              <Input
                placeholder="Role, tools, anything"
                value={filters.keyword ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value || undefined }))}
                className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
              />
            </div>
          </div>

          <button
            onClick={runSearch}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgba(59,130,246,0.6)] transition-transform hover:scale-[1.02]"
          >
            <Search className="h-4 w-4" />
            Search Internships
          </button>
        </GlassCard>

        {searchActive && (
          <div className="space-y-4">
            {searchQuery.isLoading && (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />
              </div>
            )}

            {searchQuery.isError && (
              <GlassCard className="flex flex-col items-center gap-2 py-10 text-center">
                <AlertCircle className="h-6 w-6 text-amber-400" />
                <p className="text-sm text-slate-300">{getErrorMessage(searchQuery.error)}</p>
              </GlassCard>
            )}

            {searchQuery.data && (
              <>
                <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                  {searchQuery.data.count} results
                </span>

                {searchQuery.data.internships.length === 0 ? (
                  <EmptyState
                    icon={Search}
                    title="No internships match your search"
                    description="Try broadening your filters — fewer constraints, or a shorter keyword."
                  />
                ) : (
                  <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {searchQuery.data.internships.map((job, i) => (
                      <InternshipCard
                        key={job.id}
                        internship={job}
                        delay={i * 0.05}
                        hideMatch
                        onApply={() => toast({ title: 'Application started', description: `Applying to ${job.role} at ${job.company}.` })}
                        onSave={() => toast({ title: 'Saved', description: `${job.role} at ${job.company} added to your saved list.` })}
                      />
                    ))}
                  </motion.div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
