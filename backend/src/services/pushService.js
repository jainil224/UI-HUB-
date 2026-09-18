/**
 * Push Service
 * Web Push (VAPID) notifications to existing users' browsers/phones.
 * Subscriptions are stored in MongoDB `push_subscriptions` and delivered
 * via the standard Web Push Protocol (Push API supported on Android/Chrome,
 * iOS 16.4+ Safari/Chrome for web push on phones).
 */
import webpush from 'web-push';
import fs from 'node:fs';
import path from 'node:path';
import { getCollection } from './mongoService.js';

const SUBSCRIPTIONS_COLLECTION = 'push_subscriptions';

let vapidConfigured = false;

/**
 * Loads VAPID credentials from env (or the generated backend/vapid.json fallback).
 * Silently marks the service as disabled when credentials are absent so the
 * app boots fine on machines without push keys.
 */
function ensureVapidConfigured() {
    if (vapidConfigured) return true;

    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || 'mailto:uihub.design@gmail.com';

    if (publicKey && privateKey) {
        webpush.setVapidDetails(subject, publicKey, privateKey);
        vapidConfigured = true;
        return true;
    }

    // Fallback: read a committed-free local key file (secondary/dev machines)
    try {
        const keysPath = path.resolve(process.cwd(), 'vapid.json');
        if (fs.existsSync(keysPath)) {
            const keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
            if (keys.publicKey && keys.privateKey) {
                webpush.setVapidDetails(subject, keys.publicKey, keys.privateKey);
                vapidConfigured = true;
                return true;
            }
        }
    } catch {
        // ignore secondary lookup errors
    }

    console.warn('[PushService] VAPID keys not configured — push notifications are disabled.');
    return false;
}

export const pushEnabled = () => ensureVapidConfigured();

export const getVapidPublicKey = () =>
    process.env.VAPID_PUBLIC_KEY ||
    (console.warn('[PushService] VAPID_PUBLIC_KEY missing'), '');

/**
 * Persists a browser push subscription for a user (upserted by endpoint).
 *
 * @param {Object} params
 * @param {string} params.uid Firebase auth UID
 * @param {string} params.email User email
 * @param {Object} params.subscription PushSubscription JSON
 * @param {Object} [params.meta] { userAgent, device, platform }
 */
export async function savePushSubscription({ uid, email, subscription, meta = {} }) {
    try {
        const col = await getCollection(SUBSCRIPTIONS_COLLECTION);
        const endpoint = subscription?.endpoint;
        if (!endpoint) return { success: false, error: 'Subscription endpoint missing' };

        const now = new Date();
        const existing = await col.findOne({ endpoint });
        const doc = {
            uid: uid || '',
            email: (email || '').toLowerCase(),
            endpoint,
            keys: subscription.keys || {},
            expirationTime: subscription.expirationTime ?? null,
            userAgent: (meta.userAgent || '').slice(0, 300),
            device: meta.device || '',
            platform: meta.platform || '',
            paused: false,
            createdAt: existing?.createdAt || now,
            updatedAt: now,
        };

        await col.updateOne(
            { endpoint },
            { $set: doc, $setOnInsert: { createdAt: now } },
            { upsert: true }
        );

        console.log(`[PushService] 💾 Subscription saved for ${email} (${endpoint.slice(0, 48)}…)`);
        return { success: true };
    } catch (error) {
        console.error('[PushService] Failed to save subscription:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Lists all active push subscriptions (dry-run helper).
 */
export async function getPushSubscriptions() {
    const col = await getCollection(SUBSCRIPTIONS_COLLECTION);
    return col.find({}).sort({ updatedAt: -1 }).toArray();
}

const buildSubscription = (doc) => ({
    endpoint: doc.endpoint,
    keys: doc.keys || {},
    expirationTime: doc.expirationTime ?? null,
});

/**
 * Sends a push notification to a single stored subscription.
 * Removes dead endpoints (404/410) automatically.
 */
export async function sendPushNotification(doc, payload) {
    if (!pushEnabled()) return { success: false, error: 'VAPID not configured', skipped: true };
    if (doc.paused) return { success: false, error: 'Subscription paused', skipped: true };

    const options = { TTL: 60 * 60 * 24 * 7, urgency: 'high' };
    const body = JSON.stringify({
        title: payload.title || 'UI-HUB',
        body: payload.body || '',
        icon: payload.icon || '',
        image: payload.image || '',
        badge: payload.badge || '',
        url: payload.url || 'https://ui-hub-design.vercel.app/library',
        data: payload.data || {},
    });

    try {
        const res = await webpush.sendNotification(buildSubscription(doc), body, options);
        return { success: true, statusCode: res.statusCode };
    } catch (error) {
        // 404/410 = subscription is gone/stale — prune it
        const status = error.statusCode;
        if (status === 404 || status === 410) {
            try {
                const col = await getCollection(SUBSCRIPTIONS_COLLECTION);
                await col.deleteOne({ endpoint: doc.endpoint });
                console.log(`[PushService] 🧹 Pruned stale subscription: ${(doc.endpoint || '').slice(0, 48)}…`);
            } catch (cleanupErr) {
                console.error('[PushService] Cleanup failed:', cleanupErr.message);
            }
            return { success: false, statusCode: status, error: 'Subscription expired', pruned: true };
        }
        return { success: false, statusCode: status || 0, error: error.message };
    }
}

/**
 * Broadcasts a push notification to every stored subscription.
 *
 * @param {Object} payload push message { title, body, icon, image, badge, url, data }
 * @param {Object} [opts] { dryRun: boolean, notifyFn: function }
 * @returns {Promise<{total:number, sent:number, failed:number, failures:Array}>}
 */
export async function broadcastPushNotification(payload, opts = {}) {
    const { dryRun = false, notifyFn } = opts;
    const subs = await getPushSubscriptions();

    if (dryRun) {
        return {
            total: subs.length,
            sent: 0,
            failed: 0,
            failures: [],
            dryRun: true,
            subscriptions: subs.map((s) => ({
                email: s.email,
                device: s.device,
                platform: s.platform,
                userAgent: s.userAgent,
                lastSeen: s.updatedAt,
            })),
        };
    }

    const stats = {
        total: subs.length,
        sent: 0,
        failed: 0,
        pruned: 0,
        failures: [],
    };
    if (!pushEnabled()) {
        stats.failed = stats.total;
        stats.failures.push({ error: 'VAPID not configured — push disabled' });
        return stats;
    }

    for (let i = 0; i < subs.length; i++) {
        const sub = subs[i];
        const result = await sendPushNotification(sub, payload);
        if (notifyFn) {
            notifyFn({ index: i, total: subs.length, email: sub.email, result });
        }
        if (result.success) stats.sent++;
        else if (result.pruned) stats.pruned++;
        else {
            stats.failed++;
            stats.failures.push({ email: sub.email, error: result.error });
        }
    }

    return stats;
}