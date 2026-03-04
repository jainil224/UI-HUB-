import React from 'react';
import logo from '../../Assets/logo.png';

interface LogoProps {
    className?: string;
    showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", showText = false }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <img
                src={logo}
                alt="UI HUB Logo"
                className="w-full h-full rounded-sm object-contain"
            />
            {showText && (
                <span className="font-heading font-bold text-xl tracking-tighter">UI HUB</span>
            )}
        </div>
    );
};

export default Logo;
