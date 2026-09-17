import React, { useEffect, useRef } from 'react';

interface RippleSignatureLedgerProps {
    image: { src: string; alt?: string };
    ringColor?: string;
    maxSeals?: number;
}

interface Seal {
    x: number;
    y: number;
    r: number;
    alpha: number;
    squish: number; // 1..0 -> coin-settle squash
    settled: boolean;
}

export const RippleSignatureLedger: React.FC<RippleSignatureLedgerProps> = ({
    image,
    ringColor = 'rgba(214, 190, 150, ',
    maxSeals = 3,
}) => {
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sealsRef = useRef<Seal[]>([]);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const wrap = wrapRef.current;
        if (!canvas || !wrap) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let raf = 0;
        const resize = () => {
            const rect = wrap.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.max(1, Math.floor(rect.width * dpr));
            canvas.height = Math.max(1, Math.floor(rect.height * dpr));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(wrap);

        const spawn = (x: number, y: number) => {
            const existing = sealsRef.current;
            if (existing.length >= maxSeals) existing.shift();
            existing.push({ x, y, r: 14, alpha: 0.85, squish: 1, settled: false });
        };

        const onClick = (e: MouseEvent) => {
            const rect = wrap.getBoundingClientRect();
            spawn(e.clientX - rect.left, e.clientY - rect.top);
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const list = sealsRef.current;
            for (const s of list) {
                if (s.alpha <= 0.02) continue;

                // expand then coin-settle squish
                if (!s.settled) {
                    if (s.r < 60) s.r += 1.4;
                    if (s.r >= 60) {
                        s.settled = true;
                        s.squish = 1;
                    }
                } else {
                    if (s.squish > 0.55) s.squish -= 0.02;
                    s.alpha -= 0.004;
                }

                const squishX = (1 - s.squish) * 0.35;
                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.scale(1 + squishX, 1 - squishX * 0.6);
                ctx.strokeStyle = ringColor + Math.max(0.08, s.alpha).toFixed(3) + ')';
                ctx.lineWidth = 2;
                ctx.beginPath();
                // coin-ish seal: slightly non-circular, ragged edge
                ctx.moveTo(s.r, 0);
                for (let a = 0; a < 40; a++) {
                    const t = (a / 40) * Math.PI * 2;
                    const rr = s.r * (1 + 0.03 * Math.sin(t * 6));
                    ctx.lineTo(Math.cos(t) * rr, Math.sin(t) * rr * 0.97);
                }
                ctx.closePath();
                ctx.stroke();

                // inner tick ring — off by half a degree, hand-stamped
                ctx.beginPath();
                ctx.arc(0, 0, s.r * 0.78, 0, Math.PI * 2);
                ctx.closePath();
                ctx.strokeStyle = 'rgba(214, 190, 150, 0.4)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
            }
            raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);

        wrap.addEventListener('click', onClick);
        wrap.style.cursor = 'crosshair';

        return () => {
            ro.disconnect();
            wrap.removeEventListener('click', onClick);
            cancelAnimationFrame(raf);
            cancelAnimationFrame(rafRef.current);
        };
    }, [image, ringColor, maxSeals]);

    return (
        <div
            ref={wrapRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                background: '#0a0a08',
                userSelect: 'none',
            }}
        >
            <img
                src={image.src}
                alt={image.alt || 'ledger'}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'saturate(0.72) contrast(1.05) sepia(0.18)',
                    opacity: 0.9,
                    pointerEvents: 'none',
                }}
            />
            {/* vignette */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(5,5,3,0.6) 100%)',
                    pointerEvents: 'none',
                }}
            />
            <canvas
                ref={canvasRef}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    fontSize: 10,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: 'rgba(214,190,150,0.55)',
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                    pointerEvents: 'none',
                }}
            >
                click to stamp
            </div>
        </div>
    );
};

export default RippleSignatureLedger;