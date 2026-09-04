import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
    children: React.ReactNode;
}

const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
    const location = useLocation();

    useEffect(() => {
        // Disable smooth scroll on mobile devices for better performance and native feel
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            return;
        }

        // Disable smooth scroll on demo, library, and templates routes to allow native container scrolling
        if (location.pathname.startsWith('/demo') || location.pathname.startsWith('/library') || location.pathname.startsWith('/templates')) {
            return;
        }

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        // Integrate with ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        const raf = (time: number) => {
            lenis.raf(time * 1000);
        };

        gsap.ticker.add(raf);

        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
            gsap.ticker.remove(raf);
        };
    }, [location.pathname]);

    return <>{children}</>;
};

export default SmoothScroll;
