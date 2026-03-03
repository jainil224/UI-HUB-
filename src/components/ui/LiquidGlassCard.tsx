import React from 'react';
import { motion } from 'motion/react';

interface LiquidGlassCardProps {
    children: React.ReactNode;
    className?: string;
    shadowIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
    borderRadius?: string;
    glowIntensity?: 'none' | 'low' | 'medium' | 'high';
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
    children,
    className = '',
    shadowIntensity = 'md',
    borderRadius = '24px',
    glowIntensity = 'medium'
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, translateY: -5 }}
            style={{ borderRadius }}
            className={`relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 transition-colors hover:bg-white/10 ${className}`}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            {/* Animated Glow */}
            {glowIntensity !== 'none' && (
                <motion.div
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className={`absolute -top-1/2 -left-1/2 w-full h-full bg-brand-green/10 blur-[80px] rounded-full pointer-events-none ${glowIntensity === 'low' ? 'opacity-30' :
                        glowIntensity === 'high' ? 'opacity-70' : 'opacity-50'
                        }`}
                />
            )}

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};
