import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/components/shared';
import { ScrollToTop } from '@/components/ScrollToTop';
import { RecommendProvider } from '@/hooks/RecommendContext';
import { MarketingLayout } from '@/layouts';
import { DashboardLayout } from '@/layouts';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const UploadResumePage = lazy(() => import('@/pages/UploadResumePage'));
const RecommendationsPage = lazy(() => import('@/pages/RecommendationsPage'));
const SkillGapPage = lazy(() => import('@/pages/SkillGapPage'));
const LearningRoadmapPage = lazy(() => import('@/pages/LearningRoadmapPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function LoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RecommendProvider>
        <ScrollToTop />
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Marketing routes */}
              <Route element={<MarketingLayout />}>
                <Route path="/" element={<LandingPage />} />
              </Route>

              {/* Dashboard routes */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/upload-resume" element={<UploadResumePage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/skill-gap" element={<SkillGapPage />} />
                <Route path="/learning-roadmap" element={<LearningRoadmapPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </RecommendProvider>
    </ThemeProvider>
  );
}
