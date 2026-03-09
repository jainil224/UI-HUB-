import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface GitHubStarButtonProps {
    className?: string;
}

const GitHubStarButton: React.FC<GitHubStarButtonProps> = ({ className = "" }) => {
    const [stars, setStars] = useState<number | string>("...");

    const fetchStars = async () => {
        try {
            // Add cache busting timestamp
            const response = await fetch(`https://api.github.com/repos/jainil224/UI-HUB-?t=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                setStars(data.stargazers_count);
            }
        } catch (error) {
            console.error("Failed to fetch GitHub stars:", error);
        }
    };

    useEffect(() => {
        fetchStars();

        // Refresh count when user returns to the tab
        const handleFocus = () => fetchStars();
        window.addEventListener('focus', handleFocus);

        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card navigation
        window.open('https://github.com/jainil224/UI-HUB-', '_blank', 'noopener,noreferrer');
    };

    return (
        <motion.button
            onClick={handleClick}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:border-brand-green/50 hover:bg-black/60 transition-all duration-300 group/star shadow-lg ${className}`}
        >
            <Star
                size={14}
                className="text-white/60 group-hover/star:text-brand-green group-hover/star:fill-brand-green transition-all"
            />
            <span className="text-[10px] font-bold text-white/40 group-hover/star:text-white transition-colors">
                {stars}
            </span>

            {/* Subtle pulse for interaction */}
            <span className="absolute inset-0 rounded-full bg-brand-green/20 opacity-0 group-hover/star:animate-ping -z-10" />
        </motion.button>
    );
};

export default GitHubStarButton;
