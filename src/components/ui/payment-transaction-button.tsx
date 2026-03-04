import React from 'react';

export const PaymentTransactionButton: React.FC = () => {
    return (
        <div className="payment-transaction-wrapper">
            <style>{`
                .payment-transaction-wrapper {
                    --bg-green: #5de2a3;
                    --bg-white: #ffffff;
                    --bg-hover-gray: #f9f7f9;
                    --text-color: #1a1a1a;
                    --card-color: #2b2b2b;
                    --card-chip: #ffd700;
                    --pos-color: #1f1f1f;
                    --pos-screen: #e2feca;
                    
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 1rem;
                }

                .pt-container {
                    position: relative;
                    width: 100%;
                    max-width: 460px;
                    height: 120px;
                    background: var(--bg-white);
                    border-radius: 8px;
                    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
                    display: flex;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.4s cubic-bezier(0.645, 0.045, 0.355, 1),
                                box-shadow 0.4s cubic-bezier(0.645, 0.045, 0.355, 1);
                }

                .pt-container:hover {
                    transform: scale(1.02) translateY(-2px);
                    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.15);
                }

                .pt-left {
                    width: 140px;
                    height: 100%;
                    background: linear-gradient(135deg, var(--bg-green), #4bc88a);
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .pt-right {
                    flex-grow: 1;
                    padding: 0 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--bg-white);
                    transition: background 0.4s ease;
                }

                .pt-container:hover .pt-right {
                    background: var(--bg-hover-gray);
                }

                .pt-text {
                    font-family: 'Inter', 'Lexend Deca', sans-serif;
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-color);
                    letter-spacing: -0.02em;
                }

                .pt-arrow {
                    width: 24px;
                    height: 24px;
                    color: var(--text-color);
                    transition: transform 0.4s cubic-bezier(0.645, 0.045, 0.355, 1);
                }

                .pt-container:hover .pt-arrow {
                    transform: translateX(6px);
                }

                /* --- Animations and illustrations --- */
                
                .pt-card-ill {
                    position: absolute;
                    width: 60px;
                    height: 38px;
                    background: var(--card-color);
                    border-radius: 4px;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                    z-index: 2;
                    transition: all 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
                }

                .pt-card-ill::before {
                    content: '';
                    position: absolute;
                    top: 8px;
                    left: 6px;
                    width: 12px;
                    height: 8px;
                    background: var(--card-chip);
                    border-radius: 2px;
                    opacity: 0.9;
                }
                
                .pt-card-ill::after {
                    content: '';
                    position: absolute;
                    bottom: 8px;
                    right: 6px;
                    width: 20px;
                    height: 4px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 2px;
                }

                .pt-pos-ill {
                    position: absolute;
                    width: 70px;
                    height: 60px;
                    background: var(--pos-color);
                    border-radius: 6px 6px 0 0;
                    bottom: -60px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 2;
                    box-shadow: 0 -4px 15px rgba(0,0,0,0.2);
                    transition: all 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding-top: 6px;
                }

                .pt-pos-screen {
                    width: 50px;
                    height: 24px;
                    background: #111;
                    border-radius: 3px;
                    margin-bottom: 6px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    position: relative;
                }

                .pt-pos-screen-inner {
                    width: 90%;
                    height: 85%;
                    background: var(--pos-screen);
                    border-radius: 1px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-family: monospace;
                    font-size: 14px;
                    font-weight: bold;
                    color: #228b22;
                }

                .pt-pos-symbol {
                    opacity: 0;
                    transform: scale(0.5);
                    transition: all 0.4s cubic-bezier(0.645, 0.045, 0.355, 1);
                    transition-delay: 0.5s;
                }

                .pt-pos-keys {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 3px;
                    width: 50px;
                }

                .pt-key {
                    width: 100%;
                    height: 4px;
                    background: #333;
                    border-radius: 1px;
                }
                
                .pt-pos-slot {
                    position: absolute;
                    top: -2px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 40px;
                    height: 4px;
                    background: #000;
                    border-radius: 2px;
                    z-index: 3;
                }

                /* Hover States */
                .pt-container:hover .pt-card-ill {
                    transform: translate(-50%, -120%) rotate(90deg) scale(0.9);
                    z-index: 0;
                }

                .pt-container:hover .pt-pos-ill {
                    bottom: 0px;
                }

                .pt-container:hover .pt-pos-symbol {
                    opacity: 1;
                    transform: scale(1);
                }

                @media (max-width: 480px) {
                    .pt-container {
                        transform: scale(0.9);
                    }
                    .pt-container:hover {
                        transform: scale(0.92) translateY(-2px);
                    }
                    .pt-text {
                        font-size: 1.1rem;
                    }
                    .pt-right {
                        padding: 0 20px;
                    }
                }
            `}</style>

            <div className="pt-container">
                <div className="pt-left">
                    <div className="pt-card-ill"></div>
                    <div className="pt-pos-ill">
                        <div className="pt-pos-slot"></div>
                        <div className="pt-pos-screen">
                            <div className="pt-pos-screen-inner">
                                <span className="pt-pos-symbol">$</span>
                            </div>
                        </div>
                        <div className="pt-pos-keys">
                            <div className="pt-key"></div><div className="pt-key"></div><div className="pt-key"></div>
                            <div className="pt-key"></div><div className="pt-key"></div><div className="pt-key"></div>
                        </div>
                    </div>
                </div>
                <div className="pt-right">
                    <span className="pt-text">New Transaction</span>
                    <svg
                        className="pt-arrow"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default PaymentTransactionButton;
