import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  isPushSupported,
  getPushPermission,
  requestPushPermission,
  pushPromptStorageKey,
  registerServiceWorker,
} from '../../utils/pushService';

/**
 * One-time opt-in card for existing users: prompts them to allow phone/browser
 * push notifications so "new component" announcements reach their device.
 */
const PushNotificationPrompt = () => {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<'granted' | 'failed' | null>(null);

  useEffect(() => {
    if (!user) {
      setVisible(false);
      return;
    }

    // Pre-register the service worker whenever a signed-in user loads the app.
    registerServiceWorker();

    if (!isPushSupported()) return;

    if (getPushPermission() === 'granted') return;

    const storageKey = pushPromptStorageKey(user.uid);
    if (localStorage.getItem(storageKey) === '1') return;

    // Show the prompt on existing (warm) sessions too, shortly after load.
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, [user]);

  if (!visible || !user) return null;

  const handleAllow = async () => {
    setBusy(true);
    const outcome = await requestPushPermission(user);
    setBusy(false);

    if (outcome === 'granted') {
      setResult('granted');
    } else {
      setResult('failed');
    }

    localStorage.setItem(pushPromptStorageKey(user.uid), '1');
    setTimeout(() => setVisible(false), 1800);
  };

  const handleDismiss = () => {
    localStorage.setItem(pushPromptStorageKey(user.uid), '1');
    setVisible(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9998] w-[320px] max-w-[calc(100vw-2rem)]">
      <div className="border-2 border-brand-dark bg-brand-black shadow-[4px_4px_0_0_#3D5CFF] rounded-none overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#3D5CFF]">
          <div className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-white">
            UI-HUB Alerts
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="text-white/80 hover:text-white font-mono text-sm leading-none"
          >
            ✕
          </button>
        </div>
        <div className="px-4 py-4">
          <div className="text-sm font-extrabold text-white uppercase tracking-wide mb-1">
            {result === 'granted'
              ? '✅ Notifications on'
              : result === 'failed'
                ? 'Could not enable'
                : 'New component alerts'}
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {result === 'granted'
              ? "We'll ping your phone the moment we drop new components."
              : result === 'failed'
                ? 'Enable notifications from your browser/phone settings to get instant drops.'
                : 'Get a phone notification whenever UI-HUB adds new components.'}
          </p>
          {(result === null || result === 'failed') && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAllow}
                disabled={busy}
                className="flex-1 bg-[#3D5CFF] hover:bg-[#2b47e6] text-white text-xs font-extrabold uppercase tracking-wider border-2 border-brand-dark px-3 py-2 transition-colors disabled:opacity-50"
              >
                {busy ? 'Wiring…' : 'Enable'}
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 bg-transparent border-2 border-brand-dark text-neutral-300 hover:text-white text-xs font-extrabold uppercase tracking-wider px-3 py-2 transition-colors"
              >
                Not now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PushNotificationPrompt;