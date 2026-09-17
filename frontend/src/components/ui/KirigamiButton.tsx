import React, { useState } from 'react';

interface KirigamiButtonProps {
    label: string;
    papers?: string[];
    variant?: 'kraft' | 'white' | 'black';
    href?: string;
    onClick?: () => void;
}

export const KirigamiButton: React.FC<KirigamiButtonProps> = ({
    label,
    papers,
    variant = 'kraft',
    href,
    onClick,
}) => {
    const [folded, setFolded] = useState(false);
    const [hovered, setHovered] = useState(false);

    const paper =
        variant === 'white'
            ? { base: '#e8e2d0', fold: '#d4c9ae', ink: '#2b2b2b', edge: '#b8a98a' }
            : variant === 'black'
                ? { base: '#262626', fold: '#1c1c1c', ink: '#d8d3ae', edge: '#444444' }
                : { base: '#e4cdA0', fold: '#d4b47e', ink: '#3a2f1d', edge: '#b8945e' };

    const panels = [
        { i: 0, clip: 'polygon(0 0, 46% 0, 34% 100%, 0 100%)', rot: hovered ? -5 : 0, x: hovered ? -3 : 0 },
        { i: 1, clip: 'polygon(54% 0, 100% 0, 100% 100%, 66% 100%)', rot: hovered ? 5 : 0, x: hovered ? 3 : 0 },
        { i: 2, clip: 'polygon(46% 0, 54% 0, 66% 100%, 34% 100%)', rot: 0, x: 0 },
    ];

    const inner = (
        <>
            <div
                key="root"
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    perspective: 420,
                    overflow: 'hidden',
                }}
            >
                {/* fold creases (top + bottom of the diamond panel) */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: '46%',
                        right: '46%',
                        height: 1,
                        background: paper.edge,
                        zIndex: 4,
                        opacity: hovered ? 0.9 : 0.4,
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: '34%',
                        right: '34%',
                        height: 1,
                        background: paper.edge,
                        zIndex: 4,
                        opacity: hovered ? 0.9 : 0.4,
                    }}
                />

                {panels.map((p) => (
                    <div
                        key={p.i}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            clipPath: p.clip,
                            background:
                                p.i === 2
                                    ? paper.base
                                    : `linear-gradient(${p.i === 0 ? '92deg' : '88deg'}, ${paper.base} 0%, ${paper.fold} 100%)`,
                            transform: `translateX(${p.x}px) rotate(${p.rot}deg) scale(${folded ? 0.96 : 1})`,
                            transformOrigin: p.i === 0 ? 'top right' : p.i === 1 ? 'top left' : 'center center',
                            transition: 'transform 0.35s cubic-bezier(0.2, 0.7, 0.3, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: p.i,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 11,
                                letterSpacing: '0.25em',
                                color: paper.ink,
                                textTransform: 'uppercase',
                                fontFamily: 'Georgia, serif',
                                opacity: 0.85,
                            }}
                        >
                            {p.i === 2 ? label : papers?.[p.i] || (p.i === 0 ? 'cut' : 'fold')}
                        </span>
                    </div>
                ))}
            </div>
        </>
    );

    const base = {
        display: 'inline-block',
        minWidth: 150,
        height: 52,
        cursor: 'pointer',
        border: `1px solid ${paper.edge}`,
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.35)',
        userSelect: 'none' as const,
        background: paper.base,
        fontFamily: 'Georgia, serif',
    };

    const handleClick = () => {
        setFolded((f) => !f);
        setTimeout(() => {
            setFolded(false);
            onClick?.();
        }, 360);
    };

    if (href) {
        return (
            <a
                href={href}
                {...base}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={(e) => {
                    e.preventDefault();
                    handleClick();
                }}
            >
                {inner}
            </a>
        );
    }

    return (
        <button
            type="button"
            style={base}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={handleClick}
        >
            {inner}
        </button>
    );
};

export default KirigamiButton;