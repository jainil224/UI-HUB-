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
}

const CloudScroll: React.FC<CloudScrollProps> = ({
  className = "",
}) => {
  return (
    <div className={`relative w-full h-full min-h-[500px] overflow-hidden bg-[#0690d4] rounded-3xl ${className}`}>
      <CanvasLoader>
        <ScrollWrapper>
          <Hero />
          <Experience />
          <Footer />
        </ScrollWrapper>
      </CanvasLoader>
    </div>
  );
};

export default CloudScroll;
