import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import HomePage from './pages/HomePage/HomePage';
import LibraryPage from './pages/LibraryPage/LibraryPage';
import FavoritesPage from './pages/Dashboard/FavoritesPage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';

// Wrapper: only shows Navbar + Footer on non-library pages
const AppShell = () => {
  const location = useLocation();
  const isLibrary = location.pathname.startsWith('/library');
  const isAuth = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="bg-brand-black min-h-screen text-white selection:bg-brand-green selection:text-black">
      {!isAuth && <Navbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>

      {!isLibrary && !isAuth && <Footer />}
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
