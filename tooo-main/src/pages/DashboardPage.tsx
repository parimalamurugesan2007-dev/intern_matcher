import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  Gauge,
  Sparkles,
  Target,
  Briefcase,
  ArrowRight,
  FileText,
  TrendingUp,
  FolderGit2,
  Award,
} from 'lucide-react';
import { PageTransition, StatCard, GlassCard, DomainBadge, ChartTooltip, InternshipCard, EmptyState, GradientButton } from '@/components/shared';
import { useRecommendResult } from '@/hooks';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4'];

export default function DashboardPage() {
  const { result } = useRecommendResult();

  const skillDistribution = useMemo(() => {
    if (!result?.profile.skills?.length) return [];
    // Group skills into rough proficiency bands as a distribution view.
    const bands = [
      { name: 'Expert (80+)', value: 0 },
      { name: 'Proficient (60-79)', value: 0 },
      { name: 'Intermediate (40-59)', value: 0 },
      { name: 'Beginner (<40)', value: 0 },
    ];
    for (const s of result.profile.skills) {
      if (s.proficiency >= 80) bands[0].value++;
      else if (s.proficiency >= 60) bands[1].value++;
      else if (s.proficiency >= 40) bands[2].value++;
      else bands[3].value++;
    }
    return bands.filter((b) => b.value > 0);
  }, [result]);

  const matchBars = useMemo(() => {
    if (!result?.recommendations?.length) return [];
    return result.recommendations.slice(0, 6).map((r) => ({
      name: r.company.length > 12 ? r.company.slice(0, 11) + '…' : r.company,
      match: r.matchPercentage,
    }));
  }, [result]);

  if (!result) {
    return (
      <PageTransition>
        <EmptyState
          icon={FileText}
          title="No analysis yet"
          description="Upload your resume to let AI extract your profile, predict your domain, and match you to internships."
          action={<GradientButton to="/upload-resume" size="lg"><FileText className="h-4.5 w-4.5" />Upload Resume</GradientButton>}
        />
      </PageTransition>
    );
  }

  const { profile, predictedDomain, recommendations } = result;
  const avgMatch = recommendations.length
    ? Math.round(recommendations.reduce((s, r) => s + r.matchPercentage, 0) / recommendations.length)
    : 0;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">
              Welcome{profile.name ? `, ${profile.name.split(' ')[0]}` : ''} — here's your AI-matched overview.
            </p>
          </div>
          <DomainBadge domain={predictedDomain} />
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Gauge} label="Resume ATS Score" value={profile.resumeScore} suffix="/100" trend="From your resume" accent="blue" delay={0} />
          <StatCard icon={Target} label="Avg Match" value={avgMatch} suffix="%" trend={`${recommendations.length} internships`} accent="violet" delay={0.05} />
          <StatCard icon={Sparkles} label="Skills Identified" value={profile.skills.length} trend="Extracted by AI" accent="green" delay={0.1} />
          <StatCard icon={Briefcase} label="Recommendations" value={recommendations.length} trend="Matched to you" accent="amber" delay={0.15} />
        </div>

        {/* Domain + summary banner */}
        <GlassCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Predicted Domain</p>
              <p className="text-xl font-bold text-white">{predictedDomain}</p>
            </div>
          </div>
          {profile.summary && (
            <p className="max-w-xl text-sm leading-relaxed text-slate-400">{profile.summary}</p>
          )}
        </GlassCard>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          {skillDistribution.length > 0 && (
            <GlassCard>
              <h3 className="text-base font-semibold text-white">Skill Distribution</h3>
              <p className="text-xs text-slate-400">Your skills by proficiency level</p>
              <div className="mt-4 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={skillDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                      {skillDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {skillDistribution.map((s, i) => (
                  <span key={s.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {s.name} ({s.value})
                  </span>
                ))}
              </div>
            </GlassCard>
          )}

          {matchBars.length > 0 && (
            <GlassCard>
              <h3 className="text-base font-semibold text-white">Match Scores by Company</h3>
              <p className="text-xs text-slate-400">How well your profile fits each recommendation</p>
              <div className="mt-4 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={matchBars} margin={{ left: -18, right: 8, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <ChartTooltip />
                    <Bar dataKey="match" radius={[6, 6, 0, 0]}>
                      {matchBars.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Quick profile stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <GlassCard className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400"><FolderGit2 className="h-5 w-5" /></div>
            <div><p className="text-xl font-bold text-white">{profile.projects.length}</p><p className="text-xs text-slate-400">Projects</p></div>
          </GlassCard>
          <GlassCard className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400"><Award className="h-5 w-5" /></div>
            <div><p className="text-xl font-bold text-white">{profile.certificates.length}</p><p className="text-xs text-slate-400">Certificates</p></div>
          </GlassCard>
          <GlassCard className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400"><TrendingUp className="h-5 w-5" /></div>
            <div><p className="text-xl font-bold text-white">{profile.experience.length}</p><p className="text-xs text-slate-400">Experiences</p></div>
          </GlassCard>
        </div>

        {/* Top recommendations */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Top Recommendations</h2>
            <Link to="/recommendations" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recommendations.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No recommendations were returned for your resume.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.slice(0, 6).map((job, i) => (
                <InternshipCard key={job.id} internship={job} delay={i * 0.06} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
