import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ── Web Audio Synthesizer ──────────────────────────────────────────
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  playSplash() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  playChime() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((f, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.06);
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.06 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.06);
        osc.stop(this.ctx.currentTime + i * 0.06 + 0.3);
      });
    } catch {}
  }
}

const soundFx = new SoundEffects();

// ── Three.js Background Canvas ─────────────────────────────────────
interface ThreeCanvasProps {
  mouseX: number;
  mouseY: number;
}

const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ mouseX, mouseY }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x65d9ef, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7e6, 2.0);
    sunLight.position.set(10, 20, 15);
    scene.add(sunLight);

    const blueBounce = new THREE.DirectionalLight(0x23b8db, 1.5);
    blueBounce.position.set(-10, -10, 10);
    scene.add(blueBounce);

    const waveRingGeo = new THREE.RingGeometry(2.5, 4.8, 32);
    const waveRingMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
    });
    const waveRing = new THREE.Mesh(waveRingGeo, waveRingMat);
    waveRing.rotation.x = -Math.PI / 2.3;
    waveRing.position.set(0.8, -4.2, -1);
    scene.add(waveRing);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        waveRing.scale.setScalar(1 + Math.sin(elapsed * 1.5) * 0.04);
        camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.8 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      waveRingGeo.dispose();
      waveRingMat.dispose();
    };
  }, [mouseX, mouseY]);

  return <div ref={mountRef} id="three-webgl-canvas" className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-hidden" />;
};

// ── Background Layer ───────────────────────────────────────────────
interface BackgroundProps {
  parallaxX: number;
  parallaxY: number;
}

const Background: React.FC<BackgroundProps> = ({ parallaxX, parallaxY }) => {
  return (
    <div
      id="atmospheric-background"
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none -z-20"
      style={{
        background: 'linear-gradient(180deg, #4CCBE8 0%, #59D1EA 25%, #65D9EF 50%, #D4F4FA 82%, #F2FAFC 100%)',
      }}
    >
      {/* Halftone / Fine Grain Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-overlay pointer-events-none">
        <filter id="grainFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grainFilter)" />
      </svg>

      {/* Atmospheric Soft Light Diffusion */}
      <div className="absolute top-[15%] left-[20%] w-[60vw] h-[50vh] rounded-full bg-white/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-0 right-0 h-[35vh] bg-gradient-to-t from-white/90 via-white/40 to-transparent pointer-events-none" />

      {/* Outlined "KUAISHOU" Typography */}
      <div
        id="secondary-word-kuaishou"
        className="absolute right-[8vw] top-[18vh] z-0 pointer-events-none"
        style={{
          transform: `translate3d(${parallaxX * 0.15}px, ${parallaxY * 0.15}px, 0)`,
          transition: 'transform 0.25s ease-out',
        }}
      >
        <span
          className="text-[38px] sm:text-[48px] md:text-[56px] font-[900] tracking-[0.04em] uppercase italic select-none"
          style={{
            fontFamily: "'Archivo Black', 'Montserrat', sans-serif",
            WebkitTextStroke: '1.6px rgba(255, 255, 255, 0.72)',
            color: 'transparent',
            letterSpacing: '0.05em',
          }}
        >
          KUAISHOU
        </span>
      </div>

      {/* Giant Blurred "PAIPAI" Typography & Spaced Subtitle */}
      <div
        id="giant-paipai-container"
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0"
        style={{
          transform: `translate3d(${parallaxX * 0.1}px, ${parallaxY * 0.1}px, 0)`,
          transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.4, 1)',
        }}
      >
        <div className="relative w-full flex flex-col items-center justify-center px-[3vw]">
          <h1
            id="giant-paipai-text"
            className="w-full text-center text-white font-[900] uppercase select-none leading-[0.88] m-0 tracking-[-0.045em] drop-shadow-[0_4px_30px_rgba(255,255,255,0.25)]"
            style={{
              fontFamily: "'Montserrat', 'Archivo Black', sans-serif",
              fontSize: 'clamp(120px, 20vw, 290px)',
              color: '#FFFFFF',
              filter: 'blur(8px)',
              WebkitFilter: 'blur(8px)',
            }}
          >
            PAIPAI
          </h1>

          <div
            id="spaced-kuaishou-culture"
            className="w-full max-w-[88vw] flex justify-between items-center text-white font-[800] uppercase text-[11px] sm:text-[14px] md:text-[16px] tracking-[0.35em] sm:tracking-[0.7em] md:tracking-[1.1em] mt-[10px] sm:mt-[18px] opacity-95 select-none"
            style={{ fontFamily: "'Montserrat', 'Space Mono', sans-serif" }}
          >
            <span className="flex-1 text-center">K</span>
            <span className="flex-1 text-center">U</span>
            <span className="flex-1 text-center">A</span>
            <span className="flex-1 text-center">I</span>
            <span className="flex-1 text-center">S</span>
            <span className="flex-1 text-center">H</span>
            <span className="flex-1 text-center">O</span>
            <span className="flex-1 text-center">U</span>
            <span className="w-[30px] sm:w-[60px]" />
            <span className="flex-1 text-center">C</span>
            <span className="flex-1 text-center">U</span>
            <span className="flex-1 text-center">L</span>
            <span className="flex-1 text-center">T</span>
            <span className="flex-1 text-center">U</span>
            <span className="flex-1 text-center">R</span>
            <span className="flex-1 text-center">E</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Header Component ───────────────────────────────────────────────
interface HeaderProps {
  onMascotClick?: () => void;
  onAudioToggle?: () => void;
  soundEnabled: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMascotClick, onAudioToggle, soundEnabled }) => {
  const [showNotification, setShowNotification] = useState(false);

  return (
    <header
      id="campaign-header"
      className="absolute top-0 left-0 right-0 w-full z-40 flex justify-between items-start pt-[32px] sm:pt-[44px] px-[24px] sm:px-[52px] md:px-[64px] pointer-events-none"
    >
      <div id="brand-container" className="flex flex-col max-w-[320px] pointer-events-auto select-none">
        <div className="flex items-center gap-[14px]">
          <motion.div
            id="brand-logo-icon"
            className="w-[44px] h-[44px] rounded-full bg-[#050505] flex items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex-shrink-0"
            whileHover={{ scale: 1.08, rotate: -5 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              soundFx.playChime();
              if (onMascotClick) onMascotClick();
            }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" fill="#050505" />
              <path
                d="M 5.5 14 C 5.5 8 9 5.5 14 5.5 C 19 5.5 22.5 8 22.5 14 C 22.5 18 19.5 21.5 14 21.5 C 8.5 21.5 5.5 18 5.5 14 Z"
                fill="#050505"
                stroke="#FFFFFF"
                strokeWidth="2.2"
              />
              <ellipse cx="10.5" cy="14" rx="2" ry="2.6" fill="#FFFFFF" />
              <ellipse cx="17.5" cy="14" rx="2" ry="2.6" fill="#FFFFFF" />
              <circle cx="8" cy="16.5" r="1" fill="#FFFFFF" opacity="0.6" />
              <circle cx="20" cy="16.5" r="1" fill="#FFFFFF" opacity="0.6" />
            </svg>
          </motion.div>

          <div className="flex flex-col justify-center leading-none">
            <h1
              id="brand-title"
              className="text-[#050505] text-[26px] sm:text-[32px] font-[900] tracking-[-0.03em] uppercase m-0 leading-none"
              style={{ fontFamily: "'Montserrat', 'Archivo Black', sans-serif" }}
            >
              PAIPAI
            </h1>
            <span
              id="brand-subtitle"
              className="text-[#050505] text-[8.5px] font-[700] tracking-[0.22em] uppercase mt-[4px]"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              KUAISHOU CULTURE
            </span>
          </div>
        </div>

        <p
          id="brand-microcopy"
          className="text-[#1A1A1A] text-[7.5px] leading-[1.45] tracking-[0.01em] mt-[14px] max-w-[280px] font-normal hidden sm:block"
          style={{ fontFamily: "'Montserrat', 'Space Mono', sans-serif" }}
        >
          Hi, I&apos;m PAIPAI, the ambassador of Kuaishou Culture. I like sports,
          food and short videos. My favourite season is summer. I wish I can
          bring happiness to all of you.
        </p>
      </div>

      <div id="top-right-controls" className="flex items-center gap-[8px] sm:gap-[12px] pointer-events-auto pt-[4px]">
        <motion.button
          className="w-[26px] h-[26px] rounded-full bg-white border-[1.5px] border-[#050505] flex items-center justify-center cursor-pointer shadow-[0_2px_6px_rgba(0,0,0,0.08)] hover:bg-[#F0FAFD]"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            soundFx.playPop();
            if (onMascotClick) onMascotClick();
          }}
          title="Play Sound"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#050505" strokeWidth="1.2" />
            <circle cx="5" cy="6.5" r="0.9" fill="#050505" />
            <circle cx="9" cy="6.5" r="0.9" fill="#050505" />
            <path d="M 5 8.5 Q 7 10 9 8.5" stroke="#050505" strokeWidth="0.8" fill="none" />
          </svg>
        </motion.button>

        <div className="relative">
          <motion.button
            className="w-[26px] h-[26px] rounded-full bg-white border-[1.5px] border-[#050505] flex items-center justify-center cursor-pointer shadow-[0_2px_6px_rgba(0,0,0,0.08)] hover:bg-[#F0FAFD]"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              soundFx.playPop();
              setShowNotification(!showNotification);
            }}
            title="Notifications"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M 7 2 C 5.5 2 4.5 3 4.5 5 C 4.5 7.5 3.5 8.5 3 9 L 11 9 C 10.5 8.5 9.5 7.5 9.5 5 C 9.5 3 8.5 2 7 2 Z" stroke="#050505" strokeWidth="1.2" fill="none" />
              <circle cx="7" cy="11" r="1.2" fill="#050505" />
            </svg>
          </motion.button>

          <AnimatePresence>
            {showNotification && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                className="absolute right-0 top-[34px] w-[210px] bg-white/95 backdrop-blur-md p-[12px] rounded-[10px] border border-[#050505] shadow-[0_8px_20px_rgba(0,0,0,0.15)] text-[#050505] z-50 text-[10px]"
              >
                <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                  <span className="font-bold uppercase tracking-wider text-[8px]">PAIPAI CAMPAIGN</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="mt-2 text-[9px] leading-relaxed text-gray-700">
                  Kuaishou Culture #04 Summer Sports edition is live! Click on Paipai to trigger carve tricks.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          className={`w-[26px] h-[26px] rounded-full bg-white border-[1.5px] border-[#050505] flex items-center justify-center cursor-pointer shadow-[0_2px_6px_rgba(0,0,0,0.08)] ${!soundEnabled ? 'opacity-50' : 'hover:bg-[#F0FAFD]'}`}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            soundFx.playChime();
            if (onAudioToggle) onAudioToggle();
          }}
          title={soundEnabled ? 'Sound On' : 'Sound Off'}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M 4 4 L 4 10 L 8 10 L 11 12 L 11 2 L 8 4 Z" fill="#050505" />
            {soundEnabled && <path d="M 12.5 5 C 13.2 6.2 13.2 7.8 12.5 9" stroke="#050505" strokeWidth="1.2" strokeLinecap="round" />}
          </svg>
        </motion.button>
      </div>
    </header>
  );
};

// ── Character Mascot ───────────────────────────────────────────────
interface CharacterArtProps {
  parallaxX: number;
  parallaxY: number;
  onCharacterClick?: () => void;
}

const CharacterArt: React.FC<CharacterArtProps> = ({ parallaxX, parallaxY, onCharacterClick }) => {
  const [isTricking, setIsTricking] = useState(false);
  const characterImageUrl =
    'https://res.cloudinary.com/chhwhdhk/image/upload/v1788509773/4ede3e25-0ad7-46eb-95dd-06495341141b_zzgvpi.png';

  const handleAction = () => {
    soundFx.playPop();
    setIsTricking(true);
    setTimeout(() => setIsTricking(false), 800);
    if (onCharacterClick) onCharacterClick();
  };

  return (
    <div
      id="character-container"
      className="relative flex items-center justify-center pointer-events-auto cursor-pointer select-none"
      onClick={handleAction}
      style={{
        transform: `translate3d(${parallaxX * 0.8}px, ${parallaxY * 0.8}px, 0)`,
        transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.4, 1)',
      }}
    >
      <motion.div
        id="character-and-board"
        className="relative z-20 flex flex-col items-center"
        animate={
          isTricking
            ? { y: [-22, 10, 0], rotate: [-4, 3, 0], scale: [1.04, 0.98, 1] }
            : { y: [0, -8, 0, -4, 0], rotate: [0, -0.6, 0, 0.5, 0] }
        }
        transition={
          isTricking
            ? { duration: 0.75, ease: 'easeInOut' }
            : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <img
          src={characterImageUrl}
          alt="PAIPAI Snowboard Mascot"
          className="w-[380px] sm:w-[500px] md:w-[600px] lg:w-[680px] h-auto object-contain pointer-events-none select-none filter drop-shadow-[0_16px_32px_rgba(15,45,70,0.18)]"
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </motion.div>
    </div>
  );
};

// ── Island Platform ────────────────────────────────────────────────
interface IslandPlatformProps {
  parallaxX: number;
  parallaxY: number;
}

const IslandPlatform: React.FC<IslandPlatformProps> = ({ parallaxX, parallaxY }) => {
  const [rippleActive, setRippleActive] = useState(false);
  const platformImageUrl =
    'https://res.cloudinary.com/chhwhdhk/image/upload/v1788509700/c0cfd993-d10d-4283-a9cf-6b3b2fbc29dd_j7ie6k.png';

  const handleWaterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playSplash();
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 1200);
  };

  return (
    <div
      id="island-platform-wrapper"
      className="relative flex flex-col justify-center items-center pointer-events-auto cursor-pointer select-none"
      style={{
        transform: `translate3d(${parallaxX * 0.3}px, ${parallaxY * 0.3}px, 0)`,
        transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.4, 1)',
      }}
      onClick={handleWaterClick}
    >
      <div
        className="absolute bottom-[6%] w-[82%] h-[28px] rounded-[50%] bg-[#124056]/25 blur-[18px] -z-10"
        style={{ transform: 'scaleX(1.08)' }}
      />

      <motion.div
        className="relative flex items-center justify-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <img
          src={platformImageUrl}
          alt="PAIPAI Island Platform - Sand & Water"
          className="w-[300px] sm:w-[400px] md:w-[460px] lg:w-[500px] h-auto object-contain pointer-events-none select-none filter drop-shadow-[0_14px_24px_rgba(10,50,75,0.18)]"
          referrerPolicy="no-referrer"
          loading="eager"
        />

        {rippleActive && (
          <motion.div
            className="absolute right-[22%] top-[34%] w-[90px] h-[36px] rounded-[50%] border-2 border-white/70 pointer-events-none"
            initial={{ scale: 0.2, opacity: 0.9 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        )}
      </motion.div>
    </div>
  );
};

// ── Editorial Graphics Layer ───────────────────────────────────────
const EditorialElements: React.FC = () => {
  return (
    <>
      {/* Lower Left #04 & Brand Badges */}
      <div
        id="lower-left-editorial"
        className="absolute bottom-[24px] sm:bottom-[36px] left-[24px] sm:left-[48px] md:left-[64px] z-30 flex flex-col pointer-events-auto select-none max-w-[340px]"
      >
        <div className="flex items-baseline gap-[8px]">
          <span
            id="issue-number"
            className="text-[#050505] text-[32px] sm:text-[44px] font-[900] italic leading-none tracking-[-0.04em]"
            style={{ fontFamily: "'Archivo Black', 'Montserrat', sans-serif" }}
          >
            #04
          </span>
          <span
            id="issue-chinese-label"
            className="text-[#050505] text-[12px] sm:text-[15px] font-[800] tracking-[0.02em]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            /运动派*
          </span>
        </div>

        <div className="w-full h-[1px] bg-[#050505]/20 my-[8px] sm:my-[10px]" />

        <div id="brand-badges-row" className="flex items-center gap-[8px] sm:gap-[12px] text-[#050505] flex-wrap">
          <div className="flex items-center gap-[4px]">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M 4 3 C 2.5 3 2 3.5 2 5 L 2 11 C 2 12.5 2.5 13 4 13 L 12 13 C 13.5 13 14 12.5 14 11 L 14 5 C 14 3.5 13.5 3 12 3 Z M 8 5.5 C 9.4 5.5 10.5 6.6 10.5 8 C 10.5 9.4 9.4 10.5 8 10.5 C 6.6 10.5 5.5 9.4 5.5 8 C 5.5 6.6 6.6 5.5 8 5.5 Z" />
            </svg>
            <span className="text-[9px] font-[700]">快手</span>
          </div>
          <span className="text-gray-400 text-[9px]">•</span>
          <span className="text-[8.5px] font-[700]">快手文化</span>
          <span className="text-gray-400 text-[9px]">•</span>
          <div className="flex items-center gap-[4px]">
            <div className="w-[10px] h-[10px] rounded-full bg-black flex items-center justify-center">
              <div className="w-[4px] h-[4px] rounded-full bg-white" />
            </div>
            <span className="text-[8px] font-[800] uppercase tracking-wider">PAIPAI</span>
          </div>
          <span className="text-gray-400 text-[9px]">•</span>
          <div className="bg-[#050505] text-white px-[5px] py-[1.5px] rounded-[3px]">
            <span className="text-[7.5px] font-[900] tracking-wider leading-none">KID</span>
          </div>
          <span className="text-[6.5px] font-[600] uppercase tracking-[0.05em] text-[#333] hidden sm:inline">
            Kuaishou Visual Design
          </span>
        </div>

        <p
          id="lower-left-microcopy"
          className="text-[#1F1F1F] text-[6.5px] leading-[1.4] tracking-[0.01em] mt-[6px] max-w-[310px] hidden sm:block"
          style={{ fontFamily: "'Montserrat', 'Space Mono', sans-serif" }}
        >
          The Project was initiated by the kuaishou Culture team. The design came from the kuaishou Visual Design center of kuaishou KID Design center.
        </p>
      </div>

      {/* Middle Right Rotating Circle Stamp */}
      <div
        id="middle-right-circular-graphic"
        className="absolute right-[24px] sm:right-[48px] md:right-[64px] top-[50%] -translate-y-1/2 z-30 flex flex-col items-center pointer-events-auto select-none"
      >
        <div
          className="relative w-[72px] sm:w-[84px] h-[72px] sm:h-[84px] flex items-center justify-center cursor-pointer group"
          onClick={() => soundFx.playPop()}
        >
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          >
            <path id="circleTextPath" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" fill="none" />
            <text fill="#050505" fontSize="7.4" fontWeight="800" letterSpacing="2.6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <textPath href="#circleTextPath" startOffset="0%">
                • KUAI INTERESTING DESIGN • KUAI INTERESTING DESIGN
              </textPath>
            </text>
          </motion.svg>

          <motion.div
            className="w-[36px] sm:w-[42px] h-[22px] sm:h-[26px] bg-[#050505] rounded-[4px] flex items-center justify-center shadow-[0_4px_8px_rgba(0,0,0,0.2)] group-hover:scale-110 transition-transform"
            style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)' }}
          >
            <span className="text-white text-[10px] sm:text-[12px] font-[900] tracking-[0.1em] pl-[1px]" style={{ fontFamily: "'Archivo Black', 'Montserrat', sans-serif" }}>
              KID
            </span>
          </motion.div>
        </div>
      </div>

      {/* Lower Right Blueprint Diagram & Microcopy */}
      <div
        id="lower-right-diagram-block"
        className="absolute bottom-[24px] sm:bottom-[36px] right-[24px] sm:right-[48px] md:right-[64px] z-30 flex flex-col items-end pointer-events-auto select-none max-w-[340px] hidden md:flex"
      >
        <div id="orthographic-spec-diagram" className="flex items-center gap-[18px] mb-[12px] relative">
          <div className="absolute top-[8px] left-[-16px] right-[-16px] h-[1px] border-b border-dashed border-[#050505]/25 pointer-events-none" />
          <div className="absolute top-[32px] left-[-16px] right-[-16px] h-[1px] border-b border-dashed border-[#050505]/25 pointer-events-none" />
          <div className="absolute bottom-[2px] left-[-16px] right-[-16px] h-[1px] border-b border-dashed border-[#050505]/25 pointer-events-none" />

          {/* Front View */}
          <svg width="24" height="48" viewBox="0 0 24 48" fill="none">
            <ellipse cx="12" cy="11" rx="7.5" ry="7" stroke="#050505" strokeWidth="1.1" />
            <path d="M 9 4 C 11 3 13 3 15 4" stroke="#050505" strokeWidth="1.1" strokeLinecap="round" />
            <circle cx="9.5" cy="11" r="0.9" fill="#050505" />
            <circle cx="14.5" cy="11" r="0.9" fill="#050505" />
            <path d="M 11 13 Q 12 14.5 13 13" stroke="#050505" strokeWidth="0.8" fill="none" />
            <rect x="7" y="19" width="10" height="12" rx="2" stroke="#050505" strokeWidth="1" />
            <path d="M 6.5 20 L 4 28" stroke="#050505" strokeWidth="1" strokeLinecap="round" />
            <path d="M 17.5 20 L 20 28" stroke="#050505" strokeWidth="1" strokeLinecap="round" />
            <path d="M 7 31 L 7 37 L 11 37 L 12 34 L 13 37 L 17 37 L 17 31 Z" stroke="#050505" strokeWidth="1" />
            <path d="M 9 37 L 9 44" stroke="#050505" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M 15 37 L 15 44" stroke="#050505" strokeWidth="1.1" strokeLinecap="round" />
          </svg>

          {/* Side Profile */}
          <svg width="22" height="48" viewBox="0 0 22 48" fill="none">
            <ellipse cx="11" cy="11" rx="6.5" ry="7" stroke="#050505" strokeWidth="1.1" />
            <path d="M 5 6 C 3 7 3 9 6 9" stroke="#050505" strokeWidth="1.1" />
            <path d="M 5 11 L 17 11" stroke="#050505" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="7" cy="11" r="0.9" fill="#050505" />
            <path d="M 7 19 C 7 19 14 19 14 24 C 14 28 13 31 13 31 L 8 31 Z" stroke="#050505" strokeWidth="1" />
            <path d="M 10 20 L 9 29" stroke="#050505" strokeWidth="1" strokeLinecap="round" />
            <rect x="7" y="31" width="7" height="6" stroke="#050505" strokeWidth="1" />
            <path d="M 10 37 L 10 44 L 8 44" stroke="#050505" strokeWidth="1.1" strokeLinecap="round" />
          </svg>

          {/* Back View */}
          <svg width="24" height="48" viewBox="0 0 24 48" fill="none">
            <ellipse cx="12" cy="11" rx="7.5" ry="7" stroke="#050505" strokeWidth="1.1" />
            <line x1="12" y1="4" x2="12" y2="18" stroke="#050505" strokeWidth="0.8" strokeDasharray="1 1" />
            <path d="M 5 11 L 19 11" stroke="#050505" strokeWidth="1.5" />
            <rect x="7" y="19" width="10" height="12" rx="2" stroke="#050505" strokeWidth="1" />
            <path d="M 6.5 20 L 4 28" stroke="#050505" strokeWidth="1" strokeLinecap="round" />
            <path d="M 17.5 20 L 20 28" stroke="#050505" strokeWidth="1" strokeLinecap="round" />
            <path d="M 7 31 L 7 37 L 11 37 L 12 34 L 13 37 L 17 37 L 17 31 Z" stroke="#050505" strokeWidth="1" />
            <path d="M 9 37 L 9 44" stroke="#050505" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M 15 37 L 15 44" stroke="#050505" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        </div>

        <p
          id="lower-right-microcopy"
          className="text-[#1F1F1F] text-[6.5px] leading-[1.4] tracking-[0.01em] text-right max-w-[290px]"
          style={{ fontFamily: "'Montserrat', 'Space Mono', sans-serif" }}
        >
          Paipai is a virtual image launched by Kuaishou culture. As the spokesperson of Kuai culture, paipai is full of sunshine and enthusiasm for life, infecting every friend around him. Like summer, sports, food, health, and short videos.
        </p>
      </div>
    </>
  );
};

// ── Main Exported Component ────────────────────────────────────────
const PaipaiKuaishou: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, normX: 0, normY: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion) return;
      const target = e.currentTarget as HTMLElement || window;
      const rect = (target as HTMLElement).getBoundingClientRect ? (target as HTMLElement).getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight, left: 0, top: 0 };
      const w = rect.width || window.innerWidth;
      const h = rect.height || window.innerHeight;
      const clientX = e.clientX - (rect.left || 0);
      const clientY = e.clientY - (rect.top || 0);
      const normX = (clientX / w - 0.5) * 2;
      const normY = (clientY / h - 0.5) * 2;
      setMousePos({ x: clientX, y: clientY, normX, normY });
    },
    [prefersReducedMotion]
  );

  const handleAudioToggle = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundFx.enabled = nextState;
  };

  return (
    <main
      id="hero-campaign-section"
      className="relative w-full h-full min-h-[600px] overflow-hidden flex flex-col justify-between items-center select-none"
      onMouseMove={handleMouseMove}
    >
      <Background
        parallaxX={prefersReducedMotion ? 0 : mousePos.normX * 12}
        parallaxY={prefersReducedMotion ? 0 : mousePos.normY * 10}
      />

      <ThreeCanvas
        mouseX={prefersReducedMotion ? 0 : mousePos.normX}
        mouseY={prefersReducedMotion ? 0 : mousePos.normY}
      />

      <Header
        soundEnabled={soundEnabled}
        onAudioToggle={handleAudioToggle}
        onMascotClick={() => soundFx.playChime()}
      />

      <div
        id="central-artwork-stage"
        className="relative flex-1 w-full flex flex-col items-center justify-center pointer-events-none z-20 pt-[2vh]"
      >
        <div className="relative flex flex-col items-center justify-center">
          <div className="relative -mb-[36px] sm:-mb-[54px] md:-mb-[72px] lg:-mb-[84px] z-20">
            <CharacterArt
              parallaxX={prefersReducedMotion ? 0 : mousePos.normX * 9}
              parallaxY={prefersReducedMotion ? 0 : mousePos.normY * 7}
            />
          </div>

          <div className="relative z-10">
            <IslandPlatform
              parallaxX={prefersReducedMotion ? 0 : mousePos.normX * 4}
              parallaxY={prefersReducedMotion ? 0 : mousePos.normY * 3}
            />
          </div>
        </div>
      </div>

      <EditorialElements />
    </main>
  );
};

export default PaipaiKuaishou;
