import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Crown, ArrowRight, Star, Lock, Sparkles, Download, Code2, Cpu, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
    const [isYearly, setIsYearly] = useState(false);

    // Dynamic Localization Logic
    const isIndia = Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Kolkata' || 
                   Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Calcutta';
    
    const currency = isIndia ? '₹' : '$';
    const quarterlyPrice = isIndia ? 499 : 5.99;
    const yearlyPrice = isIndia ? 1590 : 19; // ~20% discount on 4 quarters

    const freeFeatures = [
        { text: '50+ Essential UI Components', included: true },
        { text: 'React & HTML Production Code', included: true },
        { text: 'Starter Vault (Max 5 Favorites)', included: true },
        { text: 'Core Animation Design Suite', included: true },
        { text: '2 Free Trials for Advance Vibe Prompts', included: true },
        { text: 'Access to Lovable & Cursor Prompts', included: true },
    ];

    const freeLimitations = [
        { text: 'No Pixel-Perfect AI Synthesis', included: false },
        { text: 'No Elite Models (Antigravity/Claude)', included: false },
        { text: 'No Bulk ZIP Export Support', included: false },
        { text: 'No Premium Master Collection', included: false },
        { text: 'No Cinema-Grade 3D Assets', included: false },
        { text: 'No Infinite Project Storage', included: false },
    ];

    const premiumFeatures = [
        { text: 'Everything in Basic, plus', included: true },
        { text: 'Infinite Master Downloads', included: true },
        { text: '100% Pixel-Perfect AI Synthesis', included: true },
        { text: 'Elite AI (Antigravity & Claude)', included: true },
        { text: 'One-Click Bulk ZIP Export', included: true },
        { text: 'Elite Premium Collection Unlocked', included: true },
        { text: 'Cinema-Grade 3D Experiences', included: true },
        { text: 'Infinite Personal Project Vault', included: true },
    ];

    return (
        <div className="min-h-screen pt-28 pb-24 px-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-brand-green/5 blur-[140px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full" />
                <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full" />
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-green/10 border border-brand-green/20 mb-6">
                        <Sparkles className="w-3.5 h-3.5 text-brand-green" />
                        <span className="text-[11px] font-bold tracking-[0.2em] text-brand-green uppercase">Simple Pricing</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black tracking-tighter text-white mb-6 uppercase leading-none">
                        Build <span className="text-brand-green [text-shadow:0_0_60px_rgba(0,255,159,0.4)]">Faster.</span>
                        <br />
                        <span className="text-white/40">Pay Less.</span>
                    </h1>
                    <p className="text-white/50 text-lg max-w-xl mx-auto">
                        Start free with 50+ components. Upgrade whenever you need premium power.
                    </p>
                </motion.div>

                {/* Monthly / Yearly Toggle */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${!isYearly ? 'text-white' : 'text-white/30'}`}>Monthly</span>
                    <button
                        onClick={() => setIsYearly(!isYearly)}
                        className="relative w-14 h-7 rounded-full bg-white/5 border border-white/10 p-1 flex items-center transition-all hover:border-brand-green/30"
                    >
                        <motion.div
                            animate={{ x: isYearly ? 28 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="w-5 h-5 rounded-full bg-brand-green shadow-[0_0_15px_rgba(0,255,159,0.6)]"
                        />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${isYearly ? 'text-white' : 'text-white/30'}`}>Yearly</span>
                        <span className="px-2 py-0.5 rounded-md bg-brand-green/20 border border-brand-green/30 text-brand-green text-[10px] font-black uppercase tracking-widest">
                            Save 20%
                        </span>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                    {/* FREE CARD */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="relative p-8 rounded-[2rem] border border-white/8 bg-white/[0.02] backdrop-blur-xl flex flex-col overflow-hidden group shadow-2xl"
                    >
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[2rem]">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
                        </div>

                        {/* Plan badge */}
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:bg-white/[0.08] transition-colors">
                                    <Code2 className="w-5 h-5 text-white/40 group-hover:text-white/60" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">Basic</div>
                                    <div className="text-xl font-black text-white uppercase tracking-tight">Free</div>
                                </div>
                            </div>
                        </div>

                        {/* Tagline */}
                        <p className="text-white/40 text-sm mb-8 leading-relaxed relative z-10 font-medium">
                            The Foundation for Modern Creators
                        </p>

                        {/* Price */}
                        <div className="flex items-baseline gap-1 mb-8 relative z-10">
                            <span className="text-4xl font-black text-white">{currency}</span>
                            <span className="text-7xl font-black text-white tracking-tighter leading-none group-hover:scale-110 transition-transform origin-left">0</span>
                            <span className="text-white/30 text-sm font-bold ml-1 lowercase">forever</span>
                        </div>

                        {/* Features */}
                        <div className="space-y-3 mb-6 flex-1 relative z-10">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-4">What's included</p>
                            {freeFeatures.map((f, i) => (
                                <motion.div 
                                    key={i} 
                                    whileHover={{ x: 4 }}
                                    className="flex items-start gap-3 group/item cursor-default"
                                >
                                    <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:border-white/30 group-hover/item:bg-white/10 transition-all">
                                        <Check size={10} className="text-white/50 group-hover/item:text-brand-green" />
                                    </div>
                                    <span className="text-white/60 text-sm leading-snug group-hover/item:text-white transition-colors">{f.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Limitations */}
                        <div className="space-y-2.5 mb-8 relative z-10">
                            <div className="h-px bg-white/[0.05] my-4" />
                            {freeLimitations.map((l, i) => (
                                <motion.div 
                                    key={i} 
                                    whileHover={{ x: 4 }}
                                    className="flex items-start gap-3 group/limit cursor-default"
                                >
                                    <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover/limit:bg-red-500/20 group-hover/limit:border-red-500/40 transition-all">
                                        <X size={10} className="text-red-500/80 group-hover/limit:text-red-400" />
                                    </div>
                                    <span className="text-white/60 text-sm leading-snug group-hover/limit:text-white/80 transition-colors">{l.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA */}
                        <Link to="/library">
                            <button className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white/20 transition-all duration-300 active:scale-[0.98]">
                                Start for Free
                            </button>
                        </Link>
                    </motion.div>

                    {/* PREMIUM CARD */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative p-8 rounded-[2rem] flex flex-col overflow-hidden group/premium"
                        style={{
                            background: 'linear-gradient(135deg, rgba(0,255,159,0.06) 0%, rgba(0,0,0,0) 60%, rgba(99,102,241,0.04) 100%)',
                            border: '1px solid rgba(0,255,159,0.25)',
                            boxShadow: '0 0 60px rgba(0,255,159,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
                        }}
                    >
                        {/* Animated border glow */}
                        <div
                            className="absolute inset-0 rounded-[2rem] pointer-events-none group-hover/premium:opacity-100 transition-opacity duration-500"
                            style={{ boxShadow: '0 0 80px rgba(0,255,159,0.15)', opacity: 0.6 }}
                        />

                        {/* MOST POPULAR badge */}
                        <motion.div 
                            className="absolute top-6 right-6 z-20"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-green text-black text-[9px] font-black uppercase tracking-[0.15em] shadow-[0_0_20px_rgba(0,255,159,0.5)]">
                                <Star className="w-3 h-3 fill-black animate-pulse" />
                                Most Popular
                            </div>
                        </motion.div>

                        {/* Plan badge */}
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center group-hover/premium:bg-brand-green/20 transition-colors">
                                <Crown className="w-5 h-5 text-brand-green" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-green/70">Premium</div>
                                <div className="text-xl font-black text-white uppercase tracking-tight">Pro Access</div>
                            </div>
                        </div>

                        {/* Tagline */}
                        <p className="text-white/50 text-sm mb-6 leading-relaxed relative z-10 font-black tracking-wide">
                            Elite Tools for Principal Engineers
                        </p>

                        {/* Price */}
                        <div className="flex items-baseline gap-1 mb-8 relative z-10">
                            <span className="text-4xl font-black text-brand-green">{currency}</span>
                            <motion.span
                                key={isYearly ? 'yearly' : 'monthly'}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-7xl font-black text-white tracking-tighter leading-none group-hover/premium:text-brand-green transition-colors"
                            >
                                {isYearly ? Math.round(yearlyPrice / 4) : quarterlyPrice}
                            </motion.span>
                            <div className="ml-1">
                                <div className="text-white/40 text-sm font-bold lowercase">/3 months</div>
                                {isYearly && (
                                    <div className="text-brand-green/70 text-[10px] font-black uppercase tracking-wider">
                                        {currency}{yearlyPrice}/yr
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-3 mb-8 flex-1 relative z-10">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-green/50 font-bold mb-4">Everything in Basic, plus</p>
                            {premiumFeatures.map((f, i) => (
                                <motion.div 
                                    key={i} 
                                    whileHover={{ x: 4 }}
                                    className="flex items-start gap-3 group/item cursor-default"
                                >
                                    <div className="w-5 h-5 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-brand-green/20 group-hover/item:border-brand-green/50 transition-all">
                                        <Check size={10} className="text-brand-green group-hover/item:scale-125 transition-transform" />
                                    </div>
                                    <span className="text-white/80 text-sm leading-snug font-medium group-hover/item:text-white transition-colors">{f.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA */}
                        <Link to="/library" className="relative z-10">
                            <button className="w-full py-4 rounded-2xl bg-brand-green text-black text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-[0_0_50px_rgba(0,255,159,0.7)] hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group/btn">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Get Pro Access
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </span>
                                {/* Shimmer */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '200%' }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
                                />
                            </button>
                        </Link>
                    </motion.div>
                </div>

                {/* Feature Comparison Table */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="rounded-[2rem] border border-white/[0.06] bg-white/[0.02] overflow-hidden mb-16"
                >
                    <div className="p-6 border-b border-white/[0.04] flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">The Elite Difference</h3>
                        <div className="px-3 py-1 rounded-full bg-brand-green/10 border border-brand-green/20 text-[9px] font-black uppercase tracking-widest text-brand-green">Full Specification</div>
                    </div>
                    {[
                        { label: 'UI Component Library', free: 'Essential Starter', premium: 'Elite Master Collection' },
                        { label: 'Source Code Access', free: 'Standard React/HTML', premium: 'Full Production Source' },
                        { label: 'AI Model Support', free: 'Lovable & Cursor', premium: 'All (inc. Antigravity & Claude)' },
                        { label: '3D Cinematic Assets', free: '—', premium: 'Full Access' },
                        { label: 'Premium Visual Suite', free: '—', premium: 'Ultra-High Fidelity' },
                        { label: 'Bulk Export (ZIP)', free: '—', premium: 'One-Click Unlimited' },
                        { label: 'Personal Project Vault', free: 'Starter (Max 5)', premium: 'Infinite Storage' },
                        { label: 'Synthesis Logic', free: '—', premium: '100% Pixel-Perfect' },
                    ].map((row, i) => (
                        <div key={i} className={`grid grid-cols-3 px-6 py-5 transition-colors hover:bg-white/[0.03] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                            <span className="text-sm text-white/50 font-medium">{row.label}</span>
                            <span className={`text-sm font-medium text-center ${row.free === '—' ? 'text-white/10' : 'text-white/40'}`}>{row.free}</span>
                            <span className={`text-sm font-bold text-center ${row.free === '—' || row.premium.includes('Elite') || row.premium.includes('Full') || row.premium.includes('Infinite') || row.premium.includes('Perfect') || row.premium.includes('Ultra') ? 'text-brand-green' : 'text-white/80'}`}>{row.premium}</span>
                        </div>
                    ))}
                    <div className="grid grid-cols-3 px-6 py-3 bg-white/[0.01] border-t border-white/[0.04]">
                        <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Feature</span>
                        <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold text-center">Basic</span>
                        <span className="text-[10px] text-brand-green/50 uppercase tracking-widest font-bold text-center">Premium</span>
                    </div>
                </motion.div>

                {/* Trust Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {[
                        { icon: <Shield className="w-5 h-5 text-brand-green" />, title: 'Secure Payments', desc: 'Industry-standard encryption on all transactions.' },
                        { icon: <Zap className="w-5 h-5 text-brand-green" />, title: 'Instant Access', desc: 'Unlock all premium components immediately.' },
                        { icon: <Download className="w-5 h-5 text-brand-green" />, title: 'Cancel Anytime', desc: 'No lock-in. Cancel with one click anytime.' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                            <div className="w-9 h-9 rounded-xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center shrink-0">
                                {item.icon}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white mb-1">{item.title}</div>
                                <div className="text-xs text-white/35 leading-relaxed">{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default PricingPage;
