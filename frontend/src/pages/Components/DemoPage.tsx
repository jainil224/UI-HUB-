import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { componentList } from '../../data/componentData';

const DemoPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const componentItem = componentList.find(c => c.id === id);

    if (!componentItem) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-brand-black text-white p-8">
                <h1 className="text-4xl font-display uppercase tracking-tight mb-4">Component Not Found</h1>
                <p className="text-white/60 mb-8">The component with ID "{id}" could not be found.</p>
                <button
                    onClick={() => navigate('/library')}
                    className="px-8 py-3 rounded-full bg-brand-green text-black font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                >
                    Back to Library
                </button>
            </div>
        );
    }

    return (
        <div className="relative h-screen bg-brand-black overflow-hidden">
            {/* Back Button */}
            <button
                onClick={() => navigate(`/library?id=${id}`)}
                className="fixed top-8 left-8 z-[9999] flex items-center gap-2 px-6 py-3 rounded-full bg-black/80 text-white hover:bg-black transition-all text-sm font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 shadow-2xl group"
            >
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Library
            </button>

            {/* Component Rendering */}
            <div className="w-full h-full relative z-0">
                {componentItem.preview()}
            </div>

            {/* Styles for full-screen render if needed */}
            <style dangerouslySetInnerHTML={{ __html: `
                body { overflow: hidden !important; }
            `}} />
        </div>
    );
};

export default DemoPage;
