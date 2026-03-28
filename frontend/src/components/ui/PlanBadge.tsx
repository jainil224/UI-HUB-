import React from 'react';
import { motion } from 'motion/react';
import { Code2, Crown, Gem } from 'lucide-react';

export type PlanTier = 'free' | 'pro' | 'elite';

interface PlanBadgeProps {
    tier: PlanTier;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    animated?: boolean;
    className?: string;
}

const BADGE_CONFIG = {
    free: {
        label: 'FREE',
        icon: Code2,
        containerClass: 'bg-white/[0.05] border border-white/10',
        textClass: 'text-white/40',
        iconClass: 'text-white/30',
        glowClass: '',
        description: 'Basic Member',
    },
    pro: {
        label: 'PRO',
        icon: Crown,
        containerClass: 'bg-brand-green text-black border border-brand-green',
        textClass: 'text-black',
        iconClass: 'text-black',
        glowClass: 'shadow-[0_0_20px_rgba(0,255,0,0.5)]',
        description: 'Pro Member',
    },
    elite: {
        label: 'ELITE',
        icon: Gem,
        containerClass: 'bg-blue-500 border border-blue-400',
        textClass: 'text-white',
        iconClass: 'text-white',
        glowClass: 'shadow-[0_0_20px_rgba(59,130,246,0.6)]',
        description: 'Elite Member',
    },
};

const SIZE_CONFIG = {
    sm: {
        container: 'px-1.5 py-0.5 gap-0.5 rounded-md',
        text: 'text-[7px]',
        icon: 6,
    },
    md: {
        container: 'px-2 py-1 gap-1 rounded-lg',
        text: 'text-[9px]',
        icon: 9,
    },
    lg: {
        container: 'px-3 py-1.5 gap-1.5 rounded-xl',
        text: 'text-[11px]',
        icon: 12,
    },
};

const PlanBadge = ({
    tier,
    size = 'md',
    showIcon = true,
    animated = true,
    className = '',
}: PlanBadgeProps) => {
    const config = BADGE_CONFIG[tier];
    const sizeConfig = SIZE_CONFIG[size];
    const Icon = config.icon;

    const badge = (
        <span
            className={`inline-flex items-center font-display font-black uppercase tracking-[0.2em] transition-all
                ${config.containerClass}
                ${config.glowClass}
                ${sizeConfig.container}
                ${sizeConfig.text}
                ${className}`}
        >
            {showIcon && (
                <Icon
                    size={sizeConfig.icon}
                    className={`${config.iconClass} shrink-0`}
                />
            )}
            {config.label}
        </span>
    );

    if (!animated || tier === 'free') return badge;

    if (tier === 'elite') {
        return (
            <motion.span
                animate={{ opacity: [1, 0.75, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className={`inline-flex items-center font-display font-black uppercase tracking-[0.2em]
                    ${config.containerClass}
                    ${config.glowClass}
                    ${sizeConfig.container}
                    ${sizeConfig.text}
                    ${className}`}
            >
                {showIcon && (
                    <Icon size={sizeConfig.icon} className={`${config.iconClass} shrink-0`} />
                )}
                {config.label}
            </motion.span>
        );
    }

    // PRO — subtle float
    return (
        <motion.span
            animate={{ y: [0, -1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className={`inline-flex items-center font-display font-black uppercase tracking-[0.2em]
                ${config.containerClass}
                ${config.glowClass}
                ${sizeConfig.container}
                ${sizeConfig.text}
                ${className}`}
        >
            {showIcon && (
                <Icon size={sizeConfig.icon} className={`${config.iconClass} shrink-0`} />
            )}
            {config.label}
        </motion.span>
    );
};

export default PlanBadge;
