import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradientBorder?: boolean;
  delay?: number;
}

export function GlassCard({
  children,
  className,
  hover = false,
  gradientBorder = false,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -4 } : undefined}
      className={cn(
        'relative rounded-2xl p-6',
        gradientBorder ? 'gradient-border' : 'glass',
        hover && 'transition-shadow duration-300 hover:shadow-[0_20px_60px_-20px_rgba(59,130,246,0.35)]',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
