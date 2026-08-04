import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  GitCompareArrows,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Flag,
  BookOpen,
  Video,
  FileText,
  GraduationCap,
  Library,
  Sparkles,
} from 'lucide-react';
import { PageTransition, GlassCard, GradientButton, ChartTooltip, EmptyState, DomainBadge } from '@/components/shared';
import { Progress } from '@/components/ui/progress';
import { useRecommendResult } from '@/hooks';
import { deriveSkillGap } from '@/utils/derive';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const priorityStyles: Record<string, { label: string; cls: string }> = {
  high: { label: 'High Priority', cls: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  medium: { label: 'Medium Priority', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  low: { label: 'Low Priority', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
};
const resourceIcons: Record<string, typeof BookOpen> = {
  course: GraduationCap,
  video: Video,
  article: FileText,
  book: Library,
  documentation: BookOpen,
  youtube: Video,
  freecodecamp: FileText,
};

export default function SkillGapPage() {
  const { result } = useRecommendResult();
  const gap = useMemo(
    () => (result ? deriveSkillGap(result.profile, result.recommendations) : null),
    [result]
  );

  if (!result || !gap) {
    return (
      <PageTransition>
        <EmptyState
          icon={Sparkles}
          title="No skill analysis yet"
          description="Upload your resume to see your current skills and what's missing for your matched internships."
          action={<GradientButton to="/upload-resume" size="lg">Upload Resume</GradientButton>}
        />
      </PageTransition>
    );
  }

  const radarData = [
    ...gap.currentSkills.slice(0, 6).map((s) => ({ skill: s.name, you: s.proficiency, target: 90 })),
    ...gap.missingSkills.slice(0, 4).map((s) => ({ skill: s.skill, you: s.progress, target: 80 })),
  ];
  const totalHours = gap.missingSkills.reduce((sum, s) => sum + (s.priority === 'high' ? 16 : s.priority === 'medium' ? 12 : 8), 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Skill Gap Analysis</h1>
            <p className="mt-1 text-sm text-slate-400">Skills you have vs. skills your matched internships demand.</p>
          </div>
          <div className="flex items-center gap-2">
            <DomainBadge domain={result.predictedDomain} size="sm" />
            <GradientButton size="default" onClick={() => toast({ title: 'Report downloaded', description: 'Your skill gap report has been exported.' })}>
              <FileText className="h-4 w-4" /> Download Report
            </GradientButton>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <GlassCard className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <GitCompareArrows className="h-4.5 w-4.5 text-blue-400" />
              <h3 className="text-base font-semibold text-white">Current vs Target Skills</h3>
            </div>
            <p className="text-xs text-slate-400">Your proficiency vs. the level your recommendations expect</p>
            <div className="mt-4 h-[340px]">
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="75%">
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} stroke="rgba(255,255,255,0.08)" />
                    <Radar name="You" dataKey="you" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.35} strokeWidth={2} />
                    <Radar name="Target" dataKey="target" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} strokeDasharray="4 4" />
                    <ChartTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="flex h-full items-center justify-center text-sm text-slate-500">Not enough data for a chart.</p>
              )}
            </div>
          </GlassCard>

          <div className="space-y-4">
            <GlassCard>
              <p className="text-xs uppercase tracking-wider text-slate-500">Overall Gap Score</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-bold text-white">{gap.overallGapScore}</span>
                <span className="mb-1 text-sm text-slate-400">/ 100</span>
              </div>
              <Progress value={gap.overallGapScore} className="mt-3 h-2 bg-white/10" />
              <p className="mt-2 text-xs text-slate-400">Lower is better — you're closing the gap.</p>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400"><Clock className="h-5.5 w-5.5" /></div>
                <div><p className="text-2xl font-bold text-white">{totalHours}h</p><p className="text-xs text-slate-400">Estimated learning time</p></div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Current skills */}
        <GlassCard>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Current Skills ({gap.currentSkills.length})</h3>
          </div>
          {gap.currentSkills.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No skills were extracted from your resume.</p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gap.currentSkills.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-200">{s.name}</span>
                    <span className="text-slate-400">{s.proficiency}%</span>
                  </div>
                  <Progress value={s.proficiency} className="mt-2 h-1.5 bg-white/10" />
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Missing skills */}
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Missing Skills ({gap.missingSkills.length})</h2>
          </div>
          {gap.missingSkills.length === 0 ? (
            <GlassCard className="mt-4 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
              <p className="mt-3 text-base font-semibold text-white">No skill gaps detected</p>
              <p className="mt-1 text-sm text-slate-400">Your profile already covers the skills your recommendations demand.</p>
            </GlassCard>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {gap.missingSkills.map((item, i) => {
                const p = priorityStyles[item.priority];
                return (
                  <motion.div key={item.skill} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: i * 0.05 }}>
                    <GlassCard hover className="h-full">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-semibold text-white">{item.skill}</h4>
                          <span className={cn('mt-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', p.cls)}>
                            <Flag className="h-3 w-3" /> {p.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          {item.priority === 'high' ? 16 : item.priority === 'medium' ? 12 : 8}h
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">Demanded by {item.demandCount} of your recommendations</p>
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-medium text-slate-400">Learning Resources</p>
                        {item.resources.map((r) => {
                          const Icon = resourceIcons[r.type] ?? BookOpen;
                          return (
                            <a key={r.title} href={r.url} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:border-blue-500/40 hover:bg-blue-500/5">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400"><Icon className="h-4 w-4" /></span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-200 group-hover:text-white">{r.title}</p>
                                <p className="text-xs text-slate-500">{r.provider}</p>
                              </div>
                              <span className="text-xs capitalize text-slate-500">{r.type}</span>
                            </a>
                          );
                        })}
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
