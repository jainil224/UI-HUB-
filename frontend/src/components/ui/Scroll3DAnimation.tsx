import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface Scroll3DAnimationProps {
    className?: string;
    showDemoButton?: boolean;
}

const Scroll3DAnimation: React.FC<Scroll3DAnimationProps> = ({ 
    className = "",
    showDemoButton = false 
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isFirstImageLoaded, setIsFirstImageLoaded] = useState(false);

    const frameCount = 300;
    const imageSeq = useRef({ frame: 0 });

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!context || !canvas) return;

        const frameIndex = Math.floor(imageSeq.current.frame);
        const img = imagesRef.current[frameIndex];
        if (!img || !img.complete || img.width === 0) return;

        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(
            img,
            0, 0, img.width, img.height,
            centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
        );
    }, []);

    // Resize handler
    useEffect(() => {
        const handleResize = () => {
            if (!canvasRef.current || !containerRef.current) return;
            canvasRef.current.width = containerRef.current.clientWidth;
            canvasRef.current.height = containerRef.current.clientHeight;
            render();
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [render]);

    // Preload images
    useEffect(() => {
        let loadedCount = 0;
        const baseUrl = "/assets/3d-scroll-animation/male";
        
        const preloadImages = () => {
            for (let i = 1; i <= frameCount; i++) {
                const img = new Image();
                const frameNum = i.toString().padStart(4, '0');
                const src = `${baseUrl}${frameNum}.png`;
                img.src = src;
                
                img.onload = () => {
                    loadedCount++;
                    const pct = Math.floor((loadedCount / frameCount) * 100);
                    setProgress(pct);
                    
                    if (i === 1) {
                        setIsFirstImageLoaded(true);
                        setTimeout(render, 100); // Small delay to ensure canvas is ready
                    }
                    
                    if (loadedCount === frameCount) {
                        setIsLoading(false);
                        setTimeout(() => {
                            ScrollTrigger.refresh();
                        }, 500);
                    }
                };
                
                img.onerror = () => {
                    loadedCount++;
                    if (loadedCount === frameCount) setIsLoading(false);
                };
                
                imagesRef.current[i - 1] = img;
            }
        };

        preloadImages();
    }, [render]);

    useGSAP(() => {
        if (!containerRef.current || !isFirstImageLoaded) return;

        const scroller = containerRef.current.closest('.overflow-y-auto, .overflow-auto') || window;

        // Master Timeline for all animations
        const mainTl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                scroller: scroller,
                start: "top top",
                end: "+=600%",
                scrub: 1,
                pin: true,
                pinType: scroller === window ? "fixed" : "transform",
                onUpdate: render,
                invalidateOnRefresh: true,
            }
        });

        // 1. Character Animation (0 to 1 progress)
        mainTl.to(imageSeq.current, {
            frame: frameCount - 1,
            ease: "none",
            duration: 1,
            snap: "frame"
        }, 0);

        // 2. Hero Marquee Fade Out
        mainTl.to('.hero-marquee-container', {
            opacity: 0,
            y: -50,
            duration: 0.1,
            ease: "power2.inOut"
        }, 0.05);

        // 3. Page 0: Key Word
        mainTl.fromTo('.page-0-left', 
            { opacity: 0, x: 100, filter: 'blur(10px)' },
            { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.15 }, 
            0.2
        );
        mainTl.fromTo('.page-0-right', 
            { opacity: 0, x: -100, filter: 'blur(10px)' },
            { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.15 }, 
            0.2
        );
        mainTl.to('.page-0-left, .page-0-right', {
            opacity: 0, y: -50, filter: 'blur(10px)', duration: 0.1
        }, 0.35);

        // 4. Page 1: Have Fun
        mainTl.fromTo('.page-1-top', 
            { opacity: 0, y: 100, filter: 'blur(10px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.15 }, 
            0.45
        );
        mainTl.fromTo('.page-1-bottom', 
            { opacity: 0, y: 100, filter: 'blur(10px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.15 }, 
            0.5
        );
        mainTl.to('.page-1-top, .page-1-bottom', {
            opacity: 0, y: -100, filter: 'blur(10px)', duration: 0.1
        }, 0.65);

        // 5. Page 2: Playground
        mainTl.fromTo('.page-2-content', 
            { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
            { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.2 }, 
            0.75
        );
        mainTl.to('.page-2-content', {
            opacity: 0, y: -50, filter: 'blur(10px)', duration: 0.1
        }, 0.95);

        return () => {
            mainTl.kill();
            ScrollTrigger.getAll().forEach(st => st.kill());
        };
    }, { scope: containerRef, dependencies: [isFirstImageLoaded] });

    return (
        <div ref={containerRef} className={`relative w-full h-full min-h-[500px] overflow-hidden bg-[#f1f1f1] ${className}`}>
            {/* Loader */}
            {isLoading && (
                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#f1f1f1] text-black">
                    <div className="w-64 h-[2px] bg-black/10 rounded-full overflow-hidden mb-8">
                        <div 
                            className="h-full bg-black transition-all duration-300 ease-out" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-[10px] font-black tracking-[0.4em] uppercase opacity-70">
                            Initializing Scene
                        </p>
                        <p className="text-[10px] font-black tracking-[0.2em] font-mono opacity-40">
                            {progress}%
                        </p>
                    </div>
                </div>
            )}

            <canvas 
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-20 transition-opacity duration-1000 ${isFirstImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{ willChange: 'transform' }}
            />

            {/* View Full Demo Button Overlay - Only shown in Library Preview */}
            {showDemoButton && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    <Link 
                        to="/demo/3d-scroll-animation" 
                        target="_blank"
                        className="pointer-events-auto no-underline"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative flex items-center gap-3 px-10 py-4 bg-black/40 hover:bg-black/60 backdrop-blur-2xl border border-white/10 hover:border-brand-green/50 rounded-full text-white transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(0,255,0,0.2)]"
                        >
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-green/0 via-brand-green/5 to-brand-green/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
                            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 group-hover:border-brand-green/30 group-hover:bg-brand-green/10 transition-all duration-500">
                                <ExternalLink size={16} className="text-white/70 group-hover:text-brand-green group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-500" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 group-hover:text-brand-green/60 transition-colors duration-500 leading-none mb-1">Experience</span>
                                <span className="text-sm font-black uppercase tracking-widest text-white group-hover:text-white transition-colors duration-500 leading-none">View Full Demo</span>
                            </div>
                            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-pulse" />
                            </div>
                        </motion.button>
                    </Link>
                </div>
            )}

            {/* Content Layers */}
            <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000 ${isFirstImageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                {/* Hero Loop */}
                <div className="hero-marquee-container absolute top-[25%] md:top-[30%] left-0 w-full overflow-hidden flex flex-col whitespace-nowrap opacity-50">
                    <div className="flex">
                        <h1 className="text-[15vw] md:text-[10vw] font-black uppercase tracking-tighter animate-marquee text-black">
                            <span className="text-transparent outline-text uppercase">UI HUB</span> IS THE <span className="text-transparent outline-text">HOME</span> OF <span className="text-transparent outline-text">VIBE</span> CODING. &nbsp;
                        </h1>
                        <h1 className="text-[15vw] md:text-[10vw] font-black uppercase tracking-tighter animate-marquee text-black">
                            <span className="text-transparent outline-text uppercase">UI HUB</span> IS THE <span className="text-transparent outline-text">HOME</span> OF <span className="text-transparent outline-text">VIBE</span> CODING. &nbsp;
                        </h1>
                    </div>
                </div>
            </div>

            {/* Text Layers (Behind Canvas) */}
            <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000 ${isFirstImageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                {/* Page 0: Key Word */}
                <div className="scroll-text-layer page-0-left absolute top-[25%] md:top-[30%] left-[10%] right-[10%] md:right-auto max-w-xl">
                    <h3 className="text-neutral-500 text-xs md:text-sm font-bold tracking-widest uppercase mb-2 md:mb-4">WHAT IS UI HUB</h3>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-[1.1] text-black">
                        DISCOVER<br />
                        STUNNING UI<br />
                        READY TO USE
                    </h1>
                </div>

                <div className="scroll-text-layer page-0-right absolute top-[55%] md:top-[50%] left-[10%] right-[10%] md:left-auto text-left md:text-right max-w-xl">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-[1.1] text-black">
                        BUILD FASTER<br />
                        STAY CREATIVE<br />
                        VIBE CODING
                    </h1>
                    <h3 className="text-neutral-500 text-xs md:text-sm font-bold tracking-widest uppercase mt-2 md:mt-4">UI HUB CREATION</h3>
                </div>

                {/* Page 1: Creator */}
                <div className="scroll-text-layer page-1-top absolute top-[25%] md:top-[30%] left-[10%] right-[10%] md:right-auto max-w-3xl">
                    <h3 className="text-neutral-500 text-xs md:text-sm font-bold tracking-widest uppercase mb-2 md:mb-4">THE CREATOR</h3>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] text-black tracking-tight">
                        Crafted by Jainil
                        <span className="block text-xl sm:text-2xl md:text-4xl lg:text-5xl text-neutral-400 font-bold mt-1 md:mt-3">— Built for Developers</span>
                    </h1>
                </div>

                <div className="scroll-text-layer page-1-bottom absolute top-[65%] md:top-[60%] left-[10%] right-[10%] md:left-auto text-left md:text-right max-w-xl">
                    <p className="text-neutral-600 text-base md:text-lg leading-relaxed font-medium">
                        A SOLO MISSION TO EMPOWER DEVELOPERS WORLDWIDE. UI HUB DELIVERS PREMIUM, READY-TO-USE COMPONENTS SO YOU CAN STOP TWEAKING CSS AND START SHIPPING INCREDIBLE EXPERIENCES.
                    </p>
                </div>

                {/* Page 2: Playground */}
                <div className="scroll-text-layer page-2-content absolute top-[40%] left-[10%] right-[10%] md:left-auto text-center md:text-right max-w-2xl">
                    <h3 className="text-neutral-500 text-xs md:text-sm font-bold tracking-widest uppercase mb-2 md:mb-4">WHY UI HUB</h3>
                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-black leading-[0.9] text-black font-outline">
                        VIBE CODING<br />
                        IS OUR<br />
                        FUTURE
                    </h1>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .outline-text {
                    -webkit-text-stroke: 1.5px #000;
                }
                .font-outline {
                    -webkit-text-stroke: 1.5px #000;
                    color: transparent;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
            `}} />
        </div>
    );
};

export default Scroll3DAnimation;
