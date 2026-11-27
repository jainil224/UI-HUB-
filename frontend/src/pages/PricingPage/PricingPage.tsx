import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Zap, Crown, ArrowRight, Star, Download, Code2, Shield, Coins, Timer, BrainCircuit, Sparkles, Infinity as InfinityIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PlanBadge from '../../components/ui/PlanBadge';
import { useAuth } from '../../context/AuthContext';
import { loadRazorpayScript } from '../../utils/razorpayUtils';
import CheckoutOverlay from '../../components/ui/CheckoutOverlay';
import { getApiBaseUrl } from '../../utils/apiConfig';
import { useSeo } from '../../components/Seo';
import { staticPageSeoConfig } from '../../seo/runtime';
import { useBlackFridayOffer } from '../../utils/useBlackFridayOffer';

type BillingMode = 'annual' | 'lifetime';

const CREDIT_OPTIONS = [50, 100, 150, 200, 250, 500] as const;
const CREDIT_PACK = {
    usdPerCredit: 0.1,
    inrPerCredit: 8.3,
    expiryDays: 30,
};

const getRazorpayKey = async (apiUrl: string): Promise<string | null> => {
    const configuredKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    try {
        const configRes = await fetch(`${apiUrl}/api/v1/config/razorpay-key`);
        if (configRes.ok) {
            const configData = await configRes.json();
            if (configData.keyId && !configData.keyId.includes('dummy')) {
                return configData.keyId as string;
            }
        }
    } catch (configErr) {
        console.warn('[Checkout] Background Key fetch failed:', configErr);
    }
    return configuredKey && !configuredKey.includes('dummy') ? configuredKey : null;
};

const PricingPage = () => {
    const navigate = useNavigate();
    const { user, refreshProStatus, planType } = useAuth();
    const [currencyMode, setCurrencyMode] = useState<'INR' | 'USD'>('INR');
    const [billingMode, setBillingMode] = useState<BillingMode>('annual');
    const isBlackFridayOfferActive = useBlackFridayOffer();
    const prefersReducedMotion = useReducedMotion();
    const isLifetimeMode = billingMode === 'lifetime';

    const pricingConfig = staticPageSeoConfig('/pricing');
    useSeo(
        pricingConfig ?? {
            title: 'Pricing | UI Hub',
            description: 'UI Hub pricing, plan options and credit details for components, templates and sections.',
            canonicalPath: '/pricing',
            robots: 'index, follow',
            jsonLd: [],
        },
    );
    const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [checkoutMessage, setCheckoutMessage] = useState('');
    const [checkoutKind, setCheckoutKind] = useState<'plan' | 'credits'>('plan');
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
            const apiUrl = getApiBaseUrl();
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

        setCheckoutKind('plan');
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
            const apiUrl = getApiBaseUrl();
            
            // Fetch Razorpay Key ID from backend at runtime
            const razorpayKey = await getRazorpayKey(apiUrl);

            // Strict Guardrail: Stop if we still have a dummy key or no key
            if (!razorpayKey || razorpayKey.includes('dummy')) {
                setStatus('error');
                setCheckoutMessage('Configuration Error: Razorpay Key ID is missing. Please ensure the backend is deployed and reachable at the API base URL.');
                return;
            }

            // Annual plans renew after 12 months; lifetime is a one-time purchase.
            const isLifetimePlan = plan.badgeTier === 'lifetime';
            const planPurchaseType = isLifetimePlan
                ? 'lifetime'
                : plan.badgeTier === 'ultimate'
                    ? 'ultimate'
                    : plan.badgeTier === 'custom'
                        ? 'custom'
                        : 'pro';
            let planDuration = isLifetimePlan ? 'Lifetime' : '1 Year';
            let planSubscriptionMonths = isLifetimePlan ? 0 : (plan.subscriptionMonths || 12);
            if (plan.badgeTier === 'custom') {
                planDuration = plan.duration || '6 Months';
                planSubscriptionMonths = plan.months || 6;
            }

            const orderBody: any = {
                amount: plan.price,
                currency: currencyMode,
                planId: plan.badgeTier,
                purchaseType: planPurchaseType,
                duration: planDuration,
                subscriptionMonths: planSubscriptionMonths,
            };
            if (plan.badgeTier === 'custom') {
                orderBody.selectedCategories = plan.selectedCategories || [];
            }

            // Create Order
            const idToken = await user.getIdToken();
            const createOrderRes = await fetch(`${apiUrl}/api/v1/payment/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(orderBody)
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
                description: isLifetimePlan ? 'UI HUB Lifetime Access' : `${plan.title} Subscription`,
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
                                currency: currencyMode,
                                planId: plan.badgeTier,
                                purchaseType: planPurchaseType,
                                selectedCategories: plan.selectedCategories || [],
                                duration: planDuration,
                                subscriptionMonths: planSubscriptionMonths,
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

    const handleBuyCredits = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setCheckoutKind('credits');
        setStatus('loading');
        setCheckoutMessage('Initializing secure checkout...');

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            setStatus('error');
            setCheckoutMessage('Razorpay setup failed. Please check your connection.');
            return;
        }

        try {
            const apiUrl = getApiBaseUrl();
            const razorpayKey = await getRazorpayKey(apiUrl);
            if (!razorpayKey) {
                setStatus('error');
                setCheckoutMessage('Configuration Error: Razorpay Key ID is missing. Please ensure the backend is deployed and reachable at the API base URL.');
                return;
            }

            const idToken = await user.getIdToken();
            const orderRes = await fetch(`${apiUrl}/api/v1/payment/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    amount: creditAmount,
                    currency: currencyMode,
                    planId: 'credits',
                    purchaseType: 'credits',
                    credits: selectedCredits,
                }),
            });

            if (!orderRes.ok) {
                const errorData = await orderRes.json().catch(() => ({}));
                throw new Error(errorData.error || `Server responded with ${orderRes.status}`);
            }

            const orderData = await orderRes.json();
            if (!orderData.success) {
                throw new Error(orderData.error || 'Order creation failed');
            }

            const options = {
                key: razorpayKey,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'UI HUB',
                description: `${selectedCredits} AI Credits`,
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
                                tier: 'credits',
                                amount: creditAmount,
                                currency: currencyMode,
                                planId: 'credits',
                                purchaseType: 'credits',
                                credits: selectedCredits,
                            }),
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            await refreshProStatus();
                            setStatus('success');
                            setCheckoutMessage(`${selectedCredits} AI credits added. They expire in ${CREDIT_PACK.expiryDays} days.`);
                        } else if (verifyData.paymentCaptured) {
                            setStatus('error');
                            setCheckoutMessage(verifyData.error || 'Payment received but credit activation is pending. Please contact support.');
                        } else {
                            throw new Error(verifyData.error || 'Verification failed');
                        }
                    } catch (err: any) {
                        setStatus('error');
                        setCheckoutMessage(err.message || 'Payment verification failed');
                    }
                },
                prefill: {
                    name: user?.displayName || '',
                    email: user?.email || '',
                },
                theme: {
                    color: '#3B82F6',
                },
                modal: {
                    ondismiss: function () {
                        const currentStatus = checkoutStatusRef.current;
                        if (currentStatus === 'loading' || currentStatus === 'idle') {
                            setStatus('idle');
                        }
                    },
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.on('payment.failed', function (response: any) {
                console.error('[Razorpay Checkout Error]', response.error);
                setStatus('error');
                setCheckoutMessage(`Payment Failed: ${response.error.description || 'Transaction declined'} (Code: ${response.error.code || 'N/A'})`);
            });
            paymentObject.open();
        } catch (err: any) {
            console.error('[Credit Checkout API Error]', err);
            setStatus('error');
            setCheckoutMessage(err.name === 'TypeError' ? 'Server is waking up from sleep. Please try again in 30 seconds.' : err.message || 'Failed to initialize checkout.');
        }
    };

    const INR_PER_USD = 83;
    const YEARLY_INR = { pro: 999, proOriginal: 1999, ultimate: 1999, ultimateOriginal: 3999 };
    const LIFETIME_INR = 3999;
    const currency = currencyMode === 'INR' ? '₹' : '$';

    const amountFor = (inrAmount: number): number =>
        currencyMode === 'INR' ? inrAmount : Math.round((inrAmount / INR_PER_USD) * 100) / 100;

    const displayAmount = (amount: number): string =>
        currencyMode === 'INR'
            ? amount.toLocaleString('en-IN')
            : amount === 0
                ? '0'
                : amount.toFixed(2);

    const [selectedCreditIndex, setSelectedCreditIndex] = useState(CREDIT_OPTIONS.length - 1);
    const selectedCredits = CREDIT_OPTIONS[selectedCreditIndex];
    const creditAmount = currencyMode === 'INR'
        ? Math.round(selectedCredits * CREDIT_PACK.inrPerCredit)
        : Math.round(selectedCredits * CREDIT_PACK.usdPerCredit * 100) / 100;
    const creditDisplayAmount = displayAmount(creditAmount);
    const alternateCreditPrice = currencyMode === 'INR'
        ? `$${(selectedCredits * CREDIT_PACK.usdPerCredit).toFixed(2)}`
        : `₹${Math.round(selectedCredits * CREDIT_PACK.inrPerCredit).toLocaleString('en-IN')}`;
    const selectedCreditPercent = (selectedCreditIndex / (CREDIT_OPTIONS.length - 1)) * 100;
    const creditSliderTransition = prefersReducedMotion
        ? { duration: 0 }
        : { type: 'spring' as const, stiffness: 320, damping: 28 };

    type MetricKey =
        | 'resourceAccess'
        | 'aiCredits'
        | 'aiTools'
        | 'creditTopUp'
        | 'componentCopy'
        | 'sectionCopy'
        | 'templateCopy'
        | 'features';

    const lifetimePlan = {
        tier: 'Lifetime',
        title: 'LIFETIME',
        tagline: 'One payment. Ultimate access forever.',
        price: amountFor(LIFETIME_INR),
        displayPrice: displayAmount(amountFor(LIFETIME_INR)),
        originalDisplayPrice: null,
        duration: '/lifetime',
        icon: InfinityIcon,
        accentColor: 'blue',
        badgeTier: 'lifetime' as const,
        cta: planType === 'lifetime' ? 'Your current plan' : 'Get Lifetime',
        isCurrent: planType === 'lifetime',
        popular: true,
        subscriptionMonths: 0,
        metrics: {
            resourceAccess: 'Full Library',
            aiCredits: '200 Credits / Month',
            aiTools: 'All AI tools unlocked',
            creditTopUp: 'Buy credits anytime',
            componentCopy: 'No Limit (Fair Use)',
            sectionCopy: 'No Limit (Fair Use)',
            templateCopy: 'No Limit (Fair Use)',
            features: 'Access to All Features',
        } satisfies Record<MetricKey, string>,
    };

    const annualPlans = [
        {
            tier: 'Free',
            title: 'FREE',
            tagline: 'Start building with the essentials',
            price: 0,
            displayPrice: '0',
            originalDisplayPrice: null,
            duration: '/year',
            icon: Code2,
            accentColor: 'white',
            badgeTier: 'free' as const,
            cta: user && planType === 'free' ? 'Your current plan' : 'Start for Free',
            isCurrent: Boolean(user && planType === 'free'),
            popular: false,
            subscriptionMonths: 12,
            metrics: {
                resourceAccess: 'Limited',
                aiCredits: '5 Credits / Day',
                aiTools: 'Lovable + Cursor',
                creditTopUp: 'Buy credits anytime',
                componentCopy: '3 / Day',
                sectionCopy: '3 / Day',
                templateCopy: '3 / Day',
                features: 'Limited Features',
            } satisfies Record<MetricKey, string>,
        },
        {
            tier: 'Pro',
            title: 'PRO',
            tagline: 'Unlock the complete UI HUB',
            price: amountFor(YEARLY_INR.pro),
            displayPrice: displayAmount(amountFor(YEARLY_INR.pro)),
            originalDisplayPrice: isBlackFridayOfferActive
                ? displayAmount(amountFor(YEARLY_INR.proOriginal))
                : null,
            duration: '/year',
            icon: Crown,
            accentColor: 'green',
            badgeTier: 'pro' as const,
            cta: planType === 'pro' ? 'Your current plan' : 'Get Pro',
            isCurrent: planType === 'pro',
            popular: true,
            subscriptionMonths: 12,
            metrics: {
                resourceAccess: 'Full Library',
                aiCredits: '5 Daily Credits + 50 Credits / Month',
                aiTools: 'All AI tools unlocked',
                creditTopUp: 'Buy credits anytime',
                componentCopy: '25 / Day',
                sectionCopy: '25 / Day',
                templateCopy: '5 / Day',
                features: 'Access to All Features',
            } satisfies Record<MetricKey, string>,
        },
        {
            tier: 'Ultimate',
            title: 'ULTIMATE',
            tagline: 'For those who never stop shipping.',
            price: amountFor(YEARLY_INR.ultimate),
            displayPrice: displayAmount(amountFor(YEARLY_INR.ultimate)),
            originalDisplayPrice: isBlackFridayOfferActive
                ? displayAmount(amountFor(YEARLY_INR.ultimateOriginal))
                : null,
            duration: '/year',
            icon: Zap,
            accentColor: 'blue',
            badgeTier: 'ultimate' as const,
            cta: planType === 'ultimate' ? 'Your current plan' : 'Get Ultimate',
            isCurrent: planType === 'ultimate',
            popular: false,
            subscriptionMonths: 12,
            metrics: {
                resourceAccess: 'Full Library',
                aiCredits: '200 Credits / Month',
                aiTools: 'All AI tools unlocked',
                creditTopUp: 'Buy credits anytime',
                componentCopy: 'No Limit (Fair Use)',
                sectionCopy: 'No Limit (Fair Use)',
                templateCopy: 'No Limit (Fair Use)',
                features: 'Access to All Features',
            } satisfies Record<MetricKey, string>,
        },
    ];

    const plans = isLifetimeMode ? [lifetimePlan] : annualPlans;

    const comparisonRows: { label: string; key: MetricKey }[] = [
        { label: 'Resource Access', key: 'resourceAccess' },
        { label: 'AI Credits', key: 'aiCredits' },
        { label: 'AI Tools', key: 'aiTools' },
        { label: 'Credit Top-Up', key: 'creditTopUp' },
        { label: 'Component Copy Limit', key: 'componentCopy' },
        { label: 'Section Copy Limit', key: 'sectionCopy' },
        { label: 'Templates Copy Limit', key: 'templateCopy' },
        { label: 'Features', key: 'features' },
    ];

    const creditBenefits = [
        { icon: Zap, label: '10× faster AI edits' },
        { icon: Sparkles, label: 'Smarter code generation' },
        { icon: Code2, label: 'Better code generation' },
        { icon: BrainCircuit, label: 'Context-aware edits' },
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
                        if (checkoutKind === 'plan') {
                            navigate('/library');
                        }
                    }
                }} 
            />

            <div className="max-w-7xl mx-auto">
                {/* ── Section Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest mb-6">
                        <span className="w-2 h-2 rounded-full bg-brand-blue" />
                        <span className="text-white">CHOOSE WHAT FITS</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-none mb-6">
                        <span className="text-neutral-400 block text-lg sm:text-2xl tracking-widest font-bold mb-2">SIMPLE, TRANSPARENT</span>
                        <span className="text-brand-blue">PRICING</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-neutral-400 text-sm md:text-base font-medium leading-relaxed tracking-wide mb-8">
                        See what&apos;s included in each plan and choose what fits how you build.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                        {isLifetimeMode ? (
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded border-2 border-black bg-brand-yellow text-black text-[10px] font-black uppercase tracking-widest brutal-shadow-black">
                                <InfinityIcon className="w-3.5 h-3.5" />
                                LIFETIME · PAY ONCE
                            </div>
                        ) : isBlackFridayOfferActive ? (
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded border-2 border-black bg-brand-yellow text-black text-[10px] font-black uppercase tracking-widest brutal-shadow-black">
                                <Star className="w-3 h-3 fill-black text-black" />
                                BLACK FRIDAY · SAVE 50%
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded border-2 border-white bg-brand-surface text-white text-[10px] font-black uppercase tracking-widest brutal-shadow-black">
                                <Star className="w-3 h-3 fill-brand-blue text-brand-blue" />
                                YEARLY · BEST VALUE
                            </div>
                        )}

                        {/* Billing Mode Toggle */}
                        <div className="bg-brand-surface border-2 border-white p-1 rounded-lg flex items-center brutal-shadow-black" role="group" aria-label="Billing period">
                            <button
                                onClick={() => setBillingMode('annual')}
                                aria-pressed={!isLifetimeMode}
                                className={`px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all ${
                                    !isLifetimeMode
                                        ? 'bg-brand-blue text-white border-2 border-black'
                                        : 'text-neutral-400 hover:text-white'
                                }`}
                            >
                                Annual
                            </button>
                            <button
                                onClick={() => setBillingMode('lifetime')}
                                aria-pressed={isLifetimeMode}
                                className={`px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                    isLifetimeMode
                                        ? 'bg-brand-blue text-white border-2 border-black'
                                        : 'text-neutral-400 hover:text-white'
                                }`}
                            >
                                <InfinityIcon size={13} />
                                Lifetime
                            </button>
                        </div>

                        {/* Currency Toggle */}
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
                <div className={`grid gap-6 sm:gap-8 mb-16 items-stretch ${
                    isLifetimeMode
                        ? 'grid-cols-1 max-w-2xl mx-auto'
                        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto'
                }`}>
                    {plans.map((plan, idx) => {
                        const Icon = plan.icon;

                        return (
                            <motion.div
                                key={plan.title}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className={`p-5 sm:p-7 rounded-lg relative overflow-hidden flex flex-col h-full min-w-0 border-2 bg-brand-surface ${
                                    plan.popular
                                        ? 'border-brand-yellow brutal-shadow-blue'
                                        : 'border-white brutal-shadow-black'
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-4 right-4 z-20">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-yellow text-black border-2 border-black text-[10px] font-black uppercase tracking-widest">
                                            <Star className="w-3 h-3 fill-black text-black" />
                                            RECOMMENDED
                                        </div>
                                    </div>
                                )}

                                {/* Plan header */}
                                <div className="mb-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded border-2 border-white bg-brand-bg flex items-center justify-center text-white shrink-0">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{plan.tier}</p>
                                            <h2 className="text-xl font-black uppercase tracking-tight text-white">
                                                {plan.title}
                                            </h2>
                                        </div>
                                    </div>

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
                                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-5">
                                    {plan.originalDisplayPrice && (
                                        <span className="text-lg font-black text-neutral-500 line-through decoration-red-500 decoration-2">
                                            {currency}{plan.originalDisplayPrice}
                                        </span>
                                    )}
                                    <span className="text-3xl font-black text-brand-blue">
                                        {currency}
                                    </span>
                                    <span className="text-5xl font-black text-white tracking-tight leading-none">
                                        {plan.displayPrice}
                                    </span>
                                    <span className="bg-brand-bg border border-neutral-700 text-neutral-400 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                                        {plan.duration}
                                    </span>
                                </div>

                                <div className="h-0.5 bg-neutral-800 mb-5" />

                                {/* Comparison rows */}
                                <div className="flex-1 space-y-2.5 mb-7">
                                    {comparisonRows.map((row) => (
                                        <div
                                            key={row.key}
                                            className="flex items-start justify-between gap-3 border-b border-neutral-800/80 pb-2.5 last:border-0"
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 shrink-0">
                                                {row.label}
                                            </span>
                                            <span className="min-w-0 break-words text-right text-xs font-bold leading-snug text-neutral-200">
                                                {plan.metrics[row.key]}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                {plan.badgeTier === 'free' ? (
                                    <button
                                        onClick={handleStartFree}
                                        disabled={plan.isCurrent}
                                        className={`brutal-btn-outline w-full py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 bg-brand-surface ${
                                            plan.isCurrent ? 'opacity-60 cursor-default' : ''
                                        }`}
                                    >
                                        <span>{plan.cta}</span>
                                        {!plan.isCurrent && <ArrowRight size={14} />}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleCheckout(plan)}
                                        disabled={plan.isCurrent}
                                        className={`brutal-btn-primary w-full py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
                                            plan.isCurrent ? 'opacity-60 cursor-default' : ''
                                        }`}
                                    >
                                        <span>{plan.cta}</span>
                                        <ArrowRight size={14} />
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* ── Credit top-up ── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-6xl mx-auto mb-16"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8 rounded-lg border-2 border-white bg-brand-surface brutal-shadow-black">
                        <div className="min-w-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border-2 border-black bg-brand-yellow text-black text-[10px] font-black uppercase tracking-widest mb-6">
                                <Coins className="w-3.5 h-3.5" />
                                Need More Credits?
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-3">
                                Buy credits, {` `}
                                <span className="text-brand-blue">keep creating.</span>
                            </h2>
                            <p className="text-sm text-neutral-400 font-medium leading-relaxed max-w-xl mb-7">
                                Running low on credits? Get more credits anytime and keep creating without interruptions.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {creditBenefits.map((benefit) => {
                                    const BenefitIcon = benefit.icon;
                                    return (
                                        <div
                                            key={benefit.label}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded border border-neutral-700 bg-brand-bg"
                                        >
                                            <span className="w-8 h-8 rounded border border-neutral-700 bg-brand-surface flex items-center justify-center text-brand-yellow shrink-0">
                                                <BenefitIcon className="w-4 h-4" />
                                            </span>
                                            <span className="text-[11px] font-black uppercase tracking-wide text-neutral-200">
                                                {benefit.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="min-w-0 rounded-lg border-2 border-white bg-brand-bg p-5 sm:p-6">
                            <div className="flex items-center justify-between gap-3 mb-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Credit pack</p>
                                    <p className="text-lg font-black uppercase tracking-tight text-white">Instant top-up</p>
                                </div>
                                <span className="px-2.5 py-1 rounded border border-brand-blue/60 bg-brand-blue/10 text-[10px] font-black uppercase tracking-widest text-brand-blue shrink-0">
                                    Top-up
                                </span>
                            </div>

                            <label
                                htmlFor="credit-range"
                                className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3"
                            >
                                <span>Choose your amount</span>
                                <span className="text-white">{selectedCredits} credits</span>
                            </label>
                            <div className="relative h-11">
                                <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full border border-neutral-700 bg-brand-surface" />
                                <motion.div
                                    aria-hidden="true"
                                    className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-brand-blue"
                                    animate={{ width: `${selectedCreditPercent}%` }}
                                    transition={creditSliderTransition}
                                />
                                <motion.div
                                    aria-hidden="true"
                                    className="absolute top-1/2 z-10 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-black bg-brand-yellow text-black shadow-[0_0_0_3px_rgba(255,199,0,0.18)]"
                                    animate={{ left: `${selectedCreditPercent}%` }}
                                    transition={creditSliderTransition}
                                >
                                    <span className="text-[9px] font-black leading-none">{selectedCredits}</span>
                                </motion.div>
                                <input
                                    id="credit-range"
                                    type="range"
                                    min={0}
                                    max={CREDIT_OPTIONS.length - 1}
                                    step={1}
                                    value={selectedCreditIndex}
                                    aria-label="Select AI credit quantity"
                                    aria-valuetext={`${selectedCredits} credits`}
                                    onChange={(event) => setSelectedCreditIndex(Number(event.target.value))}
                                    className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                                />
                            </div>
                            <div className="mt-2 grid grid-cols-6 gap-1">
                                {CREDIT_OPTIONS.map((option, index) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setSelectedCreditIndex(index)}
                                        aria-label={`Select ${option} credits`}
                                        aria-pressed={index === selectedCreditIndex}
                                        className={`rounded border px-0.5 py-1.5 text-[9px] font-black transition-all duration-200 sm:text-[10px] ${
                                            index === selectedCreditIndex
                                                ? 'border-brand-blue bg-brand-blue/15 text-brand-blue'
                                                : 'border-neutral-700 bg-brand-bg text-neutral-500 hover:border-neutral-500 hover:text-white'
                                        }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 p-4 rounded border-2 border-white bg-brand-surface">
                                <div className="flex items-end justify-between gap-3">
                                    <div>
                                        <p className="text-2xl font-black uppercase tracking-tight text-white">{selectedCredits} Credits</p>
                                        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-neutral-400">
                                            <Timer className="w-3.5 h-3.5" />
                                            Expire in {CREDIT_PACK.expiryDays} days
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-3xl font-black text-brand-blue leading-none">
                                            {currency}{creditDisplayAmount}
                                        </p>
                                        <p className="text-[10px] font-bold text-neutral-500 mt-1">≈ {alternateCreditPrice}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleBuyCredits}
                                className="brutal-btn-primary w-full py-3 mt-5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                <Coins size={14} />
                                <span>Buy Credits</span>
                                <ArrowRight size={14} />
                            </button>
                            <p className="text-[10px] text-neutral-500 font-medium leading-relaxed mt-3 text-center">
                                Credits are added instantly after payment and spent before your plan credits.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* ── Trust strip ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Shield, title: 'Secure Payments', desc: 'Industry-standard encryption on every transaction.' },
                        { icon: Zap, title: 'Instant Access', desc: 'Unlock all premium components immediately after payment.' },
                        isLifetimeMode
                            ? { icon: InfinityIcon, title: 'One-Time Payment', desc: 'Pay once and keep lifetime access.' }
                            : { icon: Download, title: 'Cancel Anytime', desc: 'No lock-in contracts. Cancel with a single click.' },
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
