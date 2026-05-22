# Firebase Setup Guide for Car Guesser Multiplayer

## Overview
This guide will help you set up Firebase for the Car Guesser game with Google authentication and multiplayer features.

---

## STEP 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/
2. Sign in with your Google account
3. Click the blue **"Create Project"** button

---

## STEP 2: Create a New Project
1. Project name: **"Car-Guesser"**
2. Click **Continue**
3. "Enable Google Analytics for this project" → Leave as is (optional)
4. Click **"Create Project"**
5. Wait for it to finish (1-2 minutes)

---

## STEP 3: Enable Google Sign-In
1. In left sidebar → **"Authentication"**
2. Click **"Get Started"**
3. Under "Sign-in Method" → Click **"Google"**
4. Toggle **"Enable"** to ON
5. Set **"Project support email"** (your email)
6. Click **"Save"**

---

## STEP 4: Create Firestore Database
1. In left sidebar → **"Firestore Database"**
2. Click **"Create Database"**
3. Choose region: **"us-central1"** (or closest to you)
4. Click **"Next"**
5. Select: **"Start in test mode"**
6. Click **"Create"**
7. Wait for initialization (1-2 minutes)

---

## STEP 5: Get Your Firebase Config
1. Click gear icon (⚙️) in top left → **"Project Settings"**
2. Go to **"Your apps"** section
3. If you don't see a Web app, click **"</> Web"**
4. Copy the entire Firebase config object

Your config will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "car-guesser-xxxxx.firebaseapp.com",
  projectId: "car-guesser-xxxxx",
  storageBucket: "car-guesser-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**Save this config - you'll need it!**

---

## STEP 6: Add localhost to Authorized Domains
1. Go to: **Authentication → Settings tab**
2. Scroll to **"Authorized domains"**
3. Click **"Add domain"**
4. Type: **localhost**
5. Click **"Add"**

---

## STEP 7: Set Firestore Security Rules (Optional for now)
For testing, we use "Test Mode" which allows all reads/writes. Later, we'll secure it.

---

## ✅ You're Done with Firebase Setup!

**Next Steps:**
1. Save your Firebase config
2. Come back and provide the config to integrate it into the game
3. I'll create:
   - Login page with Google Sign-In
   - User dashboard with leaderboard
   - Multiplayer competitive mode
   - Real-time score syncing

---

## Troubleshooting

**"Sign-in method not available"**
- Make sure you're in the correct project
- Refresh the Firebase console

**"Authorization failed"**
- Check that localhost is added to authorized domains
- Clear browser cookies and try again

**"Firestore Database not showing"**
- Refresh the page
- Make sure you're in the correct region

---

**Ready?** Paste your Firebase config in the chat and we'll proceed.
