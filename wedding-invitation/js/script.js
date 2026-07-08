document.addEventListener('DOMContentLoaded', () => {
    setupGate();
    setupMusic();
    setupScrollAnimations();
    setupScratchCards();
    setupCountdown();
    setupRSVP();
    setupParticleTrail();
});

/* ===== Gate Opening ===== */
function setupGate() {
    const gate = document.getElementById('gateSection');
    const openBtn = document.getElementById('openBtn');
    const music = document.getElementById('bgMusic');

    if (!gate || !openBtn) return;

    openBtn.addEventListener('click', () => {
        gate.classList.add('opening');
        document.body.classList.add('invitation-open');

        if (music) {
            music.volume = 0.25;
            music.play().catch(() => {});
            updateMusicState(true);
        }

        setTimeout(() => {
            gate.classList.add('hidden');
        }, 1600);
    });
}

/* ===== Background Music ===== */
let isPlaying = false;
let manualPaused = false;

function setupMusic() {
    const music = document.getElementById('bgMusic');
    const toggle = document.getElementById('musicToggle');
    const icon = document.getElementById('musicIcon');

    if (!music || !toggle) return;

    toggle.addEventListener('click', () => {
        if (isPlaying) {
            music.pause();
            isPlaying = false;
            manualPaused = true;
        } else {
            music.play().catch(() => {});
            isPlaying = true;
            manualPaused = false;
        }
        updateMusicState(isPlaying);
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isPlaying) {
            music.pause();
        } else if (!document.hidden && isPlaying && !manualPaused) {
            music.play().catch(() => {});
        }
    });
}

function updateMusicState(playing) {
    const toggle = document.getElementById('musicToggle');
    const icon = document.getElementById('musicIcon');
    isPlaying = playing;

    if (toggle) {
        toggle.classList.toggle('muted', !playing);
    }
    if (icon) {
        icon.textContent = playing ? '♪' : '♫';
    }
}

/* ===== Scroll Animations ===== */
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
}

/* ===== Scratch Cards ===== */
function setupScratchCards() {
    const canvases = document.querySelectorAll('.scratch-canvas');
    let completedCount = 0;

    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        let isDrawing = false;
        let isCompleted = false;
        let lastX = 0;
        let lastY = 0;

        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        let gradient;
        if (ctx.createConicGradient) {
            gradient = ctx.createConicGradient(0, cx, cy);
            gradient.addColorStop(0, '#e8c96a');
            gradient.addColorStop(0.2, '#c9a227');
            gradient.addColorStop(0.4, '#f5ecd3');
            gradient.addColorStop(0.6, '#a8861e');
            gradient.addColorStop(0.8, '#e8c96a');
            gradient.addColorStop(1, '#c9a227');
        } else {
            gradient = ctx.createRadialGradient(cx, cy, 5, cx, cy, cx);
            gradient.addColorStop(0, '#f5ecd3');
            gradient.addColorStop(1, '#c9a227');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        for (let i = 0; i < 300; i++) {
            ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
        }

        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 20;

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = w / rect.width;
            const scaleY = h / rect.height;
            let clientX, clientY;

            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        }

        function scratch(e) {
            if (!isDrawing || isCompleted) return;
            e.preventDefault();
            const pos = getPos(e);
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            lastX = pos.x;
            lastY = pos.y;
            checkDone();
        }

        function startDraw(e) {
            isDrawing = true;
            const pos = getPos(e);
            lastX = pos.x;
            lastY = pos.y;
        }

        function stopDraw() {
            isDrawing = false;
        }

        function checkDone() {
            const imageData = ctx.getImageData(0, 0, w, h);
            const pixels = imageData.data;
            let transparent = 0;

            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] === 0) transparent++;
            }

            const percent = (transparent / (w * h)) * 100;
            if (percent > 45 && !isCompleted) {
                isCompleted = true;
                canvas.style.opacity = '0';
                canvas.style.transition = 'opacity 0.4s';
                setTimeout(() => { canvas.style.display = 'none'; }, 400);
                completedCount++;
                if (completedCount === canvases.length && typeof confetti === 'function') {
                    confetti({
                        particleCount: 80,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#0d5c4a', '#c9a227', '#e8c96a', '#faf7f0']
                    });
                }
            }
        }

        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', scratch);
        canvas.addEventListener('mouseup', stopDraw);
        canvas.addEventListener('mouseleave', stopDraw);
        canvas.addEventListener('touchstart', startDraw, { passive: false });
        canvas.addEventListener('touchmove', scratch, { passive: false });
        canvas.addEventListener('touchend', stopDraw);
    });
}

/* ===== Countdown ===== */
function setupCountdown() {
    const target = new Date('August 6, 2026 12:30:00').getTime();
    const els = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    };

    function pad(n) {
        return n < 10 ? '0' + n : String(n);
    }

    const timer = setInterval(() => {
        const now = Date.now();
        const diff = target - now;

        if (diff < 0) {
            clearInterval(timer);
            return;
        }

        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        if (els.days) els.days.textContent = pad(d);
        if (els.hours) els.hours.textContent = pad(h);
        if (els.minutes) els.minutes.textContent = pad(m);
        if (els.seconds) els.seconds.textContent = pad(s);
    }, 1000);
}

/* ===== RSVP ===== */
function setupRSVP() {
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const message = document.getElementById('rsvpMessage');

    if (!yesBtn || !noBtn || !message) return;

    yesBtn.addEventListener('click', (e) => {
        message.textContent = 'Alhamdulillah! We cannot wait to celebrate with you!';
        message.style.opacity = '1';
        yesBtn.classList.add('happy');
        setTimeout(() => yesBtn.classList.remove('happy'), 500);

        let originX = 0.5, originY = 0.7;
        if (e.target) {
            const rect = e.target.getBoundingClientRect();
            originX = (rect.left + rect.width / 2) / window.innerWidth;
            originY = (rect.top + rect.height / 2) / window.innerHeight;
        }

        if (typeof confetti === 'function') {
            confetti({
                particleCount: 100,
                spread: 80,
                origin: { x: originX, y: originY },
                colors: ['#0d5c4a', '#c9a227', '#e8c96a', '#ffffff'],
                zIndex: 9999
            });
        }
    });

    noBtn.addEventListener('click', () => {
        message.textContent = 'We will keep you in our duas. Jazakallahu Khair for letting us know.';
        message.style.opacity = '1';
        noBtn.classList.add('sad');
        setTimeout(() => noBtn.classList.remove('sad'), 400);
    });
}

/* ===== Gold Particle Trail ===== */
function setupParticleTrail() {
    const symbols = ['✦', '♡', '☪'];
    let throttle = 0;

    function spawn(e) {
        const now = Date.now();
        if (now - throttle < 80) return;
        throttle = now;

        let x, y;
        if (e.touches && e.touches.length > 0) {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        } else if (e.clientX !== undefined) {
            x = e.clientX;
            y = e.clientY;
        } else {
            return;
        }

        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1200);
    }

    document.addEventListener('mousemove', spawn);
    document.addEventListener('touchmove', spawn, { passive: true });
}
