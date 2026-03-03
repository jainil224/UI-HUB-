import React from 'react';
import { motion } from 'motion/react';
import { Zap, ChevronRight, ArrowUpRight, Plus } from 'lucide-react';
import SectionHeader from '../../../components/ui/SectionHeader';

const CardShowcase = () => {
    return (
        <section className="py-24 px-6 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto">
                <SectionHeader id="cards" title="Card UI" subtitle="Content Containers" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature Card */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="glass p-8 rounded-3xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
                            <Zap size={40} className="text-brand-green" />
                        </div>
                        <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center mb-6">
                            <Zap size={24} className="text-brand-green" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">High Performance</h3>
                        <p className="text-white/60 leading-relaxed mb-6">
                            Optimized for speed and efficiency. Built with the latest technologies to ensure your UI stays snappy.
                        </p>
                        <button className="flex items-center gap-2 text-sm font-bold text-brand-green group-hover:gap-4 transition-all">
                            EXPLORE <ChevronRight size={16} />
                        </button>
                    </motion.div>

                    {/* Image Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 group"
                    >
                        <div className="h-48 bg-gradient-to-br from-brand-green to-emerald-900 relative overflow-hidden">
                            <img
                                src="https://picsum.photos/seed/ui/800/600"
                                alt="UI"
                                className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/20" />
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-bold">Visual Assets</h3>
                                <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter">Premium</span>
                            </div>
                            <p className="text-white/60 text-sm mb-6">
                                Curated collection of high-quality visual elements for your next project.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px]">
                                            U{i}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-xs text-white/40">+120 users</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Minimal Stat Card */}
                    <div className="glass p-8 rounded-3xl flex flex-col justify-between border-l-4 border-l-brand-green">
                        <div>
                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Total Components</span>
                            <div className="text-6xl font-display mt-2">1,240</div>
                        </div>
                        <div className="mt-8 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                                <ArrowUpRight size={16} />
                                <span>+12% this month</span>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-green hover:text-black transition-colors">
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CardShowcase;
