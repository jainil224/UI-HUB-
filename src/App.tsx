import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import HomePage from './pages/HomePage/HomePage';
import LibraryPage from './pages/LibraryPage/LibraryPage';

function App() {
  const [selectedItem, setSelectedItem] = useState<any>(null);

  return (
    <BrowserRouter>
      <div className="bg-brand-black min-h-screen text-white selection:bg-brand-green selection:text-black">
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
