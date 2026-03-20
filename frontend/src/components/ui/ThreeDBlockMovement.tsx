import React, { Suspense, useState } from 'react';
import Spline from '@splinetool/react-spline';
import { motion, AnimatePresence } from 'framer-motion';

interface ThreeDBlockMovementProps {
    className?: string;
    onLoad?: () => void;
}

/**
 * ThreeDBlockMovement Component
 * A premium 3D experience powered by Spline.
 * Featuring a custom loader and smooth entry animations.
 */
export const ThreeDBlockMovement: React.FC<ThreeDBlockMovementProps> = ({ 
    className = "",
    onLoad
}) => {
    const [isLoading, setIsLoading] = useState(true);

    const handleLoad = (splineApp: any) => {
        if (!splineApp || typeof splineApp.findObjectByName !== 'function') {
            setIsLoading(false);
            if (onLoad) onLoad();
            return;
        }

        // List of common names or substrings to hide branding (Spline default placeholders)
        const objectsToHide = ['Branding', 'Integration', 'Title'];
        
        try {
            objectsToHide.forEach(name => {
                const obj = splineApp.findObjectByName(name);
                if (obj && !obj.name.includes('HUB') && !obj.name.includes('UI')) {
                    obj.visible = false;
                }
            });

            // We want to KEEP UI HUB / UI branding as per user request
            // So we don't hide children with 'HUB' or 'UI' in their names
        } catch (e) {
            console.warn('Non-critical Spline branding removal error:', e);
        }

        setIsLoading(false);
        if (onLoad) onLoad();
    };

    return (
        <div className={`relative w-full h-full min-h-[500px] overflow-hidden bg-[#050508] ${className} group/spline`}>
            {/* Premium Loader */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#050508]"
                    >
                        <div className="relative">
                            {/* Animated Rings */}
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="w-24 h-24 rounded-full border-t-2 border-brand-green/30 border-r-2 border-brand-green/10"
                            />
                            <motion.div 
                                animate={{ rotate: -360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 w-24 h-24 rounded-full border-b-2 border-brand-green/40 border-l-2 border-brand-green/5 scale-75"
                            />
                            
                            {/* Center Pulse */}
                            <motion.div 
                                animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.3, 0.7, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 m-auto w-4 h-4 bg-brand-green rounded-full shadow-[0_0_20px_rgba(34,197,94,0.6)]"
                            />
                        </div>
                        
                        <div className="mt-12 flex flex-col items-center gap-3">
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-[10px] font-black tracking-[0.4em] uppercase text-brand-green/60"
                            >
                                Initializing Simulation
                            </motion.p>
                            <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ opacity: [0.2, 1, 0.2] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                        className="w-1.5 h-1.5 bg-brand-green rounded-full"
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spline Scene */}
            <div className={`w-full h-full transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                <Suspense fallback={null}>
                    <Spline 
                        scene="https://prod.spline.design/qhAT99pras2aJkxX/scene.splinecode" 
                        onLoad={handleLoad}
                    />
                </Suspense>
            </div>

            {/* Covering Div to hide Spline branding logo */}
            <div className="absolute bottom-0 right-0 w-[120px] h-[35px] bg-[#050508] z-10 pointer-events-none" />

            {/* Interaction Hint Overlay */}
            {!isLoading && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                >
                    <div className="px-6 py-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 flex items-center gap-3 opacity-0 group-hover/spline:opacity-100 transition-all duration-500 translate-y-4 group-hover/spline:translate-y-0">
                        <div className="w-1.5 h-1.5 bg-brand-green rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                            Interactive 3D Simulation
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Premium Branding Overlay */}
            {!isLoading && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute top-8 left-8 z-20 pointer-events-none flex items-center gap-4"
                >
                    <div className="flex flex-col">
                        <span className="text-[12px] font-black uppercase tracking-[0.5em] text-white/80 leading-none">
                            UI HUB
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-brand-green/60 mt-1">
                            Elite 3D Asset
                        </span>
                    </div>
                </motion.div>
            )}

            {/* CSS Hack to hide Spline Branding/Logo */}
            <style dangerouslySetInnerHTML={{ __html: `
                #spline-canvas + a,
                #spline-canvas + div,
                [class*="spline-watermark"],
                [class*="SplineWatermark"],
                a[href*="spline.design"],
                #logo,
                .spline-viewer-logo,
                #spline-canvas ~ a,
                #spline-canvas ~ div {
                    display: none !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    visibility: hidden !important;
                }
            `}} />
        </div>
    );
};

export default ThreeDBlockMovement;
