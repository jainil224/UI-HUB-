import React from 'react';
import { Github, Linkedin, Instagram, ArrowUpRight, Zap, CircleDot, ArrowUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import PixelDrift from './PixelDrift';

const navigateLinks = [
    { to: '/', label: 'Home' },
    { to: '/library', label: 'Component Library' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/favorites', label: 'Favorites' },
];

const resourceLinks = [
    { href: 'https://github.com/jainil224/UI-HUB-', label: 'GitHub Repo' },
    { href: 'https://github.com/jainil224/UI-HUB-/issues', label: 'Report a Bug' },
    { href: 'https://github.com/jainil224', label: 'Author' },
];

const utilityLinks = [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms & Conditions', to: '/terms' },
    { label: 'Payment Policy', to: '/pricing' },
    { label: 'Cookie Settings', to: '/privacy' },
];

const socials = [
    { href: 'https://github.com/jainil224', icon: Github, label: 'GitHub' },
    { href: 'https://www.linkedin.com/in/jainil-patel2224', icon: Linkedin, label: 'LinkedIn' },
    { href: 'https://www.instagram.com/jainilll_2208/', icon: Instagram, label: 'Instagram' },
];

const Footer = () => (
    <footer className="w-full bg-brand-bg relative overflow-hidden">
        {/* ── Accent seam ─────────────────────────────────────────── */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-blue" />

        {/* ── Ambient backdrop: graph grid + bottom glow ──────────── */}
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
                maskImage: 'linear-gradient(to bottom, black 40%, transparent 85%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 85%)',
            }}
        />
        <div
            className="absolute inset-x-0 bottom-0 h-[420px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 115%, rgba(61,92,255,0.16), transparent 60%)' }}
        />

        {/* ── One unified content block ───────────────────────────── */}
        <div className="relative z-10 max-w-7xl mx-auto px-6">
            <div className="pt-14 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
                {/* Brand */}
                <div className="lg:col-span-5 flex flex-col gap-5">
                    <Link to="/" className="flex items-center gap-2.5 group w-fit">
                        <span className="flex items-center justify-center w-11 h-11 bg-white border-2 border-black rounded-sm brutal-shadow-blue shrink-0 group-hover:-translate-y-0.5 transition-transform">
                            <Logo className="w-7 h-7" />
                        </span>
                        <span className="font-black text-xl tracking-tight text-white group-hover:text-brand-blue transition-colors">
                            UI HUB
                        </span>
                    </Link>

                    <p className="text-neutral-400 text-sm leading-relaxed max-w-sm font-medium">
                        A premium UI component platform with 100+ cinematic components,
                        AI-powered prompts, and 3D experiences — built for developers who
                        refuse to settle for ordinary.
                    </p>

                    {/* Socials + live status, fused into one strip */}
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        {socials.map(({ href, icon: Icon, label }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="flex items-center justify-center w-10 h-10 rounded border-2 border-white bg-brand-surface text-neutral-400 hover:text-white hover:bg-brand-blue hover:border-black hover:-translate-y-0.5 brutal-shadow-black transition-all"
                            >
                                <Icon size={16} />
                            </a>
                        ))}
                        <span className="flex items-center gap-2 px-3 py-2.5 rounded border-2 border-white bg-brand-surface brutal-shadow-black">
                            <CircleDot size={10} className="text-brand-blue animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">All Systems Live</span>
                        </span>
                    </div>

                    {/* CTA */}
                    <Link
                        to="/library"
                        className="group mt-1 inline-flex items-center gap-2 w-fit px-5 py-2.5 bg-brand-blue text-white border-2 border-black text-[11px] font-black uppercase tracking-widest brutal-shadow-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                    >
                        <Sparkles size={13} className="group-hover:rotate-12 transition-transform" />
                        Explore 100+ Components
                        <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Link columns */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-10 lg:pl-12">
                    {/* Navigate */}
                    <div className="flex flex-col gap-4">
                        <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white border-b border-neutral-800 pb-3">
                            <span className="w-2 h-2 rounded-full bg-brand-blue border border-black" />
                            Navigate
                        </h4>
                        <ul className="flex flex-col gap-2.5">
                            {navigateLinks.map(({ to, label }) => (
                                <li key={to}>
                                    <Link
                                        to={to}
                                        className="group flex items-center gap-1.5 w-fit text-sm font-bold text-neutral-400 hover:text-white hover:translate-x-1 transition-all"
                                    >
                                        <span className="w-0 group-hover:w-2 h-px bg-brand-blue transition-all" />
                                        {label}
                                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="flex flex-col gap-4">
                        <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white border-b border-neutral-800 pb-3">
                            <span className="w-2 h-2 rounded-full bg-brand-yellow border border-black" />
                            Resources
                        </h4>
                        <ul className="flex flex-col gap-2.5">
                            {resourceLinks.map(({ href, label }) => (
                                <li key={label}>
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-1.5 w-fit text-sm font-bold text-neutral-400 hover:text-white hover:translate-x-1 transition-all"
                                    >
                                        <span className="w-0 group-hover:w-2 h-px bg-brand-yellow transition-all" />
                                        {label}
                                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        {/* ── Giant particle wordmark + legal row, fused as one ───── */}
        <div className="relative select-none cursor-crosshair">
            {/* Back to top — sits on the seam */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Back to top"
                className="absolute -top-6 right-6 z-30 flex items-center justify-center w-12 h-12 bg-brand-surface border-2 border-white text-white brutal-shadow-blue hover:bg-brand-blue hover:border-black hover:-translate-y-1 transition-all"
            >
                <ArrowUp size={18} />
            </button>

            <PixelDrift
                text="UI HUB"
                colors={['#FFFFFF', '#3D5CFF', '#FFC700']}
                mode="onEnter"
                replay={true}
                position="above"
                fontSize={220}
                particleSize={9}
                particleCount={45}
                mouseEnabled={true}
                mouseRadius={70}
                mouseForce={28}
                autoFit={true}
                transition={{ type: 'tween', duration: 1.4, ease: 'easeOut' }}
                className="h-[200px] sm:h-[280px] md:h-[340px] w-full"
            />

            {/* Corner ticks for brutalist framing */}
            <span className="absolute top-3 left-4 w-3 h-3 border-t-2 border-l-2 border-neutral-700 pointer-events-none" />
            <span className="absolute top-3 right-4 w-3 h-3 border-t-2 border-r-2 border-neutral-700 pointer-events-none" />
            <span className="absolute bottom-3 left-4 w-3 h-3 border-b-2 border-l-2 border-neutral-700 pointer-events-none" />
            <span className="absolute bottom-3 right-4 w-3 h-3 border-b-2 border-r-2 border-neutral-700 pointer-events-none" />

            {/* Legal row — overlaid on the wordmark so it reads as one block */}
            <div className="lg:absolute lg:bottom-0 lg:inset-x-0 z-20 bg-gradient-to-t from-brand-bg via-brand-bg/90 to-transparent">
                <div className="max-w-7xl mx-auto px-6 pt-6 pb-4 flex flex-wrap items-center justify-center lg:justify-between gap-x-6 gap-y-2">
                    <p className="text-neutral-500 text-[11px] font-mono tracking-wider">
                        © 2026 UI HUB — BUILT FOR VIBE CODERS.
                    </p>
                    <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Legal">
                        {utilityLinks.map(({ label, to }) => (
                            <Link
                                key={label}
                                to={to}
                                className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 hover:text-white underline-offset-2 hover:underline transition-colors"
                            >
                                {label}
                            </Link>
                        ))}
                        <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                            <Zap size={10} className="text-brand-blue" fill="currentColor" />
                            Made by
                            <a
                                href="https://github.com/jainil224"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:text-brand-blue transition-colors"
                            >
                                Jainil Patel
                            </a>
                        </span>
                    </nav>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
