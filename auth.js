/* ============================================================
   js/auth.js — Firebase Google Sign-In + Firestore User Setup
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

/* ---- Save / update user document in Firestore ---- */
async function saveUserToFirestore(user) {
    const userRef = db.collection('users').doc(user.uid);
    const doc = await userRef.get();

    if (!doc.exists) {
        // New user → create document with all fields
        await userRef.set({
            displayName : user.displayName || '',
            email       : user.email       || '',
            photoURL    : user.photoURL    || '',
            createdAt   : firebase.firestore.FieldValue.serverTimestamp(),
            skills      : {
                dsa       : 0,
                htmlcss   : 0,
                javascript: 0,
                react     : 0,
                nodejs    : 0,
                python    : 0
            }
        });
        console.log('New user document created in Firestore:', user.uid);
    } else {
        // Returning user → keep existing skills but refresh profile info
        await userRef.update({
            displayName : user.displayName || doc.data().displayName,
            email       : user.email       || doc.data().email,
            photoURL    : user.photoURL    || doc.data().photoURL
        });
        console.log('Existing user document updated in Firestore:', user.uid);
    }
}

/* ---- Sign In ---- */
function signInWithGoogle() {
    auth.signInWithPopup(googleProvider)
        .then((result) => {
            // Firestore write happens in onAuthStateChanged
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

/* ---- Auth State Listener — updates modal UI + writes to Firestore ---- */
auth.onAuthStateChanged((user) => {
    const signInBtn   = document.getElementById('googleSignInBtn');
    const signedInDiv = document.getElementById('signedInState');
    const userAvatar  = document.getElementById('userAvatar');
    const userNameEl  = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');

    if (user) {
        // Write / update Firestore user document
        saveUserToFirestore(user);

        // Update modal UI
        if (signInBtn)   signInBtn.style.display  = 'none';
        if (signedInDiv) signedInDiv.style.display = 'block';
        if (userAvatar)  userAvatar.src            = user.photoURL || '';
        if (userNameEl)  userNameEl.textContent    = user.displayName || 'Tech Verse Member';
        if (userEmailEl) userEmailEl.textContent   = user.email || '';
    } else {
        // Signed out
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
            if (!card.contains(e.target)) {
                modal.style.display = 'none';
            }
        });
    }
});
