import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HaosShowcase from '../../components/templates/HaosShowcase';

export const HaosDemoPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020202] flex flex-col justify-between select-none relative overflow-hidden">
            {/* Minimal Floating Back Button Overlay */}
            <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-30 pointer-events-none">
                <button
                    onClick={() => navigate('/templates')}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/90 hover:text-white text-xs font-mono uppercase tracking-wider transition-all backdrop-blur-md border border-white/10 rounded-xl pointer-events-auto shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-[#98FF68]/40"
                >
                    <ArrowLeft size={13} />
                    <span>Back to Templates</span>
                </button>
                <div className="text-[10px] font-mono tracking-widest uppercase text-white/50 font-semibold bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 backdrop-blur-sm">
                    TEMPLATE DEMO // HAOS TECH SOLUTIONS
                </div>
            </header>

            {/* Main Stage */}
            <main className="flex-1 w-full h-full">
                <HaosShowcase />
            </main>
        </div>
    );
};

export default HaosDemoPage;
