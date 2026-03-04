import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import HomePage from './pages/HomePage/HomePage';
import LibraryPage from './pages/LibraryPage/LibraryPage';

// Wrapper: only shows Navbar + Footer on non-library pages
const AppShell = () => {
  const location = useLocation();
  const isLibrary = location.pathname.startsWith('/library');

  return (
    <div className="bg-brand-black min-h-screen text-white selection:bg-brand-green selection:text-black">
      {!isLibrary && <Navbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/library" element={<LibraryPage />} />
      </Routes>

      {!isLibrary && <Footer />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
