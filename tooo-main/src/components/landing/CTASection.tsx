import { motion } from 'framer-motion';
import { ArrowRight, Upload } from 'lucide-react';
import { GradientButton, BlobBackground } from '@/components/shared';

export function CTASection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="gradient-border relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-12">
          <BlobBackground variant="subtle" />
          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Ready to find your perfect internship?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="mx-auto mt-4 max-w-xl text-base text-slate-400"
            >
              Upload your resume today and let AI match you to the right opportunities in minutes.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <GradientButton to="/upload-resume" size="lg">
                <Upload className="h-4.5 w-4.5" />
                Upload Resume
              </GradientButton>
              <GradientButton to="/upload-resume" size="lg" className="!bg-white/5 !text-white hover:!bg-white/10">
                Upload Your Resume
                <ArrowRight className="h-4.5 w-4.5" />
              </GradientButton>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
