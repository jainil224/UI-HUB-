import React from 'react';

/**
 * GeneratingOrb
 * An AI-style generating loader. The word "GENERATING" pulses through the
 * middle of a spinning orb whose inset box-shadow hues cycle through violet,
 * magenta and indigo as the ring rotates continuously.
 */
export const GeneratingOrb: React.FC = () => {
    return (
        <div
            className="w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden select-none"
            style={{
                background: 'radial-gradient(120% 120% at 50% 40%, #2a2e36 0%, #17181d 55%, #0d0e12 100%)',
            }}
        >
            <style>{`
                .go-loader-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 180px;
                    height: 180px;
                    font-family: "Inter", sans-serif;
                    font-size: 1.2em;
                    font-weight: 300;
                    color: white;
                    border-radius: 50%;
                    background-color: transparent;
                    user-select: none;
                }

                .go-loader {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    aspect-ratio: 1 / 1;
                    border-radius: 50%;
                    background-color: transparent;
                    animation: go-loader-rotate 2s linear infinite;
                    z-index: 0;
                }

                @keyframes go-loader-rotate {
                    0% {
                        transform: rotate(90deg);
                        box-shadow:
                            0 10px 20px 0 #fff inset,
                            0 20px 30px 0 #ad5fff inset,
                            0 60px 60px 0 #471eec inset;
                    }
                    50% {
                        transform: rotate(270deg);
                        box-shadow:
                            0 10px 20px 0 #fff inset,
                            0 20px 10px 0 #d60a47 inset,
                            0 40px 60px 0 #311e80 inset;
                    }
                    100% {
                        transform: rotate(450deg);
                        box-shadow:
                            0 10px 20px 0 #fff inset,
                            0 20px 30px 0 #ad5fff inset,
                            0 60px 60px 0 #471eec inset;
                    }
                }

                .go-loader-letter {
                    display: inline-block;
                    opacity: 0.4;
                    transform: translateY(0);
                    animation: go-loader-letter-anim 2s infinite;
                    z-index: 1;
                    border-radius: 50ch;
                    border: none;
                }

                .go-loader-letter:nth-child(1) {
                    animation-delay: 0s;
                }
                .go-loader-letter:nth-child(2) {
                    animation-delay: 0.1s;
                }
                .go-loader-letter:nth-child(3) {
                    animation-delay: 0.2s;
                }
                .go-loader-letter:nth-child(4) {
                    animation-delay: 0.3s;
                }
                .go-loader-letter:nth-child(5) {
                    animation-delay: 0.4s;
                }
                .go-loader-letter:nth-child(6) {
                    animation-delay: 0.5s;
                }
                .go-loader-letter:nth-child(7) {
                    animation-delay: 0.6s;
                }
                .go-loader-letter:nth-child(8) {
                    animation-delay: 0.7s;
                }
                .go-loader-letter:nth-child(9) {
                    animation-delay: 0.8s;
                }
                .go-loader-letter:nth-child(10) {
                    animation-delay: 0.9s;
                }

                @keyframes go-loader-letter-anim {
                    0%,
                    100% {
                        opacity: 0.4;
                        transform: translateY(0);
                    }
                    20% {
                        opacity: 1;
                        transform: scale(1.15);
                    }
                    40% {
                        opacity: 0.7;
                        transform: translateY(0);
                    }
                }
            `}</style>

            <div className="go-loader-wrapper">
                <span className="go-loader-letter">G</span>
                <span className="go-loader-letter">e</span>
                <span className="go-loader-letter">n</span>
                <span className="go-loader-letter">e</span>
                <span className="go-loader-letter">r</span>
                <span className="go-loader-letter">a</span>
                <span className="go-loader-letter">t</span>
                <span className="go-loader-letter">i</span>
                <span className="go-loader-letter">n</span>
                <span className="go-loader-letter">g</span>
                <div className="go-loader" />
            </div>
        </div>
    );
};

export default GeneratingOrb;