import React, { useRef, useState } from 'react';

interface KirigamiButtonProps {
    label: string;
    papers?: string[];
    variant?: 'kraft' | 'white' | 'black';
    href?: string;
    onClick?: () => void;
    foldDepth?: number;
    className?: string;
}

interface Paper {
    base: string;
    fold: string;
    ink: string;
    edge: string;
}

const PAPER: Record<'kraft' | 'white' | 'black', Paper> = {
    kraft: { base: '#e4cda0', fold: '#d4b47e', ink: '#3a2f1d', edge: '#b8945e' },
    white: { base: '#e8e2d0', fold: '#d4c9ae', ink: '#2b2b2b', edge: '#b8a98a' },
    black: { base: '#262626', fold: '#1c1c1c', ink: '#d8d3ae', edge: '#444444' },
};

export const KirigamiButton: React.FC<KirigamiButtonProps> = ({
    label,
    papers,
    variant = 'kraft',
    href,
    onClick,
    foldDepth = 24,
    className,
}) => {
    const [hovered, setHovered] = useState(false);
    const [burst, setBurst] = useState(false);
    const [shine, setShine] = useState(0);
    const firing = useRef(false);

    const paper = PAPER[variant];
    const open = hovered || burst;

    // Curtains hinge on the TOP edge and flip up/out of the button.
    // The top edge stays fixed; the bottom lifts and swings away over the top.
    const lift = open ? 100 + (burst ? Math.max(0, foldDepth) : 0) : 0;
    const curtainTransform = `rotateX(${lift}deg)`;

    const transitionOpen = 'transform 0.42s cubic-bezier(0.3, 0.85, 0.45, 1)';
    const transitionClose = 'transform 0.62s cubic-bezier(0.2, 0.9, 0.3, 1.1)';
    const curtainTransition = open ? transitionOpen : transitionClose;

    const handleClick = () => {
        if (firing.current) return;
        firing.current = true;
        setBurst(true);
        window.setTimeout(() => setBurst(false), 340);
        window.setTimeout(() => {
            firing.current = false;
            setShine((k) => k + 1);
            onClick?.();
        }, 720);
    };

    const content = (
        <span
            style={{
                position: 'relative',
                display: 'block',
                width: '100%',
                height: '100%',
                overflow: 'visible',
                transformStyle: 'preserve-3d',
            }}
        >
            {/* full label — always rendered, sits behind the curtains */}
            <span
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    fontSize: 13,
                    letterSpacing: '0.32em',
                    color: paper.ink,
                    textTransform: 'uppercase',
                    fontFamily: 'Georgia, serif',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
                    transition: 'transform 0.4s ease',
                    pointerEvents: 'none',
                }}
            >
                {label}
            </span>

            {/* left curtain — hinged at the top edge, flips up and out on hover */}
            <span
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: '34%',
                    zIndex: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(92deg, ${paper.base} 0%, ${paper.fold} 100%)`,
                    clipPath: 'polygon(0 0, 100% 0, 78% 100%, 0 100%)',
                    transformOrigin: 'top center',
                    transform: curtainTransform,
                    transition: curtainTransition,
                    willChange: 'transform',
                }}
            >
                <span
                    style={{
                        fontSize: 10,
                        letterSpacing: '0.25em',
                        color: paper.ink,
                        textTransform: 'uppercase',
                        fontFamily: 'Georgia, serif',
                        opacity: 0.9,
                        userSelect: 'none',
                        pointerEvents: 'none',
                    }}
                >
                    {papers?.[0] || 'cut'}
                </span>
            </span>

            {/* right curtain — hinged at the top edge, flips up and out on hover */}
            <span
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    width: '34%',
                    zIndex: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(88deg, ${paper.base} 0%, ${paper.fold} 100%)`,
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 22% 100%)',
                    transformOrigin: 'top center',
                    transform: curtainTransform,
                    transition: curtainTransition,
                    willChange: 'transform',
                }}
            >
                <span
                    style={{
                        fontSize: 10,
                        letterSpacing: '0.25em',
                        color: paper.ink,
                        textTransform: 'uppercase',
                        fontFamily: 'Georgia, serif',
                        opacity: 0.9,
                        userSelect: 'none',
                        pointerEvents: 'none',
                    }}
                >
                    {papers?.[1] || 'fold'}
                </span>
            </span>

            {/* fold glow on click */}
            <span
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 4,
                    background: burst
                        ? 'radial-gradient(120% 90% at 50% 40%, rgba(255,255,255,0.22), transparent 60%)'
                        : 'transparent',
                    transition: 'background 0.35s ease',
                    pointerEvents: 'none',
                }}
            />

            {/* shine sweep on release */}
            <span
                key={shine}
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 5,
                    background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.45) 50%, transparent 65%)',
                    backgroundSize: '240% 100%',
                    backgroundPosition: '0% 0%',
                    opacity: 0,
                    animation: shine > 0 ? 'kirigami-shine 0.9s ease forwards' : 'none',
                    pointerEvents: 'none',
                }}
            />

            <style>{`
                @keyframes kirigami-shine {
                    0% { opacity: 0; background-position: 120% 0; }
                    25% { opacity: 1; }
                    100% { opacity: 0; background-position: -120% 0; }
                }
            `}</style>
        </span>
    );

    const baseStyle: React.CSSProperties = {
        position: 'relative',
        display: 'inline-flex',
        minWidth: 168,
        height: 56,
        padding: 0,
        cursor: 'pointer',
        border: `1px solid ${paper.edge}`,
        borderRadius: 3,
        background: 'transparent',
        overflow: 'visible',
        boxShadow: open ? '0 20px 34px rgba(0,0,0,0.45)' : '4px 4px 0 rgba(0,0,0,0.35)',
        transition: 'box-shadow 0.4s ease',
        userSelect: 'none',
        touchAction: 'manipulation',
        fontFamily: 'Georgia, serif',
        perspective: 800,
        perspectiveOrigin: '50% 0%',
    };

    const hoverHandlers = {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
        onFocus: () => setHovered(true),
        onBlur: () => setHovered(false),
    };

    if (href) {
        return (
            <a
                href={href}
                aria-label={label}
                className={className}
                style={baseStyle}
                {...hoverHandlers}
                onClick={(e) => {
                    e.preventDefault();
                    handleClick();
                }}
            >
                {content}
            </a>
        );
    }

    return (
        <button
            type="button"
            aria-label={label}
            className={className}
            style={baseStyle}
            {...hoverHandlers}
            onClick={handleClick}
        >
            {content}
        </button>
    );
};

export default KirigamiButton;