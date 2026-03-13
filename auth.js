/* ============================================================
   js/auth.js — Firebase Google Sign-In + Toast Notifications
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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

/* ============================================================
   TOAST NOTIFICATION SYSTEM
   ============================================================ */
function showToast(type, title, message) {
    // Remove any existing toast
    const old = document.getElementById('tvToast');
    if (old) old.remove();

    const isSuccess = type === 'success';

    const toast = document.createElement('div');
    toast.id = 'tvToast';
    toast.innerHTML = `
        <div class="tv-toast-icon">${isSuccess ? successIcon() : errorIcon()}</div>
        <div class="tv-toast-body">
            <p class="tv-toast-title">${title}</p>
            <p class="tv-toast-msg">${message}</p>
        </div>
        <div class="tv-toast-progress"></div>
    `;

    // Inline base styles (type-specific colours set via class)
    toast.className = `tv-toast tv-toast--${type}`;
    document.body.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('tv-toast--visible'));
    });

    // Auto-dismiss after 4 s
    setTimeout(() => {
        toast.classList.remove('tv-toast--visible');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 4000);
}

function successIcon() {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="7 12.5 10.5 16 17 9"/>
    </svg>`;
}

function errorIcon() {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>`;
}

/* ---- Inject toast CSS once ---- */
(function injectToastStyles() {
    if (document.getElementById('tvToastStyles')) return;
    const style = document.createElement('style');
    style.id = 'tvToastStyles';
    style.textContent = `
        .tv-toast {
            position: fixed;
            bottom: 32px;
            right: 32px;
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 14px;
            min-width: 300px;
            max-width: 380px;
            padding: 16px 20px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.10);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            overflow: hidden;
            transform: translateY(24px) scale(0.96);
            opacity: 0;
            transition: transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275),
                        opacity 0.35s ease;
            font-family: 'Inter', sans-serif;
        }
        .tv-toast--visible {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        .tv-toast--success {
            background: linear-gradient(135deg, rgba(16,32,22,0.96), rgba(10,24,16,0.96));
            border-color: rgba(52,211,153,0.25);
        }
        .tv-toast--error {
            background: linear-gradient(135deg, rgba(32,12,12,0.96), rgba(24,8,8,0.96));
            border-color: rgba(248,113,113,0.25);
        }
        .tv-toast-icon {
            flex-shrink: 0;
            width: 42px;
            height: 42px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .tv-toast--success .tv-toast-icon {
            background: rgba(52,211,153,0.15);
            color: #34d399;
        }
        .tv-toast--error .tv-toast-icon {
            background: rgba(248,113,113,0.15);
            color: #f87171;
        }
        .tv-toast-body {
            flex: 1;
        }
        .tv-toast-title {
            font-size: 14px;
            font-weight: 700;
            margin: 0 0 3px;
            color: #fff;
        }
        .tv-toast-msg {
            font-size: 12px;
            margin: 0;
            line-height: 1.5;
        }
        .tv-toast--success .tv-toast-msg { color: rgba(52,211,153,0.75); }
        .tv-toast--error   .tv-toast-msg { color: rgba(248,113,113,0.75); }

        /* Sliding progress bar at bottom */
        .tv-toast-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            border-radius: 0 0 16px 16px;
            width: 100%;
            transform-origin: left;
            animation: tvProgress 4s linear forwards;
        }
        .tv-toast--success .tv-toast-progress { background: #34d399; }
        .tv-toast--error   .tv-toast-progress { background: #f87171; }

        @keyframes tvProgress {
            from { transform: scaleX(1); }
            to   { transform: scaleX(0); }
        }

        @media (max-width: 480px) {
            .tv-toast {
                bottom: 16px;
                right: 16px;
                left: 16px;
                min-width: unset;
            }
        }
    `;
    document.head.appendChild(style);
})();

/* ============================================================
   SIGN IN / SIGN OUT
   ============================================================ */
function signInWithGoogle() {
    auth.signInWithPopup(googleProvider).catch((error) => {
        console.error('Sign-in error:', error.message);
        showToast(
            'error',
            'Sign-in Failed',
            'Hmm, something went wrong. Please try again! 🔒'
        );
    });
}

function signOutUser() {
    auth.signOut().then(() => {
        // Close the modal if open
        const modal = document.getElementById('loginModal');
        if (modal) modal.style.display = 'none';
    }).catch((error) => {
        console.error('Sign-out error:', error.message);
    });
}

/* ============================================================
   AUTH STATE LISTENER
   ============================================================ */
let firstStateChange = true;

auth.onAuthStateChanged((user) => {
    const signInBtn   = document.getElementById('googleSignInBtn');
    const signedInDiv = document.getElementById('signedInState');
    const userAvatar  = document.getElementById('userAvatar');
    const userNameEl  = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');

    if (user) {
        // --- Update modal: hide sign-in button, show user card ---
        if (signInBtn)   signInBtn.style.display   = 'none';
        if (signedInDiv) signedInDiv.style.display  = 'block';
        if (userAvatar)  userAvatar.src             = user.photoURL || '';
        if (userNameEl)  userNameEl.textContent     = user.displayName || 'Tech Verse Member';
        if (userEmailEl) userEmailEl.textContent    = user.email || '';

        // --- Show success toast only when modal was just used to log in ---
        const modal = document.getElementById('loginModal');
        const modalOpen = modal && modal.style.display === 'flex';
        if (!firstStateChange || modalOpen) {
            const first = user.displayName ? user.displayName.split(' ')[0] : 'Builder';
            showToast(
                'success',
                `Welcome aboard, ${first}! 🚀`,
                'You\'re now part of the Tech Verse community. Let\'s build something great!'
            );
        }
    } else {
        // --- Signed out: show the Google button again, hide user card ---
        if (signInBtn)   signInBtn.style.display   = 'flex';
        if (signedInDiv) signedInDiv.style.display  = 'none';
        if (userAvatar)  userAvatar.src             = '';
        if (userNameEl)  userNameEl.textContent     = '';
        if (userEmailEl) userEmailEl.textContent    = '';
    }

    firstStateChange = false;
});

/* ============================================================
   CLOSE MODAL ON BACKDROP CLICK
   ============================================================ */
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
