import React, { useEffect, useRef } from 'react';

interface RippleSignatureLedgerProps {
    image: { src: string; alt?: string };
    ringColor?: string;
    maxSeals?: number;
    autoSeal?: boolean;
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
    autoSeal = true,
}) => {
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sealsRef = useRef<Seal[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const wrap = wrapRef.current;
        if (!canvas || !wrap) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const reduced =
            typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let raf = 0;

        const resize = () => {
            const rect = wrap.getBoundingClientRect();
            canvas.width = Math.max(1, Math.floor(rect.width * dpr));
            canvas.height = Math.max(1, Math.floor(rect.height * dpr));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(wrap);

        const spawn = (x: number, y: number) => {
            const list = sealsRef.current;
            if (list.length >= maxSeals) list.shift();
            list.push({
                x,
                y,
                r: reduced ? 60 : 14,
                alpha: 0.9,
                squish: 1,
                settled: reduced,
            });
        };

        const onPointer = (e: PointerEvent) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            const rect = wrap.getBoundingClientRect();
            spawn(e.clientX - rect.left, e.clientY - rect.top);
        };

        // One gentle auto-stamping demo seal so a still preview still tells its story.
        let demoTimeout = 0;
        if (autoSeal) {
            demoTimeout = window.setTimeout(() => {
                const rect = wrap.getBoundingClientRect();
                spawn(rect.width * 0.5, rect.height * 0.44);
            }, 700);
        }

        const innerRing = ringColor + '0.38)';

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const list = sealsRef.current;

            for (const s of list) {
                if (reduced) {
                    if (s.squish > 0.5) s.squish -= 0.03;
                    s.alpha -= 0.003;
                } else if (!s.settled) {
                    if (s.r < 60) s.r = Math.min(60, s.r + 1.3);
                    else s.settled = true;
                } else {
                    if (s.squish > 0.5) s.squish -= 0.02;
                    s.alpha -= 0.004;
                }
                if (s.alpha <= 0.02) continue;

                const squishX = (1 - s.squish) * 0.35;

                // Soft drop shadow under the seal.
                ctx.save();
                ctx.translate(s.x + 4, s.y + 6);
                ctx.scale(1, 0.78);
                const shadow = ctx.createRadialGradient(0, 0, s.r * 0.25, 0, 0, s.r * 1.2);
                shadow.addColorStop(0, 'rgba(0,0,0,0.4)');
                shadow.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = shadow;
                ctx.beginPath();
                ctx.arc(0, 0, s.r * 1.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // Carved wax seal: ragged coin silhouette.
                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.scale(1 + squishX, 1 - squishX * 0.6);
                ctx.strokeStyle = ringColor + Math.max(0.08, s.alpha).toFixed(3) + ')';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(s.r, 0);
                for (let a = 0; a < 40; a++) {
                    const t = (a / 40) * Math.PI * 2;
                    const rr = s.r * (1 + 0.03 * Math.sin(t * 6));
                    ctx.lineTo(Math.cos(t) * rr, Math.sin(t) * rr * 0.965);
                }
                ctx.closePath();
                ctx.stroke();

                // Inner tick ring — off by half a degree, hand-stamped.
                ctx.beginPath();
                ctx.arc(0, 0, s.r * 0.78, 0.005, Math.PI * 2);
                ctx.strokeStyle = innerRing;
                ctx.lineWidth = 1;
                ctx.stroke();

                // Ink centre dot.
                const ink = ctx.createRadialGradient(0, 0, s.r * 0.02, 0, 0, s.r * 0.22);
                ink.addColorStop(0, ringColor + Math.max(0.06, s.alpha * 0.55).toFixed(3) + ')');
                ink.addColorStop(1, ringColor + '0)');
                ctx.fillStyle = ink;
                ctx.beginPath();
                ctx.arc(0, 0, s.r * 0.22, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            sealsRef.current = list.filter((s) => s.alpha > 0.02);
            raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);

        wrap.addEventListener('pointerdown', onPointer);
        wrap.style.cursor = 'crosshair';

        return () => {
            ro.disconnect();
            wrap.removeEventListener('pointerdown', onPointer);
            cancelAnimationFrame(raf);
            if (demoTimeout) window.clearTimeout(demoTimeout);
        };
    }, [image, ringColor, maxSeals, autoSeal]);

    return (
        <div
            ref={wrapRef}
            title="Click to stamp a wax seal"
            role="button"
            aria-label="Ledger photo — click to stamp a wax seal"
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                background: '#0a0a08',
                userSelect: 'none',
                touchAction: 'none',
            }}
        >
            <img
                src={image.src}
                alt={image.alt || 'ledger'}
                draggable={false}
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