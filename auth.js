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
   showToast — small notification banner for debug / status
   ============================================================ */
function showToast(msg, isError = false) {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
        position: 'fixed', bottom: '24px', left: '50%',
        transform: 'translateX(-50%)',
        background: isError ? '#c0392b' : '#27ae60',
        color: '#fff', padding: '12px 24px', borderRadius: '10px',
        fontFamily: 'Inter, sans-serif', fontSize: '13px',
        zIndex: '99999', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        maxWidth: '90vw', textAlign: 'center', pointerEvents: 'none',
        transition: 'opacity 0.4s'
    });
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 4000);
}

/* ============================================================
   saveUserToFirestore
   ============================================================ */
async function saveUserToFirestore(user) {
    const now = new Date();

    const loginDate = now.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
    const loginTime = now.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });

    const userRef = db.collection('users').doc(user.uid);

    try {
        const snap = await userRef.get();

        if (!snap.exists) {
            // First-ever login — create full document
            await userRef.set({
                uid:           user.uid,
                name:          user.displayName || 'Unknown',
                email:         user.email || '',
                photoURL:      user.photoURL || '',
                createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginAt:   firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginDate: loginDate,
                lastLoginTime: loginTime,
            });
        } else {
            // Repeat login — update only login fields, preserve createdAt
            await userRef.update({
                name:          user.displayName || snap.data().name,
                email:         user.email || snap.data().email,
                photoURL:      user.photoURL || snap.data().photoURL,
                lastLoginAt:   firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginDate: loginDate,
                lastLoginTime: loginTime,
            });
        }

        // Push individual login record to loginHistory subcollection
        await userRef.collection('loginHistory').add({
            loginAt:   firebase.firestore.FieldValue.serverTimestamp(),
            loginDate: loginDate,
            loginTime: loginTime,
        });

        console.log('✅ User data saved to Firestore');
        showToast('✅ Logged in & data saved!');

    } catch (err) {
        const msg = err.code === 'permission-denied'
            ? '❌ Firestore rules are blocking writes. Update your Firestore Rules to allow authenticated users.'
            : `❌ Firestore error: ${err.message}`;
        console.error('Firestore write error:', err.code, err.message);
        showToast(msg, true);
    }
}

/* ---- Sign In ---- */
function signInWithGoogle() {
    auth.signInWithPopup(googleProvider)
        .then(() => { /* onAuthStateChanged handles the rest */ })
        .catch((error) => {
            const msg = error.code === 'auth/unauthorized-domain'
                ? '❌ Domain not authorised in Firebase. Open Firebase → Authentication → Authorised Domains and add "localhost" or your domain.'
                : `❌ Sign-in failed: ${error.message}`;
            console.error('Sign-in error:', error.code, error.message);
            showToast(msg, true);
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
        saveUserToFirestore(user);

        if (signInBtn)   signInBtn.style.display  = 'none';
        if (signedInDiv) signedInDiv.style.display = 'block';
        if (userAvatar)  userAvatar.src            = user.photoURL || '';
        if (userNameEl)  userNameEl.textContent    = user.displayName || 'Tech Verse Member';
        if (userEmailEl) userEmailEl.textContent   = user.email || '';
    } else {
        if (signInBtn)   signInBtn.style.display  = 'flex';
        if (signedInDiv) signedInDiv.style.display = 'none';
    }
});

/* ---- Close modal on backdrop click ---- */
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('loginModal');
    const card  = document.getElementById('loginCard');
    if (modal && card) {
        modal.addEventListener('click', (e) => {
            if (!card.contains(e.target)) modal.style.display = 'none';
        });
    }
});
