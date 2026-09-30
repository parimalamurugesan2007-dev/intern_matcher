import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Sparkles } from 'lucide-react';
import { Logo, GradientButton, BlobBackground } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useLogin, useRegister, getErrorMessage } from '@/hooks';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
        setError('Please fill all fields. Password must be at least 6 characters.');
        return;
      }
      registerMutation.mutate(
        { name: form.name.trim(), email: form.email.trim(), password: form.password },
        {
          onSuccess: (data) => {
            login(data.token, data.user);
            toast({ title: 'Account created', description: `Welcome, ${data.user.name}!` });
            navigate('/dashboard');
          },
          onError: (err) => {
            const msg = getErrorMessage(err);
            setError(msg);
            toast({ title: 'Registration failed', description: msg, variant: 'destructive' });
          },
        }
      );
    } else {
      if (!form.email.trim() || !form.password) {
        setError('Please enter your email and password.');
        return;
      }
      loginMutation.mutate(
        { email: form.email.trim(), password: form.password },
        {
          onSuccess: (data) => {
            login(data.token, data.user);
            toast({ title: 'Welcome back', description: `Logged in as ${data.user.name}` });
            navigate('/dashboard');
          },
          onError: (err) => {
            const msg = getErrorMessage(err);
            setError(msg);
            toast({ title: 'Login failed', description: msg, variant: 'destructive' });
          },
        }
      );
    }
  };

  const update = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1220] px-4">
      <BlobBackground />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-strong rounded-2xl p-8 shadow-[0_20px_80px_-20px_rgba(59,130,246,0.4)]">
          <div className="flex flex-col items-center text-center">
            <Logo to="/" />
            <h1 className="mt-6 text-2xl font-bold text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {mode === 'login'
                ? 'Sign in to access your dashboard'
                : 'Join to get AI-matched internship recommendations'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="mt-6 flex rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium transition-all',
                mode === 'login' ? 'bg-brand-gradient text-white shadow-lg' : 'text-slate-400 hover:text-white'
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium transition-all',
                mode === 'register' ? 'bg-brand-gradient text-white shadow-lg' : 'text-slate-400 hover:text-white'
              )}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label className="text-slate-300">Full Name</Label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => update({ name: e.target.value })}
                    className="border-white/10 bg-white/5 pl-10 text-slate-100 placeholder:text-slate-500 focus:border-blue-500/50"
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => update({ email: e.target.value })}
                  className="border-white/10 bg-white/5 pl-10 text-slate-100 placeholder:text-slate-500 focus:border-blue-500/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => update({ password: e.target.value })}
                  className="border-white/10 bg-white/5 pl-10 text-slate-100 placeholder:text-slate-500 focus:border-blue-500/50"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <GradientButton type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </GradientButton>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
