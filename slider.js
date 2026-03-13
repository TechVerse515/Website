/* ============================================================
   SLIDER.JS — 3D Ring Carousel (clockwise-only endless loop)
   ============================================================ */

(function () {
    const stage = document.getElementById('sliderStage');
    const dotsEl = document.getElementById('sliderDots');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');

    if (!stage) return;

    const slides = Array.from(stage.querySelectorAll('.slide'));
    const N = slides.length;                   // 8
    const CARD_W = 220;
    const STEP = 360 / N;                         // degrees between slides
    const AUTO_MS = 3000;

    /* ── Radius of the 3D ring ── */
    const radius = Math.round((CARD_W * 1.35) / (2 * Math.tan(Math.PI / N)));

    /* ── Place every slide on the ring (they never move individually) ── */
    slides.forEach((slide, i) => {
        slide.style.transform = `rotateY(${STEP * i}deg) translateZ(${radius}px)`;
    });

    /* ── Running angle — only ever DECREASES (clockwise) ── */
    let cumulativeAngle = 0;

    /* ── Build dots ── */
    const dots = slides.map((_, i) => {
        const btn = document.createElement('button');
        btn.className = 'slider-dot';
        btn.setAttribute('aria-label', `Slide ${i + 1}`);
        dotsEl.appendChild(btn);
        return btn;
    });

    /* ── Which slide index is currently at the front ── */
    function currentIndex() {
        return (Math.round(-cumulativeAngle / STEP) % N + N) % N;
    }

    /* ── Update active states without changing angle ── */
    function updateActive() {
        const idx = currentIndex();
        slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
        dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    }

    /* ── Rotate one step clockwise ── */
    function stepForward() {
        cumulativeAngle -= STEP;
        stage.style.transform = `rotateY(${cumulativeAngle}deg)`;
        updateActive();
    }

    /* ── Jump clockwise to an arbitrary target index ── */
    function jumpTo(targetIdx) {
        const cur = currentIndex();
        /* how many clockwise steps to reach target? */
        let steps = ((targetIdx - cur) % N + N) % N;
        if (steps === 0) return;          // already there
        cumulativeAngle -= STEP * steps;
        stage.style.transform = `rotateY(${cumulativeAngle}deg)`;
        updateActive();
    }

    /* ── Dot clicks → jump clockwise to that slide ── */
    dots.forEach((btn, i) => {
        btn.addEventListener('click', () => { stopAuto(); jumpTo(i); startAuto(); });
    });

    /* ── Slide click → jump clockwise to that slide ── */
    slides.forEach((s, i) => {
        s.addEventListener('click', () => { stopAuto(); jumpTo(i); startAuto(); });
    });

    /* ── Buttons: BOTH go clockwise ──
       Next = one step forward.
       Prev = N−1 steps forward (same as going back one, but clockwise). */
    if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); stepForward(); startAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', () => {
        stopAuto();
        /* clockwise "back" = advance N-1 steps */
        cumulativeAngle -= STEP * (N - 1);
        stage.style.transform = `rotateY(${cumulativeAngle}deg)`;
        updateActive();
        startAuto();
    });

    /* ── Keyboard ── */
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            stopAuto(); stepForward(); startAuto();
        }
    });

    /* ── Touch / swipe (always clockwise) ── */
    let tx = 0;
    stage.addEventListener('touchstart', e => { tx = e.touches[0].clientX; stopAuto(); }, { passive: true });
    stage.addEventListener('touchend', e => {
        /* swipe left OR right → clockwise step */
        if (Math.abs(tx - e.changedTouches[0].clientX) > 40) stepForward();
        startAuto();
    }, { passive: true });

    /* ── Auto-play ── */
    let timer = null;
    function startAuto() { timer = setInterval(stepForward, AUTO_MS); }
    function stopAuto() { clearInterval(timer); }

    /* Pause on hover */
    stage.addEventListener('mouseenter', stopAuto);
    stage.addEventListener('mouseleave', startAuto);

    /* ── Kick off ── */
    updateActive();
    startAuto();
})();
