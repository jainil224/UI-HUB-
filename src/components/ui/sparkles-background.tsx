"use client";

import { motion } from "framer-motion";
import { SparklesCore } from "./sparkles";

export function SparklesBackground({
    title = "Sparkles background",
}: {
    title?: string;
}) {
    const words = title.split(" ");

    return (
        <div className="relative min-h-[400px] h-full w-full flex items-center justify-center overflow-hidden bg-neutral-950">
            {/* Core Sparkles Component */}
            <div className="w-full absolute inset-0 h-full pointer-events-none">
                <SparklesCore
                    id="tsparticlesfullpage"
                    background="transparent"
                    minSize={0.6}
                    maxSize={2.4}
                    particleDensity={100}
                    className="w-full h-full"
                    particleColor="#FFFFFF"
                />
            </div>

            {/* Radial Gradient to fade out edges */}
            <div className="absolute inset-0 w-full h-full bg-neutral-950 [mask-image:radial-gradient(ellipse_at_center,transparent_0%,black_100%)] pointer-events-none"></div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
                        {words.map((word, wordIndex) => (
                            <span
                                key={wordIndex}
                                className="inline-block mr-4 last:mr-0 text-white"
                            >
                                {word.split("").map((letter, letterIndex) => (
                                    <motion.span
                                        key={`${wordIndex}-${letterIndex}`}
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay:
                                                wordIndex * 0.1 +
                                                letterIndex * 0.03,
                                            type: "spring",
                                            stiffness: 150,
                                            damping: 25,
                                        }}
                                        className="inline-block text-transparent bg-clip-text 
                                        bg-gradient-to-r from-white to-white/80 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                    >
                                        {letter}
                                    </motion.span>
                                ))}
                            </span>
                        ))}
                    </h1>


                </motion.div>
            </div>
        </div>
    );
}

export default SparklesBackground;
