/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  Layers, 
  MousePointer2, 
  Layout, 
  Zap, 
  ChevronRight,
  Github,
  Twitter,
  ExternalLink,
  Plus,
  ArrowRight
} from 'lucide-react';

// --- Components ---

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-brand-black/80 backdrop-blur-md border-b border-white/5">
    <Link to="/" className="flex items-center gap-2">
      <div className="w-8 h-8 bg-brand-orange rounded-sm flex items-center justify-center font-display text-xl text-black">U</div>
      <span className="font-heading font-bold text-xl tracking-tighter">UI HUB</span>
    </Link>
    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
      <Link to="/" className="hover:text-brand-orange transition-colors">Home</Link>
      <a href="/#buttons" className="hover:text-brand-orange transition-colors">Buttons</a>
      <a href="/#cards" className="hover:text-brand-orange transition-colors">Cards</a>
      <Link to="/library" className="hover:text-brand-orange transition-colors">Component Library</Link>
      <a href="/#hover" className="hover:text-brand-orange transition-colors">Effects</a>
    </div>
    <div className="flex items-center gap-4">
      <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
        <Github size={20} />
      </button>
      <button className="bg-brand-orange text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-white hover:text-black transition-all">
        Get Started
      </button>
    </div>
  </nav>
);

const SectionHeader = ({ title, subtitle, id }: { title: string; subtitle: string; id: string }) => (
  <div id={id} className="mb-12">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-12 h-[1px] bg-brand-orange" />
      <span className="text-brand-orange text-xs font-bold uppercase tracking-widest">{subtitle}</span>
    </div>
    <h2 className="text-4xl md:text-5xl font-display uppercase tracking-tight">{title}</h2>
  </div>
);

const ButtonShowcase = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <SectionHeader id="buttons" title="Button UI" subtitle="Interactive Actions" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Primary Orange */}
        <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center gap-6 group">
          <button className="bg-brand-orange text-black font-bold px-8 py-3 rounded-lg hover:scale-105 active:scale-95 transition-all orange-glow">
            Primary Action
          </button>
          <span className="text-xs text-white/40 font-mono">.btn-primary</span>
        </div>

        {/* Outline Glow */}
        <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center gap-6 group">
          <button className="border border-brand-orange text-brand-orange font-bold px-8 py-3 rounded-lg hover:bg-brand-orange hover:text-black transition-all">
            Outline Glow
          </button>
          <span className="text-xs text-white/40 font-mono">.btn-outline</span>
        </div>

        {/* Ghost with Icon */}
        <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center gap-6 group">
          <button className="flex items-center gap-2 text-white font-medium hover:text-brand-orange transition-colors">
            Learn More <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <span className="text-xs text-white/40 font-mono">.btn-ghost</span>
        </div>

        {/* Minimal Dark */}
        <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center gap-6 group">
          <button className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-brand-orange transition-colors">
            Minimal Dark
          </button>
          <span className="text-xs text-white/40 font-mono">.btn-pill</span>
        </div>
      </div>
    </section>
  );
};

const CardShowcase = () => {
  return (
    <section className="py-24 px-6 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <SectionHeader id="cards" title="Card UI" subtitle="Content Containers" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="glass p-8 rounded-3xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
              <Zap size={40} className="text-brand-orange" />
            </div>
            <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center mb-6">
              <Zap size={24} className="text-brand-orange" />
            </div>
            <h3 className="text-2xl font-bold mb-4">High Performance</h3>
            <p className="text-white/60 leading-relaxed mb-6">
              Optimized for speed and efficiency. Built with the latest technologies to ensure your UI stays snappy.
            </p>
            <button className="flex items-center gap-2 text-sm font-bold text-brand-orange group-hover:gap-4 transition-all">
              EXPLORE <ChevronRight size={16} />
            </button>
          </motion.div>

          {/* Image Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 group"
          >
            <div className="h-48 bg-gradient-to-br from-brand-orange to-orange-900 relative overflow-hidden">
              <img 
                src="https://picsum.photos/seed/ui/800/600" 
                alt="UI" 
                className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold">Visual Assets</h3>
                <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter">Premium</span>
              </div>
              <p className="text-white/60 text-sm mb-6">
                Curated collection of high-quality visual elements for your next project.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px]">
                      U{i}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-white/40">+120 users</span>
              </div>
            </div>
          </motion.div>

          {/* Minimal Stat Card */}
          <div className="glass p-8 rounded-3xl flex flex-col justify-between border-l-4 border-l-brand-orange">
            <div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Total Components</span>
              <div className="text-6xl font-display mt-2">1,240</div>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                <ArrowUpRight size={16} />
                <span>+12% this month</span>
              </div>
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-orange hover:text-black transition-colors">
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HoverEffectShowcase = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <SectionHeader id="hover" title="Hover Effects" subtitle="Interactive Feedback" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Reveal Effect */}
        <div className="relative h-64 rounded-3xl overflow-hidden group cursor-pointer">
          <img 
            src="https://picsum.photos/seed/minimal/1200/800" 
            alt="Minimal" 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-colors duration-500" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <h3 className="text-3xl font-display uppercase tracking-tight mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Reveal Content</h3>
            <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-sm max-w-xs">
              Hover to reveal the full beauty and details of the underlying component.
            </p>
          </div>
        </div>

        {/* Magnetic Button Simulation */}
        <div className="glass rounded-3xl flex items-center justify-center p-12 relative overflow-hidden">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-32 h-32 rounded-full bg-brand-orange flex items-center justify-center text-black font-bold cursor-pointer relative z-10"
          >
            DRAG ME
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="w-64 h-64 border border-white rounded-full animate-ping" />
          </div>
        </div>
      </div>
    </section>
  );
};

const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-orange/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-orange/5 blur-[120px] rounded-full" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest mb-8">
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
          v2.0 is now live
        </div>
        
        <h1 className="text-7xl md:text-[10rem] font-display leading-[0.85] uppercase tracking-tighter mb-8">
          Craft the <br />
          <span className="text-brand-orange">Future</span> of UI
        </h1>
        
        <p className="max-w-xl mx-auto text-white/60 text-lg md:text-xl mb-12 font-light leading-relaxed">
          A curated collection of minimal, high-performance UI components built for modern web experiences. Simple, bold, and effective.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button className="w-full sm:w-auto bg-brand-orange text-black font-bold px-10 py-4 rounded-full text-lg hover:scale-105 active:scale-95 transition-all orange-glow">
            Explore Components
          </button>
          <button className="w-full sm:w-auto glass text-white font-bold px-10 py-4 rounded-full text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            Documentation <ExternalLink size={18} />
          </button>
        </div>
      </motion.div>

      {/* Floating Elements Inspired by References */}
      <div className="mt-24 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50 hover:opacity-100 transition-opacity duration-700">
        <div className="glass p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
            <Layers size={24} className="text-brand-orange" />
          </div>
          <div>
            <div className="text-xs text-white/40 font-bold uppercase tracking-widest">Components</div>
            <div className="text-xl font-bold">500+ Assets</div>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
            <MousePointer2 size={24} className="text-brand-orange" />
          </div>
          <div>
            <div className="text-xs text-white/40 font-bold uppercase tracking-widest">Interactions</div>
            <div className="text-xl font-bold">Smooth Motion</div>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
            <Layout size={24} className="text-brand-orange" />
          </div>
          <div>
            <div className="text-xs text-white/40 font-bold uppercase tracking-widest">Layouts</div>
            <div className="text-xl font-bold">Bento Grids</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-12 px-6 border-t border-white/5 bg-black">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-orange rounded-sm flex items-center justify-center font-display text-xl text-black">U</div>
        <span className="font-heading font-bold text-xl tracking-tighter">UI HUB</span>
      </div>
      <div className="text-white/40 text-sm">
        © 2024 UI HUB. Crafted with passion for the web.
      </div>
      <div className="flex items-center gap-6">
        <Twitter size={20} className="text-white/40 hover:text-brand-orange cursor-pointer transition-colors" />
        <Github size={20} className="text-white/40 hover:text-brand-orange cursor-pointer transition-colors" />
        <div className="w-[1px] h-4 bg-white/10" />
        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Status: Operational</span>
      </div>
    </div>
  </footer>
);

const AssetsShowcase = () => {
  const assets = [
    {
      category: "Text Animations",
      items: [
        { name: "Split Text" },
        { name: "Blur Text" },
        { name: "Circular Text" },
        { name: "Text Type" },
        { name: "Shuffle" },
        { name: "Shiny Text", status: "Updated" },
        { name: "Text Pressure" },
        { name: "Curved Loop" },
        { name: "Fuzzy Text", status: "Updated" },
        { name: "Gradient Text", status: "Updated" },
        { name: "Falling Text" },
        { name: "Text Cursor" },
        { name: "Decrypted Text" },
        { name: "True Focus" },
      ]
    },
    {
      category: "Animations",
      items: [
        { name: "Animated Content" },
        { name: "Fade Content" },
        { name: "Electric Border", status: "Updated" },
        { name: "Orbit Images", status: "New" },
        { name: "Pixel Transition" },
        { name: "Glare Hover" },
        { name: "Antigravity", status: "New" },
        { name: "Logo Loop" },
        { name: "Target Cursor" },
        { name: "Laser Flow" },
        { name: "Magnet Lines" },
      ]
    },
    {
      category: "Backgrounds",
      items: [
        { name: "Liquid Ether" },
        { name: "Prism" },
        { name: "Dark Veil" },
        { name: "Light Pillar", status: "New" },
        { name: "Silk" },
        { name: "Floating Lines", status: "New" },
        { name: "Light Rays" },
        { name: "Pixel Blast" },
        { name: "Color Bends", status: "New" },
        { name: "Aurora" },
        { name: "Plasma" },
        { name: "Particles" },
        { name: "Gradient Blinds" },
        { name: "Grainient", status: "New" },
      ]
    }
  ];

  return (
    <section className="py-24 px-6 bg-brand-black">
      <div className="max-w-7xl mx-auto">
        <SectionHeader id="assets" title="Component Library" subtitle="Ready-to-use Assets" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {assets.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-6">
              <h3 className="text-xl font-heading font-bold text-white/90 border-l-2 border-brand-orange pl-4">
                {group.category}
              </h3>
              <ul className="space-y-3">
                {group.items.map((item, i) => (
                  <li key={i} className="group flex items-center justify-between py-1 cursor-pointer">
                    <span className="text-white/50 group-hover:text-brand-orange transition-colors duration-300 font-medium">
                      {item.name}
                    </span>
                    {item.status && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                        item.status === 'New' ? 'bg-brand-orange text-black' : 'border border-white/20 text-white/40'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HomePage = () => (
  <>
    <Hero />
    <ButtonShowcase />
    <CardShowcase />
    <HoverEffectShowcase />
  </>
);

const LibraryPage = () => (
  <div className="pt-20">
    <AssetsShowcase />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
