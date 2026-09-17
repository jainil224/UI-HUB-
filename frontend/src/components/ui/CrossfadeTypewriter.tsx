import React, { useEffect, useRef, useState } from 'react';

interface CrossfadeTypewriterProps {
    lines: string[];
    speedMs?: number;
    pauseMs?: number;
    textClass?: string;
}

export const CrossfadeTypewriter: React.FC<CrossfadeTypewriterProps> = ({
    lines,
    speedMs = 90,
    pauseMs = 1600,
    textClass,
}) => {
    const [lens, setLens] = useState<number[]>([0, Math.min(3, lines[1]?.length ?? 0)]);
    const [active, setActive] = useState(0);
    const activeRef = useRef(0);
    const enteringRef = useRef(true);
    const pausedRef = useRef(0);

    useEffect(() => {
        if (!lines.length) return;
        const left = lines[0];
        const right = lines[1];

        const tick = () => {
            const now = Date.now();
            if (pausedRef.current && now - pausedRef.current < pauseMs) return;

            const entering = enteringRef.current;
            const onB = activeRef.current === 1;

            if (entering) {
                if (lens[onB ? 1 : 0] < lines[activeRef.current].length) {
                    setLens((prev) => {
                        const next = [...prev];
                        next[onB ? 1 : 0] = next[onB ? 1 : 0] + 1;
                        return next;
                    });
                } else {
                    enteringRef.current = false;
                }
            } else {
                if (lens[onB ? 1 : 0] > 0) {
                    setLens((prev) => {
                        const next = [...prev];
                        next[onB ? 1 : 0] = next[onB ? 1 : 0] - 1;
                        return next;
                    });
                } else {
                    // swap sides
                    activeRef.current = activeRef.current === 0 ? 1 : 0;
                    setActive(activeRef.current);
                    enteringRef.current = true;
                    pausedRef.current = Date.now();
                    return;
                }
            }

            pausedRef.current = 0;
        };

        const id = window.setInterval(tick, speedMs);
        return () => window.clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lines, speedMs, pauseMs]);

    const shown = (i: number) => (lines[i] || '').slice(0, lens[i]);

    return (
        <div
            className={textClass}
            style={{
                position: 'relative',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 'clamp(1.15rem, 3vw, 1.6rem)',
                lineHeight: 1.5,
                minHeight: '1.6em',
                whiteSpace: 'pre-wrap',
            }}
            aria-live="polite"
        >
            <span style={{ opacity: active === 1 ? 0.25 : 1, transition: 'opacity 0.3s ease', marginRight: 2 }}>
                {shown(0)}
            </span>
            <span style={{ opacity: active === 0 ? 0.25 : 1, transition: 'opacity 0.3s ease' }}>
                {shown(1)}
            </span>
            <span
                style={{
                    display: 'inline-block',
                    width: 2,
                    height: '0.9em',
                    marginLeft: 2,
                    background: '#8a6f45',
                    verticalAlign: '-0.1em',
                    animation: 'cwt-caret 0.9s steps(2) infinite',
                }}
            />
            <style>{`@keyframes cwt-caret { 0%,100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
        </div>
    );
};

export default CrossfadeTypewriter;