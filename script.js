(() => {
  "use strict";
  const cfg = birthdayConfig;
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  /* ---------- tulip SVG (hand-drawn style) ---------- */
  const tulipSVG = (c) => `<svg viewBox="0 0 60 90" aria-hidden="true"><path d="M30 88V46" stroke="#7fa86b" stroke-width="4" stroke-linecap="round"/><path d="M30 78c-12-2-16-10-18-14 10 0 16 4 18 14zM30 70c10-1 15-7 18-12-9-1-15 3-18 12z" fill="#9cc287"/><path d="M12 14c0 22 6 36 18 36s18-14 18-36c-5 4-9 2-12-3-3 5-9 5-12 0-3 5-7 7-12 3z" fill="${c}" stroke="#59464a" stroke-opacity=".35" stroke-width="2" stroke-linejoin="round"/><path d="M30 11c-5 12-5 26 0 39" fill="none" stroke="#59464a" stroke-opacity=".2" stroke-width="2"/></svg>`;
  document.querySelectorAll(".tulip").forEach(t => { t.innerHTML = tulipSVG(t.dataset.c || "#F3A9BD"); });

  /* ---------- floating decorations (few, lightweight) ---------- */
  const icons = ["🌷", "🦋", "✨", "💗", "🌸"];
  document.querySelectorAll(".floaters").forEach(box => {
    const n = reduce ? 0 : 8;
    for (let i = 0; i < n; i++) {
      const s = el("span", "", icons[i % icons.length]);
      s.style.left = (i * 12.5 + Math.random() * 6) + "%";
      s.style.animationDuration = (12 + Math.random() * 10) + "s";
      s.style.animationDelay = (-Math.random() * 14) + "s";
      box.appendChild(s);
    }
  });

  /* ---------- intro ---------- */
  const intro = $("#intro"), site = $("#site");
  let entered = false;
  function enter() {
    if (entered) return; entered = true;
    intro.classList.add("out");
    site.hidden = false;
    document.body.classList.remove("locked");
    window.scrollTo(0, 0);
    setTimeout(() => { intro.hidden = true; }, 800);
    startLetterWhenSeen();
  }
  $("#openBtn").addEventListener("click", () => {
    $("#envelope").classList.add("open");
    setTimeout(() => { confetti(40); enter(); }, reduce ? 0 : 1300);
  });
  $("#skipBtn").addEventListener("click", enter);

  /* ---------- hero card tilt ---------- */
  const card = $("#card3d"), inner = $(".card-inner", card);
  if (!reduce) {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      inner.style.setProperty("--ry", ((e.clientX - r.left) / r.width - .5) * 14 + "deg");
      inner.style.setProperty("--rx", (.5 - (e.clientY - r.top) / r.height) * 14 + "deg");
    });
    const reset = () => { inner.style.setProperty("--rx", "0deg"); inner.style.setProperty("--ry", "0deg"); };
    card.addEventListener("pointerleave", reset); card.addEventListener("pointerup", reset);
  }

  /* ---------- letter ---------- */
  const body = $("#letterBody"), sig = $("#sig"), revealBtn = $("#revealBtn");
  let typed = false, timer = null;
  function showSig() { sig.textContent = cfg.signature; sig.hidden = false; revealBtn.hidden = true; }
  function finishLetter() {
    clearTimeout(timer); typed = true;
    body.textContent = "";
    cfg.letter.forEach(t => body.appendChild(el("p", "", t)));
    showSig();
  }
  function typeLetter() {
    if (typed) return; typed = true;
    let p = 0, i = 0, node = null;
    const step = () => {
      if (p >= cfg.letter.length) { node && node.classList.remove("cursor"); return showSig(); }
      if (!node) { node = body.appendChild(el("p", "cursor", "")); }
      const t = cfg.letter[p];
      i = Math.min(t.length, i + 3);
      node.textContent = t.slice(0, i);
      if (i >= t.length) { node.classList.remove("cursor"); node = null; p++; i = 0; timer = setTimeout(step, 260); }
      else timer = setTimeout(step, 22);
    };
    step();
  }
  revealBtn.addEventListener("click", finishLetter);
  function startLetterWhenSeen() {
    if (reduce) return finishLetter();
    new IntersectionObserver((es, ob) => { if (es[0].isIntersecting) { typeLetter(); ob.disconnect(); } }, { threshold: .25 }).observe($("#letter"));
  }

  /* ---------- tulip garden ---------- */
  const beds = $("#beds"), tmsg = $("#tulipMsg");
  cfg.tulips.forEach(t => {
    const b = el("button", "bed"); b.type = "button"; b.setAttribute("aria-label", t.name + " tulip");
    b.innerHTML = tulipSVG(t.color);
    b.addEventListener("click", () => {
      beds.querySelectorAll(".on").forEach(x => x.classList.remove("on"));
      b.classList.add("on"); tmsg.textContent = t.msg;
    });
    beds.appendChild(b);
  });

  /* ---------- photos + lightbox ---------- */
  const scrap = $("#scrap"), lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
  let cur = 0, lastFocus = null;
  cfg.photos.forEach((p, i) => {
    const b = el("button", "pol " + p.type); b.type = "button"; b.setAttribute("aria-label", "Open photo: " + p.caption);
    const img = el("img"); img.loading = "lazy"; img.decoding = "async"; img.alt = p.caption; img.src = p.src;
    img.addEventListener("error", () => b.classList.add("broken"));
    b.append(img, el("span", "cap", p.caption));
    if (p.type === "portrait") { const s = el("span", "st", i % 2 ? "🌷" : "⭐"); s.setAttribute("aria-hidden", "true"); b.appendChild(s); }
    b.addEventListener("click", () => openLb(i));
    scrap.appendChild(b);
  });
  function showLb() { const p = cfg.photos[cur]; lbImg.src = p.src; lbImg.alt = p.caption; lbCap.textContent = p.caption; }
  function openLb(i) { cur = i; lastFocus = document.activeElement; showLb(); lb.hidden = false; document.body.classList.add("locked"); $("#lbClose").focus(); }
  function closeLb() { lb.hidden = true; document.body.classList.remove("locked"); lastFocus && lastFocus.focus(); }
  const go = d => { cur = (cur + d + cfg.photos.length) % cfg.photos.length; showLb(); };
  $("#lbClose").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", () => go(-1));
  $("#lbNext").addEventListener("click", () => go(1));
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb(); if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1);
  });
  let sx = null;
  lb.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); sx = null; });

  /* ---------- video ---------- */
  const vid = $("#memoryVideo"), vmiss = $("#videoMissing");
  vid.poster = cfg.video.poster; vid.title = cfg.video.title; vid.setAttribute("aria-label", cfg.video.title);
  vid.src = cfg.video.src;
  vid.addEventListener("error", () => { vmiss.hidden = false; });

  /* ---------- Shin-chan corner ---------- */
  const bubble = $("#bubble"); let lastJ = -1;
  $("#laughBtn").addEventListener("click", () => {
    let j; do { j = Math.floor(Math.random() * cfg.jokes.length); } while (j === lastJ && cfg.jokes.length > 1);
    lastJ = j; bubble.textContent = cfg.jokes[j];
    bubble.classList.remove("pop"); void bubble.offsetWidth; bubble.classList.add("pop");
  });

  /* ---------- travel ---------- */
  const trips = $("#trips");
  cfg.trips.forEach(t => {
    const c = el("div", "pc" + (t.first ? " first" : ""));
    const ic = el("span", "ic", t.icon); ic.setAttribute("aria-hidden", "true");
    c.append(ic, el("h3", "", t.title), el("p", "", t.note));
    if (t.first) c.appendChild(el("span", "stamp", "FIRST STOP"));
    trips.appendChild(c);
  });
  const path = $("#routePath"), plane = $("#plane"), len = path.getTotalLength();
  let t0 = 0, planeOn = false;
  function fly(ts) {
    if (!planeOn) return;
    if (!document.hidden) {
      const f = ((ts - t0) / 9000) % 1, pt = path.getPointAtLength(f * len);
      plane.setAttribute("x", pt.x); plane.setAttribute("y", pt.y);
    }
    requestAnimationFrame(fly);
  }
  if (reduce) { const pt = path.getPointAtLength(len * .5); plane.setAttribute("x", pt.x); plane.setAttribute("y", pt.y); }
  else new IntersectionObserver(es => { const on = es[0].isIntersecting; if (on && !planeOn) { planeOn = true; t0 = performance.now(); requestAnimationFrame(fly); } else if (!on) planeOn = false; }).observe($("#travel"));

  /* ---------- wishes ---------- */
  const wg = $("#wgrid");
  cfg.wishes.forEach(w => {
    const b = el("button", "wc"); b.type = "button"; b.setAttribute("aria-pressed", "false");
    const f = el("span", "f"); f.append(el("span", "", w.icon), el("b", "", w.title));
    b.append(f, el("span", "b", w.msg));
    b.addEventListener("click", () => { const on = b.classList.toggle("flip"); b.setAttribute("aria-pressed", on); });
    wg.appendChild(b);
  });

  /* ---------- gift + confetti ---------- */
  const cv = $("#confetti"), ctx = cv.getContext("2d");
  let parts = [], raf = 0;
  const cols = ["#F3A9BD", "#FFD7C2", "#FFF0B8", "#D8EEFF", "#E8DDF8", "#DCE8D5"];
  function confetti(n = 80) {
    if (reduce) return;
    cv.width = innerWidth; cv.height = innerHeight;
    for (let i = 0; i < n; i++) parts.push({ x: innerWidth / 2, y: innerHeight * .55, vx: (Math.random() - .5) * 10, vy: -Math.random() * 12 - 4, s: 5 + Math.random() * 6, c: cols[i % cols.length], r: Math.random() * 6, h: i % 5 === 0 });
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(p => p.y < cv.height + 20);
    parts.forEach(p => {
      p.vy += .3; p.x += p.vx; p.y += p.vy; p.r += .1; ctx.fillStyle = p.c;
      if (p.h) { ctx.font = p.s * 2 + "px serif"; ctx.fillText("💗", p.x, p.y); }
      else { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6); ctx.restore(); }
    });
    raf = parts.length ? requestAnimationFrame(tick) : 0;
    if (!parts.length) ctx.clearRect(0, 0, cv.width, cv.height);
  }
  const fin = $("#finalMsg");
  $("#giftBtn").addEventListener("click", function () {
    $("#giftbox").classList.add("open"); this.hidden = true;
    fin.textContent = ""; cfg.finalMessage.forEach(t => fin.appendChild(el("p", "", t)));
    fin.hidden = false; confetti(110);
    setTimeout(() => fin.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }), 400);
  });
  $("#topBtn").addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

  /* ---------- music (optional, user-initiated only) ---------- */
  const mBtn = $("#musicBtn"), bgm = $("#bgm");
  if (cfg.showMusicButton) {
    mBtn.hidden = false; bgm.src = cfg.backgroundMusic;
    const set = on => { mBtn.setAttribute("aria-pressed", on); mBtn.setAttribute("aria-label", on ? "Pause background music" : "Play background music"); };
    bgm.addEventListener("error", () => { set(false); mBtn.title = "Music file not found"; mBtn.disabled = true; mBtn.style.opacity = .5; });
    mBtn.addEventListener("click", () => {
      if (bgm.paused) bgm.play().then(() => set(true)).catch(() => set(false));
      else { bgm.pause(); set(false); }
    });
  }

  /* ---------- scroll reveals + pause when hidden ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .15 });
  document.querySelectorAll(".sec > h2, .sub, .scrap, .vframe, .cards, .wgrid").forEach(n => { n.classList.add("reveal"); io.observe(n); });
  document.addEventListener("visibilitychange", () => document.body.classList.toggle("paused", document.hidden));
  addEventListener("resize", () => { if (parts.length) { cv.width = innerWidth; cv.height = innerHeight; } });
})();