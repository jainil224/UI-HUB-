import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LumosHero from '../../components/templates/LumosHero';

export const LumosDemoPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F1F1F0] flex flex-col justify-between select-none relative overflow-hidden">
            {/* Minimal Floating Back Button Overlay */}
            <header className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between z-40 pointer-events-none">
                <button
                    onClick={() => navigate('/templates')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 hover:bg-white text-[#111111] hover:text-black text-[11px] font-mono uppercase tracking-wider transition-all backdrop-blur-md border border-neutral-300 rounded pointer-events-auto shadow-xs hover:border-black"
                >
                    <ArrowLeft size={13} />
                    <span>Back to Templates</span>
                </button>
                <div className="text-[9px] font-mono tracking-widest uppercase text-neutral-600 font-bold bg-white/80 px-2.5 py-1 rounded border border-neutral-300 backdrop-blur-sm shadow-xs">
                    TEMPLATE DEMO // LUMOS
                </div>
            </header>

            {/* Main Stage */}
            <main className="flex-1 w-full h-full">
                <LumosHero />
            </main>
        </div>
    );
};

export default LumosDemoPage;
