import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoveAppHero from '../../components/templates/LoveAppHero';

export const LoveAppDemoPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-screen bg-[#D8D2F8] flex flex-col justify-between select-none relative overflow-hidden">
            {/* Minimal Floating Back Button Overlay */}
            <header className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between z-50 pointer-events-none">
                <button
                    onClick={() => navigate('/templates')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 hover:bg-white text-[#111111] hover:text-black text-[11px] font-sans font-medium uppercase tracking-wider transition-all backdrop-blur-md border border-[#CBC4EC] rounded-full pointer-events-auto shadow-xs hover:border-black"
                >
                    <ArrowLeft size={13} />
                    <span>Back to Templates</span>
                </button>
                <div className="text-[9px] font-sans tracking-widest uppercase text-neutral-600 font-semibold bg-white/85 px-3 py-1 rounded-full border border-[#CBC4EC] backdrop-blur-sm shadow-xs">
                    TEMPLATE DEMO // LOVEAPP HERO
                </div>
            </header>

            {/* Main Stage */}
            <main className="flex-1 w-full h-full">
                <LoveAppHero />
            </main>
        </div>
    );
};

export default LoveAppDemoPage;
