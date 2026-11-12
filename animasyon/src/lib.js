// Pıtır'ın Maceraları — çizim motoru: yardımcılar, karakterler, arka planlar, eşyalar
const W = 1280, H = 720, FPS = 30, GY = 585;
const PI = Math.PI, TAU = PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const ease = u => { u = clamp(u); return u * u * (3 - 2 * u); };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eseg = (t, a, b) => ease(seg(t, a, b));
const pulse = (t, a, b, f = 0.35) => Math.min(eseg(t, a, a + f), 1 - eseg(t, b - f, b));
const backOut = u => { u = clamp(u); const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
function kf(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++)
    if (t < k[i + 1][0]) return lerp(k[i][1], k[i + 1][1], ease((t - k[i][0]) / (k[i + 1][0] - k[i][0])));
  return k[k.length - 1][1];
}
// zıplama: t0 anında başlayan, d süren, h yüksekliğinde (negatif y)
const hop = (t, t0, d = 0.5, h = 60) => (t > t0 && t < t0 + d) ? -h * Math.sin(PI * (t - t0) / d) : 0;
const hops = (t, list, d = 0.5, h = 60) => list.reduce((s, t0) => s + hop(t, t0, d, h), 0);
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function mix(a, b, u) { const A = hex(a), B = hex(b); u = clamp(u); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], u)).toString(16).padStart(2, '0')).join(''); }

// ---------- temel şekiller ----------
function circ(c, x, y, r, f) { c.beginPath(); c.arc(x, y, Math.max(0, r), 0, TAU); c.fillStyle = f; c.fill(); }
function ell(c, x, y, rx, ry, f, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, TAU); c.fillStyle = f; c.fill(); }
function rr(c, x, y, w, h, r, f) { c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = f; c.fill(); }
function line(c, x1, y1, x2, y2, w, col) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineWidth = w; c.lineCap = 'round'; c.strokeStyle = col; c.stroke(); }
function star(c, x, y, r, f, rot = 0, n = 5, inner = 0.45) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = rot - PI / 2 + i * PI / n, R = i % 2 ? r * inner : r; c.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R); }
  c.closePath(); c.fillStyle = f; c.fill();
}
function heart(c, x, y, s, f) {
  c.beginPath(); c.moveTo(x, y + s * 0.9);
  c.bezierCurveTo(x - s * 1.5, y - s * 0.2, x - s * 0.7, y - s * 1.2, x, y - s * 0.4);
  c.bezierCurveTo(x + s * 0.7, y - s * 1.2, x + s * 1.5, y - s * 0.2, x, y + s * 0.9);
  c.fillStyle = f; c.fill();
}
const FONT = 'Baloo';
function text(c, s, x, y, size, fill, o = {}) {
  c.font = `${size}px ${FONT}`; c.textAlign = o.align || 'center'; c.textBaseline = o.base || 'middle';
  if (o.stroke) { c.lineJoin = 'round'; c.lineWidth = o.sw || size * 0.22; c.strokeStyle = o.stroke; c.strokeText(s, x, y); }
  c.fillStyle = fill; c.fillText(s, x, y);
}
function sparkle(c, x, y, r, t, col = '#fff7b0') {
  const k = 0.6 + 0.4 * Math.sin(t * 9 + x); star(c, x, y, r * k, col, t * 1.5, 4, 0.3);
}
function sparkles(c, t, t0, t1, x, y, w, h, n = 10, col) {
  const a = pulse(t, t0, t1); if (a <= 0) return;
  c.save(); c.globalAlpha = a;
  for (let i = 0; i < n; i++) sparkle(c, x + rnd(i + 1) * w, y + rnd(i + 50) * h, 14 + rnd(i + 9) * 16, t + i, col);
  c.restore();
}
// büyük "pop" yazısı (sayı / renk adı)
function popText(c, t, t0, t1, s, x, y, size, col) {
  if (t < t0 || t > t1) return;
  const k = backOut(seg(t, t0, t0 + 0.45)) * (1 - eseg(t, t1 - 0.3, t1));
  c.save(); c.translate(x, y); c.scale(k, k); c.rotate(Math.sin(t * 3) * 0.05);
  text(c, s, 0, 0, size, col, { stroke: '#ffffff', sw: size * 0.2 });
  c.restore();
}

// ---------- PITIR (ana karakter) ----------
const SK = '#ffd0ad', HAIR = '#3d2a70', HAIR2 = '#553c96';
function head(c, o) { // yerel koordinat: baş merkezi (0,0), yarıçap ~70
  const mood = o.mood || 'happy', f = (o.face || 0) * 7, t = o.t || 0;
  const blink = o.blink !== undefined ? o.blink : ((t % 3.4) > 3.25 ? 1 : 0);
  circ(c, 0, -6, 80, HAIR);
  for (const s of [-1, 1]) { // topuzlar
    circ(c, s * 66, -70, 31, HAIR); circ(c, s * 70, -76, 12, HAIR2);
    circ(c, s * 50, -50, 10, '#ffd23f');
  }
  for (const s of [-1, 1]) { circ(c, s * 69, 6, 12, SK); }
  circ(c, 0, 0, 70, SK);
  c.save(); c.beginPath(); c.arc(0, 0, 70.5, 0, TAU); c.clip(); // kâkül
  ell(c, 0, -74, 84, 46, HAIR); ell(c, -50, -44, 26, 22, HAIR, 0.5); ell(c, 50, -44, 26, 22, HAIR, -0.5);
  c.restore();
  // yanaklar
  c.globalAlpha *= 0.6; circ(c, -45 + f, 30, 13, '#ff8fa3'); circ(c, 45 + f, 30, 13, '#ff8fa3'); c.globalAlpha /= 0.6;
  // gözler
  const ey = 6, big = mood === 'wow' ? 1.18 : 1;
  for (const s of [-1, 1]) {
    const ex = s * 27 + f;
    c.strokeStyle = '#2b1d3a'; c.lineWidth = 4.5; c.lineCap = 'round';
    if (mood === 'sleep') { c.beginPath(); c.arc(ex, ey - 2, 11, 0.15 * PI, 0.85 * PI); c.stroke(); }
    else if (mood === 'joy' || blink) { c.beginPath(); c.arc(ex, ey + 6, 11, 1.15 * PI, 1.85 * PI); c.stroke(); }
    else {
      ell(c, ex, ey, 11 * big, 14.5 * big, '#2b1d3a');
      circ(c, ex - 3 + f * 0.3, ey - 6, 4.5, '#fff'); circ(c, ex + 4, ey + 5, 2.2, '#fff');
    }
    if (mood === 'wow' || mood === 'sad') { // kaşlar
      c.beginPath(); c.lineWidth = 4; c.strokeStyle = HAIR;
      if (mood === 'wow') c.arc(ex, ey - 22, 12, 1.2 * PI, 1.8 * PI);
      else { c.moveTo(ex - s * 12, ey - 26); c.lineTo(ex + s * 10, ey - 20); }
      c.stroke();
    }
  }
  // ağız
  const mx = f, my = 34;
  c.strokeStyle = '#a03050'; c.lineWidth = 4.5; c.lineCap = 'round';
  if (mood === 'happy') { c.beginPath(); c.arc(mx, my - 8, 15, 0.15 * PI, 0.85 * PI); c.stroke(); }
  else if (mood === 'joy' || mood === 'open') {
    c.beginPath(); c.arc(mx, my - 4, 17, 0, PI); c.closePath(); c.fillStyle = '#a03050'; c.fill();
    c.save(); c.clip(); circ(c, mx, my + 14, 10, '#ff8fa3'); if (o.teeth) rr(c, mx - 14, my - 5, 28, 7, 2, '#fff'); c.restore();
  }
  else if (mood === 'wow' || mood === 'o') ell(c, mx, my + 2, mood === 'o' ? 11 : 8, mood === 'o' ? 14 : 10, '#a03050');
  else if (mood === 'sad') { c.beginPath(); c.arc(mx, my + 14, 13, 1.2 * PI, 1.8 * PI); c.stroke(); }
  else if (mood === 'sleep') ell(c, mx, my + 2, 5, 5, '#a03050');
  if (o.dirt) { c.save(); c.globalAlpha *= o.dirt; ell(c, -30, -22, 15, 10, '#8a5a2b', 0.4); ell(c, 34, 44, 12, 8, '#8a5a2b', -0.3); circ(c, 40, -8, 6, '#8a5a2b'); c.restore(); }
}
function pitir(c, o) {
  const { x, y } = o, s = o.s || 0.78, t = o.t || 0;
  const walk = o.walk || 0, ph = t * 11;
  const body = o.pj ? '#7d8ff0' : '#ff6b6b', shirt = o.pj ? '#b9c4ff' : '#fff1cf', shoe = o.pj ? '#fff' : '#fff';
  const bob = o.bob !== undefined ? o.bob : Math.sin(t * 3) * 2 + Math.abs(Math.sin(ph)) * 5 * walk;
  const jump = o.jump || 0;
  const aL = (o.armL !== undefined ? o.armL : 0.25) + Math.sin(ph) * 0.5 * walk;
  const aR = (o.armR !== undefined ? o.armR : 0.25) - Math.sin(ph) * 0.5 * walk;
  const L = 62, sy = -150;
  c.save(); c.translate(x, y); c.scale(s, s);
  if (!o.noShadow) { const k = 1 + jump / 300; ell(c, 0, 4, 72 * k, 12 * k, 'rgba(40,30,60,.16)'); }
  c.translate(0, jump / s); if (o.rot) c.rotate(o.rot);
  const air = jump < -4 ? 1 : 0, sw = Math.sin(ph) * 24 * walk;
  for (const sd of [-1, 1]) { // bacaklar
    const fx = sd * 22 + sd * sw + air * sd * 8, fy = -10 - Math.max(0, sd * Math.cos(ph)) * 14 * walk - air * 10;
    line(c, sd * 22, -74 + bob, fx, fy, 24, SK);
    ell(c, fx + (o.face || 0) * 6, fy + 2, 22, 13, shoe); ell(c, fx + (o.face || 0) * 6, fy + 9, 22, 6, o.pj ? '#dfe4ff' : '#ffd23f');
  }
  c.translate(0, bob);
  const hand = sd => { const a = sd < 0 ? aL : aR; return [sd * 44 + sd * Math.sin(a) * L, sy + Math.cos(a) * L]; };
  const arm = sd => { const [hx, hy] = hand(sd); line(c, sd * 44, sy, hx, hy, 20, SK); line(c, sd * 44, sy, sd * 44 + (hx - sd * 44) * 0.4, sy + (hy - sy) * 0.4, 26, shirt); circ(c, hx, hy, 13, SK); };
  if (!o.armsFront) { arm(-1); arm(1); }
  rr(c, -47, -172, 94, 108, 36, shirt);
  rr(c, -47, -140, 94, 78, [10, 10, 36, 36], body); // tulum
  line(c, -30, -170, -30, -138, 12, body); line(c, 30, -170, 30, -138, 12, body);
  circ(c, -30, -136, 5, '#ffd23f'); circ(c, 30, -136, 5, '#ffd23f');
  if (o.pj) { star(c, 0, -104, 14, '#ffe66d', 0); } else heart(c, 0, -104, 12, '#fff1cf');
  if (o.dirt) { c.save(); c.globalAlpha = o.dirt; ell(c, -20, -84, 16, 10, '#8a5a2b', 0.3); ell(c, 24, -120, 12, 8, '#8a5a2b'); c.restore(); }
  if (o.armsFront) { arm(-1); arm(1); }
  c.save(); c.translate(0, -232); if (o.tilt) c.rotate(o.tilt); head(c, o); c.restore();
  c.restore();
  const wp = (lx, ly) => [x + lx * s, y + jump + (ly + bob) * s];
  return { hL: wp(...hand(-1)), hR: wp(...hand(1)), mouth: wp((o.face || 0) * 7, -198), head: wp(0, -232), top: wp(0, -320) };
}
// konum anahtar karelerinden otomatik yürüyen Pıtır
function actor(c, t, xk, o = {}) {
  const x = kf(t, xk), v = (kf(t + 0.05, xk) - kf(t - 0.05, xk)) / 0.1;
  const walk = clamp(Math.abs(v) / 70);
  return pitir(c, Object.assign({ x, y: GY, t, walk, face: walk > 0.1 ? Math.sign(v) : (o.face || 0) }, o, walk > 0.1 ? { face: Math.sign(v) } : {}));
}

// ---------- CİK (civciv arkadaş) ----------
function cik(c, x, y, t, o = {}) {
  const s = o.s || 1, f = o.face || 1, flap = o.flap || 0;
  c.save(); c.translate(x, y + (o.jump || 0)); c.scale(s * f, s);
  line(c, -8, -4, -8, 6, 4, '#ff9f1c'); line(c, 8, -4, 8, 6, 4, '#ff9f1c');
  circ(c, 0, -28, 27, '#ffe14d'); circ(c, 8, -52, 19, '#ffe14d');
  ell(c, -10, -28 - flap * 10 * Math.abs(Math.sin(t * 22)), 13, 9 + flap * 6, '#ffc61a', -0.4 - flap * Math.sin(t * 22));
  c.beginPath(); c.moveTo(24, -54); c.lineTo(40, -49); c.lineTo(24, -44); c.closePath(); c.fillStyle = '#ff9f1c'; c.fill();
  if (o.sleep) { c.strokeStyle = '#2b1d3a'; c.lineWidth = 3; c.beginPath(); c.arc(13, -57, 5, 0.1 * PI, 0.9 * PI); c.stroke(); }
  else { circ(c, 14, -56, 4.5, '#2b1d3a'); circ(c, 13, -58, 1.6, '#fff'); }
  line(c, 2, -70, -2, -80, 4, '#ffc61a'); line(c, 8, -71, 10, -82, 4, '#ffc61a');
  c.restore();
}

// ---------- arka planlar ----------
function cloud(c, x, y, s, col = '#fff') { circ(c, x, y, 34 * s, col); circ(c, x + 38 * s, y + 6 * s, 28 * s, col); circ(c, x - 38 * s, y + 8 * s, 26 * s, col); circ(c, x + 6 * s, y - 20 * s, 28 * s, col); rr(c, x - 60 * s, y + 4 * s, 122 * s, 30 * s, 15 * s, col); }
function sun(c, x, y, r, t) {
  c.save(); c.translate(x, y); c.rotate(t * 0.3);
  for (let i = 0; i < 12; i++) { c.rotate(TAU / 12); rr(c, r * 1.25, -6, r * 0.45, 12, 6, '#ffd23f'); }
  c.restore(); circ(c, x, y, r, '#ffdf5e'); circ(c, x, y, r * 0.82, '#ffe98a');
}
function moon(c, x, y, r) { circ(c, x, y, r * 1.5, 'rgba(255,255,220,.12)'); circ(c, x, y, r, '#fff6c9'); circ(c, x - r * 0.3, y - r * 0.2, r * 0.18, '#f1e6a8'); circ(c, x + r * 0.25, y + r * 0.3, r * 0.13, '#f1e6a8'); }
function flower(c, x, y, s, col, t) {
  const sw = Math.sin(t * 1.5 + x) * 0.08;
  c.save(); c.translate(x, y); c.rotate(sw); line(c, 0, 0, 0, -34 * s, 5 * s, '#3fa34d');
  for (let i = 0; i < 5; i++) circ(c, Math.cos(i * TAU / 5) * 10 * s, -38 * s + Math.sin(i * TAU / 5) * 10 * s, 8 * s, col);
  circ(c, 0, -38 * s, 6 * s, '#ffe14d'); c.restore();
}
// dark: 0 gündüz .. 1 yağmur/gri ; night: 0..1 gece
function garden(c, t, o = {}) {
  const d = o.dark || 0, n = o.night || 0;
  const top = mix(mix('#6ec6ff', '#7f8ea3', d), '#141a4a', n), bot = mix(mix('#d6f3ff', '#b8c4cf', d), '#3a3f7a', n);
  const g = c.createLinearGradient(0, 0, 0, 520); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (n > 0.3) { c.save(); c.globalAlpha = (n - 0.3) / 0.7; for (let i = 0; i < 40; i++) sparkle(c, rnd(i) * W, rnd(i + 70) * 380, 5 + rnd(i + 3) * 6, t * 0.4 + i, '#fff'); moon(c, 1040, 120, 50); c.restore(); }
  if (o.sun !== 0 && n < 0.7) { c.save(); c.globalAlpha = (o.sun === undefined ? 1 : o.sun) * (1 - d) * (1 - n / 0.7); sun(c, o.sunX || 1100, o.sunY || 110, 56, t); c.restore(); }
  if (o.behind) o.behind(c);
  const cc = mix(mix('#ffffff', '#69758a', d), '#5a5f95', n);
  for (let i = 0; i < 4; i++) { const cx = ((i * 380 + t * (10 + i * 3)) % (W + 300)) - 150; cloud(c, cx, 90 + (i % 2) * 70 + i * 12, 0.9 + (i % 3) * 0.25 + d * 0.35, cc); }
  const h1 = mix(mix('#a8e08a', '#8fb58a', d), '#2e4a6b', n), h2 = mix(mix('#7fd16a', '#79a877', d), '#274463', n), gr = mix(mix('#63c356', '#5d9c5a', d), '#1f3d57', n), gr2 = mix(mix('#55b34a', '#528e50', d), '#1a3550', n);
  ell(c, 260, 560, 520, 150, h1); ell(c, 1050, 570, 560, 170, h1); ell(c, 660, 590, 620, 120, h2);
  // çit
  if (!o.noFence) for (let i = 0; i < 17; i++) { rr(c, i * 80 - 10, 440, 54, 110, [27, 27, 0, 0], mix(mix('#fff7e6', '#d5d0c5', d), '#565c8c', n)); }
  if (!o.noFence) { c.fillStyle = mix(mix('#f2e3c4', '#c2bcae', d), '#474d7c', n); c.fillRect(0, 470, W, 14); c.fillRect(0, 515, W, 14); }
  c.fillStyle = gr; c.fillRect(0, 540, W, 180);
  c.fillStyle = gr2; for (let i = 0; i < 26; i++) { const gx = rnd(i + 5) * W, gy = 560 + rnd(i + 30) * 140; c.beginPath(); c.moveTo(gx - 8, gy); c.lineTo(gx, gy - 14); c.lineTo(gx + 8, gy); c.fill(); }
  const cols = ['#ff6b9d', '#ffd23f', '#b388ff', '#ff8c42', '#ffffff'];
  if (!o.noFlowers) for (let i = 0; i < 9; i++) flower(c, 40 + i * 150 + rnd(i) * 40, 560 + (i % 3) * 8, 0.9, cols[i % 5], t);
}
function room(c, t, o = {}) {
  const wall = o.wall || '#ffe3ec', wall2 = o.wall2 || '#ffd1df', floor = o.floor || '#e9b97a';
  c.fillStyle = wall; c.fillRect(0, 0, W, H);
  if (o.tiles) { c.strokeStyle = wall2; c.lineWidth = 3; for (let x = 0; x <= W; x += 80) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 520); c.stroke(); } for (let y = 40; y < 520; y += 80) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } }
  else for (let i = 0; i < 16; i++) { if (o.dots) { for (let j = 0; j < 5; j++) circ(c, i * 90 + (j % 2) * 45, 50 + j * 95, 9, wall2); } else { c.fillStyle = wall2; c.fillRect(i * 160, 0, 80, 520); } }
  c.fillStyle = o.skirt || '#ffffff'; c.fillRect(0, 500, W, 26);
  c.fillStyle = floor; c.fillRect(0, 526, W, 200);
  c.strokeStyle = 'rgba(120,70,20,.18)'; c.lineWidth = 3; for (let y = 570; y < H; y += 48) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  if (o.rug) ell(c, o.rug[0], 630, o.rug[1], 60, o.rug[2]), ell(c, o.rug[0], 630, o.rug[1] - 30, 44, o.rug[3] || '#fff');
  if (o.win) {
    const [x, y, w, h] = o.win;
    rr(c, x - 14, y - 14, w + 28, h + 28, 20, '#fff');
    c.save(); c.beginPath(); c.roundRect(x, y, w, h, 10); c.clip();
    c.fillStyle = o.sky || '#8fd3ff'; c.fillRect(x, y, w, h); if (o.winDraw) o.winDraw(c, x, y, w, h);
    c.restore();
    c.fillStyle = '#fff'; c.fillRect(x + w / 2 - 5, y, 10, h); c.fillRect(x, y + h / 2 - 5, w, 10);
    rr(c, x - 26, y + h + 10, w + 52, 16, 8, '#fff');
  }
}

// ---------- eşyalar ----------
function balloon(c, x, y, r, col, t, tx, ty) {
  if (tx !== undefined) { c.beginPath(); c.moveTo(x, y + r * 1.2); c.quadraticCurveTo(x + Math.sin(t * 2 + x) * 14, (y + ty) / 2 + r, tx, ty); c.lineWidth = 2.5; c.strokeStyle = 'rgba(80,80,80,.6)'; c.stroke(); }
  ell(c, x, y, r, r * 1.18, col); c.beginPath(); c.moveTo(x - 7, y + r * 1.15); c.lineTo(x + 7, y + r * 1.15); c.lineTo(x, y + r * 1.32); c.closePath(); c.fill();
  ell(c, x - r * 0.35, y - r * 0.45, r * 0.18, r * 0.3, 'rgba(255,255,255,.55)', 0.5);
}
function apple(c, x, y, r, col = '#f0433a') { circ(c, x - r * 0.3, y, r * 0.8, col); circ(c, x + r * 0.3, y, r * 0.8, col); line(c, x, y - r * 0.6, x + r * 0.15, y - r * 1.1, r * 0.16, '#7a4a21'); ell(c, x + r * 0.5, y - r * 1.0, r * 0.35, r * 0.18, '#57b947', -0.5); ell(c, x - r * 0.45, y - r * 0.3, r * 0.14, r * 0.25, 'rgba(255,255,255,.5)', 0.4); }
function banana(c, x, y, r) { c.save(); c.translate(x, y); c.beginPath(); c.arc(0, -r * 0.9, r * 1.3, 0.12 * PI, 0.88 * PI); c.lineWidth = r * 0.55; c.lineCap = 'round'; c.strokeStyle = '#ffd93b'; c.stroke(); circ(c, -r * 1.22, -r * 0.42, r * 0.12, '#7a5a21'); circ(c, r * 1.22, -r * 0.42, r * 0.12, '#7a5a21'); c.restore(); }
function strawberry(c, x, y, r) { c.beginPath(); c.moveTo(x - r, y - r * 0.5); c.quadraticCurveTo(x - r * 0.9, y + r * 0.7, x, y + r * 1.15); c.quadraticCurveTo(x + r * 0.9, y + r * 0.7, x + r, y - r * 0.5); c.quadraticCurveTo(x, y - r * 1.1, x - r, y - r * 0.5); c.fillStyle = '#f23c50'; c.fill(); for (let i = 0; i < 7; i++) ell(c, x + (rnd(i) - 0.5) * r * 1.2, y + (rnd(i + 9) - 0.4) * r * 1.1, r * 0.06, r * 0.1, '#ffe98a'); star(c, x, y - r * 0.75, r * 0.6, '#57b947', 0, 5, 0.4); }
function orange(c, x, y, r) { circ(c, x, y, r, '#ff9a1f'); ell(c, x - r * 0.35, y - r * 0.35, r * 0.18, r * 0.28, 'rgba(255,255,255,.45)', 0.5); ell(c, x + r * 0.1, y - r * 0.95, r * 0.32, r * 0.15, '#57b947', -0.4); }
function teddy(c, x, y, s, t = 0, rot = 0) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(rot);
  const b = '#c98a4b', l = '#f1cfa0';
  ell(c, -24, -8, 16, 12, b); ell(c, 24, -8, 16, 12, b); ell(c, 0, -40, 34, 38, b); ell(c, 0, -36, 20, 24, l);
  ell(c, -36, -52, 12, 16, b, 0.6); ell(c, 36, -52, 12, 16, b, -0.6);
  circ(c, -26, -112, 13, b); circ(c, 26, -112, 13, b); circ(c, -26, -112, 7, l); circ(c, 26, -112, 7, l);
  circ(c, 0, -90, 32, b); ell(c, 0, -80, 14, 11, l); circ(c, -11, -96, 4, '#2b1d3a'); circ(c, 11, -96, 4, '#2b1d3a'); ell(c, 0, -84, 5, 3.5, '#2b1d3a');
  c.restore();
}
function ball(c, x, y, r, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); circ(c, 0, 0, r, '#4db6ff'); c.beginPath(); c.arc(0, 0, r, 0, TAU); c.clip(); c.fillStyle = '#ff5d73'; c.fillRect(-r, -r * 0.3, 2 * r, r * 0.6); c.fillStyle = '#ffe14d'; c.fillRect(-r * 0.25, -r, r * 0.5, 2 * r); c.restore(); }
function blocks(c, x, y, s) { rr(c, x - 34 * s, y - 30 * s, 32 * s, 30 * s, 5, '#ff5d73'); rr(c, x + 2 * s, y - 30 * s, 32 * s, 30 * s, 5, '#4db6ff'); rr(c, x - 16 * s, y - 60 * s, 32 * s, 30 * s, 5, '#ffd23f'); }
function car(c, x, y, s) { rr(c, x - 42 * s, y - 34 * s, 84 * s, 24 * s, 9 * s, '#f0433a'); rr(c, x - 22 * s, y - 54 * s, 46 * s, 26 * s, [12 * s, 12 * s, 0, 0], '#f0433a'); rr(c, x - 15 * s, y - 49 * s, 32 * s, 15 * s, 5 * s, '#cfefff'); circ(c, x - 24 * s, y - 10 * s, 11 * s, '#333'); circ(c, x + 24 * s, y - 10 * s, 11 * s, '#333'); circ(c, x - 24 * s, y - 10 * s, 4 * s, '#ddd'); circ(c, x + 24 * s, y - 10 * s, 4 * s, '#ddd'); }
function duck(c, x, y, s, t) { c.save(); c.translate(x, y); c.rotate(Math.sin(t * 2.5) * 0.12); c.scale(s, s); ell(c, 0, 0, 32, 20, '#ffe14d'); circ(c, 22, -24, 17, '#ffe14d'); ell(c, 42, -22, 12, 6, '#ff9f1c'); circ(c, 26, -29, 3.5, '#2b1d3a'); ell(c, -8, -2, 14, 9, '#ffc61a', -0.3); c.restore(); }
function bubble(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.9)'; c.stroke(); circ(c, x - r * 0.35, y - r * 0.35, r * 0.2, 'rgba(255,255,255,.9)'); }
function zzz(c, x, y, t, col = '#fff') { for (let i = 0; i < 3; i++) { const u = ((t * 0.45 + i / 3) % 1); c.save(); c.globalAlpha = Math.sin(u * PI); text(c, 'Z', x + u * 60 + Math.sin(u * 8) * 8, y - u * 90, 22 + u * 26, col, { stroke: 'rgba(60,50,120,.5)', sw: 5 }); c.restore(); } }
function bed(c, x, y, o = {}) { // x: sol, y: zemin
  rr(c, x - 10, y - 190, 40, 190, 14, '#b9794a'); rr(c, x + 430, y - 120, 34, 120, 12, '#b9794a');
  rr(c, x + 10, y - 96, 440, 60, 14, '#fff'); rr(c, x + 10, y - 50, 440, 34, 8, '#b9794a');
  rr(c, x + 30, y - 132, 130, 50, 24, o.pillow || '#fff7d6');
}
function blanket(c, x, y, t, col = '#9b8cf2', bump = 1) { const br = Math.sin(t * 1.6) * 4 * bump; c.beginPath(); c.moveTo(x + 150, y - 40); c.lineTo(x + 150, y - 110); c.quadraticCurveTo(x + 260, y - 150 * bump - 10 - br, x + 452, y - 104); c.lineTo(x + 452, y - 40); c.closePath(); c.fillStyle = col; c.fill(); for (let i = 0; i < 5; i++) star(c, x + 200 + i * 52, y - 70 - (i % 2) * 14, 9, '#ffe66d', i); }

module.exports = { W, H, FPS, GY, PI, TAU, clamp, lerp, ease, seg, eseg, pulse, backOut, kf, hop, hops, rnd, mix, circ, ell, rr, line, star, heart, text, sparkle, sparkles, popText, head, pitir, actor, cik, cloud, sun, moon, flower, garden, room, balloon, apple, banana, strawberry, orange, teddy, ball, blocks, car, duck, bubble, zzz, bed, blanket, FONT };
