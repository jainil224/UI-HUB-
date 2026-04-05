# UI-HUB: Firebase Admin SDK Credentials Fix — Implementation Prompt

## Problem Statement

**Error:** `Could not load the default credentials`
**Context:** Payment is verified by Razorpay successfully (HMAC signature passes), but when the backend attempts to write the payment record to Firestore and upgrade the user's `planTier`, Firebase Admin SDK throws an authentication error and the fulfillment fails entirely.

**What this means:**
- Money has been charged to the customer ✅
- Razorpay has the payment record ✅
- Your Firestore `payments` collection was NOT written ❌
- The user's `planTier` was NOT upgraded ❌
- The invoice email was NOT sent ❌

This error occurs because `firebase-admin` cannot find valid service account credentials. It falls back to looking for Google Application Default Credentials (ADC) — which only exist on Google Cloud infrastructure — and fails everywhere else (Vercel, Railway, Render, local without gcloud CLI).

---

## Root Cause Tree

```
firebase-admin init
    └── credential not provided explicitly
            └── SDK falls back to ADC (Application Default Credentials)
                    ├── Looks for GOOGLE_APPLICATION_CREDENTIALS env var → not set
                    ├── Looks for gcloud CLI credentials          → not available on Vercel
                    └── Looks for GCE metadata server             → not on Vercel
                            → throws "Could not load the default credentials"
```

Possible specific causes in your codebase:

| # | Cause | Symptom |
|---|---|---|
| A | `FIREBASE_SERVICE_ACCOUNT_JSON` env var not set in deployment platform | Error on all requests |
| B | Env var set but `admin.initializeApp()` called without `credential:` field | Same error |
| C | `JSON.parse()` missing — passing raw string as credential object | TypeError or same error |
| D | Private key `\n` characters mangled by platform (Vercel, Railway) | JSON parse succeeds but credential is invalid |
| E | `admin.initializeApp()` called multiple times (no `apps.length` guard) | Intermittent crashes |
| F | Service account JSON pasted with literal newlines instead of `\n` escape | JSON.parse throws SyntaxError |

---

## Fix Implementation

### Step 1 — Locate Your Firebase Admin Initialization

Find the file where you call `admin.initializeApp()`. It is likely one of:
- `firebaseService.js`
- `firebase.js`
- `config/firebase.js`
- `server.js` (top-level)

---

### Step 2 — Rewrite the Initialization Block

Replace your current initialization with this hardened version that handles all failure modes:

```js
// services/firebaseService.js (or wherever you init admin)

import admin from 'firebase-admin';

function initializeFirebaseAdmin() {
  // Guard: prevent re-initialization across hot reloads or multiple imports
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    throw new Error(
      '[Firebase] FIREBASE_SERVICE_ACCOUNT_JSON is not set. ' +
      'Add it to your .env file locally and to your deployment platform environment variables.'
    );
  }

  let serviceAccount;

  try {
    // Fix for platforms that mangle \n in private_key (Vercel, Railway, etc.)
    // The private key field contains literal \n sequences that get double-escaped
    const cleaned = raw.replace(/\\n/g, '\n');
    serviceAccount = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `[Firebase] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: ${err.message}. ` +
      'Ensure the value is valid JSON. If pasting into Vercel, use the Base64 method below.'
    );
  }

  // Validate required fields before attempting init
  const requiredFields = ['project_id', 'client_email', 'private_key'];
  for (const field of requiredFields) {
    if (!serviceAccount[field]) {
      throw new Error(`[Firebase] Service account JSON is missing required field: "${field}"`);
    }
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Optional: explicitly set project ID as a second safety net
    projectId: serviceAccount.project_id,
  });

  console.log(`[Firebase] Admin SDK initialized for project: ${serviceAccount.project_id}`);
  return admin.app();
}

// Initialize once at module load
initializeFirebaseAdmin();

// Export the db and auth instances for use in controllers/services
export const db   = admin.firestore();
export const auth = admin.auth();
export default admin;
```

---

### Step 3 — Set the Environment Variable Correctly

#### Option A: Raw JSON (simpler, works for most platforms)

1. Open Firebase Console → Project Settings → Service Accounts
2. Click **"Generate new private key"** → downloads a `.json` file
3. Open the file, copy the entire contents
4. In your deployment platform (Vercel / Railway / Render), create env var:
   - **Key:** `FIREBASE_SERVICE_ACCOUNT_JSON`
   - **Value:** paste the entire JSON as-is (one line or multi-line depending on platform)

**For Vercel specifically** — Vercel's UI collapses multiline values but preserves `\n` as literal `\n` inside strings, which the `replace(/\\n/g, '\n')` in Step 2 handles.

#### Option B: Base64 Encoded (most reliable — recommended for Vercel)

**On your machine, encode the JSON:**
```bash
# macOS / Linux
base64 -i path/to/serviceAccountKey.json | tr -d '\n'

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\serviceAccountKey.json"))
```

**Set the env var:**
- **Key:** `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64`
- **Value:** the base64 string output

**Update your init code to decode it:**
```js
function getServiceAccount() {
  // Try Base64 first (most reliable), fall back to raw JSON
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
  const raw    = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (base64) {
    try {
      return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
    } catch (err) {
      throw new Error(`[Firebase] Failed to decode Base64 service account: ${err.message}`);
    }
  }

  if (raw) {
    try {
      return JSON.parse(raw.replace(/\\n/g, '\n'));
    } catch (err) {
      throw new Error(`[Firebase] Failed to parse JSON service account: ${err.message}`);
    }
  }

  throw new Error('[Firebase] No service account credentials found in environment.');
}
```

---

### Step 4 — Local `.env` Setup

In your local `.env` file:

```env
# Option A — Raw JSON (must be on ONE line, no line breaks)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project-id","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvAIBAD...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

# Option B — Base64 (preferred, no formatting concerns)
FIREBASE_SERVICE_ACCOUNT_JSON_BASE64=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50...
```

**Never commit either of these to Git.** Ensure `.env` is in `.gitignore`.

---

### Step 5 — Verify the Fix Locally Before Deploying

Add a one-time health check route to confirm credentials load correctly:

```js
// In server.js — REMOVE THIS after confirming it works
app.get('/api/v1/health/firebase', async (req, res) => {
  try {
    // Attempt a lightweight Firestore read to confirm connectivity
    await db.collection('_healthcheck').limit(1).get();
    res.json({ status: 'ok', message: 'Firebase Admin SDK connected successfully.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});
```

Hit `GET /api/v1/health/firebase` after starting your server. If it returns `status: ok`, credentials are working. Delete this route before deploying to production.

---

### Step 6 — Recover the Affected Payment (Your Pro Access)

Since your payment succeeded in Razorpay but fulfillment failed, manually fix your account:

#### Option A: Firebase Console (quickest)

1. Go to Firebase Console → Firestore
2. Navigate to `users` collection → find your document (by UID or email)
3. Edit the `planTier` field → set value to `"pro"`
4. Manually add a document to `payments` collection:

```json
{
  "userId":    "your_firebase_uid",
  "email":     "your@email.com",
  "paymentId": "pay_xxxxxxxxxx",
  "orderId":   "order_xxxxxxxxxx",
  "tier":      "pro",
  "planId":    "monthly",
  "amount":    999,
  "currency":  "INR",
  "status":    "captured",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "note":      "Manual recovery — fulfillment failed due to missing Firebase credentials"
}
```

#### Option B: Recovery Script (run once locally, after fixing credentials)

```js
// scripts/recoverPayment.js — run with: node scripts/recoverPayment.js
import '../services/firebaseService.js'; // triggers init
import { db } from '../services/firebaseService.js';

const RECOVERY = {
  userId:    'PASTE_YOUR_FIREBASE_UID',
  email:     'your@email.com',
  paymentId: 'pay_PASTE_FROM_RAZORPAY_DASHBOARD',
  orderId:   'order_PASTE_FROM_RAZORPAY_DASHBOARD',
  tier:      'pro',
  planId:    'monthly',
  amount:    999,
  currency:  'INR',
};

async function recover() {
  // Write payment record
  await db.collection('payments').add({
    ...RECOVERY,
    status:    'captured',
    createdAt: new Date(),
    note:      'Manual recovery',
  });

  // Upgrade user tier
  await db.collection('users').doc(RECOVERY.userId).update({
    planTier:       RECOVERY.tier,
    planActivatedAt: new Date(),
  });

  console.log('Recovery complete. User upgraded to:', RECOVERY.tier);
  process.exit(0);
}

recover().catch(err => {
  console.error('Recovery failed:', err);
  process.exit(1);
});
```

---

### Step 7 — Prevent Silent Failures in the Future

Update your `verifyPayment` controller to distinguish between payment verification failure and fulfillment failure. Never return a generic "Payment Failed" when Razorpay already captured the money:

```js
export async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, tier, planId } = req.body;

  // Step 1: Verify signature
  let signatureValid = false;
  try {
    signatureValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  } catch (err) {
    console.error('[PAYMENT] Signature verification threw:', err);
    return res.status(400).json({ success: false, error: 'Payment verification failed.' });
  }

  if (!signatureValid) {
    return res.status(400).json({ success: false, error: 'Invalid payment signature.' });
  }

  // Step 2: Fulfillment — handle separately so a DB error doesn't look like a payment failure
  try {
    const result = await fulfillPayment({
      userId:    req.user.uid,
      email,
      tier,
      planId,
      paymentId: razorpay_payment_id,
      orderId:   razorpay_order_id,
    });

    if (result.alreadyProcessed) {
      return res.status(200).json({ success: true, message: 'Plan already active.' });
    }

    // Send invoice email (non-blocking — don't fail the response if email fails)
    sendInvoiceEmail({ ... }).catch(err =>
      console.error('[EMAIL] Invoice send failed (non-fatal):', err)
    );

    return res.status(200).json({ success: true, tier });

  } catch (err) {
    // ⚠️ CRITICAL: Payment was captured but fulfillment failed
    // Log with full context so you can recover manually
    console.error('[FULFILLMENT FAILED]', {
      paymentId: razorpay_payment_id,
      orderId:   razorpay_order_id,
      userId:    req.user.uid,
      email,
      tier,
      error:     err.message,
      stack:     err.stack,
    });

    // Tell the user payment went through but something went wrong on our end
    // DO NOT say "Payment Failed" — the payment succeeded
    return res.status(500).json({
      success: false,
      paymentCaptured: true,
      error: 'Your payment was successful, but we encountered an issue activating your plan. ' +
             'Please contact support@uihub.io with your payment ID and we will resolve this immediately.',
      paymentId: razorpay_payment_id,
    });
  }
}
```

**Update your frontend** to handle the `paymentCaptured: true` flag and show a different message:

```tsx
// In your payment result handler
if (!data.success && data.paymentCaptured) {
  // Show a support message, not a generic "Payment Failed"
  showModal({
    type: 'warning',
    title: 'Payment Received — Activation Pending',
    message: `Your payment was successful (ID: ${data.paymentId}), but plan activation hit a snag on our end. 
              We've logged this and will activate your account within 24 hours. 
              Contact support@uihub.io if you don't hear back.`,
  });
} else if (!data.success) {
  showModal({ type: 'error', title: 'Payment Failed', message: data.error });
}
```

---

## Deployment Checklist

Before redeploying, verify every item:

- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` (or `_BASE64` variant) set in Vercel/Railway environment variables
- [ ] `admin.initializeApp()` explicitly passes `credential: admin.credential.cert(serviceAccount)`
- [ ] `JSON.parse()` wraps the env var string
- [ ] `replace(/\\n/g, '\n')` applied before parsing (or Base64 method used)
- [ ] `admin.apps.length` guard prevents double initialization
- [ ] `/api/v1/health/firebase` endpoint confirms connection before going live
- [ ] Health check route removed after confirmation
- [ ] Affected payment manually recovered in Firestore (Step 6)
- [ ] Frontend distinguishes `paymentCaptured: true` from a real payment failure