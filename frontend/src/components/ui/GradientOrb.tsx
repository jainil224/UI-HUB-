import React from 'react';

/**
 * GradientOrb
 * A liquid-gradient orb loader. A glossy sphere layers two rotating animated
 * surfaces (inset-shadow blobs + a blurred color gradient behind it) while a
 * 100x100 SVG on top sculpts the orb's face with masks: an animated pair of
 * paths drives a wave ripple mask, a clipping + blur mask softens the crests,
 * and a fade mask edges the sphere into a diffused glow. All layers spin on
 * their own durations and the palette shifts through red/blue/yellow/cyan via
 * hue-rotate keyframes.
 */
export const GradientOrb: React.FC = () => {
    return (
        <div
            className="w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden select-none"
            style={{
                background: 'radial-gradient(120% 120% at 50% 40%, #2a2e36 0%, #17181d 55%, #0d0e12 100%)',
            }}
        >
            <style>{`
                .gorb-loader {
                    --gorb-color-one: red;
                    --gorb-color-two: blue;
                    --gorb-color-three: yellow;
                    --gorb-color-fore: cyan;
                    --gorb-color-five: white;
                    --gorb-time-animation: 1s;
                    --gorb-size: 100px;
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    border-radius: 50%;
                }

                .gorb-loader .gorb-sphere {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    border-radius: 50%;
                    width: var(--gorb-size);
                    height: var(--gorb-size);
                    background: radial-gradient(
                        circle at 80% 20%,
                        rgba(255, 255, 255, 1) 0%,
                        rgba(255, 255, 255, 0.8) 20%,
                        rgba(255, 255, 255, 0.4) 50%,
                        rgba(255, 255, 255, 0) 70%
                    );
                }

                .gorb-loader .gorb-sphere::before {
                    content: "";
                    position: absolute;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: var(--gorb-size);
                    height: var(--gorb-size);
                    border-radius: 50%;
                    box-shadow:
                        inset calc(var(--gorb-size) / -20) calc(var(--gorb-size) / -20) calc(var(--gorb-size) / 10) var(--gorb-color-fore),
                        inset calc(var(--gorb-size) / 10) 0 calc(var(--gorb-size) / 5) var(--gorb-color-three);
                    animation:
                        gorb-rotation calc(var(--gorb-time-animation) * 2) linear infinite,
                        gorb-colorize calc(var(--gorb-time-animation) * 2) ease-in-out infinite;
                }

                .gorb-loader .gorb-sphere::after {
                    content: "";
                    position: absolute;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: var(--gorb-size);
                    height: var(--gorb-size);
                    border-radius: 50%;
                    z-index: -1;
                    background: radial-gradient(
                            circle at 80% 20%,
                            rgba(255, 255, 255, 0.7) 0%,
                            rgba(255, 255, 255, 0.5) 30%,
                            rgba(255, 255, 255, 0) 70%
                        ),
                        linear-gradient(120deg, var(--gorb-color-one) 20%, var(--gorb-color-two) 80%);
                    animation:
                        gorb-rotation calc(var(--gorb-time-animation) * 2) linear infinite,
                        gorb-colorblur calc(var(--gorb-time-animation) * 2) ease-in-out infinite;
                }

                .gorb-loader svg {
                    position: absolute;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: var(--gorb-size);
                    height: var(--gorb-size);
                    animation: gorb-rotation calc(var(--gorb-time-animation) * 3) cubic-bezier(0.7, 0.6, 0.3, 0.4) infinite;
                }

                .gorb-loader svg #gorb-shapes circle {
                    fill: var(--gorb-color-five);
                }

                .gorb-loader svg #gorb-blurriness g,
                .gorb-loader svg #gorb-clipping ellipse,
                .gorb-loader svg #gorb-shapes g:nth-of-type(2),
                .gorb-loader svg #gorb-fade ellipse {
                    filter: blur(7px);
                }

                .gorb-loader svg #gorb-waves g path {
                    will-change: d;
                    stroke-width: 7px;
                }

                .gorb-loader svg #gorb-waves g path:nth-of-type(1) {
                    animation: gorb-wave-one var(--gorb-time-animation) cubic-bezier(0.7, 0.6, 0.3, 0.4) infinite;
                }

                .gorb-loader svg #gorb-waves g path:nth-of-type(2) {
                    animation: gorb-wave-two var(--gorb-time-animation) cubic-bezier(0.7, 0.6, 0.3, 0.4) calc(var(--gorb-time-animation) / -2) infinite reverse;
                }

                .gorb-loader svg #gorb-waves g path:nth-of-type(3) {
                    animation: gorb-wave-one var(--gorb-time-animation) cubic-bezier(0.7, 0.6, 0.3, 0.4) calc(var(--gorb-time-animation) / -2) infinite;
                }

                .gorb-loader svg #gorb-waves g path:nth-of-type(4) {
                    animation: gorb-wave-two var(--gorb-time-animation) cubic-bezier(0.7, 0.6, 0.3, 0.4) infinite reverse;
                }

                @keyframes gorb-wave-one {
                    0% {
                        d: path("M5,50 C10,50 15,50 20,50 C25,50 30,50 95,50");
                    }
                    50% {
                        d: path("M5,50 C25,50 30,20 50,20 C70,20 75,50 95,50");
                    }
                    100% {
                        d: path("M5,50 C70,50 75,50 80,50 C85,50 90,50 95,50");
                    }
                }

                @keyframes gorb-wave-two {
                    0% {
                        d: path("M5,50 C10,50 15,50 20,50 C25,50 30,50 95,50");
                    }
                    50% {
                        d: path("M5,50 C25,50 30,80 50,80 C70,80 75,50 95,50");
                    }
                    100% {
                        d: path("M5,50 C70,50 75,50 80,50 C85,50 90,50 95,50");
                    }
                }

                @keyframes gorb-rotation {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }

                @keyframes gorb-colorize {
                    0% {
                        filter: hue-rotate(0deg);
                    }
                    20% {
                        filter: hue-rotate(-30deg);
                    }
                    40% {
                        filter: hue-rotate(-60deg);
                    }
                    60% {
                        filter: hue-rotate(-90deg);
                    }
                    80% {
                        filter: hue-rotate(-45deg);
                    }
                    100% {
                        filter: hue-rotate(0deg);
                    }
                }

                @keyframes gorb-colorblur {
                    0% {
                        filter: hue-rotate(0deg) blur(calc(var(--gorb-size) / 15));
                    }
                    20% {
                        filter: hue-rotate(-30deg) blur(calc(var(--gorb-size) / 15));
                    }
                    40% {
                        filter: hue-rotate(-60deg) blur(calc(var(--gorb-size) / 15));
                    }
                    60% {
                        filter: hue-rotate(-90deg) blur(calc(var(--gorb-size) / 15));
                    }
                    80% {
                        filter: hue-rotate(-45deg) blur(calc(var(--gorb-size) / 15));
                    }
                    100% {
                        filter: hue-rotate(0deg) blur(calc(var(--gorb-size) / 15));
                    }
                }
            `}</style>

            <div className="gorb-loader">
                <div className="gorb-sphere" />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    <defs>
                        <mask id="gorb-waves" maskUnits="userSpaceOnUse">
                            <g fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5,50 C25,50 30,20 50,20 C70,20 75,50 95,50" />
                                <path d="M5,50 C25,50 30,20 50,20 C70,20 75,50 95,50" />
                                <path d="M5,50 C25,50 30,80 50,80 C70,80 75,50 95,50" />
                                <path d="M5,50 C25,50 30,80 50,80 C70,80 75,50 95,50" />
                            </g>
                        </mask>
                        <mask id="gorb-blurriness" maskUnits="userSpaceOnUse">
                            <g>
                                <circle cx={50} cy={50} r={50} fill="white" />
                                <ellipse cx={50} cy={50} rx={25} ry={25} fill="black" />
                            </g>
                        </mask>
                        <mask id="gorb-clipping" maskUnits="userSpaceOnUse">
                            <ellipse cx={50} cy={50} rx={25} ry={50} fill="white" />
                        </mask>
                        <mask id="gorb-fade" maskUnits="userSpaceOnUse">
                            <ellipse cx={50} cy={50} rx={45} ry={50} fill="white" />
                        </mask>
                    </defs>
                    <g id="gorb-shapes" mask="url(#gorb-fade)">
                        <g mask="url(#gorb-clipping)">
                            <circle cx={50} cy={50} r={50} fill="currentColor" mask="url(#gorb-waves)" />
                        </g>
                        <g mask="url(#gorb-blurriness)">
                            <circle cx={50} cy={50} r={50} fill="currentColor" mask="url(#gorb-waves)" />
                        </g>
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default GradientOrb;