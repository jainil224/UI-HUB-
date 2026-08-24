import React from 'react';
import { Github, Linkedin, Instagram, ArrowUpRight, Zap, CircleDot } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import PixelDrift from './PixelDrift';

const utilityLinks = [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms & Conditions', to: '/terms' },
    { label: 'Payment Policy', to: '/pricing' },
    { label: 'Cookie Settings', to: '/privacy' },
];

const Footer = () => (
    <footer className="w-full border-t-4 border-black bg-brand-bg relative overflow-hidden">
        {/* ── Top: Brand + Link Columns ─────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="pt-16 pb-12 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
                {/* Brand column */}
                <div className="md:col-span-2 flex flex-col gap-5">
                    <Link to="/" className="flex items-center gap-2.5 group w-fit">
                        <Logo />
                        <span className="font-black text-xl tracking-tight text-white group-hover:text-brand-blue transition-colors">
                            UI HUB
                        </span>
                    </Link>
                    <p className="text-neutral-400 text-sm leading-relaxed max-w-sm font-medium">
                        A premium UI component platform with 100+ cinematic components,
                        AI-powered prompts, and 3D experiences — built for developers who
                        refuse to settle for ordinary.
                    </p>
                    {/* Social links */}
                    <div className="flex items-center gap-2 mt-1">
                        {[
                            { href: 'https://github.com/jainil224', icon: Github, label: 'GitHub' },
                            { href: 'https://www.linkedin.com/in/jainil-patel2224', icon: Linkedin, label: 'LinkedIn' },
                            { href: 'https://www.instagram.com/jainilll_2208/', icon: Instagram, label: 'Instagram' },
                        ].map(({ href, icon: Icon, label }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="flex items-center justify-center w-11 h-11 rounded border-2 border-white bg-brand-surface text-neutral-400 hover:text-white hover:bg-brand-blue hover:border-black brutal-shadow-black transition-all"
                            >
                                <Icon size={17} />
                            </a>
                        ))}
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-2 mt-1 px-3 py-1.5 rounded border-2 border-white bg-brand-surface w-fit brutal-shadow-black">
                        <CircleDot size={10} className="text-brand-blue animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">All Systems Live</span>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-blue border border-black" />
                        Navigate
                    </h4>
                    <ul className="flex flex-col gap-2.5">
                        {[
                            { to: '/', label: 'Home' },
                            { to: '/library', label: 'Component Library' },
                            { to: '/pricing', label: 'Pricing' },
                            { to: '/favorites', label: 'Favorites' },
                        ].map(({ to, label }) => (
                            <li key={to}>
                                <Link
                                    to={to}
                                    className="text-sm font-bold text-neutral-400 hover:text-white transition-colors flex items-center gap-1 group w-fit"
                                >
                                    {label}
                                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Resources */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-yellow border border-black" />
                        Resources
                    </h4>
                    <ul className="flex flex-col gap-2.5">
                        {[
                            { href: 'https://github.com/jainil224/UI-HUB-', label: 'GitHub Repo' },
                            { href: 'https://github.com/jainil224/UI-HUB-/issues', label: 'Report a Bug' },
                            { href: 'https://github.com/jainil224', label: 'Author' },
                        ].map(({ href, label }) => (
                            <li key={label}>
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-bold text-neutral-400 hover:text-white transition-colors flex items-center gap-1 group w-fit"
                                >
                                    {label}
                                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        {/* ── Utility Links Row (United-Carriers style) ─────────────── */}
        <div className="relative z-10 border-t-2 border-neutral-800">
            <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center lg:justify-between gap-x-6 gap-y-2">
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

        {/* ── Giant Interactive Particle Wordmark ──────────────────── */}
        <div
            className="relative select-none cursor-crosshair"
            style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(61,92,255,0.12), transparent 60%)' }}
        >
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
                className="h-[200px] sm:h-[280px] md:h-[360px] w-full"
            />

            {/* Corner ticks for brutalist framing */}
            <span className="absolute top-3 left-4 w-3 h-3 border-t-2 border-l-2 border-neutral-700 pointer-events-none" />
            <span className="absolute top-3 right-4 w-3 h-3 border-t-2 border-r-2 border-neutral-700 pointer-events-none" />
            <span className="absolute bottom-3 left-4 w-3 h-3 border-b-2 border-l-2 border-neutral-700 pointer-events-none" />
            <span className="absolute bottom-3 right-4 w-3 h-3 border-b-2 border-r-2 border-neutral-700 pointer-events-none" />
        </div>
    </footer>
);

export default Footer;
