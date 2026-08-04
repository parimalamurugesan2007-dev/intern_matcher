import { motion } from 'framer-motion';
import { AnimatedCounter, SectionHeading } from '@/components/shared';
import { stats } from '@/utils/demo-data';

export function Statistics() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="gradient-border relative overflow-hidden rounded-3xl px-6 py-14 sm:px-12">
          <div className="absolute inset-0 -z-10 opacity-40" style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.15), transparent 70%)' }} />
          <SectionHeading
            eyebrow="By the numbers"
            title="Real results from real students"
            description="Our AI matching engine has helped thousands of students find and prepare for internships."
          />
          <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </div>
                <p className="mt-2 text-sm text-slate-400">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
