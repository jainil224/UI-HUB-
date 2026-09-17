import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Eraser, Undo2, PenLine } from 'lucide-react';

interface StrokePoint {
    x: number;
    y: number;
    width: number;
}

interface SignaturePadProps {
    /** Called with the signature data URL whenever a stroke ends (or cleared). */
    onChange?: (dataUrl: string) => void;
    /** Pen color. */
    penColor?: string;
    /** Minimum stroke width in px (slow drawing). */
    minWidth?: number;
    /** Maximum stroke width in px (fast drawing). */
    maxWidth?: number;
    /** Clear the canvas when it is resized (e.g. orientation change). */
    clearOnResize?: boolean;
    /** Hint text shown along the baseline. */
    hint?: string;
    className?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
    onChange,
    penColor = '#f5f5f5',
    minWidth = 1,
    maxWidth = 4,
    clearOnResize = false,
    hint = 'Sign above',
    className = '',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const drawing = useRef(false);
    const strokes = useRef<StrokePoint[][]>([]); // history for undo
    const currentStroke = useRef<StrokePoint[]>([]);
    const lastPoint = useRef<{ x: number; y: number; t: number } | null>(null);

    const [hasInk, setHasInk] = useState(false);

    const emit = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        onChange?.(dataUrl);
    }, [onChange]);

    const renderStrokes = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Full redraw from history so undo works cleanly
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = penColor;
        for (const stroke of strokes.current) {
            for (let i = 1; i < stroke.length; i++) {
                ctx.lineWidth = stroke[i].width;
                ctx.beginPath();
                ctx.moveTo(stroke[i - 1].x, stroke[i - 1].y);
                ctx.lineTo(stroke[i].x, stroke[i].y);
                ctx.stroke();
            }
        }
    }, [penColor]);

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const wrap = wrapRef.current;
        if (!canvas || !wrap) return;
        const rect = wrap.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, rect.width * dpr);
        canvas.height = Math.max(1, rect.height * dpr);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        if (clearOnResize) {
            strokes.current = [];
            currentStroke.current = [];
            setHasInk(false);
        }
        renderStrokes();
    }, [clearOnResize, renderStrokes]);

    useEffect(() => {
        resizeCanvas();
        const ro = new ResizeObserver(resizeCanvas);
        if (wrapRef.current) ro.observe(wrapRef.current);
        return () => ro.disconnect();
    }, [resizeCanvas]);

    const toLocal = (e: PointerEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const onPointerDown = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            e.preventDefault();
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.setPointerCapture(e.pointerId);
            const { x, y } = toLocal(e.nativeEvent);
            drawing.current = true;
            lastPoint.current = { x, y, t: performance.now() };
            currentStroke.current = [];
            const pt = { x, y, width: (minWidth + maxWidth) / 2 };
            currentStroke.current.push(pt);
        },
        [minWidth, maxWidth],
    );

    const onPointerMove = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            if (!drawing.current) return;
            e.preventDefault();
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx || !lastPoint.current) return;

            const { x, y } = toLocal(e.nativeEvent);
            const now = performance.now();
            const dt = Math.max(1, now - lastPoint.current.t);
            const dist = Math.hypot(x - lastPoint.current.x, y - lastPoint.current.y);
            const speed = dist / dt; // px per ms

            // Variable ink weight: faster strokes render thinner ink
            const width = Math.max(
                minWidth,
                Math.min(maxWidth, maxWidth - speed * (maxWidth - minWidth) * 0.03),
            );

            const pt = { x, y, width };
            currentStroke.current.push(pt);

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = penColor;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
            ctx.lineTo(x, y);
            ctx.stroke();

            lastPoint.current = { x, y, t: now };
            setHasInk(true);
        },
        [minWidth, maxWidth, penColor],
    );

    const endStroke = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            if (!drawing.current) return;
            drawing.current = false;
            if (currentStroke.current.length > 0) {
                strokes.current.push([...currentStroke.current]);
                currentStroke.current = [];
            }
            emit();
        },
        [emit],
    );

    const clear = useCallback(() => {
        strokes.current = [];
        currentStroke.current = [];
        setHasInk(false);
        renderStrokes();
        emit();
    }, [emit, renderStrokes]);

    const undo = useCallback(() => {
        strokes.current.pop();
        currentStroke.current = [];
        setHasInk(strokes.current.length > 0);
        renderStrokes();
        emit();
    }, [emit, renderStrokes]);

    return (
        <div className={`w-full ${className}`}>
            <div
                ref={wrapRef}
                className="relative h-48 w-full touch-none overflow-hidden rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-900"
            >
                <canvas
                    ref={canvasRef}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endStroke}
                    onPointerCancel={endStroke}
                    onPointerLeave={endStroke}
                    className="absolute inset-0 cursor-crosshair"
                />

                {/* Baseline */}
                <div className="pointer-events-none absolute bottom-8 left-6 right-6 flex flex-col items-center gap-1.5">
                    <span className="text-center text-xs text-neutral-500">{hint}</span>
                    <div className="h-0 w-full max-w-md border-t-2 border-dotted border-neutral-600 opacity-40" />
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={undo}
                        disabled={!hasInk}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Undo2 size={13} /> Undo
                    </button>
                    <button
                        type="button"
                        onClick={clear}
                        disabled={!hasInk}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-red-500/50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Eraser size={13} /> Clear
                    </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                    <PenLine size={13} className="text-neutral-500" />
                    <span className={hasInk ? 'text-emerald-400' : 'text-neutral-500'}>
                        {hasInk ? 'Signature captured' : 'Draw with mouse or touch'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SignaturePad;