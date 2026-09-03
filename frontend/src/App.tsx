import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
const HomePage = React.lazy(() => import('./pages/HomePage/HomePage'));
const LibraryPage = React.lazy(() => import('./pages/LibraryPage/LibraryPage'));
const FavoritesPage = React.lazy(() => import('./pages/Dashboard/FavoritesPage'));
const DashboardLayout = React.lazy(() => import('./pages/Dashboard/DashboardLayout'));
const MCPPage = React.lazy(() => import('./pages/Dashboard/MCPPage'));
const LoginPage = React.lazy(() => import('./pages/Auth/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/Auth/SignupPage'));
const ForgotPassword = React.lazy(() => import('./pages/Auth/ForgotPassword'));
const Scroll3DAnimationPage = React.lazy(() => import('./pages/Components/Scroll3DAnimationPage'));
const ThreeDSliderPage = React.lazy(() => import('./pages/Components/ThreeDSliderPage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage/PricingPage'));
const TemplatesPage = React.lazy(() => import('./pages/TemplatesPage/TemplatesPage'));
const TemplateDetailPage = React.lazy(() => import('./pages/TemplatesPage/TemplateDetailPage'));
const SectionScrollPage = React.lazy(() => import('./pages/Components/SectionScrollPage'));
const CloudScrollPage = React.lazy(() => import('./pages/Components/CloudScrollPage'));
const TarsDemoPage = React.lazy(() => import('./pages/Components/TarsDemoPage'));
const SplitOrbDemoPage = React.lazy(() => import('./pages/Components/SplitOrbDemoPage'));
const SegmintDemoPage = React.lazy(() => import('./pages/Components/SegmintDemoPage'));
const HaosDemoPage = React.lazy(() => import('./pages/Components/HaosDemoPage'));
const MentalityDemoPage = React.lazy(() => import('./pages/Components/MentalityDemoPage'));
const DemoPage = React.lazy(() => import('./pages/Components/DemoPage'));
const AdminGuard = React.lazy(() => import('./pages/Admin/AdminGuard'));
const AdminLayout = React.lazy(() => import('./pages/Admin/AdminLayout'));
const OverviewPage = React.lazy(() => import('./pages/Admin/OverviewPage'));
const AnalyticsPage = React.lazy(() => import('./pages/Admin/AnalyticsPage'));
const ToolsPage = React.lazy(() => import('./pages/Admin/ToolsPage'));
const PlaygroundPage = React.lazy(() => import('./pages/Admin/PlaygroundPage'));
const ComponentsPage = React.lazy(() => import('./pages/Admin/ComponentsPage'));
const SearchPage = React.lazy(() => import('./pages/Admin/SearchPage'));
const UsersPage = React.lazy(() => import('./pages/Admin/UsersPage'));
const UserDetailPage = React.lazy(() => import('./pages/Admin/UserDetailPage'));
const ApiKeysPage = React.lazy(() => import('./pages/Admin/ApiKeysPage'));
const LogsPage = React.lazy(() => import('./pages/Admin/LogsPage'));
const SecurityPage = React.lazy(() => import('./pages/Admin/SecurityPage'));
const HealthPage = React.lazy(() => import('./pages/Admin/HealthPage'));
const AlertsPage = React.lazy(() => import('./pages/Admin/AlertsPage'));
const SettingsPage = React.lazy(() => import('./pages/Admin/SettingsPage'));
const AuditPage = React.lazy(() => import('./pages/Admin/AuditPage'));
const ExportPage = React.lazy(() => import('./pages/Admin/ExportPage'));
import ScrollToTop from './components/ui/ScrollToTop';
import FourierFlow from './components/ui/FourierFlow';
import { SkeletonProvider } from './context/SkeletonContext';
import { HeroSkeleton } from './components/ui/Skeleton';
import TopLoader from './components/ui/TopLoader';
import { triggerBackgroundComponentSync } from './utils/componentSync';


// Wrapper: only shows Navbar + Footer on non-library pages
const AppShell = () => {
  const { theme } = useTheme();
  const location = useLocation();

  React.useEffect(() => {
    triggerBackgroundComponentSync();
  }, []);
  const isLibrary = location.pathname.startsWith('/library');
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAdmin = location.pathname.startsWith('/admin');
  const isAuth = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password';
  const isDemo = location.pathname.startsWith('/demo');

  return (
    <div className={`min-h-[100dvh] flex flex-col transition-colors duration-300 ${
      isDemo
        ? 'bg-neutral-950 text-white'
        : theme === 'dark'
          ? 'bg-brand-black text-white selection:bg-brand-green selection:text-black'
          : 'bg-[#CFE6F7] text-[#0A0F14] selection:bg-[#5FA3D6] selection:text-white'
    }`}>
      <TopLoader />
      {!isDemo && !isAdmin && <Navbar />}

      <main className="flex-1 flex flex-col">
        <React.Suspense fallback={
          <div className="w-full flex-1 flex flex-col">
            <HeroSkeleton />
          </div>
        }>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard/mcp" replace />} />
                <Route path="mcp" element={<MCPPage />} />
            </Route>
            <Route path="/mcp" element={<Navigate to="/dashboard/mcp" replace />} />
            <Route path="/admin/mcp" element={<AdminGuard />}>
                <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/mcp/overview" replace />} />
                    <Route path="overview" element={<OverviewPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="tools" element={<ToolsPage />} />
                    <Route path="playground" element={<PlaygroundPage />} />
                    <Route path="components" element={<ComponentsPage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="users/:uid" element={<UserDetailPage />} />
                    <Route path="api-keys" element={<ApiKeysPage />} />
                    <Route path="logs" element={<LogsPage />} />
                    <Route path="security" element={<SecurityPage />} />
                    <Route path="health" element={<HealthPage />} />
                    <Route path="alerts" element={<AlertsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="audit" element={<AuditPage />} />
                    <Route path="export" element={<ExportPage />} />
                </Route>
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/demo/3d-scroll-animation" element={<Scroll3DAnimationPage />} />
            <Route path="/demo/3d-slider" element={<ThreeDSliderPage />} />
            <Route path="/demo/section-scroll" element={<SectionScrollPage />} />
            <Route path="/demo/cloud-scroll" element={<CloudScrollPage />} />
            <Route path="/demo/tars-hero-arena" element={<TarsDemoPage />} />
            <Route path="/demo/split-fuzzy-orb" element={<SplitOrbDemoPage />} />
            <Route path="/demo/segmint-2026" element={<SegmintDemoPage />} />
            <Route path="/demo/haos-tech-solutions" element={<HaosDemoPage />} />
            <Route path="/demo/mentality" element={<MentalityDemoPage />} />
            <Route path="/demo/:id" element={<DemoPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/templates/:id" element={<TemplateDetailPage />} />
          </Routes>
        </React.Suspense>
      </main>

      {!isLibrary && !isAuth && !isDemo && !isDashboard && !isAdmin && <Footer />}
      <ScrollToTop />
    </div>
  );
};

import SmoothScroll from './components/ui/SmoothScroll';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SkeletonProvider>
            <SmoothScroll>
              <AppShell />
            </SmoothScroll>
          </SkeletonProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
