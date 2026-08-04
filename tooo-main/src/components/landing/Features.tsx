import { motion } from 'framer-motion';
import {
  FileText,
  BrainCircuit,
  GitCompareArrows,
  GraduationCap,
  MapPin,
  Gauge,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { SectionHeading } from '@/components/shared';

const features = [
  {
    icon: FileText,
    title: 'Resume Parsing',
    description: 'AI extracts skills, education, projects, and experience from any PDF or DOCX resume automatically.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: BrainCircuit,
    title: 'AI Matching',
    description: 'Semantic matching ranks internships by how well your profile fits each role and technology stack.',
    color: 'from-violet-500 to-violet-600',
  },
  {
    icon: GitCompareArrows,
    title: 'Skill Gap Analysis',
    description: 'Instantly see which skills you are missing for target roles, with priority and learning time estimates.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: GraduationCap,
    title: 'Learning Roadmap',
    description: 'Get a personalized week-by-week learning plan with curated resources to close your skill gaps.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: MapPin,
    title: 'Location Based Matching',
    description: 'Find nearby internships and remote opportunities matched to your preferred location and commute.',
    color: 'from-rose-500 to-pink-600',
  },
  {
    icon: Gauge,
    title: 'ATS Resume Score',
    description: 'See exactly how your resume performs against applicant tracking systems and get improvement tips.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track applications, recommendation accuracy, and skill growth over time with rich visualizations.',
    color: 'from-purple-500 to-fuchsia-600',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy First',
    description: 'Your data stays yours. Resumes are processed securely and never shared without your consent.',
    color: 'from-teal-500 to-emerald-600',
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to land your internship"
          description="A complete AI toolkit that takes you from resume to offer — matching, analysis, and learning in one place."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              whileHover={{ y: -6 }}
              className="group glass relative overflow-hidden rounded-2xl p-6 transition-shadow duration-300 hover:shadow-[0_20px_60px_-20px_rgba(59,130,246,0.35)]"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                <f.icon className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.description}</p>
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
