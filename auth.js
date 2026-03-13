/* ============================================================
   js/auth.js — Firebase Google Sign-In for Login Modal
   ============================================================
   ⚠️  IMPORTANT: Replace the firebaseConfig object below with
       your own Firebase project credentials from:
       https://console.firebase.google.com → Project Settings → Web App
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

// Initialise Firebase (guard against double-init if included elsewhere)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

/* ---- Sign In ---- */
function signInWithGoogle() {
    auth.signInWithPopup(googleProvider)
        .then((result) => {
            // Auth state listener below will update the UI
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

/* ---- Auth State Listener — updates modal UI ---- */
auth.onAuthStateChanged((user) => {
    const signInBtn = document.getElementById('googleSignInBtn');
    const signedInDiv = document.getElementById('signedInState');
    const userAvatar = document.getElementById('userAvatar');
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');

    if (user) {
        // Signed in → show user card, hide sign-in button
        if (signInBtn) signInBtn.style.display = 'none';
        if (signedInDiv) signedInDiv.style.display = 'block';
        if (userAvatar) userAvatar.src = user.photoURL || '';
        if (userNameEl) userNameEl.textContent = user.displayName || 'Tech Verse Member';
        if (userEmailEl) userEmailEl.textContent = user.email || '';
    } else {
        // Signed out → show sign-in button, hide user card
        if (signInBtn) signInBtn.style.display = 'flex';
        if (signedInDiv) signedInDiv.style.display = 'none';
    }
});

/* ---- Close modal on backdrop click ---- */
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('loginModal');
    const card = document.getElementById('loginCard');
    if (modal && card) {
        modal.addEventListener('click', (e) => {
            if (!card.contains(e.target)) {
                modal.style.display = 'none';
            }
        });
    }
});
