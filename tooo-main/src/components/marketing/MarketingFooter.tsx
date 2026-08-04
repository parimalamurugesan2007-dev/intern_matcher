import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import { Logo } from '@/components/shared';

type FooterLink = { label: string; href?: string; to?: string };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it Works', href: '#how-it-works' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Dashboard', to: '/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Upload Resume', to: '/upload-resume' },
      { label: 'Recommendations', to: '/recommendations' },
      { label: 'Skill Gap', to: '/skill-gap' },
      { label: 'Learning Roadmap', to: '/learning-roadmap' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer id="contact" className="relative mt-20 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Find your perfect internship with AI. Upload your resume, get matched,
              and follow a personalized learning roadmap to land your dream role.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[Github, Linkedin, Twitter, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:border-blue-500/40 hover:text-blue-400"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) =>
                  link.to ? (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-slate-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <a
                        href={link.href ?? '#'}
                        className="text-sm text-slate-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} AI Internship Matcher. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300">Privacy</a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300">Terms</a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
