import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { PageTransition, GlassCard, GradientButton, SkillBadge, DomainBadge } from '@/components/shared';
import { Progress } from '@/components/ui/progress';
import { useRecommend, useRecommendResult, getErrorMessage } from '@/hooks';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ACCEPTED = '.pdf,.docx';

export default function UploadResumePage() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const recommend = useRecommend();
  const navigate = useNavigate();
  const { result } = useRecommendResult();
  const done = !!result;

  const handleFile = useCallback(
    (f: File) => {
      const valid = f.type === 'application/pdf' || f.name.endsWith('.docx') || f.name.endsWith('.pdf');
      if (!valid) {
        toast({ title: 'Unsupported file', description: 'Please upload a PDF or DOCX file.', variant: 'destructive' });
        return;
      }
      setFile(f);
      setProgress(0);
      recommend.mutate(
        { file: f, onProgress: setProgress },
        {
          onSuccess: () => {
            setProgress(100);
            toast({
              title: 'Resume analyzed!',
              description: 'Your profile and recommendations are ready.',
            });
          },
          onError: (err) => {
            toast({
              title: 'Upload failed',
              description: getErrorMessage(err),
              variant: 'destructive',
            });
          },
        }
      );
    },
    [recommend]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setFile(null);
    setProgress(0);
    recommend.reset();
  };

  const loading = recommend.isPending;

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Upload Resume</h1>
          <p className="mt-1 text-sm text-slate-400">
            Upload your resume and our AI will extract your profile, predict your domain, and match you to internships.
          </p>
        </div>

        <GlassCard>
          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById('resume-input')?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-all',
                dragOver
                  ? 'border-blue-500/60 bg-blue-500/10'
                  : 'border-white/15 bg-white/[0.02] hover:border-blue-500/40 hover:bg-white/5'
              )}
            >
              <motion.div
                animate={{ y: dragOver ? -6 : 0 }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-[0_10px_40px_-10px_rgba(59,130,246,0.6)]"
              >
                <UploadCloud className="h-8 w-8" />
              </motion.div>
              <h3 className="mt-5 text-lg font-semibold text-white">Drag & drop your resume here</h3>
              <p className="mt-1 text-sm text-slate-400">
                Supports <span className="text-slate-200">PDF</span> and <span className="text-slate-200">DOCX</span>
              </p>
              <div className="mt-6">
                <GradientButton type="button" size="default">
                  <FileText className="h-4 w-4" />
                  Browse files
                </GradientButton>
              </div>
              <input
                id="resume-input"
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <button onClick={reset} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Remove file">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <AnimatePresence>
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-300">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                        Analyzing with AI...
                      </span>
                      <span className="font-semibold text-white">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </GlassCard>

        {/* Result preview */}
        <AnimatePresence>
          {done && result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <GlassCard gradientBorder className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-white">Analysis complete</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Your profile has been extracted and {result.recommendations.length} internship{result.recommendations.length === 1 ? '' : 's'} matched.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <DomainBadge domain={result.predictedDomain} />
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-slate-200">
                    <FileText className="h-3.5 w-3.5 text-blue-400" />
                    {result.profile.resumeScore}/100 ATS
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-slate-200">
                    <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                    {result.profile.skills.length} skills
                  </span>
                </div>

                {result.profile.skills.length > 0 && (
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {result.profile.skills.slice(0, 10).map((s) => (
                      <SkillBadge key={s.name} name={s.name} proficiency={s.proficiency} />
                    ))}
                  </div>
                )}

                <GradientButton size="lg" className="mt-7" onClick={() => navigate('/dashboard')}>
                  View Dashboard
                  <ArrowRight className="h-4.5 w-4.5" />
                </GradientButton>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
