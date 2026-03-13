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
    const CARD_W = 200;
    const STEP = 360 / N;                         // degrees between slides
    const AUTO_MS = 3000;

    /* ── Radius of the 3D ring ── */
    const radius = Math.round((CARD_W * 1.5) / (2 * Math.tan(Math.PI / N)));

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

    /* ── Rotate one step clockwise (Next) ── */
    function stepForward() {
        cumulativeAngle -= STEP;
        stage.style.transform = `rotateY(${cumulativeAngle}deg)`;
        updateActive();
    }

    /* ── Rotate one step anticlockwise (Prev) ── */
    function stepBack() {
        cumulativeAngle += STEP;
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

    /* ── Buttons: Next = clockwise, Prev = anticlockwise ── */
    if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); stepForward(); startAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); stepBack(); startAuto(); });

    /* ── Keyboard: ArrowRight = next (clockwise), ArrowLeft = prev (anticlockwise) ── */
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { stopAuto(); stepForward(); startAuto(); }
        if (e.key === 'ArrowLeft')  { stopAuto(); stepBack();    startAuto(); }
    });

    /* ── Touch / swipe: swipe left = next, swipe right = prev ── */
    let tx = 0;
    stage.addEventListener('touchstart', e => { tx = e.touches[0].clientX; stopAuto(); }, { passive: true });
    stage.addEventListener('touchend', e => {
        const diff = tx - e.changedTouches[0].clientX;
        if (diff > 40)  { stepForward(); }   // swipe left  → next
        if (diff < -40) { stepBack(); }       // swipe right → prev
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
