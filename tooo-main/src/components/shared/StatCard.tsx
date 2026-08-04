import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend?: string;
  accent?: 'blue' | 'violet' | 'green' | 'amber';
  delay?: number;
}

const accents: Record<string, { iconBg: string; ring: string; value: string }> = {
  blue: { iconBg: 'from-blue-500 to-blue-600', ring: 'group-hover:shadow-[0_20px_50px_-20px_rgba(59,130,246,0.5)]', value: 'text-blue-400' },
  violet: { iconBg: 'from-violet-500 to-violet-600', ring: 'group-hover:shadow-[0_20px_50px_-20px_rgba(139,92,246,0.5)]', value: 'text-violet-400' },
  green: { iconBg: 'from-emerald-500 to-emerald-600', ring: 'group-hover:shadow-[0_20px_50px_-20px_rgba(34,197,94,0.5)]', value: 'text-emerald-400' },
  amber: { iconBg: 'from-amber-500 to-orange-600', ring: 'group-hover:shadow-[0_20px_50px_-20px_rgba(245,158,11,0.5)]', value: 'text-amber-400' },
};

export function StatCard({ icon: Icon, label, value, suffix, prefix, trend, accent = 'blue', delay = 0 }: StatCardProps) {
  const a = accents[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={cn('group glass relative overflow-hidden rounded-2xl p-5 transition-shadow duration-300', a.ring)}
    >
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg', a.iconBg)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-3xl font-bold tracking-tight text-white">
        <AnimatedValue value={value} prefix={prefix} suffix={suffix} accentClass={a.value} />
      </div>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
      {trend && (
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
          {trend}
        </p>
      )}
    </motion.div>
  );
}

function AnimatedValue({ value, prefix, suffix, accentClass }: { value: number; prefix?: string; suffix?: string; accentClass: string }) {
  // Lightweight in-view count-up to avoid importing the heavier AnimatedCounter everywhere.
  return (
    <span className={accentClass}>
      {prefix}
      <CountUp value={value} />
      {suffix}
    </span>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [d, setD] = useState('0');
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setD(Math.round(v).toLocaleString('en-US')),
    });
    return () => controls.stop();
  }, [inView, value]);
  return <span ref={ref}>{d}</span>;
}
