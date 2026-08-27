import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { cn } from '@/lib/utils';
import type { TopDomain } from '@/types';

interface TopDomainsListProps {
  domains: TopDomain[];
  className?: string;
  // If provided, clicking a domain navigates to /browse?domain=<domain>
  // (the domain-click-through flow: Predicted Domains -> Click Domain ->
  // Domain Internships -> Back -> Select another Domain).
  linkToBrowse?: boolean;
}

export function TopDomainsList({ domains, className, linkToBrowse = true }: TopDomainsListProps) {
  const navigate = useNavigate();

  if (!domains.length) return null;

  return (
    <GlassCard className={cn('p-5', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
        <Sparkles className="h-4 w-4 text-violet-400" />
        Top Predicted Domains
      </div>

      <div className="mt-4 space-y-3">
        {domains.map((d, i) => {
          const pct = Math.round(d.confidence * 100);
          const content = (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-white">{d.domain}</span>
                <span className="text-slate-400">{pct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                />
              </div>
            </>
          );

          if (!linkToBrowse) {
            return <div key={d.domain}>{content}</div>;
          }

          return (
            <button
              key={d.domain}
              onClick={() => navigate(`/browse?domain=${encodeURIComponent(d.domain)}`)}
              className="block w-full text-left transition-opacity hover:opacity-80"
            >
              {content}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
