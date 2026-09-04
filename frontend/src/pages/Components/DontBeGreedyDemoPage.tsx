import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DontBeGreedyFooter from '../../components/templates/DontBeGreedyFooter';

export const DontBeGreedyDemoPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-screen bg-[#050505] flex flex-col justify-between select-none relative overflow-x-hidden font-sans">
            {/* Minimal Floating Back Button Overlay */}
            <header className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between z-50 pointer-events-none">
                <button
                    onClick={() => navigate('/templates')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#141414]/90 hover:bg-[#202020] text-white hover:text-[#B8F500] text-[11px] font-mono uppercase tracking-wider transition-all backdrop-blur-md border border-[#2B2B2B] rounded-full pointer-events-auto shadow-xs hover:border-[#B8F500] cursor-pointer"
                >
                    <ArrowLeft size={13} />
                    <span>Back to Templates</span>
                </button>
                <div className="text-[9px] font-mono tracking-widest uppercase text-[#B8F500] font-bold bg-[#141414]/90 px-3 py-1.5 rounded-full border border-[#2B2B2B] backdrop-blur-sm shadow-xs">
                    ARCHIVE DEMO // DON'T BE GREEDY
                </div>
            </header>

            {/* Main Stage */}
            <main className="flex-1 w-full flex flex-col justify-end">
                <DontBeGreedyFooter />
            </main>
        </div>
    );
};

export default DontBeGreedyDemoPage;
