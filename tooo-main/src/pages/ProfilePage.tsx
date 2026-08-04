import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Github,
  Linkedin,
  Globe,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Award,
  FolderGit2,
  Briefcase,
  Sparkles,
  FileText,
  MapPin,
  Pencil,
} from 'lucide-react';
import { PageTransition, GlassCard, SkillBadge, BlobBackground, DomainBadge, EmptyState, GradientButton } from '@/components/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRecommendResult } from '@/hooks';
import { getInitials } from '@/utils/format';
import { toast } from '@/hooks/use-toast';
import type { LucideIcon } from 'lucide-react';

export default function ProfilePage() {
  const { result } = useRecommendResult();
  const [editing, setEditing] = useState(false);

  if (!result) {
    return (
      <PageTransition>
        <EmptyState
          icon={FileText}
          title="No profile yet"
          description="Upload your resume to let AI extract your profile."
          action={<GradientButton to="/upload-resume" size="lg"><FileText className="h-4.5 w-4.5" />Upload Resume</GradientButton>}
        />
      </PageTransition>
    );
  }

  const { profile, predictedDomain } = result;
  const name = profile.name || 'Your Profile';

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Profile</h1>
          <p className="mt-1 text-sm text-slate-400">Extracted from your resume by AI.</p>
        </div>

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl">
          <BlobBackground variant="subtle" />
          <div className="relative z-10 glass-strong rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand-gradient text-3xl font-bold text-white shadow-[0_10px_40px_-10px_rgba(59,130,246,0.6)] ring-2 ring-white/10">
                {getInitials(name)}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white">{name}</h2>
                {profile.degree && <p className="text-sm text-slate-400">{profile.degree}</p>}
                {profile.college && <p className="text-sm text-slate-400">{profile.college}</p>}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <DomainBadge domain={predictedDomain} size="sm" />
                  {profile.github && <SocialLink href={profile.github} icon={Github} label="GitHub" />}
                  {profile.linkedin && <SocialLink href={profile.linkedin} icon={Linkedin} label="LinkedIn" />}
                  {profile.portfolio && <SocialLink href={profile.portfolio} icon={Globe} label="Portfolio" />}
                  {profile.email && <SocialLink href={`mailto:${profile.email}`} icon={Mail} label="Email" />}
                </div>
              </div>
              <GradientButton size="default" onClick={() => { setEditing((e) => !e); if (editing) toast({ title: 'Profile updated' }); }}>
                <Pencil className="h-4 w-4" />
                {editing ? 'Save Changes' : 'Edit Profile'}
              </GradientButton>
            </div>
          </div>
        </div>

        <Tabs defaultValue="info" className="space-y-5">
          <TabsList className="glass h-auto gap-1 rounded-xl p-1.5">
            <TabsTrigger value="info" className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white">Personal Info</TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white">Skills</TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white">Projects</TabsTrigger>
            <TabsTrigger value="resume" className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white">Education & Experience</TabsTrigger>
          </TabsList>

          {/* Personal info */}
          <TabsContent value="info" className="space-y-4">
            <GlassCard>
              <h3 className="text-base font-semibold text-white">Personal Information</h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InfoRow icon={Pencil} label="Full Name" value={profile.name} />
                <InfoRow icon={Mail} label="Email" value={profile.email} />
                <InfoRow icon={Phone} label="Phone" value={profile.phone} />
                <InfoRow icon={MapPin} label="Location" value={profile.location} />
                <InfoRow icon={Building2} label="College" value={profile.college} />
                <InfoRow icon={GraduationCap} label="Degree" value={profile.degree} />
              </div>
              {profile.summary && (
                <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Summary</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{profile.summary}</p>
                </div>
              )}
            </GlassCard>
          </TabsContent>

          {/* Skills */}
          <TabsContent value="skills" className="space-y-4">
            <GlassCard>
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <Sparkles className="h-4.5 w-4.5 text-blue-400" />
                Skills ({profile.skills.length})
              </h3>
              {profile.skills.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">No skills were extracted from your resume.</p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <SkillBadge key={s.name} name={s.name} proficiency={s.proficiency} />
                  ))}
                </div>
              )}
            </GlassCard>
          </TabsContent>

          {/* Projects */}
          <TabsContent value="projects" className="space-y-4">
            {profile.projects.length === 0 ? (
              <GlassCard><p className="text-sm text-slate-400">No projects were detected in your resume.</p></GlassCard>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {profile.projects.map((p, i) => (
                  <GlassCard key={i} hover>
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="h-4.5 w-4.5 text-blue-400" />
                      <h3 className="text-base font-semibold text-white">{p.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{p.description}</p>
                    {p.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.technologies.map((t) => <SkillBadge key={t} name={t} />)}
                      </div>
                    )}
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                        <Github className="h-3.5 w-3.5" /> View project
                      </a>
                    )}
                  </GlassCard>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Education + experience */}
          <TabsContent value="resume" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <GlassCard>
                <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                  <GraduationCap className="h-4.5 w-4.5 text-blue-400" /> Education
                </h3>
                <div className="mt-4 space-y-3">
                  {profile.education.length === 0 ? (
                    <p className="text-sm text-slate-400">No education entries detected.</p>
                  ) : (
                    profile.education.map((edu, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold text-white">{edu.institution}</p>
                        <p className="text-xs text-slate-400">{edu.degree}{edu.field ? ` · ${edu.field}` : ''}</p>
                        {(edu.startYear || edu.endYear) && <p className="mt-1 text-xs text-slate-500">{edu.startYear} – {edu.endYear}{edu.gpa ? ` · GPA ${edu.gpa}` : ''}</p>}
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                  <Briefcase className="h-4.5 w-4.5 text-blue-400" /> Experience
                </h3>
                <div className="mt-4 space-y-3">
                  {profile.experience.length === 0 ? (
                    <p className="text-sm text-slate-400">No experience entries detected.</p>
                  ) : (
                    profile.experience.map((exp, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold text-white">{exp.role}{exp.company ? ` · ${exp.company}` : ''}</p>
                        {(exp.start || exp.end) && <p className="text-xs text-slate-500">{exp.start} – {exp.end ?? 'Present'}</p>}
                        {exp.description && <p className="mt-2 text-sm text-slate-400">{exp.description}</p>}
                      </div>
                    ))
                  )}
                </div>

                {profile.certificates.length > 0 && (
                  <div className="mt-5">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Award className="h-4 w-4 text-emerald-400" /> Certificates
                    </h4>
                    <div className="mt-3 space-y-2">
                      {profile.certificates.map((c, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400"><Award className="h-4 w-4" /></div>
                          <div><p className="text-sm font-medium text-white">{c.title}</p><p className="text-xs text-slate-400">{c.issuer}{c.date ? ` · ${c.date}` : ''}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}

function SocialLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:border-blue-500/40 hover:text-blue-400" aria-label={label}>
      <Icon className="h-4 w-4" />
    </a>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-400"><Icon className="h-4 w-4" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-white">{value || '—'}</p>
      </div>
    </div>
  );
}
