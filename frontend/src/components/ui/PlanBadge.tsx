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
        containerClass: 'bg-brand-surface border-2 border-white/60 text-white',
        textClass: 'text-white font-black',
        iconClass: 'text-neutral-400',
        glowClass: '',
        description: 'Basic Member',
    },
    pro: {
        label: 'PRO',
        icon: Crown,
        containerClass: 'bg-brand-yellow text-black border-2 border-black',
        textClass: 'text-black font-black',
        iconClass: 'text-black',
        glowClass: '',
        description: 'Pro Member',
    },
    elite: {
        label: 'ELITE',
        icon: Gem,
        containerClass: 'bg-brand-blue text-white border-2 border-black',
        textClass: 'text-white font-black',
        iconClass: 'text-white',
        glowClass: '',
        description: 'Elite Member',
    },
};

const SIZE_CONFIG = {
    sm: {
        container: 'px-2 py-0.5 gap-1 rounded',
        text: 'text-[9px]',
        icon: 10,
    },
    md: {
        container: 'px-2.5 py-1 gap-1 rounded',
        text: 'text-[10px]',
        icon: 12,
    },
    lg: {
        container: 'px-3.5 py-1.5 gap-1.5 rounded',
        text: 'text-xs',
        icon: 14,
    },
};

const PlanBadge = ({
    tier,
    size = 'md',
    showIcon = true,
    animated = false,
    className = '',
}: PlanBadgeProps) => {
    const config = BADGE_CONFIG[tier];
    const sizeConfig = SIZE_CONFIG[size];
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center font-black uppercase tracking-wider
                ${config.containerClass}
                ${config.textClass}
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
};

export default PlanBadge;
