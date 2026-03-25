import React, { useEffect, useRef } from 'react';

interface ThreeDTubesCursorProps {
    /** Colors for the tubes */
    colors?: string[];
    /** Light colors for the scene */
    lightColors?: string[];
    /** Intensity of the lights */
    lightIntensity?: number;
    /** Optional ref to the container for local tracking */
    containerRef?: React.RefObject<HTMLElement>;
    /** Optional class name */
    className?: string;
}

/**
 * 3D Tubes Cursor Animation
 * Ported from legacy Three.js component reference.
 * Features neon glowing tubes that trail behind the cursor in 3D space.
 */
export const ThreeDTubesCursor: React.FC<ThreeDTubesCursorProps> = ({
    colors = ["#f967fb", "#53bc28", "#6958d5"],
    lightColors = ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"],
    lightIntensity = 200,
    containerRef,
    className = '',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<any>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let isMounted = true;

        const init = async () => {
            try {
                // Dynamically import the legacy library from CDN as referenced in the Assets folder
                // @ts-ignore - TypeScript cannot resolve URL imports at compile time
                const TubesModule = await import(/* @keep-external */ "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js");
                const TubesCursor = TubesModule.default;

                if (!isMounted) return;

                const app = TubesCursor(canvas, {
                    tubes: {
                        colors: colors,
                        lights: {
                            intensity: lightIntensity,
                            colors: lightColors
                        }
                    }
                });

                appRef.current = app;

                // Handle resize based on container
                const handleResize = () => {
                    if (containerRef?.current) {
                        // The library might handle its own resize if canvas matches container, 
                        // but we can force it if needed.
                        canvas.width = containerRef.current.clientWidth;
                        canvas.height = containerRef.current.clientHeight;
                    }
                };

                handleResize();
                window.addEventListener('resize', handleResize);

                return () => {
                    window.removeEventListener('resize', handleResize);
                    // The library doesn't expose a clean destroy, but we can clear the canvas
                    if (app && app.destroy) app.destroy();
                };
            } catch (err) {
                console.error("3D Tubes Cursor failed to load:", err);
            }
        };

        const cleanupPromise = init();

        return () => {
            isMounted = false;
            cleanupPromise.then(cleanup => cleanup && cleanup());
        };
    }, [colors, lightColors, lightIntensity, containerRef]);

    // Handle color changes via app instance if they change after mount
    useEffect(() => {
        if (appRef.current?.tubes) {
            appRef.current.tubes.setColors(colors);
            appRef.current.tubes.setLightsColors(lightColors);
        }
    }, [colors, lightColors]);

    return (
        <canvas
            ref={canvasRef}
            id="canvas"
            className={className}
            style={{
                position: containerRef ? 'absolute' : 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: containerRef ? 1 : 9999,
                display: 'block'
            }}
        />
    );
};

export default ThreeDTubesCursor;
