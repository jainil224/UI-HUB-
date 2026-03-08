import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';

interface StatItemProps {
    label: string;
    value: number;
    suffix: string;
    index: number;
    formatValue?: (val: number) => string;
}

const StatItem = ({ label, value, suffix, index, formatValue }: StatItemProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const count = useSpring(0, {
        stiffness: 40,
        damping: 20,
        restDelta: 0.001
    });

    const displayValue = useTransform(count, (latest) => {
        const val = Math.round(latest);
        if (formatValue) return formatValue(val);
        return val.toLocaleString();
    });

    useEffect(() => {
        if (isInView) {
            const timer = setTimeout(() => {
                count.set(value);
            }, index * 100);
            return () => clearTimeout(timer);
        }
    }, [isInView, count, value, index]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center p-8 relative group"
        >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-[#00ff66]/0 group-hover:bg-[#00ff66]/5 blur-3xl transition-colors duration-700 rounded-full -z-10" />

            <div className="flex items-baseline mb-2">
                <motion.span
                    className="text-6xl md:text-7xl font-display font-black tracking-tighter text-white tabular-nums"
                    style={{
                        textShadow: isInView ? '0 0 20px rgba(0, 255, 102, 0.3)' : 'none',
                    }}
                    animate={{
                        color: isInView ? ["#ffffff", "#00ff66", "#ffffff"] : "#ffffff",
                        textShadow: isInView ? [
                            "0 0 0px rgba(0, 255, 102, 0)",
                            "0 0 30px rgba(0, 255, 102, 0.5)",
                            "0 0 15px rgba(0, 255, 102, 0.2)"
                        ] : "none"
                    }}
                    transition={{
                        duration: 2,
                        delay: (index * 0.1) + 1.5,
                        ease: "easeOut"
                    }}
                >
                    <motion.span>{displayValue}</motion.span>
                </motion.span>
                <span className="text-3xl md:text-4xl font-display font-bold text-[#00ff66] ml-1">
                    {suffix}
                </span>
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: (index * 0.1) + 0.5 }}
                className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-white/50 group-hover:text-white/80 transition-colors duration-300"
            >
                {label}
            </motion.p>

            {/* Subtle underline decoration */}
            <div className="mt-4 w-12 h-[2px] bg-white/10 group-hover:w-20 group-hover:bg-[#00ff66]/50 transition-all duration-500" />
        </motion.div>
    );
};

const statsData = [
    {
        label: "Total Components",
        value: 85,
        suffix: "+",
    },
    {
        label: "Weekly Downloads",
        value: 24000,
        suffix: "",
        formatValue: (val: number) => {
            if (val >= 1000) return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`;
            return val.toString();
        }
    },
    {
        label: "Projects Built",
        value: 500,
        suffix: "+",
    },
    {
        label: "Rendering Performance",
        value: 10,
        suffix: "x",
    },
];

const Stats = () => {
    return (
        <section className="py-24 bg-[#050505] border-y border-white/5 relative overflow-hidden">
            {/* Background noise/pattern could go here */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,102,0.03),transparent_70%)]" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {statsData.map((stat, index) => (
                        <StatItem
                            key={index}
                            index={index}
                            label={stat.label}
                            value={stat.value}
                            suffix={stat.suffix}
                            formatValue={stat.formatValue}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
