'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import CanvasLoader from "./components/common/CanvasLoader";
import ScrollWrapper from "./components/common/ScrollWrapper";
import Experience from "./components/experience";
import Footer from "./components/footer";
import Hero from "./components/hero";

export interface CloudScrollProps {
  className?: string;
  showDemoButton?: boolean;
}

const CloudScroll: React.FC<CloudScrollProps> = ({
  className = "",
  showDemoButton = false,
}) => {
  return (
    <div className={`relative w-full h-full min-h-[500px] overflow-hidden bg-[#0690d4] rounded-3xl ${className}`}>
      <CanvasLoader isPreview={showDemoButton}>
        <ScrollWrapper>
          <Hero />
          <Experience />
          <Footer />
        </ScrollWrapper>
      </CanvasLoader>

      {/* View Full Demo Button Overlay - Only shown in Library Preview */}
      {showDemoButton && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <Link
            to="/demo/cloud-scroll"
            target="_blank"
            className="pointer-events-auto no-underline"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center gap-3 px-8 py-3.5 bg-black/75 hover:bg-black/90 backdrop-blur-xl border border-white/20 hover:border-brand-blue rounded-full text-white transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.6)] cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-brand-blue/20 border border-brand-blue/50 text-brand-blue">
                <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 leading-none mb-1">Interactive 3D</span>
                <span className="text-xs font-black uppercase tracking-wider text-white leading-none">View Full Experience</span>
              </div>
            </motion.button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CloudScroll;
