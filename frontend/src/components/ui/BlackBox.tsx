"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import TargetCursor from "./TargetCursor";
import {
    LineChart, Line, XAxis, Tooltip, ResponsiveContainer, YAxis
} from "recharts";
import {
    Cpu,
    AlertTriangle,
    Eye,
    Skull,
    Zap,
    Code2,
    Wifi,
    Lock,
    Unlock,
    RefreshCcw,
    ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";

// --- MOCK DATA ---
const CHAOS_DATA = Array.from({ length: 20 }, (_, i) => ({
    cycle: `T-${i}`,
    value: Math.floor(Math.random() * 100) + 50,
    noise: Math.floor(Math.random() * 200),
}));

// --- CSS INJECTION (THE GLITCH ENGINE) ---
export function GlobalStyles() {
    return (
        <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rubik+Glitch&display=swap');

    :root {
      --glitch-1: #ff00ff;
      --glitch-2: #00ffff;
    }

    .font-mono-tech { font-family: 'Share Tech Mono', monospace; }
    .font-glitch { font-family: 'Rubik Glitch', cursive; }

    /* NOISE BACKGROUND */
    .noise-bg {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
    }

    /* GLITCH KEYFRAMES */
    @keyframes glitch-skew {
      0% { transform: skew(0deg); }
      20% { transform: skew(-2deg); }
      40% { transform: skew(2deg); }
      60% { transform: skew(-1deg); }
      80% { transform: skew(1deg); }
      100% { transform: skew(0deg); }
    }

    .glitch-hover:hover {
      animation: glitch-skew 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
    }

    /* RGB SPLIT EFFECT */
    .rgb-split {
      position: relative;
    }
    .rgb-split::before,
    .rgb-split::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .rgb-split::before {
      left: 2px;
      text-shadow: -1px 0 #ff00ff;
      clip-path: inset(44% 0 61% 0);
      animation: glitch-anim-1 2s infinite linear alternate-reverse;
    }
    .rgb-split::after {
      left: -2px;
      text-shadow: -1px 0 #00ffff;
      clip-path: inset(50% 0 30% 0);
      animation: glitch-anim-2 2s infinite linear alternate-reverse;
    }

    @keyframes glitch-anim-1 {
      0% { clip-path: inset(20% 0 80% 0); }
      20% { clip-path: inset(60% 0 10% 0); }
      40% { clip-path: inset(40% 0 50% 0); }
      60% { clip-path: inset(80% 0 5% 0); }
      80% { clip-path: inset(10% 0 70% 0); }
      100% { clip-path: inset(30% 0 20% 0); }
    }
    @keyframes glitch-anim-2 {
      0% { clip-path: inset(10% 0 60% 0); }
      20% { clip-path: inset(80% 0 5% 0); }
      40% { clip-path: inset(30% 0 20% 0); }
      60% { clip-path: inset(10% 0 80% 0); }
      80% { clip-path: inset(50% 0 30% 0); }
      100% { clip-path: inset(70% 0 10% 0); }
    }

    /* SCROLLBAR */
    ::-webkit-scrollbar { width: 0px; }

    @keyframes scan {
      0% { transform: translateY(0); }
      100% { transform: translateY(100vh); }
    }

    @keyframes scrollUp {
      0% { transform: translateY(0); }
      100% { transform: translateY(-50%); }
    }
  `}</style>
    );
}

// --- COMPONENTS ---

export function GlitchButton({ children, onClick, className }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative px-6 py-2 bg-black text-white border border-zinc-800 font-mono-tech uppercase tracking-widest overflow-hidden group hover:bg-white hover:text-black transition-colors cursor-target",
                className
            )}
        >
            <span className="relative z-10 group-hover:hidden">{children}</span>
            <span className="relative z-10 hidden group-hover:block glitch-hover font-bold">ERROR_CLICK</span>
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-800 group-hover:border-black" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-800 group-hover:border-black" />
        </button>
    );
}

export function RawBox({ children, title, className, glitch = false }: any) {
    return (
        <div className={cn("relative bg-black border border-zinc-800 p-1 group", className)}>
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white/20" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white/20" />

            {title && (
                <div className="bg-zinc-900/50 border-b border-zinc-800 p-2 flex justify-between items-center mb-1 cursor-target">
                    <h3 className={cn("text-[10px] font-mono-tech uppercase text-zinc-500", glitch && "rgb-split text-white")} data-text={title}>
                        {title}
                    </h3>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-none animate-pulse" />
                        <div className="w-2 h-2 bg-zinc-700 rounded-none" />
                    </div>
                </div>
            )}

            <div className="relative z-10 bg-[#050505] border border-zinc-900/30 p-4">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5 animate-[scan_3s_linear_infinite] pointer-events-none" />
                {children}
            </div>
        </div>
    );
}

export function DataStream() {
    return (
        <div className="fixed top-0 left-0 w-64 h-full pointer-events-none opacity-10 hidden md:block overflow-hidden">
            <div className="font-mono-tech text-[8px] text-green-500/50 leading-none whitespace-pre-wrap animate-[scrollUp_20s_linear_infinite]">
                {Array(100).fill(0).map((_, i) => (
                    `0x${Math.random().toString(16).substr(2, 8).toUpperCase()} :: MEM_ALLOC :: CORE_VIBE_${i}\n`
                ))}
            </div>
        </div>
    );
}

// --- MAIN PORTFOLIO COMPONENT ---

export default function BlackBox({ showDemoButton = false }: { showDemoButton?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [glitchMode, setGlitchMode] = useState(false);
    const [time, setTime] = useState("00:00:00");
    const [terminalText, setTerminalText] = useState<string[]>([]);

    const projects = [
        { id: "P-01", name: "UI_HUB_CORE", status: "STABLE", size: "142MB", tech: "NEXT.JS/TS" },
        { id: "P-02", name: "VIBE_ENGINE_v2", status: "UNSTABLE", size: "89MB", tech: "WEBGL/GSAP" },
        { id: "P-03", name: "SCROLL_3D_ARCH", status: "STABLE", size: "210MB", tech: "GSAP/CANVAS" },
        { id: "P-04", name: "MY_VAULT_SYSTEM", status: "CORRUPT", size: "12MB", tech: "FIREBASE/TAILWIND" },
    ];

    const stats = [
        { label: "COFFEE_INTAKE", value: "85%", color: "text-blue-500", icon: <Cpu className="w-4 h-4" /> },
        { label: "CODE_PURITY", value: "99.2%", color: "text-green-500", icon: <Skull className="w-4 h-4" /> },
        { label: "VIBE_STABILITY", value: "OPTIMAL", color: "text-yellow-500", icon: <AlertTriangle className="w-4 h-4" /> },
        { label: "UPTIME", value: "14.2K_HRS", color: "text-purple-500", icon: <Eye className="w-4 h-4" /> },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setTime(now.toLocaleTimeString([], { hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const logs = [
            "--- INITIALIZING PERSONAL_INTERFACE_v4.0.1 ---",
            "LOCATING SYSTEM: UI HUB",
            "ESTABLISHING SECURE_VIBE_CONNECTION...",
            "CREDENTIALS: FULL_STACK_ENGINEER // UI_SPECIALIST",
            "LOADING_BIOGRAPHY...",
            "SYSTEM_READY."
        ];
        let i = 0;
        const interval = setInterval(() => {
            if (i < logs.length) {
                setTerminalText(prev => [...prev.slice(-10), logs[i]]);
                i++;
            }
        }, 600);
        return () => clearInterval(interval);
    }, []);

    return (
        <div 
            ref={containerRef}
            className={cn(
                "min-h-screen h-full bg-black text-white font-mono-tech selection:bg-white selection:text-black overflow-y-auto overflow-x-hidden transition-all duration-700 noise-bg pb-24 target-cursor-area",
                glitchMode && "invert contrast-[1.5] brightness-[0.8]"
            )}
        >
            <GlobalStyles />
            <DataStream />

            {/* SCANLINE EFFECT */}
            <div className="fixed inset-0 pointer-events-none z-50 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            <header className="fixed top-0 left-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex justify-between items-center overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[scan_2s_linear_infinite]" />
                
                <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 font-mono tracking-[0.5em] animate-pulse">SYSTEM_STATUS: ACTIVE</span>
                        <h2 className="text-xl font-glitch text-white tracking-widest cursor-wait hover:scale-110 transition-transform cursor-target">UI HUB</h2>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-zinc-800 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <span className="text-[10px] font-black text-white/50 group-hover:text-white transition-colors cursor-target">UH</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-black tracking-[0.2em] text-white">UI HUB</h1>
                            <p className="text-[10px] text-zinc-500 font-mono tracking-widest mt-0.5 uppercase">Interface Architect</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-32 pb-12 px-4 md:px-12 max-w-[1800px] mx-auto space-y-32">
                {/* HERO SECTION */}
                <motion.div 
                    initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-8"
                >
                    <div className="col-span-1 md:col-span-8">
                        <RawBox title="CORE_BIOGRAPHY" className="h-[300px] flex flex-col">
                            <div className="flex-1 font-mono text-sm text-green-500 space-y-1 overflow-y-auto p-4 bg-[#0a0a0a] border border-zinc-800 shadow-inner">
                                {terminalText.map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </RawBox>
                    </div>

                    <div className="col-span-1 md:col-span-4 flex flex-col gap-4">
                        <RawBox title="SYSTEM_TIME" glitch>
                            <div className="flex flex-col items-center justify-center h-full py-12">
                                <div className="text-4xl font-black font-mono tracking-tighter text-white relative">
                                    <span className="relative z-10">{time}</span>
                                    <span className="absolute inset-0 text-red-500 blur-[2px] opacity-30 animate-pulse">{time}</span>
                                </div>
                                <div className="mt-4 flex items-center gap-3 text-[10px] font-mono text-zinc-500 tracking-[0.3em]">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    CONNECTION_STABLE
                                </div>
                            </div>
                        </RawBox>
                        <div className="flex gap-2">
                            <GlitchButton className="flex-1" onClick={() => setGlitchMode(!glitchMode)}>
                                {glitchMode ? "RESTORE" : "GLITCH"}
                            </GlitchButton>
                            <GlitchButton className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-black">INITIALIZE</GlitchButton>
                        </div>
                    </div>
                </motion.div>

                {/* EXPERIENCE SECTION */}
                <motion.div 
                    initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-8"
                >
                    <div className="col-span-1 md:col-span-8">
                        <RawBox title="CREATION_MOMENTUM" glitch>
                            <div className="h-[550px] w-full relative">
                                <div className="absolute top-10 left-10 p-2 bg-green-500/10 border border-green-500 text-green-500 text-[10px] z-10 animate-pulse">
                                    ✓ PERFORMANCE_HEALTH: OPTIMAL
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={CHAOS_DATA}>
                                        <XAxis dataKey="cycle" hide />
                                        <YAxis hide domain={['auto', 'auto']} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#000', 
                                                border: '1px solid #333',
                                                fontFamily: 'Share Tech Mono'
                                            }}
                                            itemStyle={{ color: '#00ffff' }}
                                        />
                                        <Line 
                                            type="stepAfter" 
                                            dataKey="value" 
                                            stroke="#fff" 
                                            strokeWidth={2} 
                                            dot={false}
                                            animationDuration={2000}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="noise" 
                                            stroke="#ff00ff" 
                                            strokeWidth={1} 
                                            strokeDasharray="5 5"
                                            dot={false}
                                            opacity={0.3}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </RawBox>
                    </div>

                    <div className="col-span-1 md:col-span-4">
                        <div className="grid grid-cols-2 gap-4 h-full">
                            {stats.map((stat, i) => (
                                <div key={i} className="group relative bg-[#0a0a0a] border border-zinc-800 p-6 flex flex-col justify-center hover:border-zinc-400 transition-colors duration-500 overflow-hidden cursor-target">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                                        {stat.icon}
                                    </div>
                                    <div className={`text-2xl font-black tracking-tighter ${stat.color} group-hover:animate-pulse`}>
                                        {stat.value}
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mt-2">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* PROJECTS SECTION */}
                <motion.div 
                    initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-8"
                >
                    <div className="col-span-1 md:col-span-12">
                        <RawBox title="DEPLOYED_ASSETS">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-800">
                                            <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">ID</th>
                                            <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">PROJECT_NAME</th>
                                            <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">TECH_STACK</th>
                                            <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">SIZE</th>
                                            <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projects.map((project, i) => (
                                            <tr key={i} className="group border-b border-zinc-900 hover:bg-white/5 transition-colors cursor-target">
                                                <td className="p-4 font-mono text-[10px] text-zinc-500">{project.id}</td>
                                                <td className="p-4 font-black text-sm text-white group-hover:text-green-500 transition-colors">{project.name}</td>
                                                <td className="p-4 font-mono text-[10px] text-zinc-500">{project.tech}</td>
                                                <td className="p-4 font-mono text-[10px] text-zinc-400">{project.size}</td>
                                                <td className="p-4 text-right">
                                                    <span className={`text-[10px] font-black px-2 py-1 border ${
                                                        project.status === 'STABLE' ? 'border-green-500 text-green-500' : 
                                                        project.status === 'UNSTABLE' ? 'border-yellow-500 text-yellow-500' : 
                                                        'border-red-500 text-red-500'
                                                    }`}>
                                                        {project.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </RawBox>
                    </div>
                </motion.div>

                {/* SKILLS SECTION */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
                    whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-8"
                >
                    <div className="col-span-1 md:col-span-4">
                        <RawBox title="TRAFFIC_HEATMAP" glitch>
                            <div className="h-48 flex items-end gap-1 p-4 overflow-hidden bg-[#0a0a0a]">
                                {[...Array(24)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-green-500 opacity-20 hover:opacity-100 transition-all duration-300"
                                        style={{ height: `${20 + Math.random() * 80}%` }}
                                    />
                                ))}
                            </div>
                        </RawBox>
                    </div>

                    <div className="col-span-1 md:col-span-8">
                        <RawBox title="PORTFOLIO_ENGINE_STATUS">
                            <div className="p-12 flex flex-col items-center justify-center text-center">
                                <div className="text-3xl font-black text-white mb-6 tracking-[0.25em]">AVAILABLE_FOR_DEPLOYMENT</div>
                                <p className="text-zinc-500 font-mono text-xs max-w-xl leading-relaxed uppercase tracking-widest opacity-70">
                                    Current primary focus: Building the world's most advanced library of high-fidelity interfaces. 
                                    UI HUB is the home for elite structural components.
                                </p>
                                <div className="mt-8 flex gap-4">
                                    <div className="px-4 py-2 border border-zinc-800 text-[10px] font-bold tracking-widest text-zinc-500 cursor-target">GITHUB: UI-HUB-PROJECT</div>
                                    <div className="px-4 py-2 border border-zinc-800 text-[10px] font-bold tracking-widest text-zinc-500 cursor-target">SYSTEM: ACTIVE</div>
                                </div>
                            </div>
                        </RawBox>
                    </div>
                </motion.div>
            </main>

            <footer className="border-t border-zinc-800 p-12 text-center relative overflow-hidden mt-32">
                <div className="absolute inset-0 bg-white/5 opacity-5 animate-pulse" />
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="text-[10px] font-black text-zinc-600 tracking-[1em] uppercase">SYSTEM_VERSION_LOG :: 2026.03.25</div>
                    <div className="text-sm text-zinc-500 font-mono italic opacity-40">"THE_VIBE_IS_THE_CODE // ARCHITECT_BY_DESIGN"</div>
                    <div className="w-16 h-[1px] bg-zinc-800" />
                    <p className="text-[8px] text-zinc-700 tracking-widest uppercase">© 2026 UI_HUB • ALL_RIGHTS_RESERVED</p>
                </div>
            </footer>

            {/* VIEW FULL DEMO OVERLAY - Only shown in Library Preview */}
            <AnimatePresence>
                {showDemoButton && (
                    <motion.div 
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 pointer-events-none"
                    >
                        <Link 
                            to="/demo/black-box" 
                            target="_blank"
                            className="pointer-events-auto no-underline"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <GlitchButton 
                                    className="!px-12 !py-6 text-xl gap-4 flex items-center bg-black border-2 border-brand-green/50 text-brand-green font-mono-tech shadow-[0_0_30px_rgba(0,255,0,0.2)]"
                                    glitch={true}
                                >
                                    <ExternalLink size={24} className="animate-pulse" />
                                    VIEW FULL DEMO
                                </GlitchButton>
                            </motion.div>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Target Cursor Component */}
            <TargetCursor containerRef={containerRef} />
        </div>
    );
}
