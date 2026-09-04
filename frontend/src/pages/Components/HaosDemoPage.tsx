import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HaosShowcase from '../../components/templates/HaosShowcase';

export const HaosDemoPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020202] flex flex-col justify-between select-none relative overflow-hidden">
            {/* Minimal Floating Back Button Overlay */}
            <header className="absolute top-0 left-0 right-0 p-3 sm:p-6 flex items-center justify-between z-30 pointer-events-none">
                <button
                    onClick={() => navigate('/templates')}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-wider transition-all backdrop-blur-md border border-white/15 rounded-xl pointer-events-auto shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-[#98FF68]/40"
                >
                    <ArrowLeft size={13} />
                    <span className="hidden xs:inline">Back to Templates</span>
                    <span className="xs:hidden">Back</span>
                </button>
                <div className="text-[9px] xs:text-[10px] font-mono tracking-widest uppercase text-white/70 font-semibold bg-white/5 px-2 sm:px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-sm truncate max-w-[200px] xs:max-w-none">
                    <span className="hidden sm:inline">TEMPLATE DEMO // </span>HAOS TECH
                </div>
            </header>

            {/* Main Stage */}
            <main className="flex-1 w-full h-full pt-12 sm:pt-0">
                <HaosShowcase />
            </main>
        </div>
    );
};

export default HaosDemoPage;
