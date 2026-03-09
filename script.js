/* ── Navbar ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', scrollY > 20), { passive: true });

/* ── Mobile nav ── */
const toggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

/* ── Typewriter ── */
const roles = [
    'Postdoctoral Researcher @ CNES',
    '3D Team Lead @ Velmeni',
    'PhD · Computational Imaging',
    'Spectral Imaging Specialist',
    'Co-Owner @ Spektralion',
];
let ri = 0, ci = 0, del = false;
const roleEl = document.getElementById('role-text');
function type() {
    const s = roles[ri];
    roleEl.textContent = del ? s.slice(0, --ci) : s.slice(0, ++ci);
    let d = del ? 38 : 72;
    if (!del && ci === s.length)   { d = 2000; del = true; }
    if (del  && ci === 0)          { del = false; ri = (ri + 1) % roles.length; d = 350; }
    setTimeout(type, d);
}
type();

/* ── Hero particle canvas ── */
(function () {
    const c = document.getElementById('hero-canvas');
    const ctx = c.getContext('2d');
    let W, H, pts = [];

    function resize() { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; }

    function Pt() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.vx = (Math.random() - .5) * .28;
        this.vy = (Math.random() - .5) * .28;
        this.r  = Math.random() * 1.1 + .3;
        this.a  = Math.random() * .45 + .08;
        // Hue spread: teal (175°) → violet (270°)
        this.hue = 175 + Math.random() * 95;
    }

    function init() { resize(); pts = Array.from({ length: 140 }, () => new Pt()); }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        pts.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue},90%,65%,${p.a})`;
            ctx.fill();
        });
        // Connections
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
                const d = Math.sqrt(dx*dx + dy*dy);
                if (d < 90) {
                    const alpha = .1 * (1 - d / 90);
                    const mid = (pts[i].hue + pts[j].hue) / 2;
                    ctx.beginPath();
                    ctx.moveTo(pts[i].x, pts[i].y);
                    ctx.lineTo(pts[j].x, pts[j].y);
                    ctx.strokeStyle = `hsla(${mid},80%,60%,${alpha})`;
                    ctx.lineWidth = .7;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    window.addEventListener('resize', resize, { passive: true });
    init(); draw();
})();

/* ── Starfield in research card ── */
(function () {
    const sf = document.getElementById('starfield');
    if (!sf) return;
    for (let i = 0; i < 60; i++) {
        const s = document.createElement('div');
        const size = Math.random() * 1.5 + .4;
        Object.assign(s.style, {
            position: 'absolute',
            width: size + 'px', height: size + 'px',
            borderRadius: '50%',
            background: `rgba(255,255,255,${Math.random() * .7 + .1})`,
            left: Math.random() * 100 + '%',
            top:  Math.random() * 60 + '%',
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 3}s infinite`,
        });
        sf.appendChild(s);
    }
})();

// Add twinkle keyframes dynamically
(function () {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes twinkle {
            0%,100% { opacity:.2; transform:scale(1); }
            50%      { opacity:1;  transform:scale(1.4); }
        }
    `;
    document.head.appendChild(style);
})();

/* ── Scroll reveal ── */
const revealObs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
        if (!e.isIntersecting) return;
        setTimeout(() => e.target.classList.add('revealed'), 0);
        revealObs.unobserve(e.target);
    });
}, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el, i) => {
    // Stagger siblings
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    revealObs.observe(el);
});

/* ── Stats counter ── */
const statsObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll('.stat-n').forEach(el => {
            const target = +el.dataset.to, dur = 1200, start = performance.now();
            function tick(now) {
                const p = Math.min((now - start) / dur, 1);
                const ease = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * ease);
                if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
        statsObs.unobserve(e.target);
    });
}, { threshold: .5 });
const bar = document.querySelector('.stats-bar');
if (bar) statsObs.observe(bar);

/* ── 3D tilt on cards ── */
document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
        const y = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
        card.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateZ(4px)`;
        card.style.boxShadow = `${-x * 8}px ${y * 8}px 30px rgba(0,229,204,.08)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
    });
});

/* ── Animated gradient border on featured project ── */
(function () {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes border-flow {
            0%,100% { background-position: 0% 50%; }
            50%      { background-position: 100% 50%; }
        }
        .proj-card--featured::before {
            content: '';
            position: absolute; inset: 0; border-radius: 14px; padding: 1px;
            background: linear-gradient(135deg, #00e5cc, #9d7bea, #fb923c, #00e5cc);
            background-size: 300% 300%;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: destination-out;
            mask-composite: exclude;
            animation: border-flow 4s ease infinite;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
})();

/* ── Bibtex database ── */
const bibtexDB = {
    fsian2025deep: `@article{fsian2025deep,
  title     = {Deep Joint Demosaicking and Super-Resolution for Spectral Filter Array Images},
  author    = {Fsian, Abdelhamid Nour-Eddine and Thomas, Jean-Baptiste and Hardeberg, Jon Yngve and Gouton, Pierre},
  journal   = {IEEE Access},
  volume    = {13},
  year      = {2025},
  doi       = {10.1109/ACCESS.2025.3528753}
}`,
    fsian2024spectral: `@article{fsian2024spectral,
  title     = {Spectral Reconstruction from RGB Imagery: A Potential Option for Infinite Spectral Data?},
  author    = {Fsian, Abdelhamid Nour-Eddine and Thomas, Jean-Baptiste and Hardeberg, Jon Yngve and Gouton, Pierre},
  journal   = {Sensors},
  volume    = {24},
  year      = {2024},
  doi       = {10.3390/s24113666}
}`,
    fsian2025stitching: `@inproceedings{fsian2025stitching,
  title     = {Stitching from Spectral Filter Array Video Sequences},
  author    = {Fsian, Abdelhamid Nour-Eddine and others},
  booktitle = {Computational Color Imaging Workshop (CCIW 2024), Springer LNCS},
  volume    = {15193},
  year      = {2025},
  doi       = {10.1007/978-3-031-72845-7_10}
}`,
    fsian2023bayesian: `@inproceedings{fsian2023bayesian,
  title     = {Bayesian Multispectral Videos Super Resolution},
  author    = {Fsian, Abdelhamid Nour-Eddine and others},
  booktitle = {11th European Workshop on Visual Information Processing (EUVIP 2023)},
  year      = {2023},
  doi       = {10.1109/EUVIP58404.2023.10323068}
}`,
    fsian2025apple: `@inproceedings{fsian2025apple,
  title     = {Apple Bruise Detection using Multispectral Imaging},
  author    = {Fsian, Abdelhamid Nour-Eddine and Khawaja, Muhammad Atif and others},
  booktitle = {ICDIP 2025, Proceedings of SPIE},
  volume    = {13709},
  year      = {2025},
  doi       = {10.1117/12.3075704}
}`,
    fsian2025unified: `@article{fsian2025unified,
  title     = {Unified Method for Image Reconstruction and Super-Resolution of SFA Video Sequences},
  author    = {Fsian, Abdelhamid Nour-Eddine and others},
  journal   = {EURASIP Journal on Image and Video Processing},
  note      = {Under Review},
  year      = {2025}
}`
};

/* ── Bibtex popup ── */
(function () {
    const popup  = document.getElementById('bib-popup');
    const content = document.getElementById('bib-content');
    const closeBtn = document.getElementById('bib-close');
    const copyBtn  = document.getElementById('bib-copy');

    function openBib(key) {
        content.textContent = bibtexDB[key] || '% BibTeX entry not available';
        popup.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeBib() {
        popup.classList.remove('open');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.pub-btn--bib').forEach(btn => {
        btn.addEventListener('click', () => openBib(btn.dataset.bibKey));
    });
    if (closeBtn) closeBtn.addEventListener('click', closeBib);
    if (popup) popup.addEventListener('click', e => { if (e.target === popup) closeBib(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBib(); });

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = content.textContent;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    copyBtn.textContent = 'Copied ✓';
                    setTimeout(() => { copyBtn.textContent = 'Copy to Clipboard'; }, 2000);
                });
            } else {
                const el = document.createElement('textarea');
                el.value = text;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                copyBtn.textContent = 'Copied ✓';
                setTimeout(() => { copyBtn.textContent = 'Copy to Clipboard'; }, 2000);
            }
        });
    }
})();

/* ── Active nav link highlight ── */
const sections = document.querySelectorAll('section[id], header[id]');
const navAs = document.querySelectorAll('.nav-links a');
const activeObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            navAs.forEach(a => {
                const active = a.getAttribute('href') === `#${e.target.id}`;
                a.style.color = active ? 'var(--t)' : '';
            });
        }
    });
}, { rootMargin: '-35% 0px -60% 0px' });
sections.forEach(s => activeObs.observe(s));
