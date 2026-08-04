import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { SectionHeading, GradientButton } from '@/components/shared';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: '/month',
    description: 'Everything you need to get matched.',
    features: ['1 resume upload / month', 'AI skill extraction', '10 internship matches', 'Basic skill gap report', 'Community support'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/month',
    description: 'For serious internship hunters.',
    features: ['Unlimited resume uploads', 'Unlimited AI matches', 'Full skill gap + roadmap', 'ATS resume scoring', 'Advanced analytics', 'Priority applications'],
    cta: 'Start Pro',
    highlighted: true,
  },
  {
    name: 'Campus',
    price: 'Custom',
    period: '',
    description: 'For colleges and placement cells.',
    features: ['Everything in Pro', 'Bulk student onboarding', 'Placement analytics dashboard', 'Dedicated support', 'Custom integrations'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, transparent pricing"
          description="Start free and upgrade when you are ready. No hidden fees, cancel anytime."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                'relative rounded-2xl p-6',
                plan.highlighted ? 'gradient-border' : 'glass'
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </span>
              )}
              <div className={plan.highlighted ? 'pt-2' : ''}>
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{plan.description}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-slate-400">{plan.period}</span>
                </div>
                <GradientButton
                  to="/upload-resume"
                  className={cn('mt-6 w-full', !plan.highlighted && '!bg-white/5 !text-white hover:!bg-white/10')}
                >
                  {plan.cta}
                </GradientButton>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
