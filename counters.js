/* ============================================================
   js/counters.js — Animated Number Counters (Stats Section)
   ============================================================ */

/**
 * Animates a number from 0 up to `target` over `duration` ms.
 * @param {HTMLElement} el       - The element to update
 * @param {number}      target   - The final value
 * @param {string}      suffix   - Text appended after the number (e.g. 'k')
 * @param {number}      duration - Animation duration in ms (default: 1800)
 */
function animateCounter(el, target, suffix = '', duration = 1800) {
    let startTime = null;

    function update(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.floor(eased * target);

        el.textContent = current + suffix;

        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

// Only trigger counters when the stats section scrolls into view
const counterObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            const text = el.textContent.trim();

            // Map stat text → counter target & suffix
            if (text === '600k') animateCounter(el, 600, 'k');
            // "01 Million" keeps its static text — add more cases here if needed

            counterObserver.unobserve(el); // only animate once
        });
    },
    { threshold: 0.5 }
);

document.querySelectorAll('.stat-number').forEach((el) => {
    counterObserver.observe(el);
});
