import React, { useMemo, useEffect, useState } from 'react';

interface SignalStrengthMeterProps {
    value: string;
    rules?: { label: string; test: (v: string) => boolean }[];
    labels?: [string, string];
}

export const SignalStrengthMeter: React.FC<SignalStrengthMeterProps> = ({
    value: controlled,
    rules,
    labels = ['SIGNAL', 'NOISE'],
}) => {
    const [internal, setInternal] = useState(controlled);
    const value = controlled !== undefined ? controlled : internal;
    useEffect(() => { if (controlled !== undefined) setInternal(controlled); }, [controlled]);
    const checks = useMemo(() => {
        const defaultRules = [
            { label: '8+ chars', test: (v: string) => v.length >= 8 },
            { label: 'uppercase', test: (v: string) => /[A-Z]/.test(v) },
            { label: 'lowercase', test: (v: string) => /[a-z]/.test(v) },
            { label: 'digit', test: (v: string) => /[0-9]/.test(v) },
            { label: 'symbol', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
        ];
        const r = rules || defaultRules;
        return r.map((rule) => ({ ...rule, pass: value ? rule.test(value) : false }));
    }, [value, rules]);

    const bars = useMemo(() => {
        if (!value) return [0, 0, 0, 0, 0];
        const passed = checks.filter((c) => c.pass).length;
        return [1, 2, 3, 4, 5].map((i) => (passed >= i ? 1 : 0.22 + (i - passed) * 0.05));
    }, [value, checks]);

    const flicker = useMemo(
        () => (bars[0] === 1 ? 2 : 0) + (bars[1] === 1 ? 1 : 0),
        [bars]
    );

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 18,
                fontFamily: '"Courier New", monospace',
            }}
        >
            <input
                type="text"
                value={value}
                aria-label="signal input"
                placeholder="___"
                onChange={(e) => setInternal(e.target.value)}
                style={{
                    width: 'min(280px, 90%)',
                    height: 40,
                    background: '#0c0f0a',
                    border: '1px solid #2f3a24',
                    color: '#d8d3ae',
                    fontFamily: 'inherit',
                    letterSpacing: '0.35em',
                    textAlign: 'center',
                    fontSize: 14,
                    outline: 'none',
                }}
            />

            {/* Tower + bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 96 }}>
                {bars.map((h, i) => (
                    <div
                        key={i}
                        style={{
                            width: 14,
                            height: `${12 + h * 68}px`,
                            background: h === 1 ? '#a3a35c' : '#3a3a28',
                            transform: h === 1 ? 'none' : `translateY(${flicker % 2 === 0 && h < 1 ? 1 : 0}px)`,
                            transition: 'height 0.3s ease, background 0.3s ease',
                        }}
                    />
                ))}
            </div>

            {/* Static layer */}
            <div
                style={{
                    width: 'min(240px, 85%)',
                    height: 18,
                    overflow: 'hidden',
                    position: 'relative',
                    opacity: 0.9,
                }}
            >
                {[...new Array(40)].map((_, i) => (
                    <span
                        key={i}
                        style={{
                            position: 'absolute',
                            left: `${(i * 17) % 100}%`,
                            top: `${(i * 13) % 100}%`,
                            width: 1,
                            height: 1,
                            background: bars[0] === 1 ? '#75724a' : '#4d4a33',
                            animation: bars[0] === 1 ? 'none' : `static-shake ${0.12 + (i % 4) * 0.05}s steps(2) infinite`,
                        }}
                    />
                ))}
            </div>

            <div style={{ width: 'min(280px, 90%)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, letterSpacing: '0.28em', color: bars[2] === 1 ? '#a3a35c' : '#57533d' }}>
                    {labels[0]}
                </span>
                <span style={{ fontSize: 10, letterSpacing: '0.28em', color: bars[0] === 1 ? '#57533d' : '#a3a35c' }}>
                    {labels[1]}
                </span>
            </div>

            <style>{`@keyframes static-shake { 0%,100% { opacity: 0.9; } 50% { opacity: 0.2; } }`}</style>

            {/* meter id tag */}
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#3f3b28', textTransform: 'uppercase' }}>
                rssi #{bars[0] === 1 ? checks.length : 0}/5
            </div>
        </div>
    );
};

export default SignalStrengthMeter;