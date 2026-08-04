import { cn } from '@/lib/utils';

interface SkillBadgeProps {
  name: string;
  proficiency?: number;
  className?: string;
}

export function SkillBadge({ name, proficiency, className }: SkillBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-blue-500/40 hover:bg-blue-500/10',
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
      {name}
      {proficiency !== undefined && (
        <span className="text-slate-500">{proficiency}%</span>
      )}
    </span>
  );
}
