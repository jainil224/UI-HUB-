import React from 'react';

/**
 * TradingCandles
 * A trading-terminal loader: three candlestick columns (green, red, green)
 * bounce in a staggered waltz like a live market ticker. Each candle is a
 * top wick, a rounded 2px body and a bottom wick, bouncing on a 1s loop off
 * its own delay so the middle (red) candle leads the ripple.
 */
export const TradingCandles: React.FC = () => {
    return (
        <div
            className="w-full h-full min-h-[380px] flex items-center justify-center gap-1 overflow-hidden select-none"
            style={{
                background: 'radial-gradient(120% 120% at 50% 40%, #2a2e36 0%, #17181d 55%, #0d0e12 100%)',
            }}
        >
            <style>{`
                .tc-candle-group {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    animation: tc-bounce 1s ease-in-out infinite;
                }

                .tc-wick {
                    width: 4px;
                    background: var(--tc-candle);
                }

                .tc-body {
                    width: 12px;
                    height: 48px;
                    border-radius: 2px;
                    background: var(--tc-candle);
                }

                .tc-candle-green {
                    --tc-candle: #22c55e;
                }

                .tc-candle-red {
                    --tc-candle: #ef4444;
                }

                @keyframes tc-bounce {
                    0%,
                    100% {
                        transform: translateY(-20%);
                        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
                    }
                    50% {
                        transform: none;
                        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
                    }
                }
            `}</style>

            <div className="tc-candle-group tc-candle-green" style={{ animationDelay: '0.1s' }}>
                <div className="tc-wick h-6" />
                <div className="tc-body" />
                <div className="tc-wick h-6" />
            </div>
            <div className="tc-candle-group tc-candle-red" style={{ animationDelay: '0.2s' }}>
                <div className="tc-wick h-6" />
                <div className="tc-body" />
                <div className="tc-wick h-6" />
            </div>
            <div className="tc-candle-group tc-candle-green" style={{ animationDelay: '0.1s' }}>
                <div className="tc-wick h-6" />
                <div className="tc-body" />
                <div className="tc-wick h-6" />
            </div>
        </div>
    );
};

export default TradingCandles;