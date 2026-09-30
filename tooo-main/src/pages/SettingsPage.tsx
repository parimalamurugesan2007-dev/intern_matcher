import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Lock, Moon, Sun, Save } from 'lucide-react';
import { PageTransition, GlassCard, GradientButton, useTheme } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useChangePassword, getErrorMessage } from '@/hooks';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });
  const changePasswordMutation = useChangePassword();

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.newPass) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all password fields.',
        variant: 'destructive',
      });
      return;
    }
    if (passwords.newPass.length < 6) {
      toast({
        title: 'Password too short',
        description: 'New password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast({
        title: 'Passwords do not match',
        description: 'New password and confirmation must match.',
        variant: 'destructive',
      });
      return;
    }
    changePasswordMutation.mutate(
      { currentPassword: passwords.current, newPassword: passwords.newPass },
      {
        onSuccess: () => {
          toast({
            title: 'Password updated',
            description: 'Your password has been changed successfully.',
          });
          setPasswords({ current: '', newPass: '', confirm: '' });
        },
        onError: (err) => {
          toast({
            title: 'Failed to update password',
            description: getErrorMessage(err),
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your theme and account password.
          </p>
        </div>

        <Tabs defaultValue="theme" className="space-y-5">
          <TabsList className="glass h-auto gap-1 rounded-xl p-1.5">
            <TabsTrigger
              value="theme"
              className="gap-1.5 data-[state=active]:bg-brand-gradient data-[state=active]:text-white"
            >
              <Palette className="h-3.5 w-3.5" /> Theme
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="gap-1.5 data-[state=active]:bg-brand-gradient data-[state=active]:text-white"
            >
              <Lock className="h-3.5 w-3.5" /> Password
            </TabsTrigger>
          </TabsList>

          {/* ── Theme ── */}
          <TabsContent value="theme">
            <GlassCard>
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <Palette className="h-4 w-4 text-blue-400" />
                Appearance
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Choose how the app looks to you. Your preference is saved automatically.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <ThemeOption
                  active={theme === 'dark'}
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  icon={Moon}
                  title="Dark"
                  description="Premium dark theme with glassmorphism"
                  preview="dark"
                />
                <ThemeOption
                  active={theme === 'light'}
                  onClick={() => theme !== 'light' && toggleTheme()}
                  icon={Sun}
                  title="Light"
                  description="Clean light theme"
                  preview="light"
                />
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Current theme: <span className="font-medium text-blue-400">{theme === 'dark' ? 'Dark' : 'Light'}</span>
              </p>
            </GlassCard>
          </TabsContent>

          {/* ── Password ── */}
          <TabsContent value="password">
            <GlassCard className="max-w-lg">
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <Lock className="h-4 w-4 text-blue-400" />
                Change Password
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Update your account password. You'll need your current password to make changes.
              </p>

              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Current password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                    className="border-white/10 bg-white/5 text-slate-100 focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">New password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.newPass}
                    onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
                    className="border-white/10 bg-white/5 text-slate-100 focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Confirm new password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                    className="border-white/10 bg-white/5 text-slate-100 focus:border-blue-500/50"
                  />
                </div>

                <GradientButton
                  size="default"
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                >
                  <Save className="h-4 w-4" />
                  {changePasswordMutation.isPending ? 'Updating...' : 'Update password'}
                </GradientButton>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}

function ThemeOption({
  active,
  onClick,
  icon: Icon,
  title,
  description,
  preview,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  description: string;
  preview: 'dark' | 'light';
}) {
  return (
    <motion.button
      whileHover={{ y: -3 }}
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all',
        active
          ? 'border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/20'
          : 'border-white/10 bg-white/5 hover:border-white/20'
      )}
    >
      <div
        className={cn(
          'flex h-14 w-20 shrink-0 items-center justify-center rounded-xl border',
          preview === 'dark'
            ? 'border-white/10 bg-[#0b1220]'
            : 'border-slate-200 bg-slate-100'
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5',
            preview === 'dark' ? 'text-blue-400' : 'text-amber-500'
          )}
        />
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>

      {active && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </motion.button>
  );
}