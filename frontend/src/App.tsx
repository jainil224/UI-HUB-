import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
const HomePage = React.lazy(() => import('./pages/HomePage/HomePage'));
const LibraryPage = React.lazy(() => import('./pages/LibraryPage/LibraryPage'));
const FavoritesPage = React.lazy(() => import('./pages/Dashboard/FavoritesPage'));
const LoginPage = React.lazy(() => import('./pages/Auth/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/Auth/SignupPage'));
const Scroll3DAnimationPage = React.lazy(() => import('./pages/Components/Scroll3DAnimationPage'));
const ThreeDSliderPage = React.lazy(() => import('./pages/Components/ThreeDSliderPage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage/PricingPage'));
const DemoPage = React.lazy(() => import('./pages/Components/DemoPage'));

// Wrapper: only shows Navbar + Footer on non-library pages
const AppShell = () => {
  const location = useLocation();
  const isLibrary = location.pathname.startsWith('/library');
  const isAuth = location.pathname === '/login' || location.pathname === '/signup';
  const isDemo = location.pathname.startsWith('/demo');

  return (
    <div className="bg-brand-black min-h-screen text-white selection:bg-brand-green selection:text-black flex flex-col">
      {!isAuth && !isDemo && <Navbar />}

      <main className="flex-1 flex flex-col">
        <React.Suspense fallback={
          <div className="flex-1 flex items-center justify-center bg-brand-black">
            <div className="w-8 h-8 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/demo/:id" element={<DemoPage />} />
            <Route path="/demo/3d-scroll-animation" element={<Scroll3DAnimationPage />} />
            <Route path="/demo/3d-slider" element={<ThreeDSliderPage />} />
            <Route path="/pricing" element={<PricingPage />} />
          </Routes>
        </React.Suspense>
      </main>

      {!isLibrary && !isAuth && !isDemo && <Footer />}
    </div>
  );
};

import SmoothScroll from './components/ui/SmoothScroll';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SmoothScroll>
          <AppShell />
        </SmoothScroll>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
