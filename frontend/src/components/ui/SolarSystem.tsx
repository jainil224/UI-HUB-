import React, { useState, useEffect, useRef, useMemo } from 'react';
import './SolarSystem.css';

interface PlanetData {
    name: string;
    description: string;
    tilt: number;
    gravity: number;
    hours: number;
    image: string;
}

const PLANETS: PlanetData[] = [
    {
        name: "Mercury",
        description: "Tiny and close to the sun.",
        tilt: 3.13,
        gravity: 0.9,
        hours: 10,
        image: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-1188/1_mercury.jpg"
    },
    {
        name: "Venus",
        description: "A planet of razors and tennis players.",
        tilt: 4.13,
        gravity: 0.2,
        hours: 20,
        image: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-1188/2_venus.jpg"
    },
    {
        name: "Earth",
        description: "Voted best planet in the Solar System by all organisms.",
        tilt: 5.13,
        gravity: 7.3,
        hours: 30,
        image: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-1188/3_earth.jpg"
    },
    {
        name: "Mars",
        description: "Future Site of Elon Musk's AirBnB.",
        tilt: 6.13,
        gravity: 1.1,
        hours: 40,
        image: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-1188/4_mars.jpg"
    },
    {
        name: "Jupiter",
        description: "Twice as massive as the other planets combined.",
        tilt: 11.13,
        gravity: 1.8,
        hours: 50,
        image: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-1188/5_jupiter.jpg"
    },
    {
        name: "Saturn",
        description: "This planet sponsored by Zales.",
        tilt: 9.13,
        gravity: 7.3,
        hours: 60,
        image: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-1188/6_saturn.jpg"
    },
    {
        name: "Uranus",
        description: "Hey, stop laughing. It's not funny.",
        tilt: 11.13,
        gravity: 1.8,
        hours: 50,
        image: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-1188/7_uranus.jpg"
    },
    {
        name: "Neptune",
        description: "A planet for pirates; just narrowly made the cut.",
        tilt: 31.03,
        gravity: 8.9,
        hours: 10,
        image: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-1188/8_neptune.jpg"
    }
];

export const SolarSystem: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [animatedValues, setAnimatedValues] = useState({
        tilt: PLANETS[0].tilt,
        gravity: PLANETS[0].gravity,
        hours: PLANETS[0].hours
    });
    
    const navPathRef = useRef<SVGPathElement>(null);
    const tspanRefs = useRef<(SVGTSpanElement | null)[]>([]);

    // Distribution of text along the SVG path
    useEffect(() => {
        if (!navPathRef.current) return;
        
        const pathLength = navPathRef.current.getTotalLength();
        const tspans = tspanRefs.current.filter(t => t !== null);
        const length = tspans.length - 1;
        
        // Use the last tspan to calculate the "available" length
        const lastTspan = tspans[length];
        const lastTspanWidth = lastTspan.getComputedTextLength();
        const availablePathLength = pathLength - lastTspanWidth;

        tspans.forEach((tspan, i) => {
            const percent = i / length;
            const x = percent * availablePathLength;
            tspan.setAttribute('x', x.toString());
        });
    }, []);

    // Number animation when active planet changes
    useEffect(() => {
        const prevPlanet = PLANETS[activeIndex === 0 ? 0 : activeIndex - 1]; // Simplified for initial
        // Actually we need to track previous values
    }, [activeIndex]);

    // Smoother value transition using a custom requestAnimationFrame loop
    const prevActiveIndex = useRef(activeIndex);
    useEffect(() => {
        const startValues = { ...animatedValues };
        const endValues = {
            tilt: PLANETS[activeIndex].tilt,
            gravity: PLANETS[activeIndex].gravity,
            hours: PLANETS[activeIndex].hours
        };
        
        const duration = 800;
        const startTime = performance.now();

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = (1 - Math.cos(progress * Math.PI)) / 2;

            setAnimatedValues({
                tilt: startValues.tilt + (endValues.tilt - startValues.tilt) * ease,
                gravity: startValues.gravity + (endValues.gravity - startValues.gravity) * ease,
                hours: Math.round(startValues.hours + (endValues.hours - startValues.hours) * ease)
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
        prevActiveIndex.current = activeIndex;
    }, [activeIndex]);
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                setActiveIndex(prev => (prev + 1) % PLANETS.length);
            } else if (e.key === 'ArrowLeft') {
                setActiveIndex(prev => (prev - 1 + PLANETS.length) % PLANETS.length);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handlePlanetClick = (index: number) => {
        setActiveIndex(index);
    };

    return (
        <div className="solar-system-explorer relative">
            <div id="app" style={{ '--active': activeIndex } as React.CSSProperties}>
                {PLANETS.map((planet, i) => (
                    <div 
                        key={planet.name} 
                        className="planet" 
                        data-active={activeIndex === i}
                    >
                        <div className="planet-title">
                            <h1>
                                {planet.name.split('').map((char, charIdx) => (
                                    <span 
                                        key={charIdx} 
                                        className="char" 
                                        style={{ '--char-index': charIdx } as React.CSSProperties}
                                    >
                                        {char}
                                    </span>
                                ))}
                            </h1>
                            <p className="planet-description">{planet.description}</p>
                        </div>

                        <div className="planet-details">
                            <div className="detail" data-detail="tilt" data-postfix="°">
                                {activeIndex === i ? animatedValues.tilt.toFixed(2) : planet.tilt}
                            </div>
                            <div className="detail" data-detail="gravity" data-postfix="𝗑">
                                {activeIndex === i ? animatedValues.gravity.toFixed(1) : planet.gravity}
                            </div>
                            <div className="detail" data-detail="hours">
                                {activeIndex === i ? animatedValues.hours : planet.hours}
                            </div>
                        </div>

                        <figure className="planet-figure">
                            <img src={planet.image} alt={planet.name} />
                        </figure>
                    </div>
                ))}

                <nav className="planet-nav">
                    <svg viewBox="0 20 400 400" xmlns="http://www.w3.org/2000/svg">
                        <path 
                            id="navPath" 
                            ref={navPathRef}
                            d="M10,200 C30,-28 370,-28 390,200" 
                            fill="none" 
                        />
                        <text>
                            <textPath href="#navPath" startOffset="0" fontSize="10">
                                {PLANETS.map((planet, i) => (
                                    <tspan 
                                        key={i}
                                        ref={el => tspanRefs.current[i] = el}
                                        onClick={() => handlePlanetClick(i)}
                                    >
                                        {planet.name}
                                    </tspan>
                                ))}
                            </textPath>
                        </text>
                    </svg>
                </nav>
            </div>

            {/* Navigation Guide */}
            <div className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-widest pointer-events-none animate-pulse">
                <span>Navigate</span>
                <span className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20">←</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20">→</span>
                </span>
            </div>
        </div>
    );
};

export default SolarSystem;
