import React, { useState, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import { Menu, X } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export const ThreeDLandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for premium feel
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate normalized mouse position (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    // Reset to center
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-black text-white font-['Gruppo',sans-serif] overflow-hidden relative w-full h-[600px] rounded-3xl"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gruppo&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Sen:wght@400..800&display=swap');

        .landing-nav-link {
          position: relative;
          text-decoration: none;
        }

        .landing-nav-link::after {
          content: "";
          position: absolute;
          width: 100%;
          height: 1px;
          bottom: -4px;
          left: 0;
          background-color: white;
          transform: scaleX(0);
          transform-origin: bottom left;
          transition: transform 0.3s ease-out;
        }

        .landing-nav-link:hover::after {
          transform: scaleX(1);
        }

        .landing-glass-effect {
          background: rgba(95, 93, 93, 0.342);
          backdrop-filter: blur(7px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      <nav className="absolute top-0 left-0 right-0 z-20">
        <div className="container mx-auto px-4 md:px-10 py-4 md:py-10 flex justify-between items-center">
          <div className="text-xl md:text-2xl font-bold">UI HUB</div>
          <div className="hidden md:flex space-x-8 landing-glass-effect !px-6 !py-3">
            <a href="#" className="landing-nav-link">Home</a>
            <a href="#" className="landing-nav-link">Courses</a>
            <a href="#" className="landing-nav-link">Library</a>
            <a href="#" className="landing-nav-link">Resources</a>
          </div>
          <button className="hidden md:block border border-white/50 rounded-full px-4 py-2 hover:bg-white/10 transition">
            Let's Talk
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white border border-white/50 rounded-full px-3 py-1 hover:bg-white/10 transition focus:outline-none"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute inset-0 bg-black/90 z-30 flex flex-col justify-center items-center px-4 md:px-10 landing-glass-effect !rounded-none">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-4 right-4 text-white border border-white/50 rounded-full px-3 py-1 hover:bg-white/10 transition focus:outline-none"
          >
            <X size={24} />
          </button>
          <a href="#" className="text-2xl my-4 hover:text-gray-300 transition-colors duration-300" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#" className="text-2xl my-4 hover:text-gray-300 transition-colors duration-300" onClick={() => setMenuOpen(false)}>Courses</a>
          <a href="#" className="text-2xl my-4 hover:text-gray-300 transition-colors duration-300" onClick={() => setMenuOpen(false)}>Library</a>
          <a href="#" className="text-2xl my-4 hover:text-gray-300 transition-colors duration-300" onClick={() => setMenuOpen(false)}>Resources</a>
          <button className="mt-8 border border-white/50 rounded-full px-6 py-3 hover:bg-white/10 transition text-xl">
            Let's Talk
          </button>
        </div>
      )}

      {/* Spline / GIF */}
      <div className="relative w-full h-full perspective-1000">
        <motion.div 
          className="w-full h-full hidden md:block"
          style={{ 
            rotateX, 
            rotateY,
            transformStyle: "preserve-3d"
          }}
        >
          <Spline scene="https://prod.spline.design/WNmhHpS4PLU16Rji/scene.splinecode" />
        </motion.div>
        
        <img
          src="/assets/3d-landing-animation.gif"
          alt="Animated GIF"
          className="w-full h-full object-cover md:hidden"
        />

        {/* Hero Content */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="container mx-auto h-full flex flex-col justify-end px-4 md:px-10 py-4 md:py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end w-full">
              <div className="mb-8 md:mb-0 max-w-full md:max-w-[50%] landing-glass-effect !px-6 !py-4 pointer-events-auto">
                <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-7xl font-['Sen',sans-serif] font-normal leading-none tracking-tighter mb-4">
                  We Build Next-Gen<br />UI Experiences
                </h1>

              </div>

              <div className="w-full md:w-auto md:text-left landing-glass-effect !px-6 !py-4 pointer-events-auto">
                <p className="text-sm sm:text-base md:text-sm lg:text-lg mb-4 md:mb-6">
                  Designing Next-Gen UI Systems
                  <br className="hidden md:inline" />
                  That Make Brands Unforgettable
                </p>
                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-0 md:space-y-2 lg:space-y-0 lg:space-x-4 md:items-end">
                  <button className="text-xs sm:text-sm md:text-xs lg:text-sm border border-white/50 rounded-full px-3 py-1 md:px-4 md:py-2 hover:bg-white/10 transition w-full sm:w-auto">
                    Explore Work
                  </button>
                  <button className="text-xs sm:text-sm md:text-xs lg:text-sm border border-white/50 rounded-full px-3 py-1 md:px-4 md:py-2 hover:bg-white/10 transition w-full sm:w-auto">
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDLandingPage;
