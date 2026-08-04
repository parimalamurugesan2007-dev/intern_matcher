import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  GitCompareArrows,
  Map,
  Send,
  Bookmark,
  User,
  Settings,
  Menu,
  Bell,
  Search,
  Moon,
  Sun,
  Upload,
} from 'lucide-react';
import { Logo } from '@/components/shared';
import { useTheme } from '@/components/shared';
import { useRecommendResult } from '@/hooks';
import { getInitials } from '@/utils/format';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Resume Analysis', to: '/upload-resume', icon: FileText },
  { label: 'Recommendations', to: '/recommendations', icon: Sparkles },
  { label: 'Skill Gap', to: '/skill-gap', icon: GitCompareArrows },
  { label: 'Learning Roadmap', to: '/learning-roadmap', icon: Map },
  { label: 'Applications', to: '/recommendations', icon: Send },
  { label: 'Saved', to: '/recommendations', icon: Bookmark },
  { label: 'Profile', to: '/profile', icon: User },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { result } = useRecommendResult();
  const profile = result?.profile;
  const displayName = profile?.name || 'Guest';
  const displaySub = profile?.email || 'Upload a resume to begin';

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-brand-gradient text-white shadow-[0_8px_24px_-10px_rgba(59,130,246,0.6)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className={cn('h-4.5 w-4.5 shrink-0', active ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
              <span>{item.label}</span>
              {active && (
                <motion.span layoutId="sidebar-active" className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link to="/upload-resume" className="flex items-center gap-3 rounded-xl glass p-3 transition-colors hover:bg-white/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{displayName}</p>
            <p className="truncate text-xs text-slate-400">{displaySub}</p>
          </div>
          {!result && <Upload className="h-4 w-4 text-blue-400" />}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0b1220]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-[#0d1424]/80 backdrop-blur-xl lg:block">
        {Sidebar}
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-[#0d1424] lg:hidden">
              {Sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-[#0b1220]/80 px-4 backdrop-blur-xl sm:px-6">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/5 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Search internships, skills, companies..." className="h-9 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/40" />
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
            <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/5 hover:text-white" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/5 hover:text-white" aria-label="Notifications">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-[#0b1220]" />
            </button>
            <Link to="/profile" className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white ring-2 ring-transparent transition-all hover:ring-blue-500/30">
              {getInitials(displayName)}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
