import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import TextFunnel from '../../components/ui/TextFunnel';

const TextFunnelDemoPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative w-full bg-black">
            <button
                onClick={() => navigate('/library?id=text-funnel')}
                className="fixed top-8 left-8 z-[9999] flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all text-sm font-bold uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-2xl group"
            >
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Library
            </button>

            <TextFunnel />
        </div>
    );
};

export default TextFunnelDemoPage;