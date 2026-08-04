import { Outlet } from 'react-router-dom';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

export function MarketingLayout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <MarketingNavbar />
      <main>
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
}
