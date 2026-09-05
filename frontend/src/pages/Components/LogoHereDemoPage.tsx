import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LogoHere from '../../components/templates/LogoHere';

export const LogoHereDemoPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative w-screen min-h-screen overflow-x-hidden bg-white select-none">
            {/* Minimal floating Back Button */}
            <div className="absolute top-4 left-4 z-50">
                <button
                    onClick={() => navigate('/templates/logo-here')}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-mono uppercase tracking-wider transition-colors rounded-full shadow-sm cursor-pointer"
                >
                    <ArrowLeft size={13} />
                    <span>Back to Templates</span>
                </button>
            </div>

            {/* Main Stage */}
            <main className="w-full min-h-screen">
                <LogoHere />
            </main>
        </div>
    );
};

export default LogoHereDemoPage;
