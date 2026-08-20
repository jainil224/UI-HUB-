import React from 'react';
import { Github, Linkedin, Instagram, ArrowUpRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => (
    <footer className="w-full border-t-4 border-black bg-brand-surface relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Main footer body */}
            <div className="py-16 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
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
                                className="flex items-center justify-center w-9 h-9 rounded border-2 border-white bg-brand-bg text-neutral-400 hover:text-white hover:bg-brand-blue hover:border-black brutal-shadow-black transition-all"
                            >
                                <Icon size={16} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Navigate</h4>
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
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Resources</h4>
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

                    {/* Status badge */}
                    <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded border-2 border-white bg-brand-bg w-fit brutal-shadow-black">
                        <span className="w-2 h-2 rounded-full bg-brand-blue" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">All Systems Live</span>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="py-6 border-t-2 border-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-neutral-500 text-xs font-mono tracking-wider">
                    © 2026 UI HUB — Built for vibe coders.
                </p>
                <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-black tracking-widest">
                    <Zap size={10} className="text-brand-blue" fill="currentColor" />
                    <span className="uppercase">Made with love by</span>
                    <a
                        href="https://github.com/jainil224"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-brand-blue transition-colors"
                    >
                        Jainil Patel
                    </a>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
