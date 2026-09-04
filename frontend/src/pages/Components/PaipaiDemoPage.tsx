import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaipaiKuaishou from '../../components/templates/PaipaiKuaishou';

export const PaipaiDemoPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-[#59D1EA] select-none">
            {/* Minimal floating Back Button */}
            <div className="absolute top-4 left-4 z-50">
                <button
                    onClick={() => navigate('/templates/paipai-kuaishou')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white hover:bg-neutral-800 text-xs font-mono uppercase tracking-wider transition-colors shadow-[2px_2px_0px_0px_#FFFFFF] cursor-pointer"
                >
                    <ArrowLeft size={13} />
                    <span>Back</span>
                </button>
            </div>

            {/* Main Full-Viewport 3D Stage */}
            <main className="w-full h-full">
                <PaipaiKuaishou />
            </main>
        </div>
    );
};

export default PaipaiDemoPage;
