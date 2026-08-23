import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * TopLoader
 * Neo-Brutalist top-of-page progress indicator for genuine route/pathname changes.
 * Explicitly ignores query parameter changes (e.g. browsing components in /library?id=...).
 */
export const TopLoader: React.FC = () => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const prevPathnameRef = useRef(location.pathname);

    useEffect(() => {
        // Only trigger on genuine route changes, not intra-page query param switches
        if (prevPathnameRef.current !== location.pathname) {
            prevPathnameRef.current = location.pathname;
            
            setIsLoading(true);
            setProgress(25);

            const t1 = setTimeout(() => setProgress(65), 100);
            const t2 = setTimeout(() => setProgress(90), 250);
            const t3 = setTimeout(() => {
                setProgress(100);
                const t4 = setTimeout(() => {
                    setIsLoading(false);
                    setProgress(0);
                }, 200);
                return () => clearTimeout(t4);
            }, 400);

            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
            };
        }
    }, [location.pathname]);

    if (!isLoading && progress === 0) return null;

    return (
        <div 
            className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
        >
            <div 
                className="h-full bg-brand-blue shadow-[0_0_10px_#3D5CFF,0_0_5px_#3D5CFF] transition-all duration-200 ease-out"
                style={{
                    width: `${progress}%`,
                    opacity: progress === 100 ? 0 : 1,
                    transition: progress === 100 
                        ? 'width 0.2s ease-out, opacity 0.2s 0.1s ease-in' 
                        : 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            />
        </div>
    );
};

export default TopLoader;
