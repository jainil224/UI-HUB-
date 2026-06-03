import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Scroll3DAnimation from '../../components/ui/Scroll3DAnimation';

const Scroll3DAnimationPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen bg-[#f1f1f1]" data-lenis-prevent>
            {/* Back Button */}
            <button
                onClick={() => navigate('/library?id=3d-scroll-animation')}
                className="fixed top-8 left-8 z-50 flex items-center gap-2 px-6 py-3 rounded-full bg-black/80 text-white hover:bg-black transition-all text-sm font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 shadow-2xl group"
            >
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Library
            </button>

            {/* Full Screen Animation */}
            <div className="w-full h-screen">
                <Scroll3DAnimation className="h-full" />
            </div>
        </div>
    );
};

export default Scroll3DAnimationPage;
