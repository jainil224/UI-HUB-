import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuCabaretPoster from '../../components/templates/AuCabaretPoster';

export const AuCabaretDemoPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-screen bg-[#EDEDED] flex flex-col justify-between select-none relative overflow-hidden font-sans">
            {/* Minimal Floating Back Button Overlay */}
            <header className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between z-50 pointer-events-none">
                <button
                    onClick={() => navigate('/templates')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/90 hover:bg-white text-[#111111] hover:text-black text-[11px] font-sans font-medium uppercase tracking-wider transition-all backdrop-blur-md border border-neutral-300 rounded-full pointer-events-auto shadow-xs hover:border-black cursor-pointer"
                >
                    <ArrowLeft size={13} />
                    <span>Back to Templates</span>
                </button>
                <div className="text-[9px] font-sans tracking-widest uppercase text-neutral-600 font-bold bg-white/90 px-3 py-1.5 rounded-full border border-neutral-300 backdrop-blur-sm shadow-xs">
                    POSTER DEMO // ME.019 AU CABARET
                </div>
            </header>

            {/* Main Stage */}
            <main className="flex-1 w-full h-full">
                <AuCabaretPoster />
            </main>
        </div>
    );
};

export default AuCabaretDemoPage;
