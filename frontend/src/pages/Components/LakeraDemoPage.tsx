import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LakeraHero from '../../components/templates/LakeraHero';

export const LakeraDemoPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex flex-col justify-between select-none relative overflow-x-hidden">
            {/* Minimal Floating Back Button Overlay */}
            <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-40 pointer-events-none">
                <button
                    onClick={() => navigate('/templates')}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 hover:bg-white text-neutral-800 hover:text-black text-xs font-mono uppercase tracking-wider transition-all backdrop-blur-md border border-neutral-300 rounded-xl pointer-events-auto shadow-sm hover:border-black"
                >
                    <ArrowLeft size={13} />
                    <span>Back to Templates</span>
                </button>
                <div className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 font-semibold bg-neutral-100/90 px-2.5 py-1 rounded-lg border border-neutral-200 backdrop-blur-sm shadow-2xs">
                    TEMPLATE DEMO // LAKERA AI SECURITY
                </div>
            </header>

            {/* Main Stage */}
            <main className="flex-1 w-full h-full">
                <LakeraHero />
            </main>
        </div>
    );
};

export default LakeraDemoPage;
