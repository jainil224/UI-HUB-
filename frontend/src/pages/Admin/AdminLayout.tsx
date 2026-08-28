import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, BarChart3, Wrench, FlaskConical, Boxes, Search, Users,
    KeyRound, ScrollText, ShieldCheck, HeartPulse, BellRing, Settings, History,
    Download, ChevronLeft, Menu, X, ArrowLeft, Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMcpKeepAlive } from '../../hooks/useMcpKeepAlive';

export const ADMIN_NAV = [
    { to: '/admin/mcp/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/mcp/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/mcp/tools', label: 'Tools', icon: Wrench },
    { to: '/admin/mcp/playground', label: 'Playground', icon: FlaskConical },
    { to: '/admin/mcp/components', label: 'Components', icon: Boxes },
    { to: '/admin/mcp/search', label: 'Search', icon: Search },
    { to: '/admin/mcp/users', label: 'MCP Users', icon: Users },
    { to: '/admin/mcp/api-keys', label: 'API Keys', icon: KeyRound },
    { to: '/admin/mcp/logs', label: 'Logs', icon: ScrollText },
    { to: '/admin/mcp/security', label: 'Security', icon: ShieldCheck },
    { to: '/admin/mcp/health', label: 'Server Health', icon: HeartPulse },
    { to: '/admin/mcp/alerts', label: 'Alerts', icon: BellRing },
    { to: '/admin/mcp/settings', label: 'Settings', icon: Settings },
    { to: '/admin/mcp/audit', label: 'Audit', icon: History },
    { to: '/admin/mcp/export', label: 'Export', icon: Download },
];

const AdminLayout: React.FC = () => {
    const { user } = useAuth();
    useMcpKeepAlive();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const isSuperAdmin = user?.email?.toLowerCase() === 'jainil11199@gmail.com';

    const SidebarContent = (
        <div className="flex flex-col h-full">
            <div className={`border-b-2 border-white px-4 py-4 flex items-center gap-3 ${collapsed ? 'justify-center px-2' : ''}`}>
                <div className="w-9 h-9 shrink-0 rounded-md border-2 border-white bg-brand-blue flex items-center justify-center text-white">
                    <Bot size={18} />
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-widest text-white truncate">UI HUB</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">MCP Admin</p>
                    </div>
                )}
            </div>

            <nav className={`flex-1 overflow-y-auto p-3 space-y-1 ${collapsed ? 'px-2' : ''}`}>
                {ADMIN_NAV.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-md px-3 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                                    collapsed ? 'justify-center px-2' : ''
                                } ${
                                    isActive
                                        ? 'bg-brand-blue text-white shadow-[3px_3px_0_0_#000]'
                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                                }`
                            }
                            title={item.label}
                        >
                            <Icon size={16} className="shrink-0" />
                            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            <div className={`border-t-2 border-white p-4 ${collapsed ? 'px-2 text-center' : ''}`}>
                <div className={`flex items-center gap-3 rounded-md border-2 border-white bg-brand-bg p-2.5 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-9 h-9 shrink-0 rounded-full border-2 border-white bg-brand-yellow text-black flex items-center justify-center font-black text-sm uppercase">
                        {(user?.displayName || user?.email || 'A').slice(0, 1).toUpperCase()}
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="text-[11px] font-black text-white truncate">{user?.displayName || 'Admin'}</p>
                            <p className="text-[10px] text-neutral-400 truncate">{isSuperAdmin ? 'Super Admin' : 'Admin'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 relative bg-brand-bg">
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="absolute -top-48 -left-48 w-[560px] h-[560px] bg-brand-blue/[0.08] blur-[130px] rounded-full" />
                <div className="absolute -bottom-48 -right-48 w-[560px] h-[560px] bg-brand-blue/[0.05] blur-[130px] rounded-full" />
            </div>

            <div className="max-w-[1500px] mx-auto">
                <header className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden w-10 h-10 rounded-md border-2 border-white bg-brand-surface flex items-center justify-center text-white cursor-pointer"
                            aria-label="Open navigation"
                        >
                            <Menu size={18} />
                        </button>
                        <div className="hidden lg:flex items-center gap-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{location.pathname.split('/').filter(Boolean).join(' / ')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCollapsed((c) => !c)}
                            className="hidden lg:flex items-center gap-2 rounded-md border-2 border-white bg-brand-surface px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={14} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                            {collapsed ? 'Expand' : 'Collapse'}
                        </button>
                        <Link
                            to="/dashboard/mcp"
                            className="inline-flex items-center gap-2 rounded-md border-2 border-white bg-brand-surface px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                        >
                            <ArrowLeft size={14} /> Dashboard
                        </Link>
                        <div className="hidden sm:flex items-center gap-2 rounded-md border-2 border-white bg-brand-surface px-3 py-2">
                            <span className="w-7 h-7 rounded-full border-2 border-white bg-brand-yellow text-black flex items-center justify-center font-black text-xs uppercase">
                                {(user?.displayName || user?.email || 'A').slice(0, 1).toUpperCase()}
                            </span>
                            <div className="hidden md:block">
                                <p className="text-[11px] font-black text-white leading-none">{user?.displayName || 'Admin'}</p>
                                <p className="text-[9px] text-brand-blue font-bold uppercase mt-0.5">{isSuperAdmin ? 'Super Admin' : 'Admin'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className={`hidden lg:block shrink-0 transition-all duration-200 ${collapsed ? 'w-16' : 'w-64'}`}>
                        <div className="lg:sticky lg:top-24 border-2 border-white bg-brand-surface rounded-lg brutal-shadow-blue overflow-hidden">
                            {SidebarContent}
                        </div>
                    </aside>

                    <section className="flex-1 min-w-0">
                        <Outlet />
                    </section>
                </div>
            </div>

            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-[100]">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-brand-surface border-r-2 border-white shadow-2xl overflow-y-auto">
                        <div className="flex items-center justify-end p-3 border-b-2 border-white">
                            <button onClick={() => setMobileOpen(false)} className="w-10 h-10 rounded-md border-2 border-white flex items-center justify-center text-white cursor-pointer" aria-label="Close navigation">
                                <X size={18} />
                            </button>
                        </div>
                        {SidebarContent}
                    </div>
                </div>
            )}
        </main>
    );
};

export default AdminLayout;