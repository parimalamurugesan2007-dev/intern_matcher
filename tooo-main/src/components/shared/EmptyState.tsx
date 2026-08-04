import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

// Shown when no /recommend result is available yet (e.g. user navigates
// directly to /dashboard without uploading a resume first).
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
        <Icon className="h-7 w-7" />
      </div>
      <p className="mt-4 text-base font-semibold text-white">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
