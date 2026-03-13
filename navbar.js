/* ============================================================
   js/navbar.js — Navbar Scroll Behavior & Active Link Tracking
   ============================================================ */

const navbarWrapper = document.querySelector('.navbar-wrapper');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

// Darken navbar background when user scrolls down
window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        navbarWrapper.style.background = 'rgba(8,8,8,0.85)';
        navbarWrapper.style.backdropFilter = 'blur(24px)';
        navbarWrapper.style.webkitBackdropFilter = 'blur(24px)';
        navbarWrapper.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
    } else {
        navbarWrapper.style.background = 'transparent';
        navbarWrapper.style.backdropFilter = 'none';
        navbarWrapper.style.webkitBackdropFilter = 'none';
        navbarWrapper.style.borderBottom = 'none';
    }
});

// Highlight the active nav link as user scrolls through sections
window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

/* ============================================================
   HAMBURGER MENU TOGGLE
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

function openMenu() {
    hamburger.classList.add('is-open');
    mobileMenu.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
    hamburger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
}

function toggleMenu() {
    mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
}

if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
}

// Close drawer when any mobile link is tapped
mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

// Close on scroll (keeps screen clean)
window.addEventListener('scroll', () => {
    if (mobileMenu && mobileMenu.classList.contains('is-open')) {
        closeMenu();
    }
}, { passive: true });

// Close when tapping outside the navbar
document.addEventListener('click', (e) => {
    if (
        mobileMenu &&
        mobileMenu.classList.contains('is-open') &&
        !navbarWrapper.contains(e.target)
    ) {
        closeMenu();
    }
});

