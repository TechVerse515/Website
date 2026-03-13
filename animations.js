/* ============================================================
   js/animations.js — Scroll Fade-In & Parallax Animations
   ============================================================ */

// --- Fade-in on scroll (cards, headings, etc.) ---
const fadeObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

// Add fade-in class to all major elements then observe them
document.querySelectorAll(
    '.stat-card, .impact-card, .testimonial-card, .course-card, .section-heading'
).forEach((el) => {
    el.classList.add('fade-in');
    fadeObserver.observe(el);
});

// --- Stagger delays for groups of cards ---
document.querySelectorAll('.stats-grid        .stat-card').forEach((el, i) => { el.style.transitionDelay = `${i * 0.08}s`; });
document.querySelectorAll('.testimonials-grid .testimonial-card').forEach((el, i) => { el.style.transitionDelay = `${i * 0.08}s`; });
document.querySelectorAll('.impact-cards      .impact-card').forEach((el, i) => { el.style.transitionDelay = `${i * 0.10}s`; });

// --- Hero parallax on scroll ---
const heroContent = document.querySelector('.hero-content');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (heroContent && scrollY < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrollY * 0.12}px)`;
        heroContent.style.opacity = `${1 - scrollY / 650}`;
    }
});
