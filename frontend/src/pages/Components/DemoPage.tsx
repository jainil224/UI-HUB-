import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { componentList, ComponentItem } from '../../data/componentData';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

class DemoErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("[DemoPage Error]:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-8 text-center">
                    <div className="w-14 h-14 rounded-full bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center text-brand-blue mb-4">
                        <RotateCcw size={24} />
                    </div>
                    <h2 className="text-xl font-bold uppercase tracking-wider mb-2">Component Preview Error</h2>
                    <p className="text-xs text-neutral-400 max-w-sm mb-6">
                        An error occurred while initializing this component in full-screen mode.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 rounded-full bg-brand-blue text-white font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform border border-white/20"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const DemoPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [componentItem, setComponentItem] = useState<ComponentItem | null>(() => {
        return componentList.find(c => c.id === id) || null;
    });
    const [isLoading, setIsLoading] = useState(!componentItem);

    useEffect(() => {
        if (!componentItem && id) {
            const fetchCustom = async () => {
                try {
                    const snap = await getDoc(doc(collection(db, 'components'), id));
                    if (snap.exists()) {
                        const data = snap.data();
                        setComponentItem({
                            id: snap.id,
                            title: data.componentName,
                            description: data.description || "Community component",
                            category: data.category || "Community Uploads",
                            preview: () => (
                                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                                    <h3 className="text-2xl font-bold text-white mb-2">{data.componentName}</h3>
                                    <p className="text-sm text-neutral-400 max-w-md">{data.description}</p>
                                </div>
                            ),
                            code: data.code || "// No code available",
                            isPremium: false,
                            vibePrompt: data.vibePrompt || data.description || ""
                        });
                    }
                } catch (e) {
                    console.error("Failed to load custom component demo:", e);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCustom();
        }
    }, [id, componentItem]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white">
                <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xs font-mono font-bold tracking-widest uppercase text-neutral-400">Loading Fullscreen Preview...</p>
            </div>
        );
    }

    if (!componentItem) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-8 text-center">
                <h1 className="text-3xl font-black uppercase tracking-tight mb-3">Component Not Found</h1>
                <p className="text-neutral-400 text-sm max-w-sm mb-8">The component with ID "{id}" could not be located in the library catalog.</p>
                <button
                    onClick={() => navigate('/library')}
                    className="px-8 py-3 rounded-full bg-brand-blue text-white font-bold uppercase tracking-widest hover:scale-105 transition-transform border border-white/20 shadow-xl"
                >
                    Back to Library
                </button>
            </div>
        );
    }

    const isCenteredCategory = componentItem.category === 'button' || 
                               componentItem.category === 'text' || 
                               componentItem.category === 'effect';

    return (
        <DemoErrorBoundary>
            <div className="relative w-screen h-screen min-h-screen bg-neutral-950 text-white overflow-hidden select-none">
                {/* Floating Back to Library Button */}
                <button
                    onClick={() => navigate(`/library?id=${id}`)}
                    className="fixed top-6 left-6 z-[9999] flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/80 hover:bg-black text-white transition-all text-xs font-bold uppercase tracking-widest backdrop-blur-xl border border-white/20 shadow-2xl hover:scale-105 group cursor-pointer"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform text-brand-blue" />
                    Back to Library
                </button>

                {/* Main Fullscreen Component Canvas / Container */}
                <div className={`w-full h-full ${isCenteredCategory ? 'flex items-center justify-center p-8' : ''}`}>
                    <React.Suspense fallback={
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
                            <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mb-3" />
                            <p className="text-[11px] uppercase tracking-widest font-mono font-bold">INITIALIZING DEMO...</p>
                        </div>
                    }>
                        {componentItem.preview({ showDemoButton: false })}
                    </React.Suspense>
                </div>
            </div>
        </DemoErrorBoundary>
    );
};

export default DemoPage;
