import React, { useEffect, useRef, useCallback, KeyboardEvent, ClipboardEvent } from 'react';

interface OtpCodeInputProps {
    /** Number of digit boxes. */
    length?: number;
    /** Controlled value (string of digits). */
    value?: string;
    /** Called with the new digit string. */
    onChange?: (value: string) => void;
    /** Focus the first box on mount. */
    autoFocus?: boolean;
    /** Disable all inputs. */
    disabled?: boolean;
    /** ARIA label for the group. */
    ariaLabel?: string;
    className?: string;
}

const DIGIT_RE = /[0-9a-zA-Z]/;

export const OtpCodeInput: React.FC<OtpCodeInputProps> = ({
    length = 6,
    value: externalValue,
    onChange,
    autoFocus = false,
    disabled = false,
    ariaLabel = 'One-time code',
    className = '',
}) => {
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    // Derive per-digit values from the external value (or keep internal state).
    const [internalValue, setInternalValue] = React.useState('');
    const value = externalValue !== undefined ? externalValue : internalValue;

    const setDigit = useCallback(
        (index: number, char: string, emit = true) => {
            if (!DIGIT_RE.test(char)) return;
            const chars = (externalValue !== undefined ? externalValue : internalValue).split('');
            while (chars.length < length) chars.push('');
            chars[index] = char;
            const next = chars.join('');
            if (externalValue !== undefined) {
                onChange?.(next);
            } else {
                setInternalValue(next);
                if (emit) onChange?.(next);
            }
            // Auto-advance to the next box
            if (index < length - 1) refs.current[index + 1]?.focus();
        },
        [externalValue, internalValue, length, onChange],
    );

    const handleChange = useCallback(
        (index: number, raw: string) => {
            const last = raw.slice(-1);
            if (last) {
                setDigit(index, last);
            } else {
                // Cleared the current box
                const chars = (externalValue !== undefined ? externalValue : internalValue).split('');
                while (chars.length < length) chars.push('');
                chars[index] = '';
                const next = chars.join('');
                if (externalValue !== undefined) onChange?.(next);
                else setInternalValue(next);
            }
        },
        [externalValue, internalValue, length, onChange, setDigit],
    );

    const handleKeyDown = useCallback(
        (index: number, e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Backspace') {
                const chars = (externalValue !== undefined ? externalValue : internalValue).split('');
                const current = chars[index] || '';
                if (current === '' && index > 0) {
                    e.preventDefault();
                    chars[index - 1] = '';
                    const next = chars.join('');
                    if (externalValue !== undefined) onChange?.(next);
                    else setInternalValue(next);
                    refs.current[index - 1]?.focus();
                }
            } else if (e.key === 'ArrowLeft' && index > 0) {
                e.preventDefault();
                refs.current[index - 1]?.focus();
            } else if (e.key === 'ArrowRight' && index < length - 1) {
                e.preventDefault();
                refs.current[index + 1]?.focus();
            }
        },
        [externalValue, internalValue, length, onChange],
    );

    const handlePaste = useCallback(
        (e: ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text').replace(/[^0-9a-zA-Z]/g, '');
            const start = 0;
            const chars = text.split('').slice(start, length);
            const next = (chars.join('') + '').slice(0, length);
            if (externalValue !== undefined) onChange?.(next);
            else setInternalValue(next);
            const focusIdx = Math.min(chars.length, length - 1);
            refs.current[focusIdx]?.focus();
        },
        [externalValue, length, onChange],
    );

    const refCallback = useCallback((el: HTMLInputElement | null) => {
        if (!el) return;
        refs.current[Number(el.dataset.index)] = el;
    }, []);

    // Focus the first box once on mount (not on every re-render).
    useEffect(() => {
        if (autoFocus) requestAnimationFrame(() => refs.current[0]?.focus());
    }, [autoFocus]);

    const chars = value.padEnd(length, ' ').split('');

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`} role="group" aria-label={ariaLabel}>
            {chars.map((char, i) => {
                const isFilled = char !== ' ';
                const isNext = i === chars.findIndex((c) => c === ' ');
                return (
                    <input
                        key={i}
                        data-index={i}
                        ref={refCallback}
                        type="text"
                        inputMode="text"
                        maxLength={1}
                        value={char === ' ' ? '' : char}
                        disabled={disabled}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={handlePaste}
                        onClick={(e) => e.currentTarget.select()}
                        aria-label={`Digit ${i + 1}`}
                        className={`h-12 w-11 rounded-xl border-2 bg-neutral-900 text-center text-xl font-mono text-white transition-all focus:outline-none sm:h-14 sm:w-12 ${
                            isFilled || isNext
                                ? 'border-brand-blue shadow-[0_0_12px_rgba(61,92,255,0.25)]'
                                : 'border-neutral-800 hover:border-neutral-600'
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                    />
                );
            })}
        </div>
    );
};

export default OtpCodeInput;