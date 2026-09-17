import React, { useCallback, useMemo, useRef, useState, KeyboardEvent } from 'react';

interface TickRangeSliderProps {
    /** Minimum value. */
    min?: number;
    /** Maximum value. */
    max?: number;
    /** Step between values (defines the magnetic stops). */
    step?: number;
    /** Controlled value. */
    value?: number;
    /** Called with the new value while dragging (and on release snap). */
    onChange?: (value: number) => void;
    /** Custom labels rendered under tick marks (map from value → label). */
    labelFor?: (value: number) => string | undefined;
    /** Magnetic snap distance in px around each stop. */
    magnetRadius?: number;
    /** Disable the slider. */
    disabled?: boolean;
    /** ARIA label for the range control. */
    ariaLabel?: string;
    className?: string;
}

export const TickRangeSlider: React.FC<TickRangeSliderProps> = ({
    min = 0,
    max = 100,
    step = 10,
    value: externalValue,
    onChange,
    labelFor,
    magnetRadius = 8,
    disabled = false,
    ariaLabel = 'Range slider',
    className = '',
}) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);

    const [internalValue, setInternalValue] = React.useState(min);
    const value = externalValue !== undefined ? externalValue : internalValue;

    // All discrete stops
    const stops = useMemo(() => {
        const list: number[] = [];
        for (let v = min; v <= max + 0.0001; v += step) {
            list.push(Math.min(max, parseFloat(v.toFixed(6))));
        }
        return list;
    }, [min, max, step]);

    // Map a pixel position to a value. With magnetRadius > 0 the raw position
    // snaps to the nearest stop for a stepped "audio-style" feel; with 0 the
    // thumb tracks continuously and only the tick marks stay decorative.
    const valueFromClientX = useCallback(
        (clientX: number) => {
            const track = trackRef.current;
            if (!track) return value;
            const rect = track.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const raw = min + ratio * (max - min);

            if (magnetRadius <= 0) {
                return parseFloat((min + ratio * (max - min)).toFixed(6));
            }

            let nearest = stops[0];
            let bestDist = Infinity;
            for (const s of stops) {
                const d = Math.abs(s - raw);
                if (d < bestDist) {
                    bestDist = d;
                    nearest = s;
                }
            }
            return nearest;
        },
        [min, max, stops, value, magnetRadius],
    );

    const update = useCallback(
        (clientX: number) => {
            const next = valueFromClientX(clientX);
            if (externalValue !== undefined) onChange?.(next);
            else {
                setInternalValue(next);
                onChange?.(next);
            }
        },
        [valueFromClientX, externalValue, onChange],
    );

    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (disabled) return;
            e.preventDefault();
            dragging.current = true;
            if (trackRef.current) {
                trackRef.current.setPointerCapture?.(e.pointerId);
            }
            update(e.clientX);
        },
        [disabled, update],
    );

    const onPointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!dragging.current) return;
            e.preventDefault();
            update(e.clientX);
        },
        [update],
    );

    const endDrag = useCallback(() => {
        dragging.current = false;
    }, []);

    const onKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (disabled) return;
            let next = value;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                next = Math.max(min, value - step);
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                next = Math.min(max, value + step);
            } else if (e.key === 'Home') {
                next = min;
            } else if (e.key === 'End') {
                next = max;
            } else {
                return;
            }
            e.preventDefault();
            if (externalValue !== undefined) onChange?.(next);
            else {
                setInternalValue(next);
                onChange?.(next);
            }
        },
        [disabled, value, min, max, step, externalValue, onChange],
    );

    const pct = ((value - min) / (max - min)) * 100;
    const stopGaps = stops.length > 1 ? 100 / (stops.length - 1) : 0;

    return (
        <div className={`w-full select-none py-4 ${className}`}>
            <div
                ref={trackRef}
                role="slider"
                aria-label={ariaLabel}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={value}
                aria-valuetext={String(value)}
                aria-disabled={disabled || undefined}
                tabIndex={disabled ? -1 : 0}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={onKeyDown}
                className={`relative h-6 w-full touch-none flex items-center ${
                    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
            >
                {/* Track */}
                <div className="absolute left-0 right-0 h-1.5 rounded-full bg-neutral-800" />
                {/* Filled portion */}
                <div
                    className="absolute left-0 h-1.5 rounded-full bg-gradient-to-r from-brand-blue to-[#7b99ff]"
                    style={{ width: `${pct}%` }}
                />
                {/* Tick marks */}
                {stops.map((s, i) => {
                    const left = `${i * stopGaps}%`;
                    const labeled = !!labelFor?.(s);
                    return (
                        <div
                            key={s}
                            className="absolute h-full w-px -translate-x-1/2 flex flex-col items-center"
                            style={{ left }}
                        >
                            <div className="h-3 w-px bg-neutral-600" />
                            {labeled && (
                                <span className="mt-1 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-neutral-500">
                                    {labelFor?.(s)}
                                </span>
                            )}
                        </div>
                    );
                })}
                {/* Thumb */}
                <div
                    className="absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-brand-blue bg-white shadow-[0_0_10px_rgba(61,92,255,0.4)]"
                    style={{ left: `${pct}%` }}
                />
            </div>
        </div>
    );
};

export default TickRangeSlider;