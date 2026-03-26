"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
    motion, 
    AnimatePresence,
    useMotionValue,
    useSpring
} from "framer-motion";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Layers,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Search,
    Bell,
    TrendingUp,
    TrendingDown,
    MoreVertical,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    Filter,
    Mail,
    Github,
    Twitter,
    Linkedin,
    ExternalLink,
    Code2,
    Target,
    Zap,
    Cpu,
    Palette
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Cell
} from "recharts";
import { cn } from "@/src/lib/utils";

// --- DESIGN TOKENS ---
const COLORS = {
    yellow: "#FEF08A",
    green: "#B8FF9F",
    red: "#FF9F9F",
    blue: "#A5F3FC",
    gray: "#E5E7EB",
    black: "#000000",
    white: "#FFFFFF",
};

// --- MOCK DATA ---
const REVENUE_DATA = [
    { name: "Jan", value: 4500 },
    { name: "Feb", value: 5200 },
    { name: "Mar", value: 4800 },
    { name: "Apr", value: 6100 },
    { name: "May", value: 5500 },
    { name: "Jun", value: 6700 },
];

const PORTFOLIO_PROJECTS = [
    { 
        id: 1, 
        name: "EcoTrack AI", 
        desc: "Environmental footprint monitoring system using satellite data and neural networks.", 
        tags: ["React", "Python", "TensorFlow"],
        img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
        color: COLORS.green
    },
    { 
        id: 2, 
        name: "Glitch Market", 
        desc: "A decentralized marketplace for high-performance digital assets and NFTs.", 
        tags: ["Solidity", "NextJS", "Ether.js"],
        img: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800&q=80",
        color: COLORS.yellow
    },
    { 
        id: 3, 
        name: "Neural Nexus", 
        desc: "Synthesizing real-time data streams into actionable business intelligence.", 
        tags: ["Rust", "WASM", "WebGL"],
        img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
        color: COLORS.blue
    },
    { 
        id: 4, 
        name: "Brutal Auth", 
        desc: "Zero-knowledge proof authentication library for security-first applications.", 
        tags: ["Typescript", "Go", "Cryptography"],
        img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?w=800&q=80",
        color: COLORS.red
    },
];

const SKILLS = [
    { name: "Frontend Architecture", level: 92, icon: LayoutDashboard, color: COLORS.blue },
    { name: "Backend Core (Rust/Go)", level: 85, icon: Cpu, color: COLORS.yellow },
    { name: "UI Architecture", level: 98, icon: Palette, color: COLORS.green },
    { name: "ML Operations", level: 74, icon: Zap, color: COLORS.red },
];

const TEAM = [
    { name: "Alex", role: "Dev", avatar: "https://i.pravatar.cc/150?u=alex" },
    { name: "Sarah", role: "Design", avatar: "https://i.pravatar.cc/150?u=sarah" },
    { name: "Mike", role: "PM", avatar: "https://i.pravatar.cc/150?u=mike" },
    { name: "Elena", role: "Dev", avatar: "https://i.pravatar.cc/150?u=elena" },
];

// --- SUB-COMPONENTS ---

const BrutalCard: React.FC<{ children: React.ReactNode, className?: string, noPadding?: boolean, style?: React.CSSProperties, onMouseEnter?: () => void, onMouseLeave?: () => void }> = ({ children, className, noPadding = false, style = {}, onMouseEnter, onMouseLeave }) => (
    <div 
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        data-cursor="hover"
        className={cn(
        "bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group",
        !noPadding && "p-6",
        className
    )} style={style}>
        {children}
    </div>
);

const BrutalButton: React.FC<{ children: React.ReactNode, onClick?: () => void, active?: boolean, className?: string, color?: string }> = ({ children, onClick, active = false, className, color = "white" }) => (
    <button 
        onClick={onClick}
        data-cursor="hover"
        className={cn(
            "h-12 px-6 flex items-center justify-center gap-2 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase tracking-wider",
            color === "white" && "bg-white",
            color === "yellow" && "bg-[#FEF08A]",
            color === "green" && "bg-[#B8FF9F]",
            color === "red" && "bg-[#FF9F9F]",
            color === "black" && "bg-black text-white",
            active && "bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]",
            className
        )}
    >
        {children}
    </button>
);

const Marquee = () => (
    <div className="w-full bg-black border-b-[3px] border-black overflow-hidden whitespace-nowrap py-2 h-10 flex items-center">
        <motion.div 
            animate={{ x: [0, -2000] }} 
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            className="inline-block text-white font-bold uppercase tracking-tighter text-xs"
        >
            {Array(40).fill("NEO BRUTALISM // VIBE CODING // PORTFOLIO_V2 // SYSTEM_ONLINE // TERMINAL_READY // ").join("")}
        </motion.div>
    </div>
);

// --- VIEWS ---

const DashboardView = ({ time }: { time: Date }) => {
    const timeString = time.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateString = time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <BrutalCard className="bg-[#A5F3FC] flex flex-col items-center justify-center min-h-[160px]">
                    <span className="text-[10px] font-black uppercase opacity-40 tracking-[0.2em] mb-2 text-center">SYSTEM_CLOCK_SYNC // IST_ZONE</span>
                    <div className="bg-white border-[3px] border-black p-4 w-full flex flex-col items-center justify-center shadow-[4px_4px_0px_black]">
                        <span className="text-4xl md:text-5xl font-black text-red-500 tracking-tighter leading-none mb-1">{timeString}</span>
                        <span className="text-[10px] font-black opacity-60 tracking-[0.3em]">{dateString}</span>
                    </div>
                </BrutalCard>
                <BrutalCard className="bg-[#FEF08A]">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 border-[2px] border-black bg-white"><TrendingUp className="w-5 h-5" /></div>
                    <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">+12%</span>
                </div>
                <p className="text-sm font-bold opacity-70 uppercase tracking-widest leading-none">Productivity</p>
                <h3 className="text-4xl font-black mt-1">98%</h3>
            </BrutalCard>
            <BrutalCard className="bg-[#B8FF9F]">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 border-[2px] border-black bg-white"><Briefcase className="w-5 h-5" /></div>
                    <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">Live</span>
                </div>
                <p className="text-sm font-bold opacity-70 uppercase tracking-widest leading-none">Projects</p>
                <h3 className="text-4xl font-black mt-1">14</h3>
            </BrutalCard>
            <BrutalCard className="bg-[#A5F3FC]">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 border-[2px] border-black bg-white"><Code2 className="w-5 h-5" /></div>
                    <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">Repo</span>
                </div>
                <p className="text-sm font-bold opacity-70 uppercase tracking-widest leading-none">PRs Merged</p>
                <h3 className="text-4xl font-black mt-1">512</h3>
            </BrutalCard>
            <BrutalCard className="bg-[#FF9F9F]">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 border-[2px] border-black bg-white"><Users className="w-5 h-5" /></div>
                    <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">Active</span>
                </div>
                <p className="text-sm font-bold opacity-70 uppercase tracking-widest leading-none">Network</p>
                <h3 className="text-4xl font-black mt-1">1.2k</h3>
            </BrutalCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <BrutalCard className="lg:col-span-8 overflow-hidden">
                <h4 className="text-xl font-black uppercase mb-6 italic text-vibe-green">// EXECUTION_VELOCITY_DATA</h4>
                <div className="h-[300px] w-full cursor-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={REVENUE_DATA} barGap={8}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
                            <XAxis dataKey="name" tick={{ fill: "#000", fontWeight: 'bold' }} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
                            <YAxis tick={{ fill: "#000", fontWeight: 'bold' }} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
                            <Tooltip cursor={{ fill: '#B8FF9F22' }} contentStyle={{ backgroundColor: '#fff', border: '3px solid #000', borderRadius: 0, boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }} />
                            <Bar dataKey="value" stroke="#000" strokeWidth={2}>
                                {REVENUE_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? COLORS.yellow : COLORS.black} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </BrutalCard>
            <BrutalCard className="lg:col-span-4 flex flex-col">
                <h4 className="text-xl font-black uppercase mb-6 italic text-red-500">// UNIT_STATUS_TRACKER</h4>
                <div className="space-y-4 flex-1">
                    {TEAM.map((member, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 border-[2px] border-black bg-white group hover:bg-[#B8FF9F] transition-colors cursor-pointer" data-cursor="hover">
                            <div className="w-10 h-10 border-[2px] border-black overflow-hidden bg-black shadow-[2px_2px_0px_black] group-hover:shadow-none group-hover:translate-x-[1px] group-hover:translate-y-[1px]"><img src={member.avatar} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" /></div>
                            <div className="flex-1"><p className="font-black text-sm uppercase">{member.name}</p><p className="text-[10px] font-bold opacity-50 uppercase">{member.role}</p></div>
                        </div>
                    ))}
                </div>
                <BrutalButton className="w-full mt-6" color="black">Access Terminal</BrutalButton>
            </BrutalCard>
        </div>
    </div>
    );
};

const AboutView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
                <BrutalCard noPadding className="aspect-square overflow-hidden group border-[4px]">
                    <img 
                        src="/profile.jpg" 
                        alt="Profile" 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 border-[8px] border-black opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </BrutalCard>
                <div className="grid grid-cols-2 gap-4 mt-8">
                    <BrutalButton color="white" className="w-full"><Github className="w-5 h-5" /></BrutalButton>
                    <BrutalButton color="blue" className="w-full"><Linkedin className="w-5 h-5" /></BrutalButton>
                </div>
            </div>
            <div className="lg:col-span-8 flex flex-col gap-6">
                <h2 className="text-5xl md:text-8xl font-black uppercase leading-[0.8] tracking-tighter mb-4">
                    Crafting <span className="bg-[#FEF08A] px-2 border-[4px] border-black shadow-[6px_6px_0px_black]">Digital</span> Instability.
                </h2>
                <BrutalCard className="bg-white">
                    <h4 className="text-xl font-black uppercase mb-4 italic text-red-500">// MISSION_MANIFESTO</h4>
                    <p className="text-xl font-bold leading-relaxed mb-6">
                        I am a full-stack architect specializing in ultra-performance web environments. 
                        My design philosophy is rooted in <span className="underline decoration-[6px] decoration-[#FF9F9F]">Neo-Brutalism</span>: 
                        No softness. No compromise. Just pure interactive energy. 
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <div className="px-5 py-2 border-[3px] border-black bg-black text-white font-black text-xs uppercase tracking-widest">Architect</div>
                        <div className="px-5 py-2 border-[3px] border-black bg-white font-black text-xs uppercase tracking-widest">Vibe_Coder</div>
                        <div className="px-5 py-2 border-[3px] border-black bg-[#B8FF9F] font-black text-xs uppercase tracking-widest">Pixel_Pusher</div>
                    </div>
                </BrutalCard>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <BrutalCard className="bg-[#A5F3FC]">
                        <div className="flex gap-4 items-center">
                            <Target className="w-8 h-8" />
                            <h5 className="font-black uppercase text-xl">Direct Accuracy</h5>
                        </div>
                        <p className="mt-4 text-sm font-bold opacity-70 leading-tight italic">
                            Delivering code that is as precise as it is powerful. Built to scale, designed to impress from the roots up.
                        </p>
                    </BrutalCard>
                    <BrutalCard className="bg-[#FEF08A]">
                        <div className="flex gap-4 items-center">
                            <Zap className="w-8 h-8" />
                            <h5 className="font-black uppercase text-xl">Rapid Prototype</h5>
                        </div>
                        <p className="mt-4 text-sm font-bold opacity-70 leading-tight italic">
                            From concept to execution in record time. Accelerating digital growth through aggressive and iterative deployment cycles.
                        </p>
                    </BrutalCard>
                </div>
            </div>
        </div>
    </div>
);

const SkillsView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-4xl sm:text-5xl md:text-8xl font-black uppercase outline-text text-white leading-none mb-12">Technological_Prowess</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SKILLS.map((skill, i) => (
                <BrutalCard key={i} className="flex flex-col gap-6" style={{ backgroundColor: skill.color }}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white border-[3px] border-black shadow-[4px_4px_0px_black]"><skill.icon className="w-8 h-8" /></div>
                            <h4 className="text-2xl md:text-3xl font-black uppercase leading-none">{skill.name}</h4>
                        </div>
                        <div className="text-4xl font-black outline-text text-white">{skill.level}%</div>
                    </div>
                    <div className="w-full h-12 border-[4px] border-black bg-white relative overflow-hidden shadow-[6px_6px_0px_black]">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.level}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className="h-full bg-black flex items-center justify-end px-4"
                        >
                            <span className="text-[10px] text-white font-black uppercase tracking-widest whitespace-nowrap">Operational // Level_0{i+1}</span>
                        </motion.div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {["STABLE", "OPTIMIZED", "CORE_UNIT", "PROD_READY"].map(tag => (
                            <span key={tag} className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest border border-white/20">{tag}</span>
                        ))}
                    </div>
                </BrutalCard>
            ))}
        </div>
        <BrutalCard className="bg-black text-white px-8 py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                <h4 className="text-3xl font-black uppercase flex items-center gap-4">
                    <Code2 className="w-10 h-10 text-[#B8FF9F]" /> 
                    Secondary_Modules_Catalog
                </h4>
                <div className="h-0.5 flex-1 bg-[#B8FF9F]/20 hidden md:block mx-8" />
                <span className="bg-[#B8FF9F] text-black px-4 py-1 font-black text-xs uppercase">10_Modules_found</span>
            </div>
            <div className="flex flex-wrap gap-4">
                {["NextJS", "Docker", "PostgreSQL", "TailwindCSS", "GSAP", "ThreeJS", "Firebase", "NodeJS", "Zustand", "Playwright"].map(module => (
                    <div key={module} className="px-8 py-4 border-[3px] border-[#B8FF9F] hover:bg-[#B8FF9F] hover:text-black transition-all cursor-crosshair font-black uppercase text-sm tracking-widest shadow-[4px_4px_0px_#B8FF9F] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]" data-cursor="hover">
                        {module}
                    </div>
                ))}
            </div>
        </BrutalCard>
    </div>
);

const ProjectsView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
                <h2 className="text-4xl sm:text-5xl md:text-8xl font-black uppercase outline-text text-white leading-none">Selected_Works</h2>
                <p className="font-black text-xl uppercase mt-4 text-[#F472B6] tracking-widest italic">// EXHIBIT_DEK_D</p>
            </div>
            <div className="flex gap-4">
                <BrutalButton color="white" className="h-14">FILTER_OPS</BrutalButton>
                <BrutalButton color="black" className="h-14">GIT_MAINFRAME</BrutalButton>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {PORTFOLIO_PROJECTS.map((proj) => (
                <BrutalCard key={proj.id} noPadding className="flex flex-col group overflow-hidden border-[4px]">
                    <div className="h-72 border-b-[4px] border-black overflow-hidden relative">
                        <img src={proj.img} alt={proj.name} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0" />
                        <div className="absolute top-6 left-6 bg-black text-white px-4 py-2 font-black text-sm uppercase border-[2px] border-white shadow-[4px_4px_0px_#FF9F9F]">Unit_0{proj.id}</div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="text-white font-black text-2xl uppercase tracking-[0.3em] border-[4px] border-white p-6">Access_Granted</span>
                        </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col gap-5" style={{ backgroundColor: proj.color }}>
                        <div className="flex justify-between items-start">
                            <h4 className="text-4xl font-black uppercase leading-none tracking-tighter">{proj.name}</h4>
                            <div className="p-2 border-[2px] border-black bg-white shadow-[3px_3px_0px_black]"><ExternalLink className="w-6 h-6" /></div>
                        </div>
                        <p className="font-bold text-base leading-snug opacity-80 italic lowercase">{proj.desc}</p>
                        <div className="flex flex-wrap gap-2 mt-auto pt-6">
                            {proj.tags.map(tag => (
                                <span key={tag} className="px-4 py-1.5 bg-black text-white text-xs font-black uppercase tracking-widest border border-white/10">{tag}</span>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 border-t-[4px] border-black">
                        <button className="py-6 font-black uppercase text-sm hover:bg-black hover:text-white transition-colors border-r-[4px] border-black flex items-center justify-center gap-3 group/btn" data-cursor="hover">
                            <Layers className="w-5 h-5 group-hover/btn:animate-bounce" /> Case_Study
                        </button>
                        <button className="py-6 font-black uppercase text-sm hover:bg-[#B8FF9F] hover:text-black transition-colors flex items-center justify-center gap-3 group/btn" data-cursor="hover">
                            <ExternalLink className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" /> Launch_Live
                        </button>
                    </div>
                </BrutalCard>
            ))}
        </div>
    </div>
);

const ContactView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12">
                <h2 className="text-4xl sm:text-6xl md:text-9xl font-black uppercase text-center mb-16 outline-text text-white tracking-[0.05em] sm:tracking-[0.2em] leading-none">Initialize_Comm</h2>
            </div>
            <div className="lg:col-span-7">
                <BrutalCard className="bg-white border-[4px] shadow-[8px_8px_0px_black]">
                    <h4 className="text-2xl font-black uppercase mb-8 flex items-center gap-4 italic text-[#F472B6]">
                        <Mail className="w-8 h-8" /> Signal_Transmission_Form
                    </h4>
                    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-black uppercase tracking-widest">Identify_Name</label>
                                <input type="text" className="w-full h-16 bg-[#F3F4F6] border-[4px] border-black px-6 font-black uppercase text-sm focus:bg-[#B8FF9F] outline-none transition-all focus:shadow-[4px_4px_0px_black] placeholder:opacity-30" placeholder="ANONYMOUS_UNIT" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-black uppercase tracking-widest">Communication_IP</label>
                                <input type="email" className="w-full h-16 bg-[#F3F4F6] border-[4px] border-black px-6 font-black uppercase text-sm focus:bg-[#A5F3FC] outline-none transition-all focus:shadow-[4px_4px_0px_black] placeholder:opacity-30" placeholder="USER@TERMINAL.LOCAL" />
                            </div>
                        </div>
                        <div className="space-y-3" data-cursor="hover">
                            <label className="text-sm font-black uppercase tracking-widest">Transmission_Subject</label>
                            <input type="text" className="w-full h-16 bg-[#F3F4F6] border-[4px] border-black px-6 font-black uppercase text-sm focus:bg-[#FEF08A] outline-none transition-all focus:shadow-[4px_4px_0px_black] placeholder:opacity-30" placeholder="SECTOR_7_PROPOSAL" />
                        </div>
                        <div className="space-y-3" data-cursor="hover">
                            <label className="text-sm font-black uppercase tracking-widest">Core_Data_Payload</label>
                            <textarea rows={6} className="w-full bg-[#F3F4F6] border-[4px] border-black p-6 font-black text-sm uppercase focus:bg-white outline-none transition-all focus:shadow-[4px_4px_0px_black] resize-none placeholder:opacity-30" placeholder="DESCRIBE_THE_MISSION_PARAMETERS..."></textarea>
                        </div>
                        <BrutalButton className="w-full !h-20 text-2xl" color="black">Launch_Broadcast_Packet</BrutalButton>
                    </form>
                </BrutalCard>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-8">
                <BrutalCard className="bg-[#B8FF9F] border-[4px] shadow-[8px_8px_0px_black]">
                    <h4 className="text-2xl font-black uppercase mb-8 border-b-4 border-black pb-4 italic">// NETWORK_LOCATIONS</h4>
                    <div className="space-y-6">
                        <div className="flex items-center gap-6 group cursor-pointer" data-cursor="hover">
                            <div className="p-4 bg-black text-white border-[3px] border-black group-hover:bg-white group-hover:text-black transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1"><Mail className="w-8 h-8" /></div>
                            <div>
                                <p className="text-xs font-black uppercase opacity-60 tracking-[0.2em] mb-1">Email_Direct</p>
                                <p className="font-black text-xl md:text-2xl truncate max-w-[200px] md:max-w-none">HELLO@UIHUB.IO</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 group cursor-pointer" data-cursor="hover">
                            <div className="p-4 bg-black text-white border-[3px] border-black group-hover:bg-white group-hover:text-black transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1"><Twitter className="w-8 h-8" /></div>
                            <div>
                                <p className="text-xs font-black uppercase opacity-60 tracking-[0.2em] mb-1">Global_Freq</p>
                                <p className="font-black text-xl md:text-2xl uppercase">@BRUTAL_PORTFOLIO</p>
                            </div>
                        </div>
                    </div>
                </BrutalCard>
                <BrutalCard className="bg-[#A5F3FC] flex-1 border-[4px] shadow-[8px_8px_0px_black]">
                    <h4 className="text-2xl font-black uppercase mb-8 italic text-blue-900">// UPTIME_CYCLES</h4>
                    <div className="space-y-4 font-black md:text-lg uppercase">
                        <div className="flex justify-between border-b-2 border-black/30 pb-2"><span>MON-FRI</span><span>08:00 - 20:00</span></div>
                        <div className="flex justify-between border-b-2 border-black/30 pb-2"><span>SAT</span><span>10:00 - 16:00</span></div>
                        <div className="flex justify-between py-2 text-red-600 bg-red-100 px-2 -mx-2"><span>SUN</span><span>OFFLINE_MODE</span></div>
                    </div>
                    <div className="mt-12 p-6 bg-white border-[4px] border-black text-center shadow-[4px_4px_0px_black] group" data-cursor="hover">
                        <p className="text-xs font-black opacity-40 uppercase tracking-widest mb-1">System_Clock_Sync</p>
                        <p className="text-3xl font-black tracking-widest group-hover:text-red-500 transition-colors">21:46:10</p>
                    </div>
                </BrutalCard>
            </div>
        </div>
    </div>
);

// --- MAIN OS COMPONENT ---

export default function NeoBrutalism({ showDemoButton = false }: { showDemoButton?: boolean }) {
    const [activeTab, setActiveTab] = useState<"Dashboard" | "About" | "Skills" | "Projects" | "Contact">("Dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    const containerRef = useRef<HTMLDivElement>(null);

    const navItems = [
        { id: "Dashboard", icon: LayoutDashboard },
        { id: "About", icon: Users },
        { id: "Skills", icon: Zap },
        { id: "Projects", icon: Briefcase },
        { id: "Contact", icon: Mail },
    ];

    return (
        <div 
            ref={containerRef}
            className="flex flex-col h-screen w-full bg-[#F3F4F6] text-black font-sans selection:bg-black selection:text-[#B8FF9F] overflow-hidden relative"
        >

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                body { font-family: 'Inter', sans-serif; overflow-x: hidden; }
                .outline-text { -webkit-text-stroke: 2px black; color: white; }
                @media (max-width: 768px) { .outline-text { -webkit-text-stroke: 1px black; } }
                .custom-scrollbar::-webkit-scrollbar { width: 14px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: white; border-left: 4px solid black; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: black; border: 3px solid white; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FEF08A; }
            `}</style>
            
            <Marquee />

            <div className="flex flex-1 min-h-0 overflow-hidden relative pb-20 md:pb-0">
                {/* SIDEBAR */}
                <motion.aside 
                    initial={false}
                    animate={{ width: isSidebarOpen ? 300 : 100 }}
                    transition={{ type: "spring", stiffness: 400, damping: 40 }}
                    className="bg-white border-r-[4px] border-black flex flex-col z-20 relative overflow-hidden shrink-0 shadow-[8px_0px_0px_rgba(0,0,0,0.05)]"
                >
                    <div className="p-6 border-b-[4px] border-black h-24 flex items-center justify-between overflow-hidden bg-white">
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    className="flex items-center gap-3 whitespace-nowrap"
                                >
                                    <div className="w-12 h-12 bg-black flex items-center justify-center border-[3px] border-black shadow-[3px_3px_0px_#B8FF9F]"><span className="text-white font-black text-2xl italic">NB</span></div>
                                    <span className="font-black text-2xl uppercase tracking-tighter leading-none">Brutal OS<br/><span className="text-[10px] tracking-[0.4em] opacity-40">PORTFOLIO_UNIT</span></span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-12 h-12 border-[3px] border-black flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-[3px_3px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 shrink-0">{isSidebarOpen ? <ChevronLeft strokeWidth={3} /> : <ChevronRight strokeWidth={3} />}</button>
                    </div>

                    <nav className="flex-1 p-6 space-y-4 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] bg-opacity-5">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={cn(
                                    "w-full h-16 flex items-center gap-5 px-5 border-[4px] border-black transition-all group relative overflow-hidden",
                                    activeTab === item.id 
                                        ? "bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]" 
                                        : "bg-white hover:bg-[#FEF08A] shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                                )}
                            >
                                <item.icon className={cn("w-7 h-7 shrink-0 transition-transform group-hover:scale-110", activeTab === item.id ? "text-[#B8FF9F]" : "text-black")} />
                                {isSidebarOpen && <span className="font-black uppercase tracking-widest text-base truncate">{item.id}</span>}
                                {!isSidebarOpen && activeTab === item.id && <div className="absolute left-0 top-0 w-2 h-full bg-[#B8FF9F]" />}
                            </button>
                        ))}
                    </nav>

                    <div className="p-6 border-t-[4px] border-black overflow-hidden group cursor-pointer bg-white" onClick={() => setActiveTab("About")}>
                        <div className={cn("flex items-center gap-5 p-3 transition-all border-[3px] border-black", isSidebarOpen ? "bg-[#F3F4F6] shadow-[4px_4px_0px_black]" : "bg-white border-none items-center justify-center p-0")}>
                            <div className="w-12 h-12 bg-black border-[3px] border-black grayscale group-hover:grayscale-0 overflow-hidden shrink-0 transition-all group-hover:rotate-6 shadow-[3px_3px_0px_#B8FF9F]"><img src="/profile.jpg" alt="user" className="w-full h-full object-cover" /></div>
                            {isSidebarOpen && <div className="overflow-hidden"><p className="font-black text-sm uppercase truncate mb-0.5">Jainil_Dev</p><p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Architect_Unit_01</p></div>}
                        </div>
                    </div>
                </motion.aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                    <header className="h-24 bg-white border-b-[4px] border-black flex items-center justify-between px-6 md:px-12 z-10 shrink-0 shadow-[0px_8px_0px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase opacity-30 tracking-[0.4em]">CURRENT_LOCATION</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-black uppercase text-white bg-black px-3 py-1 border-[2px] border-black shadow-[3px_3px_0px_#FF9F9F]">ROOT</span>
                                    <span className="text-xl font-black uppercase opacity-20">/</span>
                                    <span className="text-xl font-black uppercase tracking-widest">{activeTab}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 md:gap-8">
                            <div className="hidden lg:flex flex-col items-end mr-4">
                                <span className="text-[10px] font-black uppercase opacity-30 tracking-[0.4em]">SYSTEM_HEALTH</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-3 bg-black border border-white" />)}
                                    </div>
                                    <span className="text-xs font-black uppercase">100%_SECURE</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button className="w-12 h-12 border-[3px] border-black bg-white hover:bg-[#FEF08A] transition-all relative flex items-center justify-center shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1"><Bell className="w-6 h-6" /><span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-[2px] border-black rounded-none animate-pulse" /></button>
                                <button className="w-12 h-12 border-[3px] border-black bg-white hover:bg-[#A5F3FC] transition-all flex items-center justify-center shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1"><Search className="w-6 h-6" /></button>
                            </div>
                            <BrutalButton className="!h-14 hidden md:flex !px-8 border-[4px]" color="black">SYNC_MAINFRAME</BrutalButton>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5" data-lenis-prevent>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.98, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: -30 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {activeTab === "Dashboard" && <DashboardView time={currentTime} />}
                                {activeTab === "About" && <AboutView />}
                                {activeTab === "Skills" && <SkillsView />}
                                {activeTab === "Projects" && <ProjectsView />}
                                {activeTab === "Contact" && <ContactView />}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <footer className="h-10 bg-black border-t-[4px] border-black flex items-center justify-between px-6 text-white text-[10px] font-black uppercase tracking-[0.3em] shrink-0">
                        <div className="flex gap-10">
                            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#B8FF9F]" /> SYNC: STABLE</span>
                            <span className="hidden sm:inline">NODES: 12_DISTRIBUTED</span>
                            <span className="hidden lg:inline">CORES: 64_VIRTUAL</span>
                        </div>
                        <div className="flex gap-10">
                            <span className="text-[#B8FF9F] flex items-center gap-2 animate-pulse"><div className="w-2 h-2 bg-[#B8FF9F]" /> UPLINK_ACTIVE</span>
                            <span className="hidden sm:inline">ENCRYPTION: AES_256_RSA</span>
                        </div>
                    </footer>
                </main>
            </div>
            {/* BOTTOM NAV (Mobile Only) */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t-[3px] border-black p-2 flex justify-around items-center z-[100] shadow-[0_-4px_0px_0px_rgba(0,0,0,1)]">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-none transition-all",
                            activeTab === item.id ? "bg-black text-white" : "text-black"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase">{item.id}</span>
                    </button>
                ))}
            </div>

            {/* VIEW FULL DEMO OVERLAY - Only shown in Library Preview */}
            <AnimatePresence>
                {showDemoButton && (
                    <motion.div 
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="absolute inset-0 z-[100] flex items-center justify-center bg-black/5 pointer-events-none"
                    >
                        <Link 
                            to="/demo/neo-brutalism-os" 
                            target="_blank"
                            className="pointer-events-auto no-underline"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: -1 }}
                                whileTap={{ scale: 0.95, rotate: 1 }}
                            >
                                <BrutalButton 
                                    className="!h-20 !px-12 border-[4px] shadow-[8px_8px_0px_black] text-xl gap-4 group"
                                    color="green"
                                >
                                    <ExternalLink size={24} className="group-hover:rotate-12 transition-transform" />
                                    VIEW FULL DEMO
                                </BrutalButton>
                            </motion.div>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
