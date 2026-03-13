/* ============================================================
   js/auth.js — Firebase Google Sign-In + Firestore user logging
   ============================================================ */

const firebaseConfig = {
    apiKey: "AIzaSyCrrGIYe4zPZJGrXt1IK09eAMiEXgrJakM",
    authDomain: "techverse-d5ca4.firebaseapp.com",
    projectId: "techverse-d5ca4",
    storageBucket: "techverse-d5ca4.firebasestorage.app",
    messagingSenderId: "757485819785",
    appId: "1:757485819785:web:eaa2948f3c345512a6f358",
    measurementId: "G-T5M3V5EFCR"
};

// Initialise Firebase (guard against double-init)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db   = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

/* ============================================================
   saveUserToFirestore
   Writes / merges a document in the "users" collection.
   Document ID = the user's Firebase UID (unique, stable).
   - On first login  → creates the document
   - On repeat login → updates lastLoginAt only
   ============================================================ */
async function saveUserToFirestore(user) {
    const now = new Date();

    // Human-readable timestamp strings  (IST offset kept by browser locale)
    const loginDate = now.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
    const loginTime = now.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });

    const userRef = db.collection('users').doc(user.uid);

    try {
        // merge:true → creates the doc if new, updates specific fields if existing
        await userRef.set(
            {
                uid:          user.uid,
                name:         user.displayName || 'Unknown',
                email:        user.email || '',
                photoURL:     user.photoURL  || '',
                // Tracks the very first sign-up (never overwritten on repeat logins)
                createdAt:    firebase.firestore.FieldValue.serverTimestamp(),
                // Always updated to the latest login
                lastLoginAt:  firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginDate: loginDate,
                lastLoginTime: loginTime,
            },
            { merge: true }
        );

        // Also push a record to a subcollection so every login is preserved
        await userRef.collection('loginHistory').add({
            loginAt:   firebase.firestore.FieldValue.serverTimestamp(),
            loginDate: loginDate,
            loginTime: loginTime,
        });

        console.log('✅ User data saved to Firestore');
    } catch (err) {
        console.error('❌ Firestore write error:', err);
    }
}

/* ---- Sign In ---- */
function signInWithGoogle() {
    auth.signInWithPopup(googleProvider)
        .then((result) => {
            // saveUserToFirestore is called inside onAuthStateChanged below
        })
        .catch((error) => {
            console.error('Sign-in error:', error.message);
            alert('Sign-in failed: ' + error.message);
        });
}

/* ---- Sign Out ---- */
function signOutUser() {
    auth.signOut().catch((error) => {
        console.error('Sign-out error:', error.message);
    });
}

/* ---- Auth State Listener — updates modal UI & saves data ---- */
auth.onAuthStateChanged((user) => {
    const signInBtn   = document.getElementById('googleSignInBtn');
    const signedInDiv = document.getElementById('signedInState');
    const userAvatar  = document.getElementById('userAvatar');
    const userNameEl  = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');

    if (user) {
        // Save / update user record in Firestore
        saveUserToFirestore(user);

        // Update modal UI
        if (signInBtn)   signInBtn.style.display   = 'none';
        if (signedInDiv) signedInDiv.style.display  = 'block';
        if (userAvatar)  userAvatar.src             = user.photoURL || '';
        if (userNameEl)  userNameEl.textContent     = user.displayName || 'Tech Verse Member';
        if (userEmailEl) userEmailEl.textContent    = user.email || '';
    } else {
        // Signed out — restore sign-in button
        if (signInBtn)   signInBtn.style.display   = 'flex';
        if (signedInDiv) signedInDiv.style.display  = 'none';
    }
});

/* ---- Close modal on backdrop click ---- */
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('loginModal');
    const card  = document.getElementById('loginCard');
    if (modal && card) {
        modal.addEventListener('click', (e) => {
            if (!card.contains(e.target)) {
                modal.style.display = 'none';
            }
        });
    }
});
