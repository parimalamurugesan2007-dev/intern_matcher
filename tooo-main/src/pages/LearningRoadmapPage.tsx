import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Map,
  Clock,
  CheckCircle2,
  Circle,
  BookOpen,
  Video,
  FileText,
  GraduationCap,
  Library,
  Target,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { PageTransition, GlassCard, GradientButton, EmptyState, DomainBadge } from '@/components/shared';
import { Progress } from '@/components/ui/progress';
import { useRecommendResult } from '@/hooks';
import { deriveRoadmap } from '@/utils/derive';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const resourceIcons: Record<string, typeof BookOpen> = {
  course: GraduationCap,
  video: Video,
  article: FileText,
  book: Library,
  documentation: BookOpen,
  youtube: Video,
  freecodecamp: FileText,
};

export default function LearningRoadmapPage() {
  const { result } = useRecommendResult();
  const roadmap = useMemo(
    () => (result ? deriveRoadmap(result.profile, result.recommendations, result.predictedDomain) : null),
    [result]
  );

  if (!result || !roadmap) {
    return (
      <PageTransition>
        <EmptyState
          icon={Sparkles}
          title="No roadmap yet"
          description="Upload your resume to generate a personalized learning roadmap from your skill gaps."
          action={<GradientButton to="/upload-resume" size="lg">Upload Resume</GradientButton>}
        />
      </PageTransition>
    );
  }

  const completed = roadmap.weeks.filter((w) => w.completed).length;
  const totalHours = roadmap.weeks.reduce((sum, w) => sum + w.estimatedHours, 0);
  const overallProgress = Math.round((completed / roadmap.totalWeeks) * 100);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Learning Roadmap</h1>
            <p className="mt-1 text-sm text-slate-400">
              A week-by-week plan to close your skill gaps for <span className="text-slate-200">{roadmap.targetRole}</span>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DomainBadge domain={result.predictedDomain} size="sm" />
            <GradientButton size="default" onClick={() => toast({ title: 'Roadmap exported', description: 'Your learning roadmap has been downloaded.' })}>
              <Map className="h-4 w-4" /> Export
            </GradientButton>
          </div>
        </div>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <GlassCard>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400"><Target className="h-5.5 w-5.5" /></div>
              <div><p className="text-2xl font-bold text-white">{completed}/{roadmap.totalWeeks}</p><p className="text-xs text-slate-400">Weeks completed</p></div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400"><Clock className="h-5.5 w-5.5" /></div>
              <div><p className="text-2xl font-bold text-white">{totalHours}h</p><p className="text-xs text-slate-400">Total estimated hours</p></div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400"><TrendingUp className="h-5.5 w-5.5" /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between"><p className="text-2xl font-bold text-white">{overallProgress}%</p><span className="text-xs text-slate-400">Overall</span></div>
                <Progress value={overallProgress} className="mt-1.5 h-1.5 bg-white/10" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-blue-500/40 via-violet-500/30 to-transparent sm:left-[31px]" />
          <div className="space-y-5">
            {roadmap.weeks.map((week, i) => (
              <motion.div key={week.week} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }} className="relative flex gap-4 sm:gap-6">
                <div className="relative z-10 shrink-0">
                  <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all sm:h-16 sm:w-16', week.completed ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400' : 'border-white/10 bg-[#111827] text-slate-400')}>
                    {week.completed ? <CheckCircle2 className="h-7 w-7" /> : <Circle className="h-7 w-7" />}
                  </div>
                </div>
                <GlassCard hover className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-blue-400">Week {week.week}</span>
                      <h3 className="mt-2 text-lg font-semibold text-white">{week.title}</h3>
                      <p className="text-sm text-slate-400">{week.topic}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3.5 w-3.5" />{week.estimatedHours}h</span>
                      {week.completed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400"><CheckCircle2 className="h-3 w-3" />Completed</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-400">To do</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-slate-400">Resources</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {week.resources.map((r) => {
                        const Icon = resourceIcons[r.type] ?? BookOpen;
                        return (
                          <a key={r.title} href={r.url} target="_blank" rel="noreferrer" className="group flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 p-2.5 transition-all hover:border-blue-500/40 hover:bg-blue-500/5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400"><Icon className="h-3.5 w-3.5" /></span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium text-slate-200 group-hover:text-white">{r.title}</p>
                              <p className="text-[11px] text-slate-500">{r.provider}</p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
