import React, { useEffect, useRef, useState } from 'react';

interface CrossfadeTypewriterProps {
    lines: string[];
    speedMs?: number;
    pauseMs?: number;
    textClass?: string;
    cursorColor?: string;
}

type Phase = 'type' | 'hold';

export const CrossfadeTypewriter: React.FC<CrossfadeTypewriterProps> = ({
    lines,
    speedMs = 90,
    pauseMs = 1700,
    textClass,
    cursorColor = '#8a6f45',
}) => {
    const [reduced] = useState(
        () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    );
    const count = Math.max(1, lines.length);
    const [lens, setLens] = useState<[number, number]>([lines[0]?.length ?? 0, 0]);

    const lensRef = useRef<[number, number]>([lines[0]?.length ?? 0, 0]);
    const idxRef = useRef<[number, number]>([0, count > 1 ? 1 : 0]);
    const lastRef = useRef<[number, number]>([lines[0]?.length ?? 0, 0]);
    const phaseRef = useRef<Phase>('type');
    const heldAtRef = useRef(0);

    // Reset whenever the line list changes.
    useEffect(() => {
        const n = Math.max(1, lines.length);
        idxRef.current = [0, n > 1 ? 1 : 0];
        lensRef.current = [lines[0]?.length ?? 0, 0];
        lastRef.current = [...lensRef.current] as [number, number];
        phaseRef.current = 'type';
        setLens([...lensRef.current] as [number, number]);
    }, [lines]);

    useEffect(() => {
        if (reduced || lines.length < 1) return;

        const tick = () => {
            if (document.hidden) return;
            const now = Date.now();
            const cur = idxRef.current[1];
            const target = lines[cur]?.length ?? 0;

            if (phaseRef.current === 'type') {
                if (lensRef.current[1] < target) {
                    lensRef.current[1] += 1;
                } else {
                    phaseRef.current = 'hold';
                    heldAtRef.current = now;
                }
            } else if (now - heldAtRef.current >= pauseMs) {
                const prev = idxRef.current[1];
                const next = (prev + 1) % Math.max(1, lines.length);
                idxRef.current = [prev, next];
                lensRef.current = [lines[prev]?.length ?? 0, 0];
                phaseRef.current = 'type';
            }

            const changed =
                lastRef.current[0] !== lensRef.current[0] ||
                lastRef.current[1] !== lensRef.current[1];
            lastRef.current = [...lensRef.current] as [number, number];
            if (changed) setLens([...lensRef.current] as [number, number]);
        };

        const id = window.setInterval(tick, speedMs);
        return () => window.clearInterval(id);
    }, [lines, reduced, speedMs, pauseMs]);

    if (lines.length === 0) return null;

    const shown = (i: number) => (lines[i] != null ? lines[i].slice(0, lens[i]) : '');

    return (
        <div
            className={textClass}
            role="log"
            aria-live="polite"
            aria-label="Rotating typewriter lines"
            style={{
                position: 'relative',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 'clamp(1.15rem, 3vw, 1.6rem)',
                lineHeight: 1.55,
                minHeight: 'calc(1.55em * 2)',
                whiteSpace: 'pre-wrap',
            }}
        >
            {reduced ? (
                lines.map((l, i) => (
                    <div key={i} style={i % 2 === 1 ? { opacity: 0.55 } : undefined}>
                        {l}
                    </div>
                ))
            ) : (
                <>
                    <div style={{ opacity: 0.3, transition: 'opacity 0.4s ease' }}>{shown(0)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span>{shown(1)}</span>
                        <span
                            aria-hidden
                            style={{
                                display: 'inline-block',
                                width: 2,
                                height: '0.85em',
                                marginLeft: 3,
                                background: cursorColor,
                                animation: 'cwt-blink 0.95s steps(2, start) infinite',
                                alignSelf: 'center',
                            }}
                        />
                    </div>
                </>
            )}
            <style>{`@keyframes cwt-blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
        </div>
    );
};

export default CrossfadeTypewriter;