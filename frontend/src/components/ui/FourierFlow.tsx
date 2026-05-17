import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCw, Settings, Sliders, Eye, EyeOff, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface FourierFlowProps {
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  mode?: 'loader' | 'interactive';
  defaultTheme?: 'emerald' | 'vaporwave' | 'solar' | 'cosmic';
  className?: string;
}

interface ThemeConfig {
  stroke: string;
  particles: string;
  glow: string;
  background: string;
  grid: string;
}

export const FourierFlow: React.FC<FourierFlowProps> = ({
  size = 'md',
  mode = 'interactive',
  defaultTheme = 'emerald',
  className = '',
}) => {
  const { theme: activeMode } = useTheme();
  const [theme, setTheme] = useState<keyof typeof THEMES>(defaultTheme);

  const THEMES: Record<string, ThemeConfig> = {
    emerald: {
      stroke: activeMode === 'light' ? '#00AEEF' : '#00FF00', // website brand-blue / brand-green
      particles: activeMode === 'light' ? '#5FA3D6' : '#39FF14', // light shade blue / neon lime green
      glow: activeMode === 'light' ? 'rgba(95, 163, 214, 0.4)' : 'rgba(0, 255, 0, 0.4)',
      background: activeMode === 'light' ? '#FFFFFF' : '#000000',
      grid: activeMode === 'light' ? 'rgba(95, 163, 214, 0.05)' : 'rgba(0, 255, 0, 0.04)',
    },
    vaporwave: {
      stroke: activeMode === 'light' ? '#ec4899' : '#06b6d4',
      particles: activeMode === 'light' ? '#06b6d4' : '#ec4899',
      glow: activeMode === 'light' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(236, 72, 153, 0.4)',
      background: activeMode === 'light' ? '#FAF5FF' : '#05020a',
      grid: activeMode === 'light' ? 'rgba(236, 72, 153, 0.05)' : 'rgba(6, 182, 212, 0.04)',
    },
    solar: {
      stroke: '#f59e0b',
      particles: '#ef4444',
      glow: 'rgba(245, 158, 11, 0.4)',
      background: activeMode === 'light' ? '#FFFBEB' : '#070402',
      grid: 'rgba(245, 158, 11, 0.04)',
    },
    cosmic: {
      stroke: activeMode === 'light' ? '#a855f7' : '#6366f1',
      particles: activeMode === 'light' ? '#6366f1' : '#a855f7',
      glow: activeMode === 'light' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(168, 85, 247, 0.4)',
      background: activeMode === 'light' ? '#F5F3FF' : '#020208',
      grid: activeMode === 'light' ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.04)',
    },
  };

  const currentTheme = THEMES[theme];


  // Visual options
  const [showFormula, setShowFormula] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [rotate, setRotate] = useState(false);

  // Fourier Math Configurable Constants
  const [fourierX1, setFourierX1] = useState(17.0);
  const [fourierX3, setFourierX3] = useState(7.5);
  const [fourierX5, setFourierX5] = useState(3.2);
  const [fourierY1, setFourierY1] = useState(15.0);
  const [fourierY2, setFourierY2] = useState(8.2);
  const [fourierY4, setFourierY4] = useState(4.2);
  const [fourierMixBase, setFourierMixBase] = useState(1.0);
  const [fourierMixPulse, setFourierMixPulse] = useState(0.16);

  // Simulation parameters
  const [particleCount, setParticleCount] = useState(32);
  const [trailSpan, setTrailSpan] = useState(0.46);
  const [durationMs, setDurationMs] = useState(8400);
  const [strokeWidth, setStrokeWidth] = useState(4.2);

  // Constants
  const rotationDurationMs = 44000;
  const pulseDurationMs = 6800;

  // Refs for requestAnimationFrame logic
  const groupRef = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const particlesRef = useRef<SVGCircleElement[]>([]);
  const requestRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Dynamic formula array generator
  const getFormulaText = () => {
    return [
      `x(t) = 50 + ${fourierX1.toFixed(1)} cos t + ${fourierX3.toFixed(1)} cos(3t + 0.6m) + ${fourierX5.toFixed(1)} sin(5t - 0.4)`,
      `y(t) = 50 + ${fourierY1.toFixed(1)} sin t + ${fourierY2.toFixed(1)} sin(2t + 0.25) - ${fourierY4.toFixed(1)} cos(4t - 0.5m)`,
      `m = ${fourierMixBase.toFixed(2)} + ${fourierMixPulse.toFixed(2)}s`,
    ].join('\n');
  };

  // Safe point calculator
  const getPoint = useCallback(
    (progress: number, detailScale: number) => {
      const t = progress * Math.PI * 2;
      const mix = fourierMixBase + detailScale * fourierMixPulse;
      const x =
        fourierX1 * Math.cos(t) +
        fourierX3 * Math.cos(3 * t + 0.6 * mix) +
        fourierX5 * Math.sin(5 * t - 0.4);
      const y =
        fourierY1 * Math.sin(t) +
        fourierY2 * Math.sin(2 * t + 0.25) -
        fourierY4 * Math.cos(4 * t - 0.5 * mix);
      return {
        x: 50 + x,
        y: 50 + y,
      };
    },
    [
      fourierX1,
      fourierX3,
      fourierX5,
      fourierY1,
      fourierY2,
      fourierY4,
      fourierMixBase,
      fourierMixPulse,
    ]
  );

  const getDetailScale = useCallback((time: number) => {
    const pulseProgress = (time % pulseDurationMs) / pulseDurationMs;
    const pulseAngle = pulseProgress * Math.PI * 2;
    return 0.52 + ((Math.sin(pulseAngle + 0.55) + 1) / 2) * 0.48;
  }, []);

  const getRotation = useCallback(
    (time: number) => {
      if (!rotate) return 0;
      return -((time % rotationDurationMs) / rotationDurationMs) * 360;
    },
    [rotate]
  );

  const buildPath = useCallback(
    (detailScale: number, steps = 360) => {
      const points = [];
      for (let i = 0; i <= steps; i++) {
        const point = getPoint(i / steps, detailScale);
        points.push(`${i === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
      }
      return points.join(' ');
    },
    [getPoint]
  );

  const normalizeProgress = (progress: number) => {
    return ((progress % 1) + 1) % 1;
  };

  const updateFrame = useCallback(
    (now: number) => {
      if (!startedAtRef.current) {
        startedAtRef.current = now;
      }

      // Handle pause offset
      let time = now - startedAtRef.current - pausedTimeRef.current;
      if (!isPlaying) {
        pausedTimeRef.current += now - lastTimeRef.current;
        time = lastTimeRef.current - startedAtRef.current - pausedTimeRef.current;
      }
      lastTimeRef.current = now;

      const progress = (time % durationMs) / durationMs;
      const detailScale = getDetailScale(time);

      // Rotate group
      if (groupRef.current) {
        groupRef.current.setAttribute(
          'transform',
          `rotate(${getRotation(time).toFixed(2)} 50 50)`
        );
      }

      // Update morphing main curve path
      if (pathRef.current) {
        pathRef.current.setAttribute('d', buildPath(detailScale));
      }

      // Update particle trails
      particlesRef.current.forEach((node, index) => {
        if (!node) return;
        const tailOffset = index / (particleCount - 1 || 1);
        const point = getPoint(
          normalizeProgress(progress - tailOffset * trailSpan),
          detailScale
        );
        const fade = Math.pow(1 - tailOffset, 0.56);
        const radius = 0.8 + fade * 2.5;
        const opacity = 0.05 + fade * 0.95;

        node.setAttribute('cx', point.x.toFixed(2));
        node.setAttribute('cy', point.y.toFixed(2));
        node.setAttribute('r', radius.toFixed(2));
        node.setAttribute('opacity', opacity.toFixed(3));
      });

      requestRef.current = requestAnimationFrame(updateFrame);
    },
    [
      isPlaying,
      durationMs,
      getDetailScale,
      getRotation,
      buildPath,
      particleCount,
      trailSpan,
      getPoint,
    ]
  );

  // Trigger loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateFrame);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [updateFrame]);

  // Reset modifiers
  const resetToDefault = () => {
    setFourierX1(17.0);
    setFourierX3(7.5);
    setFourierX5(3.2);
    setFourierY1(15.0);
    setFourierY2(8.2);
    setFourierY4(4.2);
    setFourierMixBase(1.0);
    setFourierMixPulse(0.16);
    setParticleCount(32);
    setTrailSpan(0.46);
    setDurationMs(8400);
    setStrokeWidth(4.2);
  };

  // Presets mapping
  const applyPreset = (type: 'spirograph' | 'butterfly' | 'chaotic' | 'heart') => {
    if (type === 'spirograph') {
      setFourierX1(20.0);
      setFourierX3(4.0);
      setFourierX5(1.5);
      setFourierY1(20.0);
      setFourierY2(4.0);
      setFourierY4(1.5);
      setFourierMixBase(0.5);
      setFourierMixPulse(0.3);
    } else if (type === 'butterfly') {
      setFourierX1(16.0);
      setFourierX3(12.0);
      setFourierX5(2.0);
      setFourierY1(8.0);
      setFourierY2(16.0);
      setFourierY4(5.0);
      setFourierMixBase(1.2);
      setFourierMixPulse(0.08);
    } else if (type === 'chaotic') {
      setFourierX1(12.0);
      setFourierX3(14.0);
      setFourierX5(8.0);
      setFourierY1(18.0);
      setFourierY2(5.0);
      setFourierY4(9.0);
      setFourierMixBase(2.0);
      setFourierMixPulse(0.5);
    } else if (type === 'heart') {
      setFourierX1(16.0);
      setFourierX3(0.0);
      setFourierX5(0.0);
      setFourierY1(13.0);
      setFourierY2(5.0);
      setFourierY4(2.0);
      setFourierMixBase(1.0);
      setFourierMixPulse(0.0);
    }
  };

  // Render variables based on size option
  const isLoader = mode === 'loader';
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-[280px] h-[280px]',
    lg: 'w-[400px] h-[400px]',
    fullscreen: 'w-full h-full max-w-[600px] aspect-ratio-1',
  };

  const containerBg = isLoader ? 'bg-transparent' : 'bg-[#050508] border border-white/5 shadow-2xl';

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 rounded-3xl ${containerBg} transition-all duration-300 ${className}`}
      style={{ background: isLoader ? 'transparent' : currentTheme.background }}
    >
      {/* Visual Canvas Panel */}
      <div className="relative w-full flex items-center justify-center">
        {/* Math Grid background */}
        {showGrid && !isLoader && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none transition-colors duration-300"
            style={{
              backgroundImage: `radial-gradient(${currentTheme.grid} 1.5px, transparent 1.5px)`,
              backgroundSize: '24px 24px',
            }}
          />
        )}

        <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
          <svg
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
            className="w-full h-full overflow-visible"
          >
            {/* Filter glow for absolute high-end visuals */}
            <defs>
              <filter id="fourier-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g ref={groupRef}>
              {/* Outer morphing path */}
              <path
                ref={pathRef}
                stroke={currentTheme.stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isLoader ? 0.35 : 0.22}
                filter="url(#fourier-glow)"
                className="transition-colors duration-500"
              />

              {/* Trail Particles */}
              {Array.from({ length: particleCount }).map((_, i) => (
                <circle
                  key={i}
                  ref={(el) => {
                    if (el) particlesRef.current[i] = el;
                  }}
                  fill={currentTheme.particles}
                  filter="url(#fourier-glow)"
                  className="transition-colors duration-500"
                />
              ))}
            </g>
          </svg>
        </div>

        {/* Floating loader tags */}
        {isLoader && size !== 'sm' && (
          <div className="absolute bottom-[-16px] text-center">
            <span
              className="text-[10px] font-black tracking-[0.3em] uppercase transition-colors duration-500"
              style={{ color: currentTheme.stroke }}
            >
              UI HUB — LOADING VIBES
            </span>
          </div>
        )}
      </div>

      {/* Control Knobs (Hidden if strictly in loader mode) */}
      {!isLoader && (
        <div className="w-full mt-6 flex flex-col gap-6 text-white z-10">
          {/* Header metadata */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <div className="text-xs font-black tracking-widest text-white/40 uppercase">
                Harmonic Function Loader
              </div>
              <div className="text-lg font-black tracking-tight mt-0.5">Fourier Flow</div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
              <button
                onClick={resetToDefault}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors group"
                title="Reset Constants"
              >
                <RotateCw className="w-3.5 h-3.5 text-white/50 group-hover:text-white" />
              </button>
              <div className="h-4 w-[1px] bg-white/10 mx-1" />
              {(['spirograph', 'butterfly', 'chaotic'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left sliders - Coefficients */}
            <div className="flex flex-col gap-3.5 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Sliders className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs font-bold tracking-wider text-white/70 uppercase">
                  Fourier Coefficients
                </span>
              </div>

              {/* Slider X1 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-white/55">
                  <span>X Coeff 1 (Primary)</span>
                  <span className="font-bold text-white">{fourierX1.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={fourierX1}
                  onChange={(e) => setFourierX1(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  style={{ accentColor: currentTheme.stroke }}
                />
              </div>

              {/* Slider X3 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-white/55">
                  <span>X Coeff 2 (3rd Harm)</span>
                  <span className="font-bold text-white">{fourierX3.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.1"
                  value={fourierX3}
                  onChange={(e) => setFourierX3(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: currentTheme.stroke }}
                />
              </div>

              {/* Slider Y1 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-white/55">
                  <span>Y Coeff 1 (Primary)</span>
                  <span className="font-bold text-white">{fourierY1.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={fourierY1}
                  onChange={(e) => setFourierY1(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: currentTheme.stroke }}
                />
              </div>

              {/* Slider Y2 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-white/55">
                  <span>Y Coeff 2 (2nd Harm)</span>
                  <span className="font-bold text-white">{fourierY2.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.1"
                  value={fourierY2}
                  onChange={(e) => setFourierY2(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: currentTheme.stroke }}
                />
              </div>
            </div>

            {/* Right sliders - Physics / Simulation */}
            <div className="flex flex-col gap-3.5 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs font-bold tracking-wider text-white/70 uppercase">
                  Physics & Trail
                </span>
              </div>

              {/* Particles */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-white/55">
                  <span>Particle Count</span>
                  <span className="font-bold text-white">{particleCount}</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="96"
                  step="1"
                  value={particleCount}
                  onChange={(e) => setParticleCount(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: currentTheme.stroke }}
                />
              </div>

              {/* Duration (Speed) */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-white/55">
                  <span>Cycle Duration</span>
                  <span className="font-bold text-white">{(durationMs / 1000).toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="16000"
                  step="200"
                  value={durationMs}
                  onChange={(e) => setDurationMs(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: currentTheme.stroke }}
                />
              </div>

              {/* Stroke width */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-white/55">
                  <span>Path Stroke Width</span>
                  <span className="font-bold text-white">{strokeWidth.toFixed(1)}px</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8"
                  step="0.1"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: currentTheme.stroke }}
                />
              </div>

              {/* Trail Span */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-white/55">
                  <span>Trail Offset Span</span>
                  <span className="font-bold text-white">{trailSpan.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.02"
                  value={trailSpan}
                  onChange={(e) => setTrailSpan(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: currentTheme.stroke }}
                />
              </div>
            </div>
          </div>

          {/* Themes, Formula Toggles & Interactive Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4">
            {/* Color presets selection */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Theme</span>
              <div className="flex gap-1.5">
                {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((th) => (
                  <button
                    key={th}
                    onClick={() => setTheme(th)}
                    className={`w-5 h-5 rounded-full border transition-all duration-300 ${
                      theme === th ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: THEMES[th].stroke }}
                  >
                    {theme === th && <Check className="w-3 h-3 text-black mx-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Config controls */}
            <div className="flex gap-2">
              {/* Play/Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              {/* Rotation */}
              <button
                onClick={() => setRotate(!rotate)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  rotate
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/5 border-white/5 text-white/55 hover:bg-white/10 hover:text-white'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${rotate ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
                <span>Orbit</span>
              </button>

              {/* Grid Toggle */}
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  showGrid
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/5 border-white/5 text-white/55 hover:bg-white/10 hover:text-white'
                }`}
              >
                {showGrid ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Grid</span>
              </button>

              {/* Formula Card */}
              <button
                onClick={() => setShowFormula(!showFormula)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  showFormula
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/5 border-white/5 text-white/55 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Formula</span>
              </button>
            </div>
          </div>

          {/* Math Equations Viewer Card */}
          {showFormula && (
            <div className="relative overflow-hidden rounded-xl bg-black/40 border border-white/5 p-4 mt-2">
              {/* Decorative accent glow */}
              <div
                className="absolute top-0 right-0 w-24 h-24 blur-[40px] pointer-events-none rounded-full"
                style={{ backgroundColor: currentTheme.glow }}
              />

              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">
                Dynamic Fourier Equations
              </div>
              <pre className="font-mono text-xs leading-relaxed text-white/80 select-all whitespace-pre-wrap">
                {getFormulaText()}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FourierFlow;
