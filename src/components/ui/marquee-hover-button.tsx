"use client"

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export type MarqueeHoverButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    label?: string;
};

export const MarqueeHoverButton: React.FC<MarqueeHoverButtonProps> = ({
    label = "Button",
    className,
    disabled,
    ...props
}) => {
    return (
        <motion.button
            type="button"
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            disabled={disabled}
            aria-disabled={disabled || undefined}
            className={cn(
                "group/btn relative select-none outline-none overflow-hidden",
                "inline-flex items-center justify-center min-w-[160px]",
                "font-black uppercase tracking-wide text-xs sm:text-sm",
                "rounded-full px-8 py-3 lg:px-12 lg:py-4",
                "bg-white text-black border border-neutral-200 shadow-sm",
                "dark:bg-black dark:text-white dark:border-neutral-800",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-white",
                "dark:focus-visible:ring-neutral-600 dark:focus-visible:ring-offset-black",
                "transition-colors duration-300",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900",
                className
            )}
            {...props}
        >
            {/* 
        Visible label that fades out on hover.
      */}
            <span
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out group-hover/btn:opacity-0"
            >
                {label}
            </span>

            {/* 
        Marquee layer that fades in on hover and slides continuously.
      */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 ease-out">
                {/* We use double duplicate strings so it loops seamlessly. */}
                <motion.div
                    className="flex flex-nowrap whitespace-nowrap gap-4 px-4 font-black"
                    animate={{ x: [0, -100] }}
                    transition={{ ease: "linear", duration: 3, repeat: Infinity, repeatType: "loop" }}
                >
                    {/* We repeat the label 5 times to ensure continuous rolling */}
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className="inline-block px-2 shrink-0">{label}</span>
                    ))}
                </motion.div>
            </div>

            {/* 
        Spacer to keep button width consistent with label length 
        The span is invisible but takes up layout space.
      */}
            <span className="invisible px-4">{label}</span>
        </motion.button>
    );
};
