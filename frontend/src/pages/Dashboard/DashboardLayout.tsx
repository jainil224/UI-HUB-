import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bot, Heart, ArrowLeft } from 'lucide-react';

const navItems = [
    { to: '/dashboard/mcp', label: 'MCP', icon: Bot, end: true },
    { to: '/favorites', label: 'Saved Components', icon: Heart },
];

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();

    return (
        <main className="min-h-screen pt-28 pb-24 px-4 sm:px-6 relative bg-brand-bg">
            {/* ── Ambient Page Texture ── */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="absolute -top-48 -left-48 w-[560px] h-[560px] bg-brand-blue/[0.07] blur-[130px] rounded-full" />
                <div className="absolute -bottom-48 -right-48 w-[560px] h-[560px] bg-brand-green/[0.05] blur-[130px] rounded-full" />
            </div>

            <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8">
                {/* ── Sidebar ── */}
                <aside className="lg:w-64 shrink-0">
                    <div className="lg:sticky lg:top-28 border-2 border-white bg-brand-surface rounded-lg brutal-shadow-blue overflow-hidden">
                        <div className="border-b-2 border-white bg-brand-bg px-5 py-4">
                            <button
                                onClick={() => navigate('/favorites')}
                                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <ArrowLeft size={13} /> Dashboard
                            </button>
                        </div>
                        <nav className="p-3 flex lg:flex-col gap-2 overflow-x-auto">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 rounded-md text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                                isActive
                                                    ? 'bg-brand-blue text-white shadow-[3px_3px_0_0_#000]'
                                                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                                            }`
                                        }
                                    >
                                        <Icon size={16} />
                                        <span>{item.label}</span>
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* ── Content ── */}
                <section className="flex-1 min-w-0">
                    <Outlet />
                </section>
            </div>
        </main>
    );
};

export default DashboardLayout;
