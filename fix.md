# UI-HUB: Firebase Users Missing — Full Diagnosis & Fix Prompt

## Problem Statement

Users are not visible in Firebase. This prompt covers both possible scenarios:

- **Scenario A**: Firebase Console → Authentication → Users tab is empty (no auth accounts)
- **Scenario B**: Firebase Console → Firestore → `users` collection is empty or missing (no user documents)
- **Scenario C**: Both are empty

All three scenarios have different root causes and fixes. Implement the section that matches your situation. If unsure, implement both.

---

## SCENARIO A — Authentication Tab is Empty

### Why This Happens

Firebase Authentication and Firestore are completely separate systems. Auth manages identity (email/password, Google, etc.). If the Auth tab is empty, one of these is true:

| Cause | Description |
|---|---|
| A1 | You're looking at the wrong Firebase project in the console |
| A2 | `createUserWithEmailAndPassword` / `signInWithPopup` is throwing an error that's being silently swallowed |
| A3 | Your frontend is pointing at wrong Firebase config (`apiKey`, `projectId` mismatch) |
| A4 | Auth provider (Email/Password, Google) is not enabled in the Firebase Console |
| A5 | Users registered but on a different auth domain/project than what you're viewing |

---

### Fix A1 — Verify You're on the Correct Project

In Firebase Console top-left dropdown, confirm the project name matches your `projectId` in your frontend Firebase config:

```js
// src/config/firebase.js or similar
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "your-project-id.firebaseapp.com",
  projectId:         "your-project-id",   // ← must match console
  storageBucket:     "your-project-id.appspot.com",
  messagingSenderId: "...",
  appId:             "...",
};
```

If these don't match the console URL (`https://console.firebase.google.com/project/YOUR-PROJECT-ID`), you're looking at the wrong project.

---

### Fix A2 — Enable Auth Providers in Firebase Console

1. Firebase Console → Authentication → Sign-in method tab
2. Enable whichever providers you use:
   - **Email/Password** → toggle on
   - **Google** → toggle on, add your support email
3. Save

If a provider is disabled, `createUserWithEmailAndPassword()` throws `auth/operation-not-allowed` which may be silently caught.

---

### Fix A3 — Surface Auth Errors (Stop Swallowing Them)

Check your signup/login function. A common pattern that hides failures:

```js
// ❌ BAD — error is caught but nothing happens
const handleSignup = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.log(err); // only in dev tools — user sees nothing, you see nothing in prod
  }
};
```

```js
// ✅ GOOD — log fully, show user, and rethrow for monitoring
const handleSignup = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('[AUTH] User created:', userCredential.user.uid);
    return userCredential;
  } catch (err) {
    console.error('[AUTH ERROR]', err.code, err.message);

    // Map Firebase error codes to human-readable messages
    const errorMessages = {
      'auth/email-already-in-use':    'An account with this email already exists.',
      'auth/invalid-email':           'Invalid email address.',
      'auth/weak-password':           'Password must be at least 6 characters.',
      'auth/operation-not-allowed':   'Email/password sign-in is not enabled. Check Firebase Console.',
      'auth/network-request-failed':  'Network error. Check your connection.',
      'auth/too-many-requests':       'Too many attempts. Try again later.',
    };

    const message = errorMessages[err.code] || `Unexpected error: ${err.message}`;
    setError(message); // show in UI
    throw err;         // rethrow so callers know it failed
  }
};
```

---

### Fix A4 — Verify Firebase Config is Loading Correctly

Add a one-time debug log to confirm your app is using the right config:

```js
// Temporarily add to your firebase.js init file
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = { /* your config */ };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// TEMPORARY — remove after confirming
console.log('[Firebase] Initialized project:', firebaseConfig.projectId);
console.log('[Firebase] Auth domain:', firebaseConfig.authDomain);
```

Check browser console when app loads. The `projectId` must match your Firebase Console URL.

---

## SCENARIO B — Firestore `users` Collection is Empty

### Why This Happens

**Firebase Authentication does NOT automatically create a Firestore document when a user signs up.** Auth only stores the identity (UID, email, display name). Creating a document in the `users` collection is your responsibility and must be done explicitly in your code.

This is the most common mistake when coming from other BaaS platforms.

---

### Fix B1 — Create Firestore User Document on Signup

Update your signup handler to write to Firestore immediately after creating the auth user:

```js
// auth/signup.js or wherever you handle registration

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export async function signUpUser({ email, password, displayName }) {
  // Step 1: Create Auth account
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Step 2: Update Auth profile with display name
  await updateProfile(user, { displayName });

  // Step 3: Create Firestore user document
  // Use setDoc with the UID as document ID — this links Auth and Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid:          user.uid,
    email:        user.email,
    displayName:  displayName || '',
    photoURL:     user.photoURL || '',
    planTier:     'free',             // default plan
    createdAt:    serverTimestamp(),
    updatedAt:    serverTimestamp(),
    emailVerified: user.emailVerified,
  });

  console.log('[SIGNUP] User document created in Firestore:', user.uid);
  return user;
}
```

---

### Fix B2 — Create Document on Google/OAuth Sign-In

For OAuth providers (Google, GitHub, etc.), users can sign in without going through your signup form. Handle this with `getDoc` to check if the document already exists before creating it:

```js
// auth/socialLogin.js

import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  // Check if Firestore document already exists (returning user)
  const userDocRef = doc(db, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    // First-time Google sign-in — create the document
    await setDoc(userDocRef, {
      uid:           user.uid,
      email:         user.email,
      displayName:   user.displayName || '',
      photoURL:      user.photoURL || '',
      planTier:      'free',
      createdAt:     serverTimestamp(),
      updatedAt:     serverTimestamp(),
      emailVerified: user.emailVerified,
      provider:      'google',
    });
    console.log('[GOOGLE AUTH] New user document created:', user.uid);
  } else {
    // Returning user — optionally sync latest profile info from Google
    await setDoc(userDocRef, {
      displayName:   user.displayName || '',
      photoURL:      user.photoURL || '',
      emailVerified: user.emailVerified,
      updatedAt:     serverTimestamp(),
    }, { merge: true }); // merge: true prevents overwriting planTier or other fields
    console.log('[GOOGLE AUTH] Returning user:', user.uid);
  }

  return user;
}
```

---

### Fix B3 — Backfill Existing Auth Users Who Have No Firestore Document

If you already have users in Firebase Auth but no corresponding Firestore documents, run this one-time backfill script from your backend (requires Admin SDK):

```js
// scripts/backfillUsers.js
// Run with: node scripts/backfillUsers.js
// WARNING: Run once only. Check Firestore before running.

import admin from 'firebase-admin';
import '../services/firebaseService.js'; // triggers admin init

const db   = admin.firestore();
const auth = admin.auth();

async function backfillUsers() {
  let nextPageToken;
  let totalProcessed = 0;
  let totalCreated   = 0;
  let totalSkipped   = 0;

  console.log('[BACKFILL] Starting user backfill...');

  do {
    // List users in batches of 1000 (Firebase max per page)
    const listResult = await auth.listUsers(1000, nextPageToken);

    for (const userRecord of listResult.users) {
      totalProcessed++;

      const userDocRef = db.collection('users').doc(userRecord.uid);
      const userDocSnap = await userDocRef.get();

      if (userDocSnap.exists) {
        console.log(`[SKIP] ${userRecord.email} — document already exists`);
        totalSkipped++;
        continue;
      }

      // Create missing Firestore document
      await userDocRef.set({
        uid:           userRecord.uid,
        email:         userRecord.email || '',
        displayName:   userRecord.displayName || '',
        photoURL:      userRecord.photoURL || '',
        planTier:      'free',
        createdAt:     admin.firestore.Timestamp.fromDate(
                         new Date(userRecord.metadata.creationTime)
                       ),
        updatedAt:     admin.firestore.FieldValue.serverTimestamp(),
        emailVerified: userRecord.emailVerified,
        note:          'Backfilled from Auth — review planTier manually if user had paid plan',
      });

      console.log(`[CREATED] ${userRecord.email} (${userRecord.uid})`);
      totalCreated++;
    }

    nextPageToken = listResult.pageToken;
  } while (nextPageToken);

  console.log('─'.repeat(50));
  console.log(`[BACKFILL COMPLETE]`);
  console.log(`  Total Auth users processed : ${totalProcessed}`);
  console.log(`  Firestore documents created: ${totalCreated}`);
  console.log(`  Already existed (skipped)  : ${totalSkipped}`);
  process.exit(0);
}

backfillUsers().catch(err => {
  console.error('[BACKFILL ERROR]', err);
  process.exit(1);
});
```

---

### Fix B4 — Firestore Security Rules Blocking Reads

Even if the documents exist, you won't see them in the Firebase Console if rules prevent all reads. Check your Firestore rules — they should allow authenticated reads of own document:

**Correct rules:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      // User can read and write only their own document
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /payments/{paymentId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if false; // admin SDK only
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

> **Note:** Firebase Console reads bypass security rules when you're logged in as an owner/editor. So if the console shows empty, it's not a rules issue — the documents genuinely don't exist.

---

## SCENARIO C — Both Auth and Firestore Are Empty

This almost always means one of:

1. **Wrong project** — your frontend is writing to `project-dev` but you're viewing `project-prod` in console (or vice versa)
2. **Firebase config object is wrong** — double check every field in your `firebaseConfig`
3. **App is using emulators** — if `connectAuthEmulator()` or `connectFirestoreEmulator()` is called in dev, all data goes to your local emulator, not the real Firebase

**Check for emulator connections in your firebase.js:**

```js
// ⚠️ If these lines exist and are not wrapped in a dev-only condition, 
// all your data is going to localhost emulators, not real Firebase

if (process.env.NODE_ENV === 'development') {  // ← must be gated like this
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}

// ❌ BAD — ungated emulator connections send ALL data to local emulator
connectAuthEmulator(auth, 'http://localhost:9099');
connectFirestoreEmulator(db, 'localhost', 8080);
```

If emulators are running and ungated, disable them or gate behind `NODE_ENV === 'development'` and redeploy.

---

## Post-Fix: Confirm Users Appear

After applying fixes, run through this checklist:

- [ ] Register a new test user in your app
- [ ] Check Firebase Console → Authentication → Users tab — should appear within seconds
- [ ] Check Firebase Console → Firestore → `users` collection — document with matching UID should exist
- [ ] Confirm document has `planTier: "free"` and correct `email`, `displayName`
- [ ] Sign in with Google (if supported) — confirm document is created on first login, not duplicated on second
- [ ] Backfill script run for existing auth users with missing Firestore docs
- [ ] Affected paying user's `planTier` manually set to `"pro"` in Firestore (from previous payment failure)