import { useCallback, useRef, useState } from 'react';
import { loadRazorpayScript } from './razorpayUtils';
import { getApiBaseUrl } from './apiConfig';

export const COMPONENT_PRICE = { usd: 1.99, inr: 49 } as const;

export type Currency = 'INR' | 'USD';

export const detectCurrency = (): Currency => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timeZone === 'Asia/Kolkata' || timeZone === 'Asia/Calcutta' ? 'INR' : 'USD';
};

export const formatComponentPrice = (currency: Currency): string => {
    const price = COMPONENT_PRICE[currency === 'INR' ? 'inr' : 'usd'];
    return currency === 'INR' ? `₹${price}` : `$${price}`;
};

export type CheckoutStatus = 'idle' | 'loading' | 'success' | 'error';

interface StartCheckoutParams {
    user: {
        email?: string | null;
        displayName?: string | null;
        getIdToken: () => Promise<string>;
    };
    description: string;
    amount: number;
    currency: Currency;
    orderExtra?: Record<string, unknown>;
    verifyExtra?: Record<string, unknown>;
    onSuccess?: (message: string) => void | Promise<void>;
    onError?: (message: string) => void;
}

/**
 * Shared Razorpay checkout flow (extracted from PricingPage).
 * Renders nothing itself — returns overlay state the caller feeds into
 * <CheckoutOverlay>, and runs the full create-order → razorpay → verify loop.
 */
export const useRazorpayCheckout = () => {
    const [checkoutStatus, setCheckoutStatusRaw] = useState<CheckoutStatus>('idle');
    const [checkoutMessage, setCheckoutMessage] = useState('');
    const statusRef = useRef<CheckoutStatus>('idle');
    const isCheckoutOpen = checkoutStatus !== 'idle';

    const setStatus = useCallback((s: CheckoutStatus) => {
        statusRef.current = s;
        setCheckoutStatusRaw(s);
    }, []);

    const startCheckout = useCallback(async (params: StartCheckoutParams) => {
        const { user, description, amount, currency, orderExtra = {}, verifyExtra = {}, onSuccess, onError } = params;
        setStatus('loading');
        setCheckoutMessage('Initializing secure checkout...');

        const loaded = await loadRazorpayScript();
        if (!loaded) {
            setStatus('error');
            setCheckoutMessage('Razorpay setup failed. Please check your connection.');
            onError?.('Razorpay setup failed. Please check your connection.');
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || getApiBaseUrl();

            // Fetch Razorpay Key ID from backend at runtime
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

            if (!razorpayKey || razorpayKey.includes('dummy')) {
                const msg = 'Configuration Error: Razorpay Key ID is missing. Please ensure your backend is deployed and VITE_API_URL is configured correctly.';
                setStatus('error');
                setCheckoutMessage(msg);
                onError?.(msg);
                return;
            }

            const idToken = await user.getIdToken();

            // Create Order
            const createOrderRes = await fetch(`${apiUrl}/api/v1/payment/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    amount,
                    currency,
                    planId: 'pro',
                    ...orderExtra,
                }),
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
                description,
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
                                tier: 'pro',
                                amount,
                                planId: 'pro',
                                selectedCategories: [],
                                duration: '6 Months',
                                subscriptionMonths: 6,
                                ...verifyExtra,
                            }),
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            const msg = verifyData.message || 'Payment verified successfully.';
                            setStatus('success');
                            setCheckoutMessage(msg);
                            await onSuccess?.(msg);
                        } else if (verifyData.paymentCaptured) {
                            const msg = verifyData.error || 'Payment received but activation is pending. Please contact support.';
                            setStatus('error');
                            setCheckoutMessage(msg);
                            onError?.(msg);
                        } else {
                            throw new Error(verifyData.error || 'Verification failed');
                        }
                    } catch (err: any) {
                        setStatus('error');
                        setCheckoutMessage(err.message || 'Payment verification failed');
                        onError?.(err.message || 'Payment verification failed');
                    }
                },
                prefill: {
                    name: user?.displayName || '',
                    email: user?.email || '',
                },
                theme: { color: '#3B82F6' },
                modal: {
                    ondismiss: function () {
                        const currentStatus = statusRef.current;
                        if (currentStatus === 'loading' || currentStatus === 'idle') {
                            setStatus('idle');
                        }
                    },
                },
            };

            const paymentObject = new (window as any).Razorpay(options);

            paymentObject.on('payment.failed', function (response: any) {
                console.error('[Razorpay Checkout Error]', response.error);
                const msg = `Payment Failed: ${response.error.description || 'Transaction declined'} (Code: ${response.error.code || 'N/A'})`;
                setStatus('error');
                setCheckoutMessage(msg);
                onError?.(msg);
            });

            paymentObject.open();
        } catch (err: any) {
            console.error('[Checkout API Error]', err);
            let msg = err.message || 'Failed to initialize checkout.';
            if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
                msg = 'Server is waking up from sleep. Please try again in 30 seconds.';
            }
            setStatus('error');
            setCheckoutMessage(msg);
            onError?.(msg);
        }
    }, [setStatus]);

    const close = useCallback(() => setStatus('idle'), [setStatus]);

    return { checkoutStatus, checkoutMessage, isCheckoutOpen, startCheckout, close };
};