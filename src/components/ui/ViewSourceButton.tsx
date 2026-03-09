import React from 'react';
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';

interface ViewSourceButtonProps {
    className?: string;
    href?: string;
}

const ViewSourceButton: React.FC<ViewSourceButtonProps> = ({
    className = "",
    href = "https://github.com/jainil224/UI-HUB-"
}) => {
    return (
        <motion.a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`group relative flex items-center gap-3 px-8 py-3.5 bg-[#0a0a0a] rounded-full border border-white/10 hover:border-white/20 transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] overflow-hidden isolate ${className}`}
        >
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

            {/* Icon */}
            <Github
                size={18}
                className="text-white transition-transform duration-500 group-hover:-rotate-12"
            />

            {/* Text */}
            <span className="text-white text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-500 group-hover:text-brand-green">
                View Source
            </span>

            {/* Reflection sweep animation */}
            <motion.div
                initial={{ x: '-150%' }}
                whileHover={{ x: '150%' }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -skew-x-12 pointer-events-none"
            />
        </motion.a>
    );
};

export default ViewSourceButton;
