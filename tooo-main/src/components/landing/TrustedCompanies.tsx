import { motion } from 'framer-motion';
import { CompanyLogo } from '@/components/shared';
import { companies } from '@/utils/demo-data';

export function TrustedCompanies() {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm font-medium uppercase tracking-wider text-slate-500"
        >
          Trusted by students who interned at
        </motion.p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          {companies.map((c, i) => (
            <motion.div
              key={c}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <CompanyLogo name={c} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
