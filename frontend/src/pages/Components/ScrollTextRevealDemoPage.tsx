import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ScrollTextReveal from '../../components/ui/ScrollTextReveal';

const ScrollTextRevealDemoPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative w-full bg-[#f1f1e8]">
            <button
                onClick={() => navigate('/library?id=scroll-text-reveal')}
                className="fixed top-8 left-8 z-[9999] flex items-center gap-2 px-6 py-3 rounded-full bg-black/80 text-white hover:bg-black transition-all text-sm font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 shadow-2xl group"
            >
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Library
            </button>

            <ScrollTextReveal />
        </div>
    );
};

export default ScrollTextRevealDemoPage;