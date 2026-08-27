import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Check, X, Zap, Crown, ArrowRight, Star, Download, Code2, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PlanBadge from '../../components/ui/PlanBadge';
import { useAuth } from '../../context/AuthContext';
import { loadRazorpayScript } from '../../utils/razorpayUtils';
import CheckoutOverlay from '../../components/ui/CheckoutOverlay';
import { getApiBaseUrl } from '../../utils/apiConfig';

const PricingPage = () => {
    const navigate = useNavigate();
    const { user, refreshProStatus } = useAuth();
    const [currencyMode, setCurrencyMode] = useState<'INR' | 'USD'>('USD');
    const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [checkoutMessage, setCheckoutMessage] = useState('');
    // Ref to avoid stale closure inside Razorpay ondismiss callback
    const checkoutStatusRef = useRef(checkoutStatus);

    // Detect if user is in India on initial load
    useEffect(() => {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timeZone === 'Asia/Kolkata' || timeZone === 'Asia/Calcutta') {
            setCurrencyMode('INR');
        }
    }, []);

    // Keep ref in sync with state
    const setStatus = (s: 'idle' | 'loading' | 'success' | 'error') => {
        checkoutStatusRef.current = s;
        setCheckoutStatus(s);
    };

    const handleStartFree = async () => {
        if (!user) {
            navigate('/signup');
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || getApiBaseUrl();
            const idToken = await user.getIdToken();
            fetch(`${apiUrl}/api/v1/users/activate-free`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
            }).catch((err) => console.warn('[PricingPage] activate-free error:', err));
        } catch (err) {
            console.warn('[PricingPage] Error fetching ID token:', err);
        }

        navigate('/library');
    };

    const handleCheckout = async (plan: any) => {
        if (!user) {
            navigate('/login');
            return;
        }

        setStatus('loading');
        setCheckoutMessage('Initializing secure checkout...');

        const res = await loadRazorpayScript();
        if (!res) {
            setStatus('error');
            setCheckoutMessage('Razorpay setup failed. Please check your connection.');
            return;
        }

        try {
            // 1. Resolve API URL
            const apiUrl = import.meta.env.VITE_API_URL || getApiBaseUrl();
            
            // 2. Fetch Razorpay Key ID from backend at runtime
            // This prevents "Key Invalid" 401 errors caused by missing Vercel env vars
            let razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
            try {
                const configRes = await fetch(`${apiUrl}/api/v1/config/razorpay-key`);
                if (configRes.ok) {
                    const configData = await configRes.json();
                    if (configData.keyId && !configData.keyId.includes('dummy')) {
                        razorpayKey = configData.keyId;
                    }
                }
            } catch (configErr) {
                console.warn('[Checkout] Background Key fetch failed:', configErr);
            }

            // 3. Strict Guardrail: Stop if we still have a dummy key or no key
            // This PREVENTS the Razorpay library from showing its own "Oops" generic browser alert
            if (!razorpayKey || razorpayKey.includes('dummy')) {
                setStatus('error');
                setCheckoutMessage('Configuration Error: Razorpay Key ID is missing. Please ensure your backend is deployed and VITE_API_URL is set in Vercel.');
                return;
            }

            // 4. Create Order
            const idToken = await user.getIdToken();
            const createOrderRes = await fetch(`${apiUrl}/api/v1/payment/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ amount: plan.price, currency: currencyMode, planId: plan.badgeTier })
            });
            
            if (!createOrderRes.ok) {
                const errorData = await createOrderRes.json().catch(() => ({}));
                throw new Error(errorData.error || `Server responded with ${createOrderRes.status}`);
            }

            const orderData = await createOrderRes.json();
            if (!orderData.success) {
                throw new Error(orderData.error || 'Order creation failed');
            }

            const options = {
                key: razorpayKey,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'UI HUB',
                description: `${plan.title} Subscription`,
                order_id: orderData.order_id,
                handler: async function (response: any) {
                    setStatus('loading');
                    setCheckoutMessage('Verifying payment securely...');
                    try {
                        const verifyRes = await fetch(`${apiUrl}/api/v1/payment/verify-payment`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${idToken}`,
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                user_email: user.email,
                                tier: plan.badgeTier,
                                amount: plan.price,
                                planId: plan.badgeTier
                            })
                        });
                        
                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            // Refresh Pro status immediately so the new entitlement applies
                            // without requiring a full page reload.
                            await refreshProStatus();
                            setStatus('success');
                            setCheckoutMessage(`Welcome to ${plan.title}! Your account is upgraded.`);
                        } else if (verifyData.paymentCaptured) {
                            setStatus('error'); 
                            setCheckoutMessage(verifyData.error || 'Payment received but plan activation is pending. Please contact support.');
                        } else {
                            throw new Error(verifyData.error || 'Verification failed');
                        }
                    } catch (err: any) {
                        setStatus('error');
                        // Display backend error rather than generic text
                        setCheckoutMessage(err.message || 'Payment verification failed');
                    }
                },
                prefill: {
                    name: user?.displayName || '',
                    email: user?.email || '',
                },
                theme: {
                    color: plan.accentColor === 'green' ? '#00FF1A' : '#3B82F6',
                },
                modal: {
                    ondismiss: function() {
                        // Always close the overlay and go home when user exits payment
                        // Use ref to get the *current* status (avoids stale closure)
                        const currentStatus = checkoutStatusRef.current;
                        if (currentStatus === 'loading' || currentStatus === 'idle') {
                            setStatus('idle');
                            navigate('/');
                        }
                    }
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            
            // Intercept native Razorpay failure events to update React state instead of browser alerts
            paymentObject.on('payment.failed', function (response: any) {
                console.error('[Razorpay Checkout Error]', response.error);
                setStatus('error');
                // Extract precise Razorpay API error rather than generic 'Payment Failed'
                setCheckoutMessage(`Payment Failed: ${response.error.description || 'Transaction declined'} (Code: ${response.error.code || 'N/A'})`);
            });

            paymentObject.open();

        } catch (err: any) {
            console.error('[Checkout API Error]', err);
            setStatus('error');
            
            // Handle Render free tier cold start appropriately
            if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
                setCheckoutMessage('Server is waking up from sleep. Please try again in 30 seconds.');
            } else {
                setCheckoutMessage(err.message || 'Failed to initialize checkout.');
            }
        }
    };

    const currency = currencyMode === 'INR' ? '₹' : '$';
    const proPrice = currencyMode === 'INR' ? '99' : '4.99';

    const plans = [
        {
            tier: 'Basic',
            title: 'FREE',
            tagline: 'The Foundation for Modern Creators',
            price: '0',
            duration: 'Forever',
            icon: Code2,
            accentColor: 'white',
            features: [
                '50+ Essential UI Components',
                'React & HTML Production Code',
                'Starter Vault (Max 5 Projects)',
                'Core Animation Design Suite',
                '2 Free AI Prompt Trials',
                'Access to Basic Prompts (Lovable + Cursor)',
            ],
            notIncluded: [
                'No AI Premium Models',
                'No Bulk Export',
                'No 3D Assets',
                'No Unlimited Storage',
            ],
            badgeTier: 'free' as const,
            cta: 'Start for Free',
            ctaLink: '/library',
            popular: false,
            bestValue: false,
        },
        {
            tier: 'Premium',
            title: 'PRO ACCESS',
            tagline: 'Elite Tools for Principal Engineers',
            price: proPrice,
            duration: '/ 6 months',
            icon: Crown,
            accentColor: 'green',
            features: [
                'Everything in Free, plus',
                'Unlimited Downloads',
                'Pixel-Perfect AI Generation',
                'Elite AI (Antigravity + Claude + Advance)',
                'One-Click ZIP Export',
                'Premium UI & Animation Library',
                'Advanced 3D Components',
                '100+ Premium Templates',
            ],
            notIncluded: [],
            badgeTier: 'pro' as const,
            cta: 'Get Pro Access',
            ctaLink: '/library',
            popular: true,
            bestValue: true,
        },
    ];

    return (
        <div className="min-h-screen pt-28 pb-24 px-6 relative bg-brand-bg text-white">
            <CheckoutOverlay 
                isOpen={checkoutStatus !== 'idle'} 
                status={checkoutStatus} 
                message={checkoutMessage} 
                onClose={() => {
                    setCheckoutStatus('idle');
                    if (checkoutStatus === 'success') {
                        refreshProStatus();
                        navigate('/library');
                    }
                }} 
            />

            <div className="max-w-7xl mx-auto">
                {/* ── Section Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest mb-6">
                        <span className="w-2 h-2 rounded-full bg-brand-blue" />
                        <span className="text-white">SIMPLE PRICING</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-none mb-6">
                        <span className="text-neutral-400 block text-lg sm:text-2xl tracking-widest font-bold mb-2">CHOOSE YOUR</span>
                        <span className="text-brand-blue">POWER LEVEL</span>
                    </h1>

                    <p className="max-w-xl mx-auto text-neutral-400 text-sm md:text-base font-medium leading-relaxed tracking-wide mb-8">
                        Start free with 50+ components. Upgrade whenever you need pro power.
                    </p>

                    {/* Currency Toggle */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-brand-surface border-2 border-white p-1 rounded-lg flex items-center brutal-shadow-black">
                            <button
                                onClick={() => setCurrencyMode('INR')}
                                className={`px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all ${
                                    currencyMode === 'INR'
                                        ? 'bg-brand-blue text-white border-2 border-black'
                                        : 'text-neutral-400 hover:text-white'
                                }`}
                            >
                                ₹ INR
                            </button>
                            <button
                                onClick={() => setCurrencyMode('USD')}
                                className={`px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all ${
                                    currencyMode === 'USD'
                                        ? 'bg-brand-blue text-white border-2 border-black'
                                        : 'text-neutral-400 hover:text-white'
                                }`}
                            >
                                $ USD
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* ── Pricing Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 mb-16">
                    {plans.map((plan, idx) => {
                        const Icon = plan.icon;

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className={`p-8 rounded-lg relative overflow-hidden flex flex-col border-2 border-white bg-brand-surface ${
                                    plan.popular
                                        ? 'brutal-shadow-blue'
                                        : 'brutal-shadow-black'
                                }`}
                            >
                                {/* Popular / Best Value Badge */}
                                {plan.popular && (
                                    <div className="absolute top-4 right-4 z-20">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-yellow text-black border-2 border-black text-[10px] font-black uppercase tracking-widest">
                                            <Star className="w-3 h-3 fill-black text-black" />
                                            MOST POPULAR
                                        </div>
                                    </div>
                                )}

                                {/* Plan header */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded border-2 border-white bg-brand-bg flex items-center justify-center text-white">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{plan.tier}</p>
                                            <h2 className="text-xl font-black uppercase tracking-tight text-white">
                                                {plan.title}
                                            </h2>
                                        </div>
                                    </div>

                                    {/* Badge preview */}
                                    <div className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded border border-neutral-700 bg-brand-bg w-fit">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">YOUR BADGE</span>
                                        <span className="text-neutral-500 text-[9px]">→</span>
                                        <PlanBadge tier={plan.badgeTier} size="sm" showIcon animated />
                                    </div>

                                    <p className="text-neutral-400 text-xs pr-4 leading-relaxed font-medium">
                                        {plan.tagline}
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-2xl font-black text-brand-blue">
                                        {currency}
                                    </span>
                                    <span className="text-6xl font-black text-white tracking-tight leading-none">
                                        {plan.price}
                                    </span>
                                    <span className="bg-brand-bg border border-neutral-700 text-neutral-400 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ml-2">
                                        {plan.duration}
                                    </span>
                                </div>

                                <div className="h-0.5 bg-neutral-800 mb-6" />

                                {/* Features */}
                                <div className="flex-1 space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-2.5 cursor-default"
                                        >
                                            <div className="w-4 h-4 rounded-full bg-brand-blue border border-black flex items-center justify-center shrink-0 mt-0.5 text-white">
                                                <Check size={10} strokeWidth={3} />
                                            </div>
                                            <span className="text-neutral-300 text-xs font-bold leading-snug">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}

                                    {plan.notIncluded.length > 0 && (
                                        <>
                                            <div className="h-0.5 bg-neutral-800 !my-4" />
                                            {plan.notIncluded.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-2.5">
                                                    <div className="w-4 h-4 rounded-full bg-neutral-800 border border-neutral-600 flex items-center justify-center shrink-0 mt-0.5 text-neutral-500">
                                                        <X size={10} strokeWidth={3} />
                                                    </div>
                                                    <span className="text-neutral-500 text-xs font-bold leading-snug">{feature}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>

                                {/* CTA Button */}
                                {plan.tier === 'Basic' ? (
                                    <button
                                        onClick={handleStartFree}
                                        className="brutal-btn-outline w-full py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 bg-brand-surface"
                                    >
                                        <span>{plan.cta}</span>
                                        <ArrowRight size={14} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleCheckout(plan)}
                                        className="brutal-btn-primary w-full py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                                    >
                                        <span>{plan.cta}</span>
                                        <ArrowRight size={14} />
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* ── Trust strip ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Shield, title: 'Secure Payments', desc: 'Industry-standard encryption on every transaction.' },
                        { icon: Zap, title: 'Instant Access', desc: 'Unlock all premium components immediately after payment.' },
                        { icon: Download, title: 'Cancel Anytime', desc: 'No lock-in contracts. Cancel with a single click.' },
                    ].map((item, i) => {
                        const ItemIcon = item.icon;
                        return (
                            <div
                                key={i}
                                className="p-5 rounded-lg border-2 border-white bg-brand-surface flex items-start gap-4 brutal-shadow-black"
                            >
                                <div className="w-10 h-10 rounded border-2 border-white bg-brand-bg flex items-center justify-center shrink-0 text-brand-blue">
                                    <ItemIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-wider text-white mb-1">{item.title}</p>
                                    <p className="text-xs text-neutral-400 font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
