import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { SectionHeading } from '@/components/shared';
import { testimonials } from '@/utils/demo-data';

export function Testimonials() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="Students love how it works"
          description="Thousands of students have used AI Internship Matcher to find and land their dream roles."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass relative overflow-hidden rounded-2xl p-6"
            >
              <Quote className="absolute right-4 top-4 h-10 w-10 text-white/5" />
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
