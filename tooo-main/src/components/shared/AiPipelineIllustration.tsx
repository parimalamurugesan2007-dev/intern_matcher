import { motion } from 'framer-motion';
import { FileText, BrainCircuit, Target, Trophy } from 'lucide-react';

// Animated vertical flow showing the AI matching pipeline.
// Resume -> AI Analysis -> Skill Matching -> Recommended Internship.
export function AiPipelineIllustration() {
  const steps = [
    { icon: FileText, label: 'Resume', color: 'from-blue-500 to-blue-600' },
    { icon: BrainCircuit, label: 'AI Analysis', color: 'from-violet-500 to-violet-600' },
    { icon: Target, label: 'Skill Matching', color: 'from-emerald-500 to-emerald-600' },
    { icon: Trophy, label: 'Recommended Internship', color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="relative flex flex-col items-center gap-3">
      {steps.map((step, i) => (
        <div key={step.label} className="flex flex-col items-center gap-3">
          <motion.div
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex w-64 items-center gap-4 rounded-2xl glass-strong p-4"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} text-white shadow-lg`}>
              <step.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{step.label}</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${75 + i * 8}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.18 + 0.3, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500"
                />
              </div>
            </div>
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
            />
          </motion.div>

          {i < steps.length - 1 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              whileInView={{ height: 28, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.18 + 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="h-6 w-px bg-gradient-to-b from-white/30 to-white/5" />
              <motion.div
                animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
                className="text-blue-400"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}
