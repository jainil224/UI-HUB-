import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SegmintFooter from '../../components/templates/SegmintFooter';

export const SegmintDemoPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#E8E9EE] flex flex-col justify-between select-none">
            {/* Minimal Back Button Overlay */}
            <header className="p-4 sm:p-6 flex items-center justify-between z-30">
                <button
                    onClick={() => navigate('/templates')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white hover:bg-neutral-800 text-xs font-mono uppercase tracking-wider transition-colors shadow-[2px_2px_0px_0px_rgba(7,85,206,1)]"
                >
                    <ArrowLeft size={13} />
                    <span>Back to Templates</span>
                </button>
                <div className="text-[10px] font-mono tracking-widest uppercase text-black font-semibold">
                    TEMPLATE DEMO // SEGMINT 2026
                </div>
            </header>

            {/* Main Stage */}
            <main className="flex-1 w-full">
                <SegmintFooter />
            </main>

            <div className="p-4 text-center text-[10px] font-mono text-neutral-500">
                UI-HUB TEMPLATE ENGINE // PRODUCTION-READY WEB3 BRUTALIST FOOTER
            </div>
        </div>
    );
};

export default SegmintDemoPage;
