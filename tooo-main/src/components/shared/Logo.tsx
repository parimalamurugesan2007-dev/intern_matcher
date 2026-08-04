import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  to?: string;
  showText?: boolean;
}

export function Logo({ className, to = '/', showText = true }: LogoProps) {
  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2.5', className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-[0_8px_24px_-8px_rgba(59,130,246,0.6)] transition-transform duration-300 group-hover:scale-105">
        <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight text-white">
            AI Internship
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-blue-400">
            Matcher
          </span>
        </span>
      )}
    </Link>
  );
}
