import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, X, Zap, Crown, ArrowRight, Star, Sparkles, Download, Code2, Shield, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PlanBadge from '../../components/ui/PlanBadge';
import { useAuth } from '../../context/AuthContext';
import { loadRazorpayScript } from '../../utils/razorpayUtils';
import CheckoutOverlay from '../../components/ui/CheckoutOverlay';
import { getApiBaseUrl } from '../../utils/apiConfig';

const PricingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currencyMode, setCurrencyMode] = useState<'INR' | 'USD'>('USD');
    const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [checkoutMessage, setCheckoutMessage] = useState('');

    // Detect if user is in India on initial load
    useEffect(() => {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timeZone === 'Asia/Kolkata' || timeZone === 'Asia/Calcutta') {
            setCurrencyMode('INR');
        }
    }, []);

    const handleCheckout = async (plan: any) => {
        if (!user) {
            navigate('/login');
            return;
        }

        setCheckoutStatus('loading');
        setCheckoutMessage('Initializing secure checkout...');

        const res = await loadRazorpayScript();
        if (!res) {
            setCheckoutStatus('error');
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
                setCheckoutStatus('error');
                setCheckoutMessage('Configuration Error: Razorpay Key ID is missing. Please ensure your backend is deployed and VITE_API_URL is set in Vercel.');
                return;
            }

            // 4. Create Order
            const createOrderRes = await fetch(`${apiUrl}/api/v1/payment/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: plan.price, currency: currencyMode })
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
                    setCheckoutStatus('loading');
                    setCheckoutMessage('Verifying payment securely...');
                    try {
                        const verifyRes = await fetch(`${apiUrl}/api/v1/payment/verify-payment`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                user_email: user.email,
                                tier: plan.badgeTier,
                                amount: plan.price
                            })
                        });
                        
                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            setCheckoutStatus('success');
                            setCheckoutMessage(`Welcome to ${plan.title}! Your account is upgraded.`);
                        } else {
                            throw new Error(verifyData.error || 'Verification failed');
                        }
                    } catch (err: any) {
                        setCheckoutStatus('error');
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
                        if (checkoutStatus === 'loading') {
                             setCheckoutStatus('idle');
                        }
                    }
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            
            // Intercept native Razorpay failure events to update React state instead of browser alerts
            paymentObject.on('payment.failed', function (response: any) {
                console.error('[Razorpay Checkout Error]', response.error);
                setCheckoutStatus('error');
                // Extract precise Razorpay API error rather than generic 'Payment Failed'
                setCheckoutMessage(`Payment Failed: ${response.error.description || 'Transaction declined'} (Code: ${response.error.code || 'N/A'})`);
            });

            paymentObject.open();

        } catch (err: any) {
            console.error('[Checkout API Error]', err);
            setCheckoutStatus('error');
            
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
    const elitePrice = currencyMode === 'INR' ? '399' : '7.99';

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
            bestValue: false,
        },
        {
            tier: 'Elite',
            title: 'BEST CHOICE',
            tagline: 'Cinema-Grade Mastery & Unlimited Power',
            price: elitePrice,
            duration: '/ year',
            icon: Heart,
            accentColor: 'blue',
            features: [
                'Everything in Pro, plus',
                'Full Premium Collection Access',
                'Cinema-Grade 3D Experiences',
                'Unlimited Project Vault',
                'Priority AI Processing',
                'Early Access to New Features',
                'Exclusive Creator Assets',
                'Download all components ZIP file',
            ],
            notIncluded: [],
            badgeTier: 'elite' as const,
            cta: 'Get Elite Access',
            ctaLink: '/library',
            popular: false,
            bestValue: true,
        },
    ];

    return (
        <div className="min-h-screen pt-28 pb-24 px-6 relative overflow-hidden">
            <CheckoutOverlay 
                isOpen={checkoutStatus !== 'idle'} 
                status={checkoutStatus} 
                message={checkoutMessage} 
                onClose={() => {
                    setCheckoutStatus('idle');
                    if (checkoutStatus === 'success') {
                        navigate('/library');
                    }
                }} 
            />
            {/* Background — matches site pattern */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-green/5 blur-[160px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full" />
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <div className="max-w-7xl mx-auto">
                {/* ── Section Header — same pattern as CardShowcase, Stats, etc. ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse shadow-[0_0_8px_#00FF00]" />
                        <span className="text-brand-green/90">Simple Pricing</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black uppercase tracking-[0.05em] leading-[0.85] mb-6">
                        <span className="text-white/40 block text-[0.5em] tracking-[0.25em] font-medium mb-2">Choose Your</span>
                        <span
                            className="bg-gradient-to-b from-[#00FF1A] via-[#00FF1A] to-[#008A0E] bg-clip-text text-transparent"
                            style={{ textShadow: '0 0 60px rgba(0,255,26,0.3)' }}
                        >
                            Power Level
                        </span>
                    </h1>

                    <p className="max-w-xl mx-auto text-white/50 text-base md:text-lg font-light leading-relaxed tracking-wide mb-12">
                        Start free with 50+ components. Upgrade whenever you need elite power.
                    </p>

                    {/* Currency Toggle */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white/[0.03] border border-white/10 p-1 rounded-2xl flex items-center shadow-2xl backdrop-blur-xl">
                            <button
                                onClick={() => setCurrencyMode('INR')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currencyMode === 'INR' ? 'bg-brand-green text-black shadow-[0_0_20px_rgba(0,255,0,0.3)]' : 'text-white/40 hover:text-white'}`}
                            >
                                ₹ INR
                            </button>
                            <button
                                onClick={() => setCurrencyMode('USD')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currencyMode === 'USD' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-white/40 hover:text-white'}`}
                            >
                                $ USD
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* ── Pricing Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    {plans.map((plan, idx) => {
                        const Icon = plan.icon;
                        const isGreen = plan.accentColor === 'green';
                        const isBlue = plan.accentColor === 'blue';

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                whileHover={{ y: -10 }}
                                className={`glass p-8 rounded-3xl relative overflow-hidden group flex flex-col ${
                                    isGreen ? 'border-brand-green/30 shadow-[0_0_40px_rgba(0,255,0,0.08)]' : ''
                                } ${isBlue ? 'border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.08)]' : ''}`}
                            >
                                {/* Popular / Best Value Badge */}
                                {plan.popular && (
                                    <motion.div
                                        className="absolute top-6 right-6 z-20"
                                        animate={{ y: [0, -3, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-green text-black text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,255,0,0.5)]">
                                            <Star className="w-3 h-3 fill-black" />
                                            Most Popular
                                        </div>
                                    </motion.div>
                                )}
                                {plan.bestValue && (
                                    <motion.div
                                        className="absolute top-6 right-6 z-20"
                                        animate={{ opacity: [1, 0.7, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                            <Zap className="w-3 h-3 fill-white" />
                                            Best Value
                                        </div>
                                    </motion.div>
                                )}

                                {/* Plan header */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 ${
                                            isGreen ? 'bg-brand-green/10' : isBlue ? 'bg-blue-500/10' : 'bg-white/[0.05]'
                                        }`}>
                                            <Icon className={`w-6 h-6 ${isGreen ? 'text-brand-green' : isBlue ? 'text-blue-400' : 'text-white/50'}`} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{plan.tier}</p>
                                            <h2 className={`text-xl font-display font-black uppercase tracking-tight ${
                                                isGreen ? 'text-brand-green' : isBlue ? 'text-blue-400' : 'text-white'
                                            }`}>
                                                {plan.title}
                                            </h2>
                                        </div>
                                    </div>

                                    {/* Badge preview — shows the badge user earns */}
                                    <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/25">Your Badge</span>
                                        <span className="text-white/20 text-[9px]">→</span>
                                        <PlanBadge tier={plan.badgeTier} size="sm" showIcon animated />
                                    </div>

                                    <p className="text-white/50 text-sm pr-16 leading-relaxed">
                                        {plan.tagline}
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className={`text-3xl font-display font-black ${isGreen ? 'text-brand-green' : isBlue ? 'text-blue-400' : 'text-white'}`}>
                                        {currency}
                                    </span>
                                    <span className="text-7xl font-display font-black text-white tracking-tighter leading-none group-hover:scale-105 transition-transform origin-left">
                                        {plan.price}
                                    </span>
                                    <span className="bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ml-2">
                                        {plan.duration}
                                    </span>
                                </div>

                                <div className="h-px bg-white/[0.06] mb-6" />

                                {/* Features */}
                                <div className="flex-1 space-y-3.5 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ x: 4 }}
                                            className="flex items-start gap-3 cursor-default"
                                        >
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-all group-hover:scale-110 ${
                                                isGreen
                                                    ? 'bg-brand-green/10 border-brand-green/30'
                                                    : isBlue
                                                    ? 'bg-blue-500/10 border-blue-500/30'
                                                    : 'bg-white/5 border-white/10'
                                            }`}>
                                                <Check size={11} className={isGreen ? 'text-brand-green' : isBlue ? 'text-blue-400' : 'text-white/60'} />
                                            </div>
                                            <span className="text-white/70 text-sm leading-snug hover:text-white transition-colors">
                                                {feature}
                                            </span>
                                        </motion.div>
                                    ))}

                                    {plan.notIncluded.length > 0 && (
                                        <>
                                            <div className="h-px bg-white/[0.06] !my-5" />
                                            {plan.notIncluded.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3 group/not-included">
                                                    <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center shrink-0 mt-0.5 transition-all group-hover/not-included:bg-red-500/20">
                                                        <X size={11} className="text-red-500" />
                                                    </div>
                                                    <span className="text-white/60 text-sm leading-snug">{feature}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>

                                {/* CTA Button — matches site button style */}
                                {plan.tier === 'Basic' ? (
                                    <Link to={plan.ctaLink}>
                                        <button
                                            className={`w-full py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all duration-300 relative overflow-hidden group/btn active:scale-95 ${
                                                isGreen
                                                    ? 'bg-brand-green text-black hover:scale-105 green-glow'
                                                    : isBlue
                                                    ? 'bg-blue-500 text-white hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]'
                                                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {plan.cta}
                                                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </span>
                                            {/* Shimmer — matches Hero button shimmer */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                        </button>
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => handleCheckout(plan)}
                                        className={`w-full py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all duration-300 relative overflow-hidden group/btn active:scale-95 ${
                                            isGreen
                                                ? 'bg-brand-green text-black hover:scale-105 green-glow'
                                                : isBlue
                                                ? 'bg-blue-500 text-white hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]'
                                                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {plan.cta}
                                            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                    </button>
                                )}

                                {/* Ambient glow on hover */}
                                <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${
                                    isGreen
                                        ? 'shadow-[inset_0_0_60px_rgba(0,255,0,0.04)]'
                                        : isBlue
                                        ? 'shadow-[inset_0_0_60px_rgba(59,130,246,0.04)]'
                                        : 'shadow-[inset_0_0_60px_rgba(255,255,255,0.02)]'
                                }`} />
                            </motion.div>
                        );
                    })}
                </div>

                {/* ── Trust strip — matches Stats section style ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {[
                        { icon: Shield, title: 'Secure Payments', desc: 'Industry-standard encryption on every transaction.' },
                        { icon: Zap, title: 'Instant Access', desc: 'Unlock all premium components immediately after payment.' },
                        { icon: Download, title: 'Cancel Anytime', desc: 'No lock-in contracts. Cancel with a single click.' },
                    ].map((item, i) => {
                        const ItemIcon = item.icon;
                        return (
                            <div
                                key={i}
                                className="glass p-6 rounded-3xl flex items-start gap-4 hover:border-white/20 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center shrink-0 group-hover:bg-brand-green/20 transition-all">
                                    <ItemIcon className="w-5 h-5 text-brand-green" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white mb-1">{item.title}</p>
                                    <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
};

export default PricingPage;
