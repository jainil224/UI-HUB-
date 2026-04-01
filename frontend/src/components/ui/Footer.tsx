import React from 'react';
import { Github, Linkedin, Instagram, ArrowUpRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => (
    <footer className="w-full border-t border-white/[0.06] bg-[#050505] relative overflow-hidden">

        {/* Subtle top glow line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-green/30 to-transparent" />
        {/* Ambient background glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-green/3 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">

            {/* Main footer body */}
            <div className="py-16 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

                {/* Brand column */}
                <div className="md:col-span-2 flex flex-col gap-5">
                    <Link to="/" className="flex items-center gap-2.5 group w-fit">
                        <Logo />
                        <span className="font-heading font-black text-xl tracking-tight text-white group-hover:text-brand-green transition-colors duration-300">
                            UI HUB
                        </span>
                    </Link>
                    <p className="text-white/35 text-sm leading-relaxed max-w-sm font-light">
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
                                className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/30 hover:text-brand-green hover:bg-brand-green/10 hover:border-brand-green/30 transition-all duration-300"
                            >
                                <Icon size={16} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25">Navigate</h4>
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
                                    className="text-sm text-white/40 hover:text-white transition-colors duration-200 flex items-center gap-1 group w-fit"
                                >
                                    {label}
                                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 -translate-y-0.5 translate-x-0 group-hover:translate-x-0.5 group-hover:-translate-y-1 transition-all duration-200" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Resources */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25">Resources</h4>
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
                                    className="text-sm text-white/40 hover:text-white transition-colors duration-200 flex items-center gap-1 group w-fit"
                                >
                                    {label}
                                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 -translate-y-0.5 group-hover:-translate-y-1 group-hover:translate-x-0.5 transition-all duration-200" />
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* Status badge */}
                    <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-brand-green/5 border border-brand-green/15 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse shadow-[0_0_6px_#00FF1A]" />
                        <span className="text-[10px] font-bold text-brand-green/80 uppercase tracking-widest">All Systems Live</span>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="py-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-white/20 text-xs font-mono tracking-wider">
                    © 2026 UI HUB — Built for vibe coders.
                </p>
                <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-black tracking-[0.2em]">
                    <Zap size={10} className="text-brand-green" fill="currentColor" />
                    <span className="uppercase">Made with love by</span>
                    <a
                        href="https://github.com/jainil224"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/70 hover:text-brand-green transition-colors duration-200"
                    >
                        Jainil Patel
                    </a>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
