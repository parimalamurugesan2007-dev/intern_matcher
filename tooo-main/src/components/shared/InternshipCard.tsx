import { motion } from 'framer-motion';
import { MapPin, Clock, Wallet, Bookmark, ExternalLink, Building2, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Internship } from '@/types';
import { SkillBadge, GradientButton } from '@/components/shared';
import { cn } from '@/lib/utils';

interface InternshipCardProps {
  internship: Internship;
  delay?: number;
  onApply?: () => void;
  onSave?: () => void;
}

export function InternshipCard({ internship, delay = 0, onApply, onSave }: InternshipCardProps) {
  const match = internship.matchPercentage;
  const matchColor =
    match >= 85 ? 'from-emerald-500 to-emerald-600' : match >= 70 ? 'from-blue-500 to-violet-500' : 'from-amber-500 to-orange-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      className="group glass relative flex flex-col overflow-hidden rounded-2xl p-5 transition-shadow duration-300 hover:shadow-[0_20px_60px_-20px_rgba(59,130,246,0.35)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 text-base font-bold text-white ring-1 ring-white/10">
            {internship.company[0]}
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight text-white">{internship.role}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
              <Building2 className="h-3 w-3" />
              {internship.company}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={cn('flex items-center gap-1.5 rounded-full bg-gradient-to-r px-2.5 py-1 text-xs font-bold text-white', matchColor)}>
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {match}% Match
          </div>
          {internship.recommendationLevel && (
            <span className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold',
              /excellent/i.test(internship.recommendationLevel)
                ? 'bg-emerald-500/15 text-emerald-300'
                : /good/i.test(internship.recommendationLevel)
                  ? 'bg-blue-500/15 text-blue-300'
                  : 'bg-amber-500/15 text-amber-300'
            )}>
              {internship.recommendationLevel}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-slate-500" />
          {internship.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          {internship.duration}
        </span>
        <span className="flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5 text-slate-500" />
          {internship.stipend}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn('h-2 w-2 rounded-full', internship.remote ? 'bg-emerald-400' : 'bg-slate-500')} />
          {internship.remote ? 'Remote' : 'On-site'}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-400">{internship.description}</p>

      {/* Matched / missing skills from backend */}
      {(internship.matchedSkills.length > 0 || internship.missingSkills.length > 0) && (
        <div className="mt-3 space-y-2">
          {internship.matchedSkills.length > 0 && (
            <div>
              <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Matched Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {internship.matchedSkills.map((s) => (
                  <span key={s} className="inline-flex items-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {internship.missingSkills.length > 0 && (
            <div>
              <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-amber-400">
                <AlertTriangle className="h-3 w-3" /> Missing Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {internship.missingSkills.map((s) => (
                  <span key={s} className="inline-flex items-center rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {internship.technologies.slice(0, 4).map((t) => (
          <SkillBadge key={t} name={t} />
        ))}
        {internship.technologies.length > 4 && (
          <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-400">
            +{internship.technologies.length - 4}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
        <GradientButton size="sm" className="flex-1" onClick={onApply}>
          Apply
          <ExternalLink className="h-3.5 w-3.5" />
        </GradientButton>
        <button
          onClick={onSave}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:border-blue-500/40 hover:text-blue-400"
          aria-label="Save internship"
        >
          <Bookmark className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
