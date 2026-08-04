import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { SectionHeading } from '@/components/shared';

const faqs = [
  {
    q: 'How does the AI match me to internships?',
    a: 'After you upload your resume, our AI extracts your skills, experience, and education, then computes a semantic similarity score against each internship in our database. The result is a ranked list of roles sorted by how well your profile fits.',
  },
  {
    q: 'What file formats are supported for resume upload?',
    a: 'We support PDF and DOCX files up to 10MB. The parser reads text, sections, and structure to extract your skills, projects, certificates, and experience automatically.',
  },
  {
    q: 'Is my data private and secure?',
    a: 'Yes. Your resume is processed securely and never shared with third parties without your explicit consent. You can delete your data and resume at any time from your settings.',
  },
  {
    q: 'How accurate is the ATS resume score?',
    a: 'Our ATS scoring simulates how applicant tracking systems parse and rank resumes, checking keyword coverage, formatting, and section structure. It is a strong indicator, though each real ATS may weigh factors slightly differently.',
  },
  {
    q: 'Can I use this without a resume yet?',
    a: 'Absolutely. You can explore recommendations, browse the skill gap analysis, and follow a learning roadmap even before uploading a resume — your matches will just improve once you do.',
  },
  {
    q: 'Is it free for students?',
    a: 'Yes, the core matching and learning roadmap features are free for students. Premium features like advanced analytics and priority applications are available on paid plans.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Everything you need to know about how the platform works."
        />

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass overflow-hidden rounded-xl"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-white sm:text-base">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-blue-400"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
