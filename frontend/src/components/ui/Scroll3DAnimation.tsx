import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Scroll3DAnimationProps {
    className?: string;
}

const Scroll3DAnimation: React.FC<Scroll3DAnimationProps> = ({ className = "" }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    const frameCount = 300;
    const imageSeq = useRef({ frame: 0 });

    // Preload images
    useEffect(() => {
        let loadedCount = 0;
        const loadedImages: HTMLImageElement[] = [];

        const preloadImages = async () => {
            const baseUrl = `${import.meta.env.BASE_URL}assets/3d-scroll-animation/male`;
            
            for (let i = 1; i <= frameCount; i++) {
                const img = new Image();
                const frameNum = i.toString().padStart(4, '0');
                img.src = `${baseUrl}${frameNum}.png`;
                
                img.onload = () => {
                    loadedCount++;
                    const percent = Math.floor((loadedCount / frameCount) * 100);
                    setProgress(percent);
                    
                    if (loadedCount === frameCount) {
                        setImages(loadedImages);
                        setIsLoading(false);
                    }
                };
                loadedImages.push(img);
            }
        };

        preloadImages();
    }, []);

    // Set up ScrollTrigger and Canvas rendering
    useEffect(() => {
        if (isLoading || !canvasRef.current || images.length === 0) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Initial render
        const render = () => {
            const frameIndex = Math.floor(imageSeq.current.frame);
            const img = images[frameIndex];
            if (!img) return;

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
        };

        // Resize handler
        const handleResize = () => {
            if (!canvasRef.current || !containerRef.current) return;
            const canvas = canvasRef.current;
            // Use container dimensions instead of window
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
            render();
        };

        handleResize(); // Initial call
        window.addEventListener('resize', handleResize);

        // GSAP Animation
        // Find closest scrollable parent or fallback to main/window
        const scroller = containerRef.current?.closest('.overflow-y-auto, .overflow-auto') || document.querySelector('main') || window;

        const tl = gsap.to(imageSeq.current, {
            frame: frameCount - 1,
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                scroller: scroller,
                start: "top top",
                end: "+=600%", 
                scrub: 1, // Smoother scrub
                pin: true,
                pinType: scroller === window ? "fixed" : "transform", // CRITICAL for local scrollers
                refreshPriority: 1,
            },
            onUpdate: render,
        });

        // Hero Marquee Fade Out
        gsap.to('.hero-marquee-container', {
            opacity: 0,
            scrollTrigger: {
                trigger: containerRef.current,
                scroller: scroller,
                start: "top top",
                end: "20% top",
                scrub: true,
            }
        });

        // Refined Text Animations
        // We'll define specific ranges for each "page" of text to fade in and out
        const pages = [
            { id: 0, start: 100, end: 200 }, // Page 1
            { id: 1, start: 250, end: 350 }, // Page 2
            { id: 2, start: 400, end: 500 }, // Page 3
        ];

        pages.forEach((page) => {
            const elements = containerRef.current?.querySelectorAll(`.page-${page.id}`);
            elements?.forEach((el) => {
                gsap.fromTo(el, 
                    { opacity: 0, y: 50, filter: 'blur(10px)' },
                    { 
                        opacity: 1, 
                        y: 0,
                        filter: 'blur(0px)',
                        scrollTrigger: {
                            trigger: containerRef.current,
                            scroller: scroller,
                            start: `${page.start}% top`,
                            end: `${page.start + 50}% top`,
                            scrub: true,
                        }
                    }
                );

                gsap.to(el, {
                    opacity: 0,
                    y: -50,
                    filter: 'blur(10px)',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        scroller: scroller,
                        start: `${page.end - 50}% top`,
                        end: `${page.end}% top`,
                        scrub: true,
                    }
                });
            });
        });

        // Refresh ScrollTrigger after measures are settled
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 100);

        return () => {
            window.removeEventListener('resize', handleResize);
            tl.kill();
            ScrollTrigger.getAll().forEach(st => st.kill());
        };
    }, [isLoading, images]);

    return (
        <div ref={containerRef} className={`relative w-full h-full min-h-[400px] overflow-hidden bg-[#f1f1f1] ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white">
                    <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                        <div 
                            className="h-full bg-indigo-500 transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs font-bold tracking-[0.3em] uppercase opacity-50">
                        Loading Experience {progress}%
                    </p>
                </div>
            )}

            <canvas 
                ref={canvasRef}
                className="relative z-20 w-full h-full object-cover transition-none"
                style={{ willChange: 'transform' }}
            />

            {/* Content Layers (Cyberfiction style) */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                {/* Hero Loop */}
                <div className="hero-marquee-container absolute top-[25%] md:top-[30%] left-0 w-full overflow-hidden flex flex-col whitespace-nowrap opacity-50">
                    <div className="flex">
                        <h1 className="text-[15vw] md:text-[10vw] font-black uppercase tracking-tighter animate-marquee text-black">
                            <span className="text-transparent outline-text">UI-HUB</span> IS THE <span className="text-transparent outline-text">REAL</span> STORY <span className="text-transparent outline-text">IN THE</span> METAVERSE. &nbsp;
                        </h1>
                        <h1 className="text-[15vw] md:text-[10vw] font-black uppercase tracking-tighter animate-marquee text-black">
                            <span className="text-transparent outline-text">UI-HUB</span> IS THE <span className="text-transparent outline-text">REAL</span> STORY <span className="text-transparent outline-text">IN THE</span> METAVERSE. &nbsp;
                        </h1>
                    </div>
                    <div className="flex flex-col px-6 md:px-0 md:ml-[10vw] mt-2 md:mt-[-1vw] opacity-80">
                         <p className="text-[3.5vw] md:text-[1.2vw] font-bold tracking-tight text-black leading-tight">
                            UI-HUB AIMS TO BE A DECENTRALIZED COMMUNITY TO
                         </p>
                         <p className="text-[3.5vw] md:text-[1.2vw] font-bold tracking-tight text-black leading-tight">
                            CREATE NEW VALUES AND PROFITS THROUGH PLAY IN THE VIRTUAL WORLD.
                         </p>
                    </div>
                </div>

                {/* Page 1 Text (Grouped as page-0) */}
                <div className="scroll-text-layer page-0 absolute top-[25%] md:top-[30%] left-[10%] right-[10%] md:right-auto max-w-xl">
                    <h3 className="text-neutral-500 text-xs md:text-sm font-bold tracking-widest uppercase mb-2 md:mb-4">UI HUB / KEY WORD</h3>
                    <h1 className="text-4xl md:text-6xl font-black leading-[1.1] text-black">
                        HAVE FUN<br />
                        LET'S PLAY<br />
                        JUST BE TOGETHER
                    </h1>
                </div>

                <div className="scroll-text-layer page-0 absolute top-[55%] md:top-[50%] left-[10%] right-[10%] md:left-auto text-left md:text-right max-w-xl">
                    <h1 className="text-4xl md:text-6xl font-black leading-[1.1] text-black">
                        MAKE A STORY<br />
                        TAKE A CHANCE<br />
                        BUILD AND OWNED
                    </h1>
                    <h3 className="text-neutral-500 text-xs md:text-sm font-bold tracking-widest uppercase mt-2 md:mt-4">UI HUB CREATION</h3>
                </div>

                {/* Page 2 Text (Grouped as page-1) */}
                <div className="scroll-text-layer page-1 absolute top-[25%] md:top-[30%] left-[10%] right-[10%] md:right-auto max-w-xl">
                    <h3 className="text-neutral-500 text-xs md:text-sm font-bold tracking-widest uppercase mb-2 md:mb-4">UI HUB / HAVE FUN</h3>
                    <h1 className="text-5xl md:text-7xl font-black leading-[1.1] text-black">
                        LET'S<br />
                        HAVE FUN<br />
                        TOGETHER
                    </h1>
                </div>

                <div className="scroll-text-layer page-1 absolute top-[65%] md:top-[60%] left-[10%] right-[10%] md:left-auto text-left md:text-right max-w-md">
                    <p className="text-neutral-600 text-base md:text-lg leading-relaxed font-medium">
                        LET'S HAVE A BLAST! LET'S JUST THROW AWAY AGE, GENDER, REGION, STATUS, ETC., DON'T COMPETE, DON'T FIGHT, COOPERATE AND SHARE WITH EACH OTHER AND ENJOY IT TOGETHER!
                    </p>
                </div>

                {/* Page 3 Text (Grouped as page-2) */}
                <div className="scroll-text-layer page-2 absolute top-[40%] left-[10%] right-[10%] md:left-auto text-center md:text-right max-w-2xl">
                    <h3 className="text-neutral-500 text-xs md:text-sm font-bold tracking-widest uppercase mb-2 md:mb-4">UI HUB / PLAYGROUND</h3>
                    <h1 className="text-6xl md:text-8xl font-black leading-[0.9] text-black">
                        UI FIELD<br />
                        IS OUR<br />
                        PLAYGROUND
                    </h1>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .outline-text {
                    -webkit-text-stroke: 1.5px #000;
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
