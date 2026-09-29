import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OriginkitHero24 from '../../components/templates/OriginkitHero24';

export const OriginkitHero24DemoPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative w-screen min-h-screen overflow-x-hidden bg-[#101216] select-none">
            {/* Minimal floating Back Button */}
            <div className="absolute top-4 left-4 z-50">
                <button
                    onClick={() => navigate('/build-with-ui-hub/UIHUB-hero-1')}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#00A1DB] text-black hover:bg-[#33b4e4] text-xs font-mono font-bold uppercase tracking-wider transition-colors rounded-[2px] shadow-sm cursor-pointer"
                >
                    <ArrowLeft size={13} />
                    <span>Back to Build with UI HUB</span>
                </button>
            </div>

            {/* Main Stage */}
            <main className="w-full min-h-screen">
                <OriginkitHero24 />
            </main>
        </div>
    );
};

export default OriginkitHero24DemoPage;
