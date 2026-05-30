import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { SectionScroll } from '../../components/ui/SectionScroll';

const SectionScrollPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative w-full bg-[#111]">
            {/* Back Button */}
            <button
                onClick={() => navigate('/library?id=section-scroll')}
                className="fixed top-8 left-8 z-[9999] flex items-center gap-2 px-6 py-3 rounded-full bg-black/80 text-white hover:bg-black transition-all text-sm font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 shadow-2xl group"
            >
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Library
            </button>

            {/* Full Screen Section Scroll */}
            <SectionScroll />
        </div>
    );
};

export default SectionScrollPage;
