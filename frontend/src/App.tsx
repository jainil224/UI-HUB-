import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
const HomePage = React.lazy(() => import('./pages/HomePage/HomePage'));
const LibraryPage = React.lazy(() => import('./pages/LibraryPage/LibraryPage'));
const FavoritesPage = React.lazy(() => import('./pages/Dashboard/FavoritesPage'));
const LoginPage = React.lazy(() => import('./pages/Auth/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/Auth/SignupPage'));
const ForgotPassword = React.lazy(() => import('./pages/Auth/ForgotPassword'));
const Scroll3DAnimationPage = React.lazy(() => import('./pages/Components/Scroll3DAnimationPage'));
const ThreeDSliderPage = React.lazy(() => import('./pages/Components/ThreeDSliderPage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage/PricingPage'));
const SectionScrollPage = React.lazy(() => import('./pages/Components/SectionScrollPage'));
const CloudScrollPage = React.lazy(() => import('./pages/Components/CloudScrollPage'));
const DemoPage = React.lazy(() => import('./pages/Components/DemoPage'));
import ScrollToTop from './components/ui/ScrollToTop';
import FourierFlow from './components/ui/FourierFlow';
import { SkeletonProvider } from './context/SkeletonContext';
import { HeroSkeleton } from './components/ui/Skeleton';


// Wrapper: only shows Navbar + Footer on non-library pages
const AppShell = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const isLibrary = location.pathname.startsWith('/library');
  const isAuth = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password';
  const isDemo = location.pathname.startsWith('/demo');

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-brand-black text-white selection:bg-brand-green selection:text-black' 
        : 'bg-[#CFE6F7] text-[#0A0F14] selection:bg-[#5FA3D6] selection:text-white'
    }`}>
      {!isAuth && !isDemo && <Navbar />}

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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/demo/3d-scroll-animation" element={<Scroll3DAnimationPage />} />
            <Route path="/demo/3d-slider" element={<ThreeDSliderPage />} />
            <Route path="/demo/section-scroll" element={<SectionScrollPage />} />
            <Route path="/demo/cloud-scroll" element={<CloudScrollPage />} />
            <Route path="/demo/:id" element={<DemoPage />} />
            <Route path="/pricing" element={<PricingPage />} />
          </Routes>
        </React.Suspense>
      </main>

      {!isLibrary && !isAuth && !isDemo && <Footer />}
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
