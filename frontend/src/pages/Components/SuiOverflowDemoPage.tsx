import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SuiOverflow from '../../components/templates/SuiOverflow';

export const SuiOverflowDemoPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative w-screen min-h-screen overflow-x-hidden bg-[#F2EFE6] select-none">
            {/* Minimal floating Back Button */}
            <div className="absolute top-4 left-4 z-50">
                <button
                    onClick={() => navigate('/templates/sui-overflow')}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#07182A] text-white hover:bg-[#0c2238] text-xs font-mono uppercase tracking-wider transition-colors rounded-[2px] shadow-sm cursor-pointer"
                >
                    <ArrowLeft size={13} />
                    <span>Back to Templates</span>
                </button>
            </div>

            {/* Main Stage */}
            <main className="w-full min-h-screen">
                <SuiOverflow />
            </main>
        </div>
    );
};

export default SuiOverflowDemoPage;
