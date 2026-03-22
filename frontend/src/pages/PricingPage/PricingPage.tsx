import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Sparkles, Zap, Shield, Globe, Cpu } from 'lucide-react';

const PricingPage = () => {
    const [isYearly, setIsYearly] = useState(false);

    const plans = [
        {
            name: "Hobbyist",
            price: isYearly ? "0" : "0",
            description: "Perfect for students and open-source enthusiasts.",
            features: [
                "Full access to Base components",
                "Code copy-paste (React/HTML)",
                "Standard community support",
                "Basic documentation"
            ],
            icon: <Globe className="text-white/40" />,
            buttonText: "Start for Free",
            highlight: false
        },
        {
            name: "Pro Maker",
            price: isYearly ? "149" : "19",
            period: isYearly ? "/year" : "/mo",
            description: "The ultimate toolkit for professional developers.",
            features: [
                "Unlimited ZIP Downloads",
                "Advanced 3D Components",
                "Master Vibe Prompts",
                "Commercial License",
                "Early access to new drops"
            ],
            icon: <Sparkles className="text-brand-green" />,
            buttonText: "Get Pro Access",
            highlight: true,
            badge: "Most Popular"
        },
        {
            name: "Studio",
            price: isYearly ? "399" : "49",
            period: isYearly ? "/year" : "/mo",
            description: "Built for agencies and high-growth teams.",
            features: [
                "Everything in Pro",
                "Up to 5 Team Seats",
                "Priority 24h Support",
                "Custom Component Requests",
                "Private Component Vault"
            ],
            icon: <Cpu className="text-purple-400" />,
            buttonText: "Contact Sales",
            highlight: false
        }
    ];

    return (
        <div className="min-h-screen pt-32 pb-24 px-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-green/10 blur-[120px] rounded-full -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full -z-10" />

            <div className="max-w-7xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-5xl md:text-8xl font-heading font-black tracking-tighter text-white mb-6 uppercase">
                        Simple <span className="text-brand-green">Pricing</span>
                    </h1>
                    <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-12">
                        Unlock high-performance components and premium vibes. 
                        Free forever for hobbyists, supercharged for pros.
                    </p>
                </motion.div>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-4 mb-16">
                    <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${!isYearly ? 'text-white' : 'text-white/40'}`}>Monthly</span>
                    <button
                        onClick={() => setIsYearly(!isYearly)}
                        className="w-14 h-7 rounded-full bg-white/5 border border-white/10 p-1 relative flex items-center transition-colors hover:border-brand-green/30"
                    >
                        <motion.div
                            animate={{ x: isYearly ? 28 : 0 }}
                            className="w-5 h-5 rounded-full bg-brand-green shadow-[0_0_15px_rgba(0,255,0,0.5)]"
                        />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${isYearly ? 'text-white' : 'text-white/40'}`}>Yearly</span>
                        <span className="px-2 py-0.5 rounded-md bg-brand-green/20 border border-brand-green/30 text-brand-green text-[10px] font-black uppercase tracking-widest">
                            20% OFF
                        </span>
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ y: -10 }}
                            className={`relative p-8 rounded-[2.5rem] border backdrop-blur-xl flex flex-col items-start text-left transition-all duration-500 overflow-hidden group ${
                                plan.highlight 
                                ? 'bg-white/[0.05] border-brand-green/40 shadow-[0_0_50px_rgba(0,255,159,0.15)] ring-1 ring-brand-green/20' 
                                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                            }`}
                        >
                            {/* Card Background Shimmer */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                                <div className="absolute inset-x-[-150%] top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine" />
                            </div>

                            {plan.badge && (
                                <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-brand-green text-black text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,0,0.4)]">
                                    {plan.badge}
                                </div>
                            )}

                            <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-6">
                                {plan.icon}
                            </div>

                            <h3 className="text-2xl font-heading font-black tracking-tight text-white mb-2 uppercase">
                                {plan.name}
                            </h3>
                            <p className="text-white/40 text-sm mb-8 leading-relaxed">
                                {plan.description}
                            </p>

                            <div className="flex items-baseline gap-1 mb-10">
                                <span className="text-4xl font-black text-white">$</span>
                                <span className="text-6xl font-black text-white tracking-tighter">
                                    {plan.price}
                                </span>
                                <span className="text-white/30 font-bold uppercase tracking-widest text-xs ml-1">
                                    {plan.period}
                                </span>
                            </div>

                            <div className="space-y-4 mb-10 w-full flex-1">
                                {plan.features.map(feature => (
                                    <div key={feature} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center shrink-0">
                                            <Check size={10} className="text-brand-green" />
                                        </div>
                                        <span className="text-white/60 text-sm font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 relative overflow-hidden ${
                                plan.highlight
                                ? 'bg-brand-green text-black shadow-[0_10px_30px_rgba(0,255,0,0.3)] hover:shadow-[0_15px_40px_rgba(0,255,0,0.5)] active:scale-[0.98]'
                                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-[0.98]'
                            }`}>
                                <span className="relative z-10">{plan.buttonText}</span>
                            </button>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-20 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 text-left"
                >
                    <div className="w-20 h-20 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center shrink-0">
                        <Shield className="text-brand-green" size={32} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">Safe and Secure Payment</h4>
                        <p className="text-white/40 text-sm">
                            We use standard encryption for all transactions. No surprise fees. 
                            Cancel your subscription at any time with a single click in your dashboard settings.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PricingPage;
