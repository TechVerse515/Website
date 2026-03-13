/* ============================================================
   js/ticker.js — Infinite Company Logo Ticker (pause on hover)
   ============================================================ */

const tickerTrack = document.querySelector('.ticker-track');

if (tickerTrack) {
    // Pause the ticker animation when the user hovers over it
    tickerTrack.addEventListener('mouseenter', () => {
        tickerTrack.style.animationPlayState = 'paused';
    });

    // Resume when they stop hovering
    tickerTrack.addEventListener('mouseleave', () => {
        tickerTrack.style.animationPlayState = 'running';
    });
}
