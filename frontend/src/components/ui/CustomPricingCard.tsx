import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Zap, ArrowRight, AlertCircle, MousePointer, Palette, Box, Image, Type, Sparkles, Layout } from 'lucide-react';
import PlanBadge from './PlanBadge';

export type CategoryKey = 
    | 'button' 
    | 'text' 
    | 'cursor' 
    | 'image-interaction' 
    | 'miscellaneous' 
    | 'interactive-background' 
    | '3d';

interface CategoryInfo {
    key: CategoryKey;
    name: string;
    tier: 1 | 2 | 3;
    tierName: string;
    usd: number;
    inr: number;
    count: number;
    icon: React.ReactNode;
    description: string;
}

interface DurationOption {
    key: '1month' | '6months' | '1year';
    label: string;
    months: number;
    discount: number;
    badge?: string;
}

export const CATEGORIES: CategoryInfo[] = [
    // Tier 1 - Basic
    {
        key: 'button',
        name: 'Buttons',
        tier: 1,
        tierName: 'BASIC',
        usd: 0.99,
        inr: 19,
        count: 11,
        icon: <Palette className="w-4 h-4" />,
        description: 'Interactive button components',
    },
    {
        key: 'text',
        name: 'Text Animations',
        tier: 1,
        tierName: 'BASIC',
        usd: 0.99,
        inr: 19,
        count: 15,
        icon: <Type className="w-4 h-4" />,
        description: 'Animated text effects',
    },
    // Tier 2 - Standard
    {
        key: 'cursor',
        name: 'Cursor Effects',
        tier: 2,
        tierName: 'STANDARD',
        usd: 1.99,
        inr: 39,
        count: 13,
        icon: <MousePointer className="w-4 h-4" />,
        description: 'Custom cursor animations',
    },
    {
        key: 'image-interaction',
        name: 'Image/Carousel',
        tier: 2,
        tierName: 'STANDARD',
        usd: 1.99,
        inr: 39,
        count: 7,
        icon: <Image className="w-4 h-4" />,
        description: 'Image galleries & carousels',
    },
    {
        key: 'miscellaneous',
        name: 'Miscellaneous',
        tier: 2,
        tierName: 'STANDARD',
        usd: 1.99,
        inr: 39,
        count: 18,
        icon: <Sparkles className="w-4 h-4" />,
        description: 'Cards, marquees, loaders & more',
    },
    // Tier 3 - Premium
    {
        key: 'interactive-background',
        name: 'Interactive Backgrounds',
        tier: 3,
        tierName: 'PREMIUM',
        usd: 2.99,
        inr: 59,
        count: 16,
        icon: <Layout className="w-4 h-4" />,
        description: 'Dynamic background effects',
    },
    {
        key: '3d',
        name: '3D Components',
        tier: 3,
        tierName: 'PREMIUM',
        usd: 2.99,
        inr: 59,
        count: 13,
        icon: <Box className="w-4 h-4" />,
        description: 'WebGL & Three.js components',
    },
];

const DURATIONS: DurationOption[] = [
    { key: '1month', label: '1 Month', months: 1, discount: 0 },
    { key: '6months', label: '6 Months', months: 6, discount: 0.15, badge: '-15%' },
    { key: '1year', label: '1 Year', months: 12, discount: 0.25, badge: '-25%' },
];

const TIER_CONFIG = {
    1: { name: 'BASIC', color: 'text-neutral-400', borderColor: 'border-neutral-700' },
    2: { name: 'STANDARD', color: 'text-brand-blue', borderColor: 'border-brand-blue/30' },
    3: { name: 'PREMIUM', color: 'text-brand-yellow', borderColor: 'border-brand-yellow/30' },
};

interface CustomPricingCardProps {
    currencyMode: 'INR' | 'USD';
    onCheckout: (planData: {
        price: number;
        title: string;
        badgeTier: 'custom';
        selectedCategories: CategoryKey[];
        duration: string;
        months: number;
        accentColor: string;
    }) => void;
}

const CustomPricingCard: React.FC<CustomPricingCardProps> = ({ currencyMode, onCheckout }) => {
    const [selectedCategories, setSelectedCategories] = useState<CategoryKey[]>([]);
    const [selectedDuration, setSelectedDuration] = useState<'1month' | '6months' | '1year'>('6months');

    const currency = currencyMode === 'INR' ? '₹' : '$';

    const toggleCategory = (key: CategoryKey) => {
        setSelectedCategories(prev => 
            prev.includes(key) 
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );
    };

    const pricing = useMemo(() => {
        let baseMonthly = 0;
        selectedCategories.forEach(catKey => {
            const cat = CATEGORIES.find(c => c.key === catKey);
            if (cat) {
                baseMonthly += currencyMode === 'INR' ? cat.inr : cat.usd;
            }
        });

        const duration = DURATIONS.find(d => d.key === selectedDuration)!;
        const discountedMonthly = baseMonthly * (1 - duration.discount);
        const total = discountedMonthly * duration.months;

        return {
            baseMonthly,
            discountedMonthly,
            total,
            months: duration.months,
            discount: duration.discount,
        };
    }, [selectedCategories, selectedDuration, currencyMode]);

    const groupedCategories = useMemo(() => {
        const groups: Record<number, CategoryInfo[]> = { 1: [], 2: [], 3: [] };
        CATEGORIES.forEach(cat => {
            groups[cat.tier].push(cat);
        });
        return groups;
    }, []);

    const isValid = selectedCategories.length >= 2;
    const selectedDurationObj = DURATIONS.find(d => d.key === selectedDuration)!;

    const handleCheckout = () => {
        if (!isValid) return;
        onCheckout({
            price: Number(pricing.total.toFixed(2)),
            title: 'CUSTOM ACCESS',
            badgeTier: 'custom',
            selectedCategories,
            duration: selectedDurationObj.label,
            months: selectedDurationObj.months,
            accentColor: 'blue',
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-lg relative overflow-hidden flex flex-col border-2 border-brand-blue bg-brand-surface brutal-shadow-blue"
        >
            {/* Badge */}
            <div className="absolute top-4 right-4 z-20">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-blue text-white border-2 border-black text-[10px] font-black uppercase tracking-widest">
                    <Zap className="w-3 h-3" />
                    FLEXIBLE
                </div>
            </div>

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded border-2 border-white bg-brand-bg flex items-center justify-center text-brand-blue">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">CUSTOM</p>
                        <h2 className="text-xl font-black uppercase tracking-tight text-white">
                            BUILD YOUR PLAN
                        </h2>
                    </div>
                </div>

                {/* Badge preview */}
                <div className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded border border-neutral-700 bg-brand-bg w-fit">
                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">YOUR BADGE</span>
                    <span className="text-neutral-500 text-[9px]">→</span>
                    <PlanBadge tier="custom" size="sm" showIcon animated />
                </div>

                <p className="text-neutral-400 text-xs pr-4 leading-relaxed font-medium">
                    Pick only what you need. Select 2+ categories and choose your duration.
                </p>
            </div>

            <div className="h-0.5 bg-neutral-800 mb-6" />

            {/* Category Selection */}
            <div className="flex-1 mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">
                    SELECT CATEGORIES (MIN 2)
                </p>

                <div className="space-y-4">
                    {([1, 2, 3] as const).map(tier => {
                        const tierConf = TIER_CONFIG[tier];
                        const cats = groupedCategories[tier];
                        if (!cats.length) return null;

                        return (
                            <div key={tier}>
                                <p className={`text-[9px] font-black uppercase tracking-widest ${tierConf.color} mb-2`}>
                                    TIER {tier} — {tierConf.name}
                                </p>
                                <div className="space-y-1.5">
                                    {cats.map(cat => {
                                        const isSelected = selectedCategories.includes(cat.key);
                                        return (
                                            <button
                                                key={cat.key}
                                                onClick={() => toggleCategory(cat.key)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded border transition-all text-left ${
                                                    isSelected
                                                        ? 'border-brand-blue bg-brand-blue/10'
                                                        : 'border-neutral-700 bg-brand-bg hover:border-neutral-500'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                                        isSelected
                                                            ? 'bg-brand-blue border-brand-blue text-white'
                                                            : 'border-neutral-600 bg-neutral-800'
                                                    }`}>
                                                        {isSelected && <Check size={10} strokeWidth={3} />}
                                                    </div>
                                                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                                                        {cat.name}
                                                    </span>
                                                    <span className="text-[9px] text-neutral-500 font-medium">
                                                        ({cat.count})
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-black text-neutral-400">
                                                    {currency}{currencyMode === 'INR' ? cat.inr : cat.usd}/mo
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="h-0.5 bg-neutral-800 mb-6" />

            {/* Duration Selection */}
            <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">
                    CHOOSE DURATION
                </p>
                <div className="grid grid-cols-3 gap-2">
                    {DURATIONS.map(dur => (
                        <button
                            key={dur.key}
                            onClick={() => setSelectedDuration(dur.key)}
                            className={`relative p-3 rounded border text-center transition-all ${
                                selectedDuration === dur.key
                                    ? 'border-brand-blue bg-brand-blue/10'
                                    : 'border-neutral-700 bg-brand-bg hover:border-neutral-500'
                            }`}
                        >
                            {dur.badge && (
                                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded bg-brand-yellow text-black text-[8px] font-black border border-black">
                                    {dur.badge}
                                </span>
                            )}
                            <p className={`text-xs font-black uppercase ${
                                selectedDuration === dur.key ? 'text-white' : 'text-neutral-300'
                            }`}>
                                {dur.label}
                            </p>
                            <p className="text-[9px] text-neutral-500 font-medium mt-0.5">
                                {dur.months === 1 ? 'No discount' : `${Math.round(dur.discount * 100)}% off`}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-0.5 bg-neutral-800 mb-6" />

            {/* Selected Summary */}
            <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">
                    YOUR SELECTION
                </p>
                <div className="flex flex-wrap gap-1.5">
                    <AnimatePresence mode="popLayout">
                        {selectedCategories.map(catKey => {
                            const cat = CATEGORIES.find(c => c.key === catKey)!;
                            return (
                                <motion.span
                                    key={catKey}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-brand-blue/20 border border-brand-blue/30 text-[10px] font-bold text-brand-blue"
                                >
                                    {cat.icon}
                                    {cat.name}
                                </motion.span>
                            );
                        })}
                    </AnimatePresence>
                    {selectedCategories.length === 0 && (
                        <span className="text-[10px] text-neutral-500 font-medium">No categories selected</span>
                    )}
                </div>
            </div>

            {/* Price Display */}
            <div className="bg-brand-bg rounded-lg p-4 border border-neutral-700 mb-4">
                <div className="flex items-baseline justify-between mb-2">
                    <span className="text-neutral-400 text-xs font-bold">Monthly</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-brand-blue">{currency}</span>
                        <span className="text-2xl font-black text-white">
                            {pricing.discountedMonthly.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">/mo</span>
                        {pricing.discount > 0 && (
                            <span className="ml-2 text-[10px] text-neutral-500 line-through">
                                {currency}{pricing.baseMonthly.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-baseline justify-between">
                    <span className="text-neutral-400 text-xs font-bold">Total ({selectedDurationObj.months}mo)</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-white">
                            {currency}{pricing.total.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Validation Message */}
            {!isValid && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 mb-4 px-3 py-2 rounded bg-yellow-500/10 border border-yellow-500/30"
                >
                    <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
                    <span className="text-[10px] font-bold text-yellow-500">
                        Select at least 2 categories to continue
                    </span>
                </motion.div>
            )}

            {/* CTA Button */}
            <button
                onClick={handleCheckout}
                disabled={!isValid}
                className={`w-full py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isValid
                        ? 'brutal-btn-primary'
                        : 'bg-neutral-800 text-neutral-500 border-2 border-neutral-700 cursor-not-allowed'
                }`}
            >
                <span>Get Custom Plan</span>
                <ArrowRight size={14} />
            </button>
        </motion.div>
    );
};

export default CustomPricingCard;
