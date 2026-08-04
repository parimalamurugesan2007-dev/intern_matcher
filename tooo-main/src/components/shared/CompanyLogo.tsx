import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CompanyLogoProps {
  name: string;
  className?: string;
}

// Stylized text-based company marks with brand-tinted glyphs — no external assets.
const marks: Record<string, { glyph: string; tint: string }> = {
  Google: { glyph: 'G', tint: 'text-blue-400' },
  Microsoft: { glyph: 'M', tint: 'text-cyan-400' },
  Amazon: { glyph: 'a', tint: 'text-amber-400' },
  Infosys: { glyph: 'I', tint: 'text-violet-400' },
  Zoho: { glyph: 'Z', tint: 'text-rose-400' },
  TCS: { glyph: 'T', tint: 'text-emerald-400' },
  Accenture: { glyph: 'A', tint: 'text-purple-400' },
};

export function CompanyLogo({ name, className }: CompanyLogoProps) {
  const m = marks[name] ?? { glyph: name[0], tint: 'text-slate-300' };
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      className={cn(
        'flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 backdrop-blur-sm transition-colors hover:border-white/20',
        className
      )}
    >
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-lg font-bold', m.tint)}>
        {m.glyph}
      </span>
      <span className="text-sm font-semibold text-slate-200">{name}</span>
    </motion.div>
  );
}
