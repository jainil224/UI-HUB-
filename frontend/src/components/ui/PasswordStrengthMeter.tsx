import React, { useMemo } from 'react';
import { Check, X, Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordCriterion {
    id: string;
    label: string;
    test: (value: string) => boolean;
}

interface PasswordStrengthMeterProps {
    /** Controlled password value (empty string hides the bar until typed). */
    value?: string;
    /** Uncontrolled input callback. */
    onChange?: (value: string) => void;
    /** Show the live checklist under the bar. */
    showChecklist?: boolean;
    /** Label rendered above the input. */
    label?: string;
    /** Placeholder text. */
    placeholder?: string;
    /** Custom criteria; defaults to the standard 5-point rule set. */
    criteria?: PasswordCriterion[];
    /** Show the strength label (Weak / Fair / Good / Strong). */
    showStrengthLabel?: boolean;
    className?: string;
}

const DEFAULT_CRITERIA: PasswordCriterion[] = [
    { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
    { id: 'upper', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
    { id: 'lower', label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
    { id: 'number', label: 'One number', test: (v) => /[0-9]/.test(v) },
    { id: 'special', label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

// Standard semantic strength colors (green → red), per spec.
const TIERS = [
    { min: 0, label: 'Very weak', segments: 1, color: '#ef4444' }, // red
    { min: 1, label: 'Weak', segments: 2, color: '#f97316' },      // orange
    { min: 2, label: 'Fair', segments: 3, color: '#eab308' },      // yellow
    { min: 3, label: 'Good', segments: 4, color: '#84cc16' },      // green
    { min: 4, label: 'Strong', segments: 5, color: '#22c55e' },    // emerald
];

const SEGMENTS = 5;

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
    value: externalValue,
    onChange,
    showChecklist = true,
    label = 'Password',
    placeholder = 'Enter a password',
    criteria = DEFAULT_CRITERIA,
    showStrengthLabel = true,
    className = '',
}) => {
    const [internalValue, setInternalValue] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);

    const value = externalValue !== undefined ? externalValue : internalValue;

    const update = (next: string) => {
        if (externalValue !== undefined) onChange?.(next);
        else {
            setInternalValue(next);
            onChange?.(next);
        }
    };

    const score = useMemo(() => criteria.reduce((acc, c) => acc + (c.test(value) ? 1 : 0), 0), [criteria, value]);
    const tier = useMemo(() => {
        let t = TIERS[0];
        for (const candidate of TIERS) {
            if (score >= candidate.min) t = candidate;
        }
        return t;
    }, [score]);

    const hasInput = value.length > 0;

    return (
        <div className={`w-full ${className}`}>
            <label className="block pb-1.5 text-[11px] font-black uppercase tracking-wider text-neutral-300">
                {label}
            </label>

            <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                    <Lock size={16} />
                </div>
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => update(e.target.value)}
                    placeholder={placeholder}
                    autoComplete="new-password"
                    className="w-full rounded-xl border-2 border-neutral-700 bg-neutral-900 py-2.5 pl-10 pr-10 font-mono text-sm text-white placeholder:text-neutral-600 transition-colors focus:border-brand-blue focus:outline-none"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-white"
                >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>

            {/* Segmented strength bar */}
            <div className="mt-3 flex items-center gap-2">
                <div className="flex h-1.5 flex-1 gap-1 overflow-hidden rounded-full">
                    {Array.from({ length: SEGMENTS }).map((_, i) => {
                        const active = i < tier.segments;
                        return (
                            <div
                                key={i}
                                className="h-full flex-1 rounded-full transition-all duration-300"
                                style={{
                                    backgroundColor: hasInput && active ? tier.color : '#262626',
                                }}
                            />
                        );
                    })}
                </div>
                {showStrengthLabel && (
                    <span
                        className="w-16 shrink-0 text-right font-mono text-[11px] font-medium transition-colors duration-300"
                        style={{ color: hasInput ? tier.color : '#525252' }}
                    >
                        {hasInput ? tier.label : 'Empty'}
                    </span>
                )}
            </div>

            {/* Checklist */}
            {showChecklist && (
                <ul className="mt-3 space-y-1.5">
                    {criteria.map((c) => {
                        const passed = c.test(value);
                        return (
                            <li key={c.id} className="flex items-center gap-2 text-[13px]">
                                <span
                                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                                        passed ? 'bg-emerald-500/15' : 'bg-neutral-800'
                                    }`}
                                >
                                    {passed ? (
                                        <Check size={11} className="text-emerald-400" />
                                    ) : (
                                        <X size={11} className="text-neutral-500" />
                                    )}
                                </span>
                                <span className={passed ? 'text-neutral-100' : 'text-neutral-500'}>
                                    {c.label}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default PasswordStrengthMeter;