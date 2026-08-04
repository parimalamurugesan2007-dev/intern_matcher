import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Logo, GradientButton } from '@/components/shared';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="mx-auto mt-3 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-strong flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/dashboard"
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:text-white',
                pathname === '/dashboard' ? 'text-white' : 'text-slate-300'
              )}
            >
              Dashboard
            </Link>
            <GradientButton to="/upload-resume" size="default">
              Get Started
            </GradientButton>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-200 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-2 max-w-7xl px-4 sm:px-6 lg:px-8 md:hidden"
          >
            <div className="glass-strong flex flex-col gap-1 rounded-2xl p-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
                <Link to="/dashboard" className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white">
                  Dashboard
                </Link>
                <GradientButton to="/upload-resume" className="w-full">
                  Get Started
                </GradientButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
