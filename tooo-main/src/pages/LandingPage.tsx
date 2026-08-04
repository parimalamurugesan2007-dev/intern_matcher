import { PageTransition } from '@/components/shared';
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustedCompanies } from '@/components/landing/TrustedCompanies';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { Testimonials } from '@/components/landing/Testimonials';
import { Statistics } from '@/components/landing/Statistics';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { CTASection } from '@/components/landing/CTASection';

export default function LandingPage() {
  return (
    <PageTransition>
      <HeroSection />
      <TrustedCompanies />
      <HowItWorks />
      <Features />
      <Statistics />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTASection />
    </PageTransition>
  );
}
