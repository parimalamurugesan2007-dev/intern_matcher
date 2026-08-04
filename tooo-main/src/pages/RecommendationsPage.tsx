import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, Wifi, Building2, Cpu, X, FileText } from 'lucide-react';
import { PageTransition, GlassCard, InternshipCard, CardSkeleton, EmptyState, DomainBadge, GradientButton } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRecommendResult } from '@/hooks';
import { toast } from '@/hooks/use-toast';
import type { LucideIcon } from 'lucide-react';

interface Filters {
  search: string;
  location: string;
  remote: boolean | undefined;
  company: string;
  technology: string;
}

export default function RecommendationsPage() {
  const { result } = useRecommendResult();
  const [filters, setFilters] = useState<Filters>({
    search: '',
    location: '',
    remote: undefined,
    company: '',
    technology: '',
  });

  const all = result?.recommendations ?? [];

  const companies = useMemo(
    () => ['Any', ...Array.from(new Set(all.map((j) => j.company).filter(Boolean)))],
    [all]
  );
  const locations = useMemo(
    () => ['Any', ...Array.from(new Set(all.map((j) => j.location).filter(Boolean)))],
    [all]
  );
  const technologies = useMemo(
    () => ['Any', ...Array.from(new Set(all.flatMap((j) => j.technologies))).sort()],
    [all]
  );

  const jobs = useMemo(() => {
    return all.filter((j) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !j.role.toLowerCase().includes(q) &&
          !j.company.toLowerCase().includes(q) &&
          !j.technologies.join(' ').toLowerCase().includes(q)
        )
          return false;
      }
      if (filters.location && filters.location !== 'Any' && !j.location.includes(filters.location)) return false;
      if (filters.remote !== undefined && j.remote !== filters.remote) return false;
      if (filters.company && filters.company !== 'Any' && j.company !== filters.company) return false;
      if (filters.technology && filters.technology !== 'Any' && !j.technologies.includes(filters.technology)) return false;
      return true;
    });
  }, [all, filters]);

  const update = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const clearAll = () => setFilters({ search: '', location: '', remote: undefined, company: '', technology: '' });
  const activeCount = Object.values(filters).filter((v) => v !== '' && v !== undefined).length;

  if (!result) {
    return (
      <PageTransition>
        <EmptyState
          icon={FileText}
          title="No recommendations yet"
          description="Upload your resume to get AI-matched internship recommendations."
          action={<GradientButton to="/upload-resume" size="lg"><FileText className="h-4.5 w-4.5" />Upload Resume</GradientButton>}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Recommendations</h1>
            <p className="mt-1 text-sm text-slate-400">AI-matched internships from your resume.</p>
          </div>
          <DomainBadge domain={result.predictedDomain} size="sm" />
        </div>

        {/* Filters */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <SlidersHorizontal className="h-4 w-4 text-blue-400" />
            Filters
            {activeCount > 0 && (
              <button onClick={clearAll} className="ml-auto inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white">
                <X className="h-3 w-3" />
                Clear all ({activeCount})
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Label className="mb-1.5 block text-xs text-slate-400">Search</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Role, company, skill..."
                  value={filters.search}
                  onChange={(e) => update({ search: e.target.value })}
                  className="border-white/10 bg-white/5 pl-10 text-slate-100 placeholder:text-slate-500"
                />
              </div>
            </div>

            <FilterSelect icon={MapPin} label="Location" value={filters.location || 'Any'} options={locations} onChange={(v) => update({ location: v === 'Any' ? '' : v })} />
            <FilterSelect icon={Building2} label="Company" value={filters.company || 'Any'} options={companies} onChange={(v) => update({ company: v === 'Any' ? '' : v })} />
            <FilterSelect icon={Cpu} label="Technology" value={filters.technology || 'Any'} options={technologies} onChange={(v) => update({ technology: v === 'Any' ? '' : v })} />

            <div className="flex items-end gap-2 lg:col-span-2">
              <div className="flex flex-1 items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <Label htmlFor="remote" className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Wifi className="h-3.5 w-3.5" />
                  Remote
                </Label>
                <Switch id="remote" checked={filters.remote === true} onCheckedChange={(c) => update({ remote: c ? true : undefined })} />
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="flex items-center justify-between">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">{jobs.length} opportunities</span>
        </div>

        {jobs.length === 0 ? (
          <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-400"><Search className="h-7 w-7" /></div>
            <p className="mt-4 text-base font-semibold text-white">No internships match your filters</p>
            <p className="mt-1 text-sm text-slate-400">Try adjusting or clearing your filters.</p>
            <button onClick={clearAll} className="mt-4 text-sm font-medium text-blue-400 hover:text-blue-300">Clear all filters</button>
          </GlassCard>
        ) : (
          <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, i) => (
              <InternshipCard
                key={job.id}
                internship={job}
                delay={i * 0.05}
                onApply={() => toast({ title: 'Application started', description: `Applying to ${job.role} at ${job.company}.` })}
                onSave={() => toast({ title: 'Saved', description: `${job.role} at ${job.company} added to your saved list.` })}
              />
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}

function FilterSelect({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="lg:col-span-2">
      <Label className="mb-1.5 block text-xs text-slate-400">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="border-white/10 bg-white/5 text-slate-100">
          <span className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 text-slate-500" />
            <SelectValue placeholder={label} />
          </span>
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-[#111827] text-slate-100">
          {options.map((o) => (
            <SelectItem key={o} value={o} className="focus:bg-white/10 focus:text-white">{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// keep CardSkeleton import referenced for future loading states
void CardSkeleton;
