# PLAN 06: PWA & Notifications

## Existing Implementation (Reference)

**Files created:**
- `nuxt.config.ts` - PWA configuration
- `public/firebase-messaging-sw.js` - Service worker
- `app/composables/useNotifications.ts` - FCM client

---

## Task 6.1: Firebase Setup

**Step 1: Create Firebase project**
- Go to https://console.firebase.google.com
- Create project: `child-health-journal`
- Disable Google Analytics (optional for MVP)

**Step 2: Enable Cloud Messaging**
- Build > Cloud Messaging
- Get Server key (for backend)

**Step 3: Add web app**
- Project Settings > General > Your apps
- Click web icon (</>)
- Register app: `child-health-journal-web`
- Copy config values to `.env`

**Step 4: Generate VAPID key**
- Project Settings > Cloud Messaging
- Web Push certificates > Generate key pair
- Copy key to `NUXT_PUBLIC_FIREBASE_VAPID_KEY`

---

## Task 6.2: Update Service Worker

**Files:**
- Modify: `public/firebase-messaging-sw.js`

Replace placeholder config:
```javascript
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
})
```

---

## Task 6.3: Test PWA Installation

**Step 1: Build for production**
```bash
npm run build
npm run preview
```

**Step 2: Install on mobile**
- Open in Chrome mobile
- Menu > "Add to Home Screen"
- Verify: App icon appears, opens in standalone mode

---

## Task 6.4: Test Notifications

**Step 1: Enable notifications**
- Go to `/settings`
- Click "Enable" for Push Notifications
- Allow browser permission

**Step 2: Verify token saved**
- Check Supabase: `push_subscriptions` table has entry
