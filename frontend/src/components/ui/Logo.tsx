import React from 'react';
import logo from '../../Assets/logo.png';
import './Logo.css';

interface LogoProps {
    className?: string;
    showText?: boolean;
    color?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", showText = false, color }) => {
    // Utility to get glow version of hex color
    const getGlowColor = (hex?: string) => {
        if (!hex) return 'rgba(0, 255, 34, 0.6)';
        if (!hex.startsWith('#')) return hex;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.6)`;
    };

    const logoStyle = color ? {
        '--logo-color': color,
        '--logo-glow': getGlowColor(color)
    } as React.CSSProperties : {};

    return (
        <div 
            className="flex items-center gap-2 cursor-pointer group/logo w-fit"
            style={logoStyle}
            onClick={() => window.location.href = '/'}
        >

            <div className={`relative overflow-hidden shrink-0 ${className}`}>
                <img
                    src={logo}
                    alt="UI HUB Logo"
                    className="w-full h-full rounded-sm object-contain relative z-10 
                               group-hover/logo:opacity-0 transition-opacity duration-100"
                />
                {/* Glitch Layers for Icon */}
                <div className="absolute inset-0 opacity-0 group-hover/logo:opacity-100 pointer-events-none">
                    <img
                        src={logo}
                        alt=""
                        className="absolute inset-0 w-full h-full object-contain glitch-layer-1"
                    />
                    <img
                        src={logo}
                        alt=""
                        className="absolute inset-0 w-full h-full object-contain glitch-layer-2"
                    />
                    <img
                        src={logo}
                        alt=""
                        className="absolute inset-0 w-full h-full object-contain glitch-layer-3"
                    />
                </div>
            </div>
            {showText && (
                <div className="relative">
                    <span className="font-heading font-bold text-xl tracking-tighter relative z-10 
                                     text-[#00ff22] logo-text-glow
                                     group-hover/logo:opacity-0 transition-opacity duration-100 whitespace-nowrap uppercase">
                        UI HUB
                    </span>
                    {/* Glitch Layers for Text */}
                    <div className="absolute inset-0 opacity-0 group-hover/logo:opacity-100 pointer-events-none whitespace-nowrap">
                        <span className="font-heading font-bold text-xl tracking-tighter absolute inset-0 text-glitch-1">UI HUB</span>
                        <span className="font-heading font-bold text-xl tracking-tighter absolute inset-0 text-glitch-2">UI HUB</span>
                        <span className="font-heading font-bold text-xl tracking-tighter absolute inset-0 text-glitch-3">UI HUB</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Logo;
