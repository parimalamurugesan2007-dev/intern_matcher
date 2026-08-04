import { motion } from 'framer-motion';
import { Upload, Compass, Sparkles, ArrowRight, Play } from 'lucide-react';
import { GradientButton, BlobBackground, AiPipelineIllustration, AnimatedCounter } from '@/components/shared';
import { stats } from '@/utils/demo-data';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24">
      <BlobBackground />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left — copy */}
          <div className="flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" />
              AI-powered internship matching
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Find Your Perfect{' '}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent text-glow">
                Internship
              </span>{' '}
              with AI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg"
            >
              Upload your resume and let AI extract your skills, match you to internships,
              detect missing skills, and generate a personalized learning roadmap — all in minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <GradientButton to="/upload-resume" size="lg">
                <Upload className="h-4.5 w-4.5" />
                Upload Resume
              </GradientButton>
              <GradientButton to="/recommendations" size="lg" className="bg-none border border-white/15 bg-white/5 !bg-white/5 !text-white hover:!bg-white/10">
                <Compass className="h-4.5 w-4.5" />
                Explore Opportunities
              </GradientButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 flex items-center gap-2 text-sm text-slate-500"
            >
              <Play className="h-4 w-4 text-blue-400" />
              No credit card required · Free for students
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.36 }}
              className="mt-12 grid w-full grid-cols-2 gap-6 sm:grid-cols-4"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-white sm:text-3xl">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center"
          >
            <div className="absolute h-[360px] w-[360px] rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 blur-3xl" />
            <div className="relative">
              <AiPipelineIllustration />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
