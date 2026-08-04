import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DomainBadgeProps {
  domain: string;
  className?: string;
  size?: 'sm' | 'md';
}

// Displays response.predicted_domain as a glowing pill badge.
export function DomainBadge({ domain, className, size = 'md' }: DomainBadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 font-semibold text-violet-300',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1.5 text-sm',
        className
      )}
    >
      <Sparkles className={cn('text-violet-400', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      <span className="opacity-70">Domain:</span>
      <span>{domain}</span>
    </motion.span>
  );
}
