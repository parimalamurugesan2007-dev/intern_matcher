import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import { GradientButton, BlobBackground, Logo } from '@/components/shared';

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0b1220] px-4 text-center">
      <BlobBackground />

      <div className="absolute left-6 top-6 z-10">
        <Logo />
      </div>

      <div className="relative z-10">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-8xl font-bold text-transparent sm:text-9xl"
        >
          404
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 text-2xl font-bold text-white sm:text-3xl"
        >
          Page not found
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mx-auto mt-3 max-w-md text-sm text-slate-400 sm:text-base"
        >
          The page you are looking for doesn't exist or has been moved. Let's get you back on track.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.26 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <GradientButton to="/" size="lg">
            <Home className="h-4.5 w-4.5" />
            Back to Home
          </GradientButton>
          <Link
            to="/recommendations"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 text-base font-semibold text-white transition-all hover:bg-white/10"
          >
            <Compass className="h-4.5 w-4.5" />
            Explore Internships
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10"
        >
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300">
            <ArrowLeft className="h-3.5 w-3.5" />
            Go to dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
