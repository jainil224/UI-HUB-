import React from 'react';
import { Check, X } from 'lucide-react';

export interface RuleChecklistCriterion {
    id: string;
    label: string;
    test: (value: string) => boolean;
}

interface RuleChecklistProps {
    /** Current field value. */
    value: string;
    /** Rules to evaluate; every rule is always rendered. */
    criteria: RuleChecklistCriterion[];
    /** Hide the whole list until the value has content (default true). */
    hideWhenEmpty?: boolean;
    className?: string;
}

/**
 * Live ✓/✗ rule list for a text field. Mirrors the checklist pattern already
 * used by PasswordStrengthMeter, kept separate so that component is untouched.
 */
const RuleChecklist: React.FC<RuleChecklistProps> = ({
    value,
    criteria,
    hideWhenEmpty = true,
    className = '',
}) => {
    if (hideWhenEmpty && value.trim().length === 0) return null;

    return (
        <ul className={`mt-1.5 space-y-1 ${className}`}>
            {criteria.map((criterion) => {
                const passed = criterion.test(value);
                return (
                    <li key={criterion.id} className="flex items-center gap-1.5 text-[11px] leading-tight">
                        <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${
                                passed ? 'bg-emerald-500/15' : 'bg-white/10'
                            }`}
                        >
                            {passed ? (
                                <Check size={9} className="text-emerald-400" />
                            ) : (
                                <X size={9} className="text-white/30" />
                            )}
                        </span>
                        <span className={passed ? 'text-white/70' : 'text-white/40'}>{criterion.label}</span>
                    </li>
                );
            })}
        </ul>
    );
};

export default RuleChecklist;
