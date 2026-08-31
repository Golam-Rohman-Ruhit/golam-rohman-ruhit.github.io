/* ============================================================
   Golam Rohman — Portfolio interactivity
   Particle canvas · animated neural net · typewriter ·
   count-up stats · animated bars · tilt cards · tooltips
   ============================================================ */
"use strict";

const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------------- Particle constellation ---------------- */
function initParticles() {
  const canvas = $("#particles");
  if (!canvas || RM) return;
  const ctx = canvas.getContext("2d");
  const HUES = ["57,135,229", "213,81,129", "25,158,112", "144,133,233", "201,133,0"];
  let w, h, dpr, particles = [];
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.floor(innerWidth * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    const count = Math.max(38, Math.min(105, Math.floor((w * h) / (dpr * dpr) / 26000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35 * dpr,
      vy: (Math.random() - 0.5) * 0.35 * dpr,
      r: (Math.random() * 1.6 + 0.9) * dpr,
      rgb: Math.random() < 0.22 ? HUES[Math.floor(Math.random() * HUES.length)] : "148,163,184",
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    const link = 110 * dpr;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20; else if (p.y > h + 20) p.y = -20;
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const md = Math.hypot(dx, dy);
      if (md < 150 * dpr && md > 0.01) {
        p.x += (dx / md) * 0.9 * dpr;
        p.y += (dy / md) * 0.9 * dpr;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.rgb},0.55)`;
      ctx.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < link) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(148,163,184,${(1 - d / link) * 0.16})`;
          ctx.lineWidth = dpr * 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX * dpr;
    mouse.y = e.clientY * dpr;
  });
  document.addEventListener("visibilitychange", () => {});
  requestAnimationFrame(tick);
}

/* ---------------- Animated neural network (hero SVG) ---------------- */
function initNeuralNet() {
  const svg = $(".neural");
  if (!svg) return;
  const edgesG = $("#nnEdges", svg);
  const nodesG = $("#nnNodes", svg);
  const sigG = $("#nnSignals", svg);
  const NS = "http://www.w3.org/2000/svg";
  const layers = [
    [50, 95, 140, 185, 230].map((y) => [70, y]),
    [70, 120, 170, 220].map((y) => [190, y]),
    [105, 175].map((y) => [310, y]),
  ];
  const allNodes = layers.flat();
  const edgeList = [];

  for (let li = 0; li < layers.length - 1; li++) {
    for (const [x1, y1] of layers[li]) {
      for (const [x2, y2] of layers[li + 1]) {
        edgeList.push([x1, y1, x2, y2]);
      }
    }
  }

  edgeList.forEach(([x1, y1, x2, y2], i) => {
    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", x1); line.setAttribute("y1", y1);
    line.setAttribute("x2", x2); line.setAttribute("y2", y2);
    if (!RM) line.style.animationDelay = `${(i % 12) * -0.4}s`;
    edgesG.appendChild(line);
  });

  allNodes.forEach(([x, y], i) => {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", x); c.setAttribute("cy", y);
    c.setAttribute("r", 6.5);
    if (!RM) c.style.animationDelay = `${(i % 5) * -0.7}s`;
    nodesG.appendChild(c);
  });

  if (RM) return;
  // Travelling signal pulses along random edges
  const chosen = edgeList.filter(() => Math.random() < 0.22).slice(0, 4);
  chosen.forEach(([x1, y1, x2, y2], i) => {
    const dot = document.createElementNS(NS, "circle");
    dot.setAttribute("r", 2.8);
    const anim = document.createElementNS(NS, "animateMotion");
    anim.setAttribute("dur", `${2.2 + (i % 3) * 0.7}s`);
    anim.setAttribute("begin", `${-i * 0.9}s`);
    anim.setAttribute("repeatCount", "indefinite");
    anim.setAttribute("path", `M ${x1} ${y1} L ${x2} ${y2}`);
    dot.appendChild(anim);
    sigG.appendChild(dot);
  });
}

/* ---------------- Typewriter ---------------- */
function initTypewriter() {
  const el = $("#typewriter");
  if (!el || RM) return;
  const roles = [
    "Artificial Intelligence Engineer",
    "Deep Learning Researcher",
    "Medical AI Specialist",
    "Climate AI Engineer",
    "Computer Vision Engineer",
    "Open-Source Contributor",
    "Agentic AI Builder",
  ];
  let ri = 0, ci = 0, deleting = false;

  function step() {
    const word = roles[ri];
    ci += deleting ? -1 : 1;
    el.textContent = word.slice(0, ci);
    let delay = deleting ? 34 : 62;
    if (!deleting && ci === word.length) { delay = 1900; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 420; }
    setTimeout(step, delay);
  }
  step();
}

/* ---------------- Count-up stats ---------------- */
function initCountUp() {
  $$(".stat-num").forEach((el) => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const fmt = (v) => v.toFixed(decimals) + suffix;

    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      if (RM) { el.textContent = fmt(target); return; }
      const t0 = performance.now();
      const dur = 1600;
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 4);
        el.textContent = fmt(target * eased);
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
  });
}

/* ---------------- Animated bars (skill + course charts) ---------------- */
function initBars() {
  // Move the value label out of the fill (so it can sit outside the pill)
  // and lift --val onto the track so the label positions against it.
  $$(".sbar-fill, .cbar-fill").forEach((fill) => {
    const track = fill.parentElement;
    const val = fill.querySelector(".sbar-val, .cbar-val");
    if (!val) return;
    fill.removeChild(val);
    track.appendChild(val);
  });

  $$(".sbar-row, .cbar-row").forEach((row) => {
    const fill = $(".sbar-fill, .cbar-fill", row);
    const val = $(".sbar-val, .cbar-val", row);
    const track = fill.parentElement;
    const target = fill.style.getPropertyValue("--val");

    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      if (RM) return;
      fill.style.width = "0%";
      val.style.left = "0%";
      requestAnimationFrame(() => {
        fill.style.width = target;
        val.style.left = target;
      });
    }, { threshold: 0.35 });
    io.observe(row);
  });
}

/* ---------------- Reveal on scroll ---------------- */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => io.observe(el));
}

/* ---------------- Chart tooltips ---------------- */
function initTooltips() {
  const tip = $("#tooltip");
  $$("[data-tip]").forEach((el) => {
    el.addEventListener("pointerenter", () => {
      tip.textContent = el.dataset.tip;
      tip.hidden = false;
    });
    el.addEventListener("pointermove", (e) => {
      const pad = 14;
      let x = e.clientX + pad;
      let y = e.clientY + pad;
      const r = tip.getBoundingClientRect();
      if (x + r.width > innerWidth - 8) x = e.clientX - r.width - pad;
      if (y + r.height > innerHeight - 8) y = e.clientY - r.height - pad;
      tip.style.left = x + "px";
      tip.style.top = y + "px";
    });
    el.addEventListener("pointerleave", () => { tip.hidden = true; });
  });
}

/* ---------------- 3D tilt on project cards ---------------- */
function initTilt() {
  if (RM || !window.matchMedia("(pointer: fine)").matches) return;
  $$(".project-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.transition = "border-color .35s ease, box-shadow .35s ease";
      card.style.transform =
        `perspective(900px) rotateX(${(0.5 - py) * 5}deg) rotateY(${(px - 0.5) * 7}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transition = "transform .5s ease, border-color .35s ease, box-shadow .35s ease";
      card.style.transform = "";
    });
  });
}

/* ---------------- Cinematic 3D parallax (hero + movie) ---------------- */
function initCinema3D() {
  if (RM || !window.matchMedia("(pointer: fine)").matches) return;
  const layers = [
    [".hero-visual", 6, 9],
    [".movie-card", 3.5, 6],
  ]
    .map(([sel, rx, ry]) => ({ el: $(sel), rx, ry, x: 0, y: 0 }))
    .filter((l) => l.el);
  let px = 0, py = 0;

  addEventListener("pointermove", (e) => {
    px = (e.clientX / innerWidth - 0.5) * 2;
    py = (e.clientY / innerHeight - 0.5) * 2;
  });

  const tick = () => {
    for (const l of layers) {
      l.x += (px - l.x) * 0.07;
      l.y += (py - l.y) * 0.07;
      if (!l.el.classList.contains("visible")) continue;
      l.el.style.transition = "transform 0.12s linear";
      l.el.style.transform =
        `rotateX(${(-l.y * l.rx).toFixed(2)}deg) rotateY(${(l.x * l.ry).toFixed(2)}deg)`;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------------- Framer Motion enhancement (progressive) ---------------- */
function initMotionEnhance() {
  const M = window.Motion;
  if (!M || RM) return;
  const t0 = performance.now();
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (t0 < 1200) {
    $$(".hero-text > *").forEach((el, i) => {
      M.animate(el, { opacity: [0, 1], y: [30, 0] },
        { duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] });
    });
    const wrap = $(".robot-wrap");
    if (wrap) {
      M.animate(wrap, { opacity: [0, 1], scale: [0.92, 1], y: [26, 0] },
        { duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] });
    }
  }
  if (!finePointer) return;

  $$(".btn").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      M.animate(btn, {
        x: (e.clientX - r.left - r.width / 2) * 0.18,
        y: (e.clientY - r.top - r.height / 2) * 0.3,
      }, { duration: 0.3, ease: "easeOut" });
    });
    btn.addEventListener("pointerleave", () => {
      M.animate(btn, { x: 0, y: 0 }, { duration: 0.5, ease: "easeOut" });
    });
  });
}

/* ---------------- Video autoplay fallback ---------------- */
function initVideoAutoplay() {
  const v = $(".movie-live");
  if (!v || RM) return;
  const tryPlay = () => {
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  };
  tryPlay();
  const onFirstInput = () => {
    tryPlay();
    removeEventListener("pointerdown", onFirstInput);
    removeEventListener("scroll", onFirstInput);
  };
  addEventListener("pointerdown", onFirstInput, { passive: true });
  addEventListener("scroll", onFirstInput, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tryPlay();
  });
}

/* ---------------- Nav: scrolled state, toggle, active link ---------------- */
function initNav() {
  const nav = $("#nav");
  const toggle = $("#navToggle");
  const links = $("#navLinks");

  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  $$(".nav-links a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  const byId = {};
  $$(".nav-links a").forEach((a) => {
    const sec = $(a.getAttribute("href"));
    if (sec) byId[sec.id] = a;
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        $$(".nav-links a").forEach((a) => a.classList.remove("active"));
        const link = byId[e.target.id];
        if (link) link.classList.add("active");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  Object.values(byId).forEach((a) => io.observe($(a.getAttribute("href"))));
}

/* ---------------- Boot ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  initParticles();
  initNeuralNet();
  initTypewriter();
  initCountUp();
  initBars();
  initReveal();
  initTooltips();
  initTilt();
  initCinema3D();
  initMotionEnhance();
  initNav();
});
