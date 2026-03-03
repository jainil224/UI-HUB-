import React from 'react';
import { ArrowRight } from 'lucide-react';
import SectionHeader from '../../../components/ui/SectionHeader';

const ButtonShowcase = () => {
    return (
        <section className="py-24 px-6 max-w-7xl mx-auto">
            <SectionHeader id="buttons" title="Button UI" subtitle="Interactive Actions" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Primary Orange */}
                <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center gap-6 group">
                    <button className="bg-brand-green text-black font-bold px-8 py-3 rounded-lg hover:scale-105 active:scale-95 transition-all green-glow">
                        Primary Action
                    </button>
                    <span className="text-xs text-white/40 font-mono">.btn-primary</span>
                </div>

                {/* Outline Glow */}
                <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center gap-6 group">
                    <button className="border border-brand-green text-brand-green font-bold px-8 py-3 rounded-lg hover:bg-brand-green hover:text-black transition-all">
                        Outline Glow
                    </button>
                    <span className="text-xs text-white/40 font-mono">.btn-outline</span>
                </div>

                {/* Ghost with Icon */}
                <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center gap-6 group">
                    <button className="flex items-center gap-2 text-white font-medium hover:text-brand-green transition-colors">
                        Learn More <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <span className="text-xs text-white/40 font-mono">.btn-ghost</span>
                </div>

                {/* Minimal Dark */}
                <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center gap-6 group">
                    <button className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-brand-green transition-colors">
                        Minimal Dark
                    </button>
                    <span className="text-xs text-white/40 font-mono">.btn-pill</span>
                </div>
            </div>
        </section>
    );
};

export default ButtonShowcase;
