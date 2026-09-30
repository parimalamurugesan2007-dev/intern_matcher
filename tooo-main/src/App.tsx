import { lazy, Suspense, type ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/components/shared';
import { ScrollToTop } from '@/components/ScrollToTop';
import { RecommendProvider } from '@/hooks/RecommendContext';
import { AuthProvider, useAuth } from '@/hooks/AuthContext';
import { MarketingLayout } from '@/layouts';
import { DashboardLayout } from '@/layouts';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const UploadResumePage = lazy(() => import('@/pages/UploadResumePage'));
const RecommendationsPage = lazy(() => import('@/pages/RecommendationsPage'));
const BrowsePage = lazy(() => import('@/pages/BrowserPage'));
const SkillGapPage = lazy(() => import('@/pages/SkillGapPage'));
const LearningRoadmapPage = lazy(() => import('@/pages/LearningRoadmapPage'));
const SavedPage = lazy(() => import('@/pages/SavedPage'));
const ApplicationsPage = lazy(() => import('@/pages/ApplicationsPage'));
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

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RecommendProvider>
          <ScrollToTop />
          <Suspense fallback={<LoadingFallback />}>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Marketing routes */}
                <Route element={<MarketingLayout />}>
                  <Route path="/" element={<LandingPage />} />
                </Route>

                {/* Auth routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Dashboard routes (protected) */}
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
                  <Route path="/upload-resume" element={<RequireAuth><UploadResumePage /></RequireAuth>} />
                  <Route path="/recommendations" element={<RequireAuth><RecommendationsPage /></RequireAuth>} />
                  <Route path="/browse" element={<RequireAuth><BrowsePage /></RequireAuth>} />
                  <Route path="/skill-gap" element={<RequireAuth><SkillGapPage /></RequireAuth>} />
                  <Route path="/learning-roadmap" element={<RequireAuth><LearningRoadmapPage /></RequireAuth>} />
                  <Route path="/saved" element={<RequireAuth><SavedPage /></RequireAuth>} />
                  <Route path="/applications" element={<RequireAuth><ApplicationsPage /></RequireAuth>} />
                  <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                  <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </RecommendProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
