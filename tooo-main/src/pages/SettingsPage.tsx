import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Bell,
  Lock,
  Shield,
  Globe,
  Moon,
  Sun,
  Save,
  Mail,
  MessageSquare,
  Sparkles,
  Eye,
} from 'lucide-react';
import { PageTransition, GlassCard, GradientButton, useTheme } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [notif, setNotif] = useState({ email: true, push: true, recommendations: true, weekly: false, marketing: false });
  const [privacy, setPrivacy] = useState({ profilePublic: true, showSkills: true, searchable: true, analytics: false });

  const saveNotif = () => toast({ title: 'Notification preferences saved' });
  const savePrivacy = () => toast({ title: 'Privacy preferences saved' });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
          <p className="mt-1 text-sm text-slate-400">Manage your theme, notifications, password, privacy, and language.</p>
        </div>

        <Tabs defaultValue="theme" className="space-y-5">
          <TabsList className="glass h-auto flex-wrap gap-1 rounded-xl p-1.5">
            <TabsTrigger value="theme" className="gap-1.5 data-[state=active]:bg-brand-gradient data-[state=active]:text-white">
              <Palette className="h-3.5 w-3.5" /> Theme
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 data-[state=active]:bg-brand-gradient data-[state=active]:text-white">
              <Bell className="h-3.5 w-3.5" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="password" className="gap-1.5 data-[state=active]:bg-brand-gradient data-[state=active]:text-white">
              <Lock className="h-3.5 w-3.5" /> Password
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-1.5 data-[state=active]:bg-brand-gradient data-[state=active]:text-white">
              <Shield className="h-3.5 w-3.5" /> Privacy
            </TabsTrigger>
            <TabsTrigger value="language" className="gap-1.5 data-[state=active]:bg-brand-gradient data-[state=active]:text-white">
              <Globe className="h-3.5 w-3.5" /> Language
            </TabsTrigger>
          </TabsList>

          {/* Theme */}
          <TabsContent value="theme">
            <GlassCard>
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <Palette className="h-4.5 w-4.5 text-blue-400" />
                Appearance
              </h3>
              <p className="text-sm text-slate-400">Choose how the app looks to you.</p>
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
                  description="Clean light theme (coming soon)"
                  preview="light"
                />
              </div>
            </GlassCard>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <GlassCard>
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <Bell className="h-4.5 w-4.5 text-blue-400" />
                Notifications
              </h3>
              <p className="text-sm text-slate-400">Control how and when you hear from us.</p>
              <div className="mt-5 space-y-1">
                <ToggleRow icon={Mail} title="Email notifications" description="Receive emails about your account and matches" checked={notif.email} onChange={(v) => setNotif((n) => ({ ...n, email: v }))} />
                <ToggleRow icon={Bell} title="Push notifications" description="Get real-time alerts in your browser" checked={notif.push} onChange={(v) => setNotif((n) => ({ ...n, push: v }))} />
                <ToggleRow icon={Sparkles} title="New recommendations" description="When a new internship matches your profile" checked={notif.recommendations} onChange={(v) => setNotif((n) => ({ ...n, recommendations: v }))} />
                <ToggleRow icon={Mail} title="Weekly digest" description="A weekly summary of your activity and matches" checked={notif.weekly} onChange={(v) => setNotif((n) => ({ ...n, weekly: v }))} />
                <ToggleRow icon={MessageSquare} title="Product updates" description="News about new features and improvements" checked={notif.marketing} onChange={(v) => setNotif((n) => ({ ...n, marketing: v }))} />
              </div>
              <GradientButton size="default" className="mt-5" onClick={saveNotif}>
                <Save className="h-4 w-4" />
                Save preferences
              </GradientButton>
            </GlassCard>
          </TabsContent>

          {/* Password */}
          <TabsContent value="password">
            <GlassCard className="max-w-lg">
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <Lock className="h-4.5 w-4.5 text-blue-400" />
                Change Password
              </h3>
              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Current password</Label>
                  <Input type="password" placeholder="••••••••" className="border-white/10 bg-white/5 text-slate-100 focus:border-blue-500/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">New password</Label>
                  <Input type="password" placeholder="••••••••" className="border-white/10 bg-white/5 text-slate-100 focus:border-blue-500/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Confirm new password</Label>
                  <Input type="password" placeholder="••••••••" className="border-white/10 bg-white/5 text-slate-100 focus:border-blue-500/50" />
                </div>
                <GradientButton size="default" onClick={() => toast({ title: 'Password updated', description: 'Your password has been changed successfully.' })}>
                  <Save className="h-4 w-4" />
                  Update password
                </GradientButton>
              </div>
            </GlassCard>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy">
            <GlassCard>
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <Shield className="h-4.5 w-4.5 text-blue-400" />
                Privacy
              </h3>
              <p className="text-sm text-slate-400">Control your data visibility and how it's used.</p>
              <div className="mt-5 space-y-1">
                <ToggleRow icon={Eye} title="Public profile" description="Allow recruiters to view your profile" checked={privacy.profilePublic} onChange={(v) => setPrivacy((p) => ({ ...p, profilePublic: v }))} />
                <ToggleRow icon={Sparkles} title="Show skills" description="Display your extracted skills on your profile" checked={privacy.showSkills} onChange={(v) => setPrivacy((p) => ({ ...p, showSkills: v }))} />
                <ToggleRow icon={Globe} title="Searchable" description="Appear in recruiter searches" checked={privacy.searchable} onChange={(v) => setPrivacy((p) => ({ ...p, searchable: v }))} />
                <ToggleRow icon={Shield} title="Usage analytics" description="Share anonymous usage data to improve the product" checked={privacy.analytics} onChange={(v) => setPrivacy((p) => ({ ...p, analytics: v }))} />
              </div>
              <GradientButton size="default" className="mt-5" onClick={savePrivacy}>
                <Save className="h-4 w-4" />
                Save preferences
              </GradientButton>
            </GlassCard>
          </TabsContent>

          {/* Language */}
          <TabsContent value="language">
            <GlassCard className="max-w-lg">
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <Globe className="h-4.5 w-4.5 text-blue-400" />
                Language & Region
              </h3>
              <p className="text-sm text-slate-400">Set your preferred language and region.</p>
              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="border-white/10 bg-white/5 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#111827] text-slate-100">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                      <SelectItem value="te">Telugu</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Region</Label>
                  <Select defaultValue="in">
                    <SelectTrigger className="border-white/10 bg-white/5 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#111827] text-slate-100">
                      <SelectItem value="in">India</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <GradientButton size="default" onClick={() => toast({ title: 'Language settings saved' })}>
                  <Save className="h-4 w-4" />
                  Save preferences
                </GradientButton>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}

import type { LucideIcon } from 'lucide-react';

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 px-4 py-3.5 transition-colors hover:bg-white/[0.02]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-400">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="data-[state=checked]:bg-blue-500" />
    </div>
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
        active ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 bg-white/5 hover:border-white/20'
      )}
    >
      <div
        className={cn(
          'flex h-14 w-20 shrink-0 items-center justify-center rounded-xl border',
          preview === 'dark' ? 'border-white/10 bg-[#0b1220]' : 'border-slate-200 bg-slate-100'
        )}
      >
        <Icon className={cn('h-5 w-5', preview === 'dark' ? 'text-blue-400' : 'text-amber-500')} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      {active && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      )}
    </motion.button>
  );
}
