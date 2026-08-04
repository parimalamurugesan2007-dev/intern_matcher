import { motion } from 'framer-motion';
import { Upload, BrainCircuit, Target, GraduationCap } from 'lucide-react';
import { SectionHeading } from '@/components/shared';

const steps = [
  {
    icon: Upload,
    title: 'Upload Resume',
    description: 'Drop your PDF or DOCX resume. Our parser reads it in seconds — no manual data entry.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: BrainCircuit,
    title: 'AI Analysis',
    description: 'AI extracts your skills, education, projects, and experience, then scores your resume for ATS.',
    color: 'from-violet-500 to-violet-600',
  },
  {
    icon: Target,
    title: 'Skill Matching',
    description: 'We match your profile against thousands of internships and rank them by compatibility.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: GraduationCap,
    title: 'Learning Roadmap',
    description: 'Close the gap with a week-by-week learning plan tailored to your target roles.',
    color: 'from-amber-500 to-orange-600',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From resume to internship in four steps"
          description="A guided pipeline that turns your resume into matched opportunities and a clear plan forward."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative"
            >
              <div className="glass relative h-full overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_-20px_rgba(59,130,246,0.35)]">
                <div className="mb-5 flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} text-white shadow-lg`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-4xl font-bold text-white/10 transition-colors group-hover:text-white/15">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.description}</p>
              </div>
              {/* connector arrow (desktop) */}
              {i < steps.length - 1 && (
                <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                  <ArrowConnector />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArrowConnector() {
  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="text-blue-500/50"
      animate={{ x: [0, 4, 0] }}
      transition={{ duration: 1.6, repeat: Infinity }}
    >
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}
