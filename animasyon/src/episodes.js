// Pıtır'ın Maceraları — 10 bölümün sahneleri. Her bölüm: draw(c, t), t = hikâye saniyesi (0..55)
const L = require('./lib');
const { W, H, GY, PI, TAU, clamp, lerp, ease, seg, eseg, pulse, backOut, kf, hop, hops, rnd, mix, circ, ell, rr, line, star, heart, text, sparkle, sparkles, popText,
  head, pitir, actor, cik, cloud, sun, moon, garden, room, balloon, apple, banana, strawberry, orange, teddy, ball, blocks, car, duck, bubble, zzz, bed, blanket } = L;
const wave = t => 2.5 + Math.sin(t * 9) * 0.35;
const S = 0.78;
function splash(c, x, y, t, t0, col = '#bfe6ff') {
  const u = (t - t0) / 0.55; if (u < 0 || u > 1) return;
  for (let i = 0; i < 9; i++) { const a = -PI * (0.12 + 0.76 * i / 8), d = 40 + rnd(i) * 70; circ(c, x + Math.cos(a) * d * u * 1.4, y + Math.sin(a) * d * u * 2 + 160 * u * u, 8 * (1 - u) + 2, col); }
}
function hearts(c, t, t0, t1, x, y) {
  if (t < t0 || t > t1) return;
  for (let i = 0; i < 6; i++) { const u = ((t - t0) * 0.35 + i / 6) % 1; c.save(); c.globalAlpha = Math.sin(u * PI) * pulse(t, t0, t1); heart(c, x + (rnd(i) - 0.5) * 220 + Math.sin(u * 6 + i) * 14, y - u * 230, 12 + rnd(i + 3) * 12, '#ff5d8f'); c.restore(); }
}

// ================= 1. GÜNAYDIN PITIR =================
const ep1 = {
  title: 'Günaydın Pıtır!', color: '#ff9f43', focus: [560, 380],
  music: { bpm: 104, root: 60, seed: 11, style: 'bouncy' },
  caps: [[0.5, 9.5, 'Güneş doğuyor... Pıtır hâlâ mışıl mışıl uyuyor.'], [10, 14, 'Zırrr! Zırrr! Saat çaldı. Günaydın Pıtır!'], [14.5, 21, 'Hop! Pıtır yataktan fırladı ve kocaman gerindi.'],
  [21.5, 30, 'Şimdi dişleri fırçalama zamanı. Fış fış fış!'], [30.5, 38, 'Yukarı, aşağı... Bütün dişler tertemiz olsun.'], [38.5, 44, 'Vaay! Dişler pırıl pırıl parlıyor.'], [44.5, 52, 'Günaydın güneş! Günaydın Cik! Yeni bir gün başlıyor.']],
  sfx: [[10, 'alarm'], [11.2, 'alarm'], [12.4, 'alarm'], [14, 'boing'], [16.5, 'tweet'], [18.5, 'tweet'], [25, 'brush', 12], [38.6, 'ding'], [39.4, 'ding'], [46, 'tweet'], [47, 'boing'], [49, 'boing']],
  draw(c, t) {
    const day = eseg(t, 1, 10), sky = day < 0.5 ? mix('#27306b', '#ffb37a', day * 2) : mix('#ffb37a', '#8fd3ff', day * 2 - 1);
    room(c, t, { wall: mix('#c9d3f2', '#dff1ff', day), wall2: mix('#bcc7ea', '#cfe8fb', day), win: [500, 110, 250, 220], sky, rug: [540, 210, '#ffb3c7', '#ffd9e3'],
      winDraw: (c, x, y, w, h) => { sun(c, x + w / 2, y + h + 70 - day * 190, 42, t); c.fillStyle = '#7fd16a'; c.beginPath(); c.ellipse(x + w / 2, y + h + 30, w * 0.8, 70, 0, 0, TAU); c.fill(); } });
    // lavabo + ayna
    circ(c, 230, 250, 92, '#fff'); circ(c, 230, 250, 80, '#cfefff');
    rr(c, 215, 440, 40, 150, 8, '#eef3f7'); rr(c, 140, 410, 180, 44, 22, '#fff'); line(c, 230, 410, 230, 380, 10, '#b8c4cf'); line(c, 230, 380, 255, 380, 10, '#b8c4cf');
    // komodin + saat
    rr(c, 690, GY - 80, 80, 80, 10, '#b9794a'); circ(c, 730, GY - 62, 6, '#ffd23f');
    const ring = t > 10 && t < 13.6 ? Math.sin(t * 60) * 5 : 0;
    c.save(); c.translate(730 + ring, GY - 108); c.rotate(ring * 0.03); circ(c, -18, -26, 10, '#f0433a'); circ(c, 18, -26, 10, '#f0433a'); circ(c, 0, 0, 28, '#f0433a'); circ(c, 0, 0, 21, '#fff'); line(c, 0, 0, 0, -13, 3, '#333'); line(c, 0, 0, 9, 4, 3, '#333'); c.restore();
    if (ring) for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(730, GY - 108, 44 + i * 14 + (t * 40 % 14), -0.9 * PI, -0.6 * PI); c.lineWidth = 4; c.strokeStyle = 'rgba(240,67,58,.6)'; c.stroke(); c.beginPath(); c.arc(730, GY - 108, 44 + i * 14 + (t * 40 % 14), -0.4 * PI, -0.1 * PI); c.stroke(); }
    bed(c, 780, GY);
    if (t < 14) {
      c.save(); c.translate(888, GY - 118); c.scale(S, S); c.rotate(-1.25); head(c, { t, mood: t < 12 ? 'sleep' : 'wow' }); c.restore();
      blanket(c, 780, GY, t, '#9b8cf2', 1);
      if (t < 10.5) zzz(c, 900, GY - 190, t, '#fff');
    } else blanket(c, 780, GY, t, '#9b8cf2', 0.45);
    if (t > 15.5) cik(c, 700, 338 + hops(t, [16.5, 18.5, 46, 48], 0.3, 20), t, { s: 0.9, face: -1, flap: (t > 16.4 && t < 19) || t > 45.8 ? 1 : 0 });
    let p;
    if (t >= 14 && t < 15) { const u = (t - 14); p = pitir(c, { x: lerp(900, 600, u), y: GY, t, jump: lerp(-110, 0, u) - 120 * Math.sin(PI * u), mood: 'joy', armL: 2.4, armR: 2.4 }); }
    else if (t >= 15) {
      const str = pulse(t, 15.3, 20.5, 0.6), br = t > 24.5 && t < 38, shine = t >= 38 && t < 44;
      p = actor(c, t, [[15, 600], [21, 600], [24, 330], [42, 330], [45, 560]], {
        armL: br ? 2.55 + Math.sin(t * 14) * 0.12 : 0.25 + str * 2.5 + (shine ? 0.9 : 0), armR: 0.25 + str * 2.5 + (t > 45.5 ? wave(t) - 0.25 : 0),
        mood: str > 0.5 ? (t < 18 ? 'o' : 'joy') : br || shine ? 'open' : t > 45 ? 'joy' : 'happy', teeth: br || shine, face: t > 21 && t < 42 ? -1 : 0, jump: hops(t, [47, 49], 0.5, 60) });
      if (br) { const dy = Math.sin(t * 14) * 7; line(c, p.hL[0], p.hL[1], p.mouth[0] - 4, p.mouth[1] + 6 + dy, 7, '#4db6ff'); rr(c, p.mouth[0] - 14, p.mouth[1] + dy - 2, 22, 12, 4, '#fff'); for (let i = 0; i < 6; i++) { const u = ((t * 0.9 + i / 6) % 1); circ(c, p.mouth[0] - 8 + (rnd(i) - 0.5) * 50, p.mouth[1] + 12 + (rnd(i + 4) - 0.3) * 24 - u * 22, 5 + rnd(i + 2) * 5, 'rgba(255,255,255,.9)'); } }
      if (shine) for (let i = 0; i < 5; i++) sparkle(c, p.mouth[0] + (rnd(i) - 0.5) * 90, p.mouth[1] + (rnd(i + 7) - 0.5) * 60, 16, t + i, '#fff');
      if (t > 23 && t < 43) { c.save(); c.beginPath(); c.arc(230, 250, 80, 0, TAU); c.clip(); c.translate(230 + (p.head[0] - 330) * 0.4, 262); c.scale(0.62, 0.62); head(c, { t, mood: br || shine ? 'open' : 'happy', teeth: true, face: 1 }); c.restore(); }
    }
    sparkles(c, t, 44.5, 52, 100, 80, 1080, 300, 8, '#fff7b0');
  }
};

// ================= 2. RENKLİ BALONLAR =================
const BC = ['#f0433a', '#ffd23f', '#3d9bff', '#4cc35b', '#9b5de5'], BN = ['KIRMIZI', 'SARI', 'MAVİ', 'YEŞİL', 'MOR'];
const ep2 = {
  title: 'Renkli Balonlar', color: '#3d9bff', focus: [420, 380],
  music: { bpm: 116, root: 62, seed: 23, style: 'bouncy' },
  caps: [[0.5, 4, 'Pıtır bahçede. Aa, gökyüzünde bir şey var!'], [4.5, 10.5, 'Kırmızı balon! Elma gibi kıpkırmızı.'], [11.5, 17.5, 'Sarı balon! Güneş gibi sapsarı.'], [18.5, 24.5, 'Mavi balon! Deniz gibi masmavi.'],
  [25.5, 31.5, 'Yeşil balon! Çimen gibi yemyeşil.'], [32.5, 38.5, 'Mor balon! Üzüm gibi mosmor.'], [39, 46, 'Bir, iki, üç... Pıtır havalanıyor! Uçuyoruum!'], [46.5, 52, 'Güle güle renkli balonlar! Yine bekleriz.']],
  sfx: [].concat(...[0, 1, 2, 3, 4].map(i => [[4 + 7 * i, 'slide'], [6.2 + 7 * i, 'ding'], [6.4 + 7 * i, 'tweet']]), [[39.5, 'slide'], [47, 'boing'], [48.5, 'pop'], [49.5, 'tweet']]),
  draw(c, t) {
    garden(c, t, { sunX: 1120 });
    const lift = kf(t, [[39.5, 0], [42, -130], [45, -130], [47, 0]]), rel = t > 48.5;
    const arriving = [0, 1, 2, 3, 4].some(i => t > 4 + 7 * i && t < 6.2 + 7 * i);
    cik(c, 1150, 440 + hops(t, [6.4, 13.4, 20.4, 27.4, 34.4, 49.5], 0.35, 30), t, { face: -1, flap: 0 });
    const p = pitir(c, { x: 420, y: GY, t, jump: lift + hops(t, [49.5, 51], 0.5, 50), armR: t > 5 && !rel ? 2.85 : rel ? wave(t) : 0.25, armL: lift < -20 ? 1.4 + Math.sin(t * 6) * 0.3 : 0.25,
      mood: t < 4 || arriving ? 'wow' : lift < -20 ? 'joy' : t > 46 ? 'joy' : 'happy', face: arriving ? 1 : 0, tilt: arriving || t < 4 ? -0.12 : 0 });
    for (let i = 0; i < 5; i++) {
      const T = 4 + 7 * i; if (t < T) continue;
      const u = eseg(t, T, T + 2.2), sx = 420 + (i - 2) * 78 + Math.sin(t * 1.3 + i) * 6, sy = 205 - (2 - Math.abs(i - 2)) * 30 + Math.sin(t * 1.7 + i * 2) * 6 + lift;
      let x = lerp(1380, sx, u), y = lerp(120 + i * 40, sy, u) - Math.sin(u * PI) * 60;
      if (rel) { const d = t - 48.5; y -= d * d * 70 + d * 30; x += d * (i - 2) * 30; balloon(c, x, y, 46, BC[i], t, x + Math.sin(t * 3 + i) * 8, y + 150); }
      else balloon(c, x, y, 46, BC[i], t, u >= 1 ? p.hR[0] : undefined, p.hR[1]);
      popText(c, t, T + 2.2, T + 6.3, BN[i], 900, 300, 120, BC[i]);
    }
  }
};

// ================= 3. YAĞMUR VE GÖKKUŞAĞI =================
const ep3 = {
  title: 'Yağmur ve Gökkuşağı', color: '#9b5de5', focus: [420, 380],
  music: { bpm: 108, root: 65, seed: 37, style: 'bouncy' },
  caps: [[0.5, 6.5, 'Pıtır dışarıda oynarken gökyüzü kararıyor.'], [7, 12.5, 'Şıp şıp şıp! Yağmur yağıyor. Şemsiye açıldı!'], [13, 21, 'Bir su birikintisi! Hop, şap! Hop, şap!'], [21.5, 30, 'Bir tane daha! Zıpla Pıtır, zıpla!'],
  [30.5, 36, 'Yağmur dindi. Bulutlar gidiyor, güneş açıyor.'], [36.5, 45, 'Bak, gökkuşağı! Kırmızı, turuncu, sarı, yeşil, mavi, mor.'], [45.5, 52, 'Yağmurdan sonra gökyüzü ne kadar da güzel!']],
  sfx: [[7, 'rain', 24.5], [7.5, 'pop'], [17, 'boing'], [17.6, 'splash'], [18.5, 'boing'], [19.1, 'splash'], [20, 'boing'], [20.6, 'splash'], [25, 'boing'], [25.6, 'splash'], [26.5, 'boing'], [27.1, 'splash'], [28, 'boing'], [28.6, 'splash'], [36, 'slide'], [41, 'ding'], [46, 'tweet'], [48, 'tweet']],
  draw(c, t) {
    const dark = kf(t, [[2, 0], [6.5, 1], [30, 1], [35, 0]]), pr = eseg(t, 35.5, 41.5);
    const RB = ['#f0433a', '#ff9a1f', '#ffd23f', '#4cc35b', '#3d9bff', '#9b5de5'];
    garden(c, t, { dark, sunX: 180, behind: c => { if (pr > 0) RB.forEach((col, i) => { c.beginPath(); c.arc(760, 580, 440 - i * 24, PI, PI + PI * pr); c.lineWidth = 25; c.lineCap = 'butt'; c.strokeStyle = col; c.stroke(); }); } });
    const pud = kf(t, [[9, 0], [13, 1], [40, 1], [50, 0.55]]);
    for (const px of [760, 990]) { ell(c, px, GY + 8, 105 * pud, 20 * pud, 'rgba(120,180,225,.9)'); ell(c, px - 20, GY + 4, 50 * pud, 6 * pud, 'rgba(255,255,255,.5)'); }
    const jt = [17, 18.5, 20, 25, 26.5, 28], jump = hops(t, jt, 0.6, 95) + hops(t, [47, 48.5, 50], 0.5, 50);
    const um = kf(t, [[7, 0], [7.8, 1], [33, 1], [34, 0]]);
    const p = actor(c, t, [[0, 500], [13, 500], [16, 760], [22, 760], [24.5, 990], [35, 990], [38, 420]], { jump, armR: um > 0 ? 0.25 + um * 2.5 : 0.25, armL: t > 38.5 && t < 45 ? 2.1 : jump < -5 ? 1.6 : 0.25,
      mood: (t > 3 && t < 8) || (t > 36 && t < 45) ? 'wow' : jump < -5 || t > 45 ? 'joy' : 'happy', tilt: t > 3 && t < 7 ? -0.12 : 0, face: t > 36 && t < 45 ? 1 : 0 });
    jt.forEach((j, i) => splash(c, i < 3 ? 760 : 990, GY, t, j + 0.6));
    if (um > 0) { // şemsiye
      const [hx, hy] = p.hR, ux = hx, uy = hy - 150; line(c, hx, hy + 6, ux, uy, 7, '#7a4a21');
      c.save(); c.translate(ux, uy); c.scale(um, um); c.beginPath(); c.arc(0, 0, 135, PI, TAU); c.closePath(); c.fillStyle = '#ffd23f'; c.fill();
      c.save(); c.clip(); for (let i = -2; i <= 2; i += 2) ell(c, i * 54, 0, 27, 135, '#ff8c42'); c.restore();
      for (let i = 0; i < 5; i++) circ(c, -108 + i * 54, 0, 27, i % 2 ? '#ff8c42' : '#ffd23f'); circ(c, 0, -135, 9, '#7a4a21'); c.restore();
    }
    const ri = kf(t, [[6.5, 0], [8, 1], [30, 1], [32, 0]]);
    if (ri > 0) { c.save(); c.globalAlpha = ri * 0.75; for (let i = 0; i < 130; i++) { const x = (rnd(i) * 1500 + t * 60) % 1400 - 60, y = (rnd(i + 200) * 760 + t * 820 * (0.8 + rnd(i + 9) * 0.4)) % 760 - 20; if (um > 0.9 && Math.abs(x - p.hR[0]) < 125 && y > p.hR[1] - 180) continue; line(c, x, y, x - 5, y + 20, 4, '#d8efff'); } c.restore(); }
    if (t > 45) cik(c, lerp(-60, 1340, seg(t, 45, 52)), 210 + Math.sin(t * 3) * 30, t, { flap: 1 });
    sparkles(c, t, 41, 46, 340, 150, 840, 200, 8, '#fff');
  }
};

// ================= 4. MİNİK TOHUM =================
const ep4 = {
  title: 'Minik Tohum', color: '#4cc35b', focus: [780, 330],
  music: { bpm: 100, root: 67, seed: 41, style: 'bouncy' },
  caps: [[0.5, 5, "Pıtır'ın elinde minicik bir tohum var."], [5.5, 10, 'Tohumu toprağa ekiyor. İyi uykular minik tohum!'], [10.5, 18, 'Şır şır şır... Tohum su içmeyi çok sever.'], [18.5, 27.5, 'Gün geçiyor, gece oluyor... Pıtır sabırla bekliyor.'],
  [28, 33.5, 'Aa! Toprağın içinden minik bir filiz çıktı!'], [34, 43, 'Büyüyor, büyüyor... Kocaman bir ayçiçeği oldu!'], [43.5, 52, 'Sevgi, su ve güneşle her şey büyür.']],
  sfx: [[1.2, 'pop'], [8.3, 'pop'], [10.8, 'water', 6.8], [28, 'ding'], [28.4, 'ding'], [34, 'grow', 9], [43, 'ding'], [45.5, 'tweet'], [47, 'boing'], [47.5, 'tweet'], [49, 'boing']],
  draw(c, t) {
    const night = kf(t, [[18.5, 0], [21, 1], [24, 1], [26.5, 0]]), g = kf(t, [[27.5, 0], [31, 0.2], [34, 0.2], [43, 1]]);
    garden(c, t, { night, sunX: 220 });
    const MX = 800; ell(c, MX, GY + 6, 100, 26, mix('#8a5a2b', '#3a2f4a', night)); ell(c, MX, GY, 70, 16, mix('#a06a35', '#463a58', night));
    if (g > 0) { // bitki
      const hgt = 340 * g, sw = Math.sin(t * 1.5) * 8 * g, tx = MX + sw, ty = GY - hgt;
      c.beginPath(); c.moveTo(MX, GY); c.quadraticCurveTo(MX, GY - hgt * 0.5, tx, ty); c.lineWidth = 8 + 8 * g; c.lineCap = 'round'; c.strokeStyle = '#3fa34d'; c.stroke();
      const leaf = (f, sd) => { const k = eseg(g, f, f + 0.2); if (k > 0) ell(c, MX + sw * f * f + sd * 44 * k, GY - 340 * f * 0.9 - 6, 44 * k, 17 * k, '#57b947', sd * -0.4); };
      leaf(0.3, 1); leaf(0.5, -1); leaf(0.66, 1);
      const hs = eseg(g, 0.5, 1);
      if (hs <= 0) { ell(c, tx - 13, ty - 6, 15, 8, '#7fd16a', 0.6); ell(c, tx + 13, ty - 6, 15, 8, '#7fd16a', -0.6); }
      else { c.save(); c.translate(tx, ty); c.rotate(sw * 0.01); c.scale(hs, hs); for (let i = 0; i < 16; i++) ell(c, Math.cos(i * TAU / 16 + t * 0.2) * 62, Math.sin(i * TAU / 16 + t * 0.2) * 62, 30, 13, i % 2 ? '#ffc61a' : '#ffd93b', i * TAU / 16 + t * 0.2); circ(c, 0, 0, 46, '#8a5a2b'); circ(c, 0, 0, 38, '#a06a35'); circ(c, -13, -6, 5, '#3a2412'); circ(c, 13, -6, 5, '#3a2412'); c.beginPath(); c.arc(0, 2, 16, 0.15 * PI, 0.85 * PI); c.lineWidth = 4; c.strokeStyle = '#3a2412'; c.stroke(); c.restore(); }
    }
    const crouch = pulse(t, 6.3, 9.3, 0.6) * 26, water = t > 10.5 && t < 18;
    const p = pitir(c, { x: 610, y: GY, t, bob: crouch + Math.sin(t * 3) * 2, face: 1, armR: t < 9.3 ? 1.5 - pulse(t, 6.3, 9.3, 0.6) * 0.6 : water ? 1.45 : g > 0.2 && t < 43 ? 0.25 + eseg(t, 34, 42) * 2.4 : 0.25, armL: g > 0.2 && t < 43 ? 0.25 + eseg(t, 34, 42) * 2.4 : t > 43 ? 1.6 + Math.sin(t * 8) * 0.4 : 0.25,
      mood: night > 0.5 ? 'sleep' : (t > 27.5 && t < 34) ? 'wow' : t > 34 ? 'joy' : 'happy', tilt: g > 0.3 ? -0.1 : 0, jump: hops(t, [29, 47, 49], 0.5, 55) });
    if (night > 0.5) zzz(c, 640, GY - 260, t);
    if (t < 7.5) { const k = backOut(seg(t, 1, 1.6)) * (1 - eseg(t, 5, 5.5)); if (k > 0) { c.save(); c.translate(760, 300); c.scale(k, k); circ(c, 0, 0, 74, '#fff'); c.lineWidth = 6; c.strokeStyle = '#4cc35b'; c.stroke(); ell(c, 0, 0, 20, 30, '#8a5a2b', 0.4); ell(c, -5, -8, 5, 10, '#b98a55', 0.4); c.restore(); } ell(c, p.hR[0] + 4, p.hR[1] - 12, 6, 9, '#8a5a2b', 0.4); }
    else if (t < 8.3) { const u = seg(t, 7.5, 8.3); ell(c, lerp(p.hR[0], MX, u), lerp(p.hR[1], GY - 4, u * u) - Math.sin(u * PI) * 30, 6, 9, '#8a5a2b', 0.4 + u * 4); }
    if (water) { // sulama kabı
      const [hx, hy] = p.hR, k = pulse(t, 10.5, 18, 0.5); c.save(); c.translate(hx + 10, hy - 6); c.rotate(0.55 * k); rr(c, -30, -26, 60, 52, 12, '#4db6ff'); line(c, 28, 6, 78, -22, 11, '#4db6ff'); circ(c, 82, -24, 11, '#2f8fd8'); c.beginPath(); c.arc(-30, 0, 20, 0.5 * PI, 1.5 * PI); c.lineWidth = 8; c.strokeStyle = '#2f8fd8'; c.stroke(); c.restore();
      if (k > 0.9) for (let i = 0; i < 12; i++) { const u = (t * 1.6 + i / 12) % 1, sx = hx + 88, sy = hy + 30; circ(c, sx + (rnd(i) - 0.3) * 40 * u + u * 20, sy + u * u * (GY - sy - 4), 5, '#bfe6ff'); }
    }
    if (t > 43.5) { const u = eseg(t, 43.5, 45.5); cik(c, lerp(1340, MX + 86, u), lerp(160, GY - 340 * 0.66 * 0.9 - 14, u) + hops(t, [47, 49], 0.35, 26), t, { face: -1, flap: u < 1 ? 1 : 0 }); }
    sparkles(c, t, 42.5, 46, 640, 120, 320, 260, 8);
  }
};

// ================= 5. ELMALARI SAYALIM =================
const NUM = ['Bir', 'İki', 'Üç', 'Dört', 'Beş'], NC = ['#f0433a', '#ff9a1f', '#3d9bff', '#4cc35b', '#9b5de5'];
const AP = [[800, 270], [870, 185], [965, 225], [905, 310], [1010, 300]];
const ep5 = {
  title: 'Elmaları Sayalım', color: '#f0433a', focus: [430, 380],
  music: { bpm: 120, root: 60, seed: 53, style: 'bouncy' },
  caps: [[0.5, 5.5, 'Elma ağacında kıpkırmızı elmalar var. Haydi sayalım!'], [6, 13, 'Tık! Bir elma düştü. Bir!'], [13.5, 20.5, 'Bir tane daha! İki!'], [21, 28, 'Sepete bak, üç elma oldu. Üç!'], [28.5, 35.5, 'Dört elma! Dört!'], [36, 43.5, 'Ve sonuncusu... Beş! Beş elma!'], [44, 52, 'Bir, iki, üç, dört, beş! Aferin sana, hepsini saydık!']],
  sfx: [].concat(...[0, 1, 2, 3, 4].map(i => [[5.6 + 7.5 * i, 'tweet'], [6 + 7.5 * i, 'slidedown'], [6.9 + 7.5 * i, 'pop'], [7.1 + 7.5 * i, 'count', i], [8, 'boing'].map((v, k) => k ? v : v + 7.5 * i)]), [0, 1, 2, 3, 4].map(i => [44.6 + i * 0.8, 'count', i]), [[49.2, 'boing'], [50.4, 'boing']]),
  draw(c, t) {
    garden(c, t, { sunX: 620, sunY: 95 });
    rr(c, 860, 330, 64, 262, 20, '#9a6234'); line(c, 890, 400, 950, 340, 22, '#9a6234');
    for (const [x, y, r] of [[890, 240, 150], [770, 280, 95], [1020, 270, 105], [880, 150, 100], [960, 330, 80]]) circ(c, x, y, r, '#4cb24a');
    for (const [x, y, r] of [[850, 200, 80], [990, 230, 60]]) circ(c, x, y, r, '#5cc559');
    const BX = 690, by = GY;
    const T = i => 6 + 7.5 * i;
    cik(c, 1040, 172 + hops(t, [0, 1, 2, 3, 4].map(i => T(i) - 0.4), 0.3, 24), t, { face: -1, flap: [0, 1, 2, 3, 4].some(i => Math.abs(t - T(i) + 0.2) < 0.4) ? 1 : 0 });
    rr(c, BX - 62, by - 78, 124, 20, 8, '#8a5a2b'); // sepet arkası
    for (let i = 0; i < 5; i++) {
      const [ax, ay] = AP[i], u = seg(t, T(i), T(i) + 0.9), tx = BX - 36 + (i % 3) * 36 + (i > 2 ? 18 : 0), ty = by - 74 - (i > 2 ? 26 : 0);
      const wig = t > T(i) - 0.7 && t < T(i) ? Math.sin(t * 40) * 4 : 0;
      apple(c, lerp(ax, tx, ease(u)) + wig, lerp(ay, ty, u * u), 24);
    }
    c.beginPath(); c.moveTo(BX - 70, by - 70); c.lineTo(BX + 70, by - 70); c.lineTo(BX + 54, by); c.lineTo(BX - 54, by); c.closePath(); c.fillStyle = '#c98a4b'; c.fill();
    c.strokeStyle = '#a06a35'; c.lineWidth = 4; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(BX - 68 + i * 3, by - 70 + i * 17); c.lineTo(BX + 68 - i * 3, by - 70 + i * 17); c.stroke(); }
    rr(c, BX - 76, by - 80, 152, 16, 8, '#a06a35');
    const cnt = [0, 1, 2, 3, 4].filter(i => t > T(i) + 0.9).length, cheer = [0, 1, 2, 3, 4].reduce((s, i) => Math.max(s, pulse(t, T(i) + 0.9, T(i) + 3.2, 0.3)), 0) + (t > 44.5 ? 1 : 0);
    pitir(c, { x: 430, y: GY, t, face: 1, jump: hops(t, [0, 1, 2, 3, 4].map(i => T(i) + 2), 0.5, 60) + hops(t, [49.2, 50.4], 0.5, 60), armL: 0.25 + cheer * (2.2 + Math.sin(t * 12) * 0.25), armR: 0.25 + cheer * (2.2 - Math.sin(t * 12) * 0.25),
      mood: cheer > 0.4 ? 'joy' : [0, 1, 2, 3, 4].some(i => t > T(i) - 0.7 && t < T(i) + 0.9) ? 'wow' : 'happy' });
    for (let i = 0; i < 5; i++) { popText(c, t, T(i) + 1.1, T(i) + 6.4, String(i + 1), 230, 180, 230, NC[i]); popText(c, t, T(i) + 1.5, T(i) + 6.4, NUM[i], 230, 320, 76, NC[i]); }
    for (let i = 0; i < 5; i++) popText(c, t, 44.6 + i * 0.8, 56, String(i + 1), 100 + i * 98, 200 + Math.sin(t * 4 + i) * 10, 130, NC[i]);
    void cnt;
  }
};

// ================= 6. AYICIK NEREDE? =================
const ep6 = {
  title: 'Ayıcık Nerede?', color: '#ff6b9d', focus: [640, 400],
  music: { bpm: 110, root: 64, seed: 67, style: 'bouncy' },
  caps: [[0.5, 4, 'Pıtır çok üzgün. Oyuncak ayısı Bıdık kayıp!'], [4.5, 11.5, 'Kutunun içinde mi? Hayır! Bu bir top.'], [12, 20.5, 'Masanın altında mı? Hayır! Bu Cik.'], [21, 26, 'Peki ya perdenin arkası? Şu kulaklar da ne?'], [26.5, 33, 'Buldum! Bıdık buradaymış!'], [33.5, 41, "Pıtır, Bıdık'a sımsıkı sarılıyor."], [41.5, 52, 'Aramaktan vazgeçmezsen, kaybolan bulunur.']],
  sfx: [[8, 'boing'], [8.9, 'pop'], [9.6, 'pop'], [16, 'tweet'], [16.6, 'tweet'], [22, 'pop'], [26.2, 'slide'], [27, 'ding'], [27.3, 'ding'], [30, 'pop'], [31, 'ding'], [45, 'boing'], [46.5, 'boing'], [48, 'boing'], [49.5, 'boing'], [47, 'tweet']],
  draw(c, t) {
    room(c, t, { wall: '#fff0c9', wall2: '#ffe2a3', dots: true, win: [900, 110, 230, 220], rug: [640, 260, '#b9e3ff', '#e2f4ff'], winDraw: (c, x, y, w, h) => { sun(c, x + 60, y + 60, 30, t); cloud(c, x + 160, y + 130, 0.7); } });
    // kutu
    const lid = eseg(t, 7.6, 8.2);
    rr(c, 205, GY - 120, 150, 120, 8, '#b98350');
    const bu = seg(t, 8, 10.2), bx = lerp(280, 120, bu), byy = t < 8 ? GY - 60 : GY - 36 - Math.abs(Math.sin(bu * PI * 3)) * 190 * (1 - bu) - (bu < 0.1 ? 60 * (1 - bu * 10) : 0);
    if (t >= 8) ball(c, bx + (t > 41 ? 0 : 0), byy + hops(t, [45.2, 46.7, 48.2, 49.7], 0.5, 70), 36, bu * 9);
    rr(c, 195, GY - 110, 170, 112, 8, '#d9a066'); rr(c, 250, GY - 80, 60, 12, 6, '#b98350');
    c.save(); c.translate(195, GY - 110); c.rotate(-lid * 2.2); rr(c, 0, -12, 86, 14, 5, '#c08a55'); c.restore(); c.save(); c.translate(365, GY - 110); c.rotate(lid * 2.2); rr(c, -86, -12, 86, 14, 5, '#c08a55'); c.restore();
    // masa
    line(c, 570, GY - 160, 570, GY, 14, '#9a6234'); line(c, 770, GY - 160, 770, GY, 14, '#9a6234');
    const cu = eseg(t, 16, 17.2); if (t > 15.8) cik(c, lerp(690, 800, cu), GY + hops(t, [16, 16.6, 47, 48.5, 50], 0.35, 34), t, { flap: t < 18 ? 1 : 0, face: t > 20 ? 1 : -1 });
    rr(c, 548, GY - 172, 244, 20, 10, '#b9794a'); rr(c, 556, GY - 154, 228, 96, [0, 0, 16, 16], '#ff8fa3'); for (let i = 0; i < 6; i++) circ(c, 575 + i * 38, GY - 58, 19, '#ff8fa3'); for (let i = 0; i < 5; i++) circ(c, 590 + i * 40, GY - 110, 8, '#fff');
    // ayı + perde
    const open = eseg(t, 26, 27.2), got = t >= 30, pk = pulse(t, 21.5, 26.2, 0.5);
    const px = kf(t, [[0, 470], [4.5, 470], [7, 430], [12, 430], [14.5, 470], [21, 470], [24.5, 860], [41, 860], [44, 640]]);
    const jump = hops(t, [27.3, 28, 45, 46.5, 48, 49.5], 0.5, 60);
    if (!got) teddy(c, lerp(1010, 960 - pk * 26 + Math.sin(t * 6) * 3 * pk, 1 - open) + 0, GY, 1, t, -0.25 * pk * (1 - open));
    const cw = lerp(250, 56, open); c.fillStyle = '#9b5de5'; c.beginPath(); c.roundRect(1140 - cw + 26, 84, cw, GY - 96, 12); c.fill();
    c.fillStyle = '#8448d1'; for (let i = 0; i < 6; i++) c.fillRect(1166 - cw + cw * (i + 0.5) / 6, 96, cw / 24, GY - 120);
    rr(c, 880, 74, 300, 18, 9, '#7a4a21');
    const mood = t < 7.5 ? 'sad' : t < 9.6 ? 'wow' : t < 15.9 ? 'sad' : t < 17.6 ? 'wow' : t < 21 ? 'sad' : t < 26.5 ? 'wow' : 'joy';
    const tu = eseg(t, 28.5, 30);
    if (!got && t > 28.5) teddy(c, lerp(1010, px, tu), lerp(GY, GY - 34, tu) - Math.sin(tu * PI) * 80, 1 - tu * 0.2, t);
    const p = pitir(c, { x: px, y: GY, t, walk: clamp(Math.abs(kf(t + 0.05, [[0, 470], [4.5, 470], [7, 430], [12, 430], [14.5, 470], [21, 470], [24.5, 860], [41, 860], [44, 640]]) - px) / 3.5), jump, mood, armsFront: got,
      face: t < 4 ? Math.sin(t * 2) : t < 12 ? -1 : t < 21 ? 0.6 : t < 30 ? 1 : 0, armL: got ? 1.0 : t > 26.5 && t < 30 ? 2.4 : 0.25, armR: got ? 1.0 : t > 26.5 && t < 30 ? 2.4 : 0.25, tilt: got ? Math.sin(t * 2.5) * 0.08 : 0, bob: got ? Math.sin(t * 5) * 3 : undefined });
    if (got) { teddy(c, px, GY - 34 + jump, 0.8, t, Math.sin(t * 2.5) * 0.1); circ(c, p.hL[0] + 20, p.hL[1] - 4, 11, '#ffd0ad'); circ(c, p.hR[0] - 20, p.hR[1] - 4, 11, '#ffd0ad'); }
    if (t < 4) { for (let i = 0; i < 2; i++) { const u = (t * 0.8 + i / 2) % 1; c.save(); c.globalAlpha = 1 - u; ell(c, p.head[0] + (i ? 34 : -34), p.head[1] + 20 + u * 50, 5, 8, '#7ecbff'); c.restore(); } }
    for (const [a, b, x] of [[5.5, 7.6, 280], [13, 15.9, 670], [22, 26, 1010]]) popText(c, t, a, b, '?', x, 200, 120, '#ff6b9d');
    hearts(c, t, 30.5, 41, px, 330);
    sparkles(c, t, 27, 30, 900, 250, 250, 300, 8);
  }
};

// ================= 7. MEYVE ZAMANI =================
const FR = [apple, banana, strawberry, orange], FN = ['ELMA', 'MUZ', 'ÇİLEK', 'PORTAKAL'], FC = ['#f0433a', '#f2b600', '#f23c50', '#ff9a1f'];
const ep7 = {
  title: 'Meyve Zamanı', color: '#ffb400', focus: [400, 380],
  music: { bpm: 118, root: 67, seed: 71, style: 'bouncy' },
  caps: [[0.5, 4.5, "Pıtır'ın karnı acıktı. Masada neler var?"], [5, 13.5, 'Elma! Kıtır kıtır. Ham ham ham!'], [14, 22.5, 'Muz! Yumuşacık ve tatlı. Ham ham ham!'], [23, 31.5, 'Çilek! Mis gibi kokuyor. Ham ham ham!'], [32, 40.5, 'Portakal! Sulu sulu. Ham ham ham!'], [41, 52, 'Meyve yiyen Pıtır güçlendi! Hop hop, zıp zıp!']],
  sfx: [].concat(...[0, 1, 2, 3].map(i => { const T = 5 + 9 * i; return [[T, 'boing'], [T + 1, 'slide'], [T + 2, 'ding'], [T + 6, 'munch'], [T + 6.6, 'munch'], [T + 7.2, 'munch'], [T + 8, 'pop']]; }), [[43, 'boing'], [45, 'boing'], [47, 'boing'], [49, 'boing'], [42, 'ding']]),
  draw(c, t) {
    room(c, t, { wall: '#e3f6ef', wall2: '#c9ecdf', tiles: true, floor: '#f1d7a8', win: [130, 110, 230, 200], winDraw: (c, x, y, w, h) => { sun(c, x + 170, y + 60, 30, t); c.fillStyle = '#7fd16a'; c.beginPath(); c.ellipse(x + w / 2, y + h + 20, w, 70, 0, 0, TAU); c.fill(); } });
    for (let i = 0; i < 3; i++) { rr(c, 620 + i * 200, 120, 160, 150, 12, '#fff'); circ(c, 760 + i * 200 - 130, 195, 7, '#ffb400'); }
    const TY = GY - 190; line(c, 640, TY, 640, GY, 18, '#9a6234'); line(c, 1160, TY, 1160, GY, 18, '#9a6234'); rr(c, 590, TY, 620, 28, 14, '#c98a4b');
    rr(c, 600, TY + 26, 600, 30, [0, 0, 14, 14], '#ff8fa3');
    const X0 = [690, 830, 970, 1100];
    let chew = 0, show = 0, shown = -1;
    const draws = [];
    for (let i = 0; i < 4; i++) {
      const T = 5 + 9 * i; let x = X0[i], y = TY - 30, r = 30, a = 1;
      if (t > T + 8) continue;
      if (t > T) {
        y += hop(t, T, 0.5, 50);
        const u = eseg(t, T + 1, T + 2), v = eseg(t, T + 5, T + 6);
        x = lerp(x, 800, u); y = lerp(y, 290, u) - Math.sin(u * PI) * 60; r = lerp(30, 92, u);
        if (u >= 1 && v < 1) { show = pulse(t, T + 1.6, T + 5.2, 0.4); shown = i; }
        if (v > 0) { x = lerp(800, 400 + 60, v); y = lerp(290, GY - 198 * S + 6, v); r = lerp(92, 30, v); }
        if (t > T + 6) { const k = Math.floor((t - T - 6) / 0.6); r = 30 * Math.max(0, 1 - (k + 1) / 3.4); chew = 1; }
      }
      draws.push([i, x, y, r]);
    }
    if (show > 0) { c.save(); c.globalAlpha = show; c.translate(800, 290); c.rotate(t * 0.4); for (let i = 0; i < 10; i++) { c.rotate(TAU / 10); c.beginPath(); c.moveTo(0, 0); c.lineTo(230, -34); c.lineTo(230, 34); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill(); } c.restore(); c.save(); c.globalAlpha = show; circ(c, 800, 290, 140, 'rgba(255,255,255,.85)'); c.restore(); }
    for (const [i, x, y, r] of draws) if (r > 31) FR[i](c, x, y + r * 0.1, r);
    const strong = t > 41, jump = hops(t, [43, 45, 47, 49], 0.6, 120);
    const p = pitir(c, { x: 400, y: GY, t, face: strong ? 0 : 1, jump, armR: strong ? 2.2 + Math.sin(t * 5) * 0.3 : chew ? 2.3 : 0.25, armL: strong ? 2.2 - Math.sin(t * 5) * 0.3 : t < 4.5 ? 0.9 + Math.sin(t * 6) * 0.2 : 0.25,
      mood: strong ? 'joy' : chew ? (Math.sin(t * 16) > 0 ? 'open' : 'happy') : shown >= 0 ? 'wow' : t < 4.5 ? 'o' : 'happy', armsFront: t < 4.5 });
    for (const [i, x, y, r] of draws) if (r <= 31 && r > 1) FR[i](c, x, y + r * 0.1, r);
    for (let i = 0; i < 4; i++) { const T = 5 + 9 * i; popText(c, t, T + 2, T + 5.2, FN[i], 800, 470, 84, FC[i]); if (t > T + 8 && t < T + 9) hearts(c, t, T + 8, T + 9, 400, 300); }
    if (strong) { sparkles(c, t, 41, 52, 200, 120, 420, 380, 10); popText(c, t, 42, 51.5, 'GÜÇLÜ!', 850, 300, 110, '#ffb400'); }
    void p;
  }
};

// ================= 8. OYUNCAKLARI TOPLAYALIM =================
const TOYS = [[300, (c, x, y) => ball(c, x, y - 34, 34)], [440, (c, x, y) => blocks(c, x, y, 1.1)], [930, (c, x, y) => car(c, x, y, 1.15)], [1060, (c, x, y) => teddy(c, x, y, 0.66)]];
const X8 = [[0, 480], [6, 480], [8.5, 300], [9, 300], [11.5, 575], [15, 575], [17.5, 440], [18, 440], [20.5, 575], [24, 575], [26.5, 930], [27, 930], [29.5, 785], [33, 785], [35.5, 1060], [36, 1060], [38.5, 785], [42, 785], [45, 520]];
const ep8 = {
  title: 'Oyuncakları Toplayalım', color: '#7d8ff0', focus: [520, 380],
  music: { bpm: 122, root: 62, seed: 83, style: 'bouncy' },
  caps: [[0.5, 5.5, 'Oyun bitti. Ama oda çok dağınık! Haydi toplayalım.'], [6, 14.5, 'Önce top. Hop, kutuya!'], [15, 23.5, 'Sonra renkli küpler. Hop, kutuya!'], [24, 32.5, 'Kırmızı araba da yerine. Düt düt!'], [33, 41.5, 'Bıdık da kutusunda dinlensin.'], [42, 52, 'Oda tertemiz oldu! Toplamak da oyun kadar eğlenceli.']],
  sfx: [].concat(...[0, 1, 2, 3].map(i => { const T = 6 + 9 * i; return [[T + 2.5, 'pop'], [T + 5.5, 'slide'], [T + 6.3, 'ding']]; }), [[43, 'pop'], [44, 'ding'], [44.4, 'ding'], [46.5, 'boing'], [48, 'boing'], [49.5, 'boing']]),
  draw(c, t) {
    room(c, t, { wall: '#e8e0ff', wall2: '#d9ceff', win: [140, 110, 230, 210], rug: [520, 250, '#ffd59e', '#ffe9c9'], winDraw: (c, x, y, w, h) => { sun(c, x + 60, y + 60, 30, t); cloud(c, x + 160, y + 140, 0.7); } });
    rr(c, 940, 190, 250, 16, 8, '#b9794a'); rr(c, 960, 130, 26, 60, 4, '#ff5d73'); rr(c, 990, 120, 26, 70, 4, '#4db6ff'); rr(c, 1020, 138, 26, 52, 4, '#ffd23f'); rr(c, 1060, 126, 30, 64, 4, '#4cc35b');
    const BX = 680, lidC = eseg(t, 42.5, 43.5);
    rr(c, BX - 84, GY - 150, 168, 150, 12, '#5a6bd6');
    c.save(); c.translate(BX - 84, GY - 128); c.rotate(-1.9 * (1 - lidC)); rr(c, 0, -20, 168, 22, 10, '#6b7ce6'); c.restore();
    const px = kf(t, X8), walk = clamp(Math.abs(kf(t + 0.05, X8) - px) / 3.5), front = [];
    for (let i = 0; i < 4; i++) {
      const T = 6 + 9 * i, [tx, fn] = TOYS[i];
      if (t < T + 2.5) fn(c, tx, GY);
      else if (t < T + 5.5) front.push(() => fn(c, px, GY - 64 + Math.sin(t * 11) * 3 * walk));
      else if (t < T + 6.3) { const u = seg(t, T + 5.5, T + 6.3); c.save(); const x = lerp(px, BX, u), y = lerp(GY - 64, GY - 90, u) - Math.sin(u * PI) * 130; c.translate(x, y); c.rotate(u * 5 * (px < BX ? 1 : -1)); c.scale(1 - u * 0.3, 1 - u * 0.3); fn(c, 0, 20); c.restore(); }
    }
    rr(c, BX - 90, GY - 128, 180, 128, 12, '#7d8ff0'); star(c, BX, GY - 64, 34, '#ffe66d', 0); rr(c, BX - 90, GY - 128, 180, 16, 8, '#96a5ff');
    const carry = [0, 1, 2, 3].some(i => t > 6 + 9 * i + 2.5 && t < 6 + 9 * i + 5.5), toss = [0, 1, 2, 3].some(i => t >= 6 + 9 * i + 5.5 && t < 6 + 9 * i + 7.5), done = t > 43.5;
    const v = kf(t + 0.05, X8) - px;
    pitir(c, { x: px, y: GY, t, walk, face: walk > 0.1 ? Math.sign(v) : toss ? (px < BX ? 1 : -1) : 0, jump: hops(t, [46.5, 48, 49.5], 0.5, 65), armL: carry ? 1.0 : toss || done ? 2.4 + Math.sin(t * 9) * 0.25 : 0.25, armR: carry ? 1.0 : toss || done ? 2.4 - Math.sin(t * 9) * 0.25 : 0.25, armsFront: carry,
      mood: t < 5.5 ? 'o' : toss || done ? 'joy' : 'happy' });
    front.forEach(f => f());
    for (let i = 0; i < 4; i++) sparkles(c, t, 6 + 9 * i + 6.3, 6 + 9 * i + 7.8, BX - 110, GY - 260, 220, 140, 6);
    sparkles(c, t, 43.5, 53, 60, 100, 1160, 480, 16);
    popText(c, t, 44, 51.5, 'TERTEMİZ!', 900, 330, 96, '#7d8ff0');
  }
};

// ================= 9. BANYO ZAMANI =================
const ep9 = {
  title: 'Banyo Zamanı', color: '#27b5d8', focus: [640, 380],
  music: { bpm: 112, root: 65, seed: 97, style: 'bouncy' },
  caps: [[0.5, 5, 'Pıtır bahçede oynadı. Her yeri çamur olmuş!'], [5.5, 11, 'Küvet doldu, köpükler hazır. Banyo zamanı!'], [11.5, 19, 'Cup! Su ılık, köpükler yumuşacık.'], [19.5, 27, 'Köpükten şapka! Vak vak, ördek de geldi.'], [27.5, 34, 'Elleri yıka, yüzü yıka. Çamurlar güle güle!'], [34.5, 40.5, 'Baloncuklar uçuşuyor. Pat pat pat!'], [41, 52, 'Pıtır mis gibi oldu! Temizlik ne güzel şey.']],
  sfx: [[5.5, 'water', 3.5], [11, 'boing'], [11.9, 'splash'], [20, 'pop'], [21.5, 'quack'], [23, 'quack'], [29, 'quack'], [35, 'pop'], [36, 'pop'], [37, 'pop'], [38, 'pop'], [39, 'pop'], [40, 'boing'], [42, 'ding'], [42.4, 'ding'], [46, 'boing'], [48, 'boing']],
  draw(c, t) {
    room(c, t, { wall: '#d9f3ff', wall2: '#bfe6f7', tiles: true, floor: '#f3e3c3', skirt: '#9fd8ee', win: [150, 100, 200, 180], rug: [380, 150, '#ffb3c7', '#ffd9e3'], winDraw: (c, x, y, w, h) => { sun(c, x + 140, y + 55, 28, t); } });
    const fill = eseg(t, 5.5, 9), TX = 640, TW = 470, RY = GY - 190;
    line(c, 1090, RY - 110, 1090, RY, 14, '#b8c4cf'); line(c, 1090, RY - 110, 1040, RY - 110, 14, '#b8c4cf'); line(c, 1040, RY - 110, 1040, RY - 90, 14, '#b8c4cf');
    if (t > 5.5 && t < 9.2) line(c, 1040, RY - 84, 1040, RY + 20, 9, '#8fd3ff');
    rr(c, TX, RY + 6, TW, 60, 10, '#bfe9f7');
    const inTub = t >= 11 && t < 40.6, wash = t > 27.5 && t < 34, popb = t > 34.5 && t < 40;
    let p;
    const dirt = 1 - eseg(t, 14, 26);
    const drawP = () => {
      if (t < 11) p = actor(c, t, [[0, 300], [8, 300], [10.6, 500]], { dirt: 1, mood: t < 5 ? 'sad' : 'happy', armL: t < 5 ? 1.2 : 0.25, armR: t < 5 ? 1.2 : 0.25, face: t < 5 ? 0 : 1 });
      else if (t < 12) { const u = t - 11; p = pitir(c, { x: lerp(500, 870, u), y: lerp(GY, GY - 130, u), t, jump: -200 * Math.sin(PI * u), dirt: 1, mood: 'joy', armL: 2.5, armR: 2.5, noShadow: true }); }
      else if (t < 40) p = pitir(c, { x: 870, y: GY - 130, t, noShadow: true, dirt, bob: Math.sin(t * 2.2) * 5, mood: popb ? 'joy' : wash ? (Math.sin(t * 3) > 0 ? 'joy' : 'happy') : t < 14 ? 'joy' : 'happy', tilt: Math.sin(t * 1.4) * 0.06,
        armL: wash ? 2.5 + Math.sin(t * 10) * 0.2 : popb ? 1.3 : 1.1 + Math.sin(t * 2) * 0.2, armR: wash ? 2.5 - Math.sin(t * 10) * 0.2 : popb ? 2.6 + Math.sin(t * 7) * 0.4 : 1.1 - Math.sin(t * 2) * 0.2 });
      else if (t < 41.2) { const u = (t - 40) / 1.2; p = pitir(c, { x: lerp(870, 440, u), y: lerp(GY - 130, GY, u), t, jump: -170 * Math.sin(PI * u), mood: 'joy', armL: 2.5, armR: 2.5, noShadow: true }); }
      else p = pitir(c, { x: 440, y: GY, t, mood: 'joy', jump: hops(t, [46, 48, 50], 0.5, 65), armL: t > 45 ? 2.4 + Math.sin(t * 9) * 0.25 : 0.25, armR: t > 43 ? wave(t) : 0.25 });
      if (t > 19.5 && t < 40) { const k = backOut(seg(t, 19.5, 20.2)); for (const [dx, dy, r] of [[-26, 8, 24], [26, 8, 24], [0, -6, 30], [-4, -34, 18]]) circ(c, p.top[0] + dx * k, p.top[1] + 22 + dy * k, r * k, '#fff'); }
    };
    if (inTub || (t >= 11 && t < 40.6)) drawP();
    rr(c, TX + 10, RY + 20, TW - 20, 172, [20, 20, 70, 70], '#fff'); rr(c, TX + 30, RY + 150, TW - 60, 26, 13, '#e6eef5');
    rr(c, TX + 60, GY - 14, 30, 18, 6, '#d9b25f'); rr(c, TX + TW - 90, GY - 14, 30, 18, 6, '#d9b25f');
    rr(c, TX - 8, RY, TW + 16, 32, 16, '#f4f8fb');
    if (fill > 0) for (let i = 0; i < 13; i++) circ(c, TX + 30 + i * 34, RY + 4 - fill * 12 + Math.sin(t * 2 + i) * 3, (20 + rnd(i) * 12) * fill, '#fff');
    if (t > 21) { const dx = kf(t, [[21, 1140], [23, 1000], [29, 720], [36, 980], [41, 1000]]); duck(c, dx, RY - 26 + Math.sin(t * 3) * 4, 1.1, t); }
    if (t > 9) { c.save(); c.globalAlpha = 1 - eseg(t, 40.5, 42.5); for (let i = 0; i < 16; i++) { const u = (t * 0.12 * (0.6 + rnd(i)) + rnd(i + 20)) % 1; if (popb && i < 5 && t > 35 + i && t < 35.25 + i) { star(c, p.hR[0] + 10, p.hR[1] - 30, 30, '#fff', t * 9, 8, 0.4); continue; } bubble(c, TX + 30 + rnd(i + 40) * (TW - 60) + Math.sin(t * 2 + i) * 14, RY - 10 - u * 380, 10 + rnd(i + 8) * 16); } c.restore(); }
    if (!(t >= 11 && t < 40.6)) drawP();
    if (t >= 11.9) splash(c, 870, RY, t, 11.9, '#fff');
    if (t > 41.5) sparkles(c, t, 41.5, 53, 300, 220, 280, 330, 10, '#fff');
    popText(c, t, 43.5, 51.5, 'MİS GİBİ!', 850, 180, 96, '#27b5d8');
  }
};

// ================= 10. İYİ GECELER =================
const ep10 = {
  title: 'İyi Geceler', color: '#4a4fb0', focus: [900, 430],
  music: { bpm: 72, root: 60, seed: 101, style: 'lullaby' },
  caps: [[0.5, 6, 'Gece oldu. Pıtır pijamalarını giydi, esniyor.'], [6.5, 12, 'Gökyüzünde yıldızlar parlıyor. Bir yıldız...'], [12.5, 20, 'İki yıldız... Üç yıldız... Ne kadar da çoklar!'], [20.5, 27.5, 'Cik bile yuvasında uyumuş. Şşşt!'], [28, 34, "Pıtır yatağına giriyor, Bıdık'a sarılıyor."], [34.5, 42, 'Işıklar söndü. Tatlı rüyalar Pıtır!'], [42.5, 52, 'İyi geceler! Yarın yeni maceralarda görüşürüz.']],
  sfx: [[8, 'count', 0], [13, 'count', 1], [16.5, 'count', 2], [28, 'boing'], [34, 'pop'], [44, 'slidedown'], [44.6, 'ding']],
  draw(c, t) {
    const k = eseg(t, 34, 35.5);
    const ST = [[60, 60, 8], [140, 150, 13], [70, 185, 16.5]];
    room(c, t, { wall: mix('#cdd3ff', '#2d3170', k), wall2: mix('#bcc4fb', '#343a80', k), floor: mix('#d9a877', '#5b466f', k), skirt: mix('#ffffff', '#4a4f99', k), win: [470, 100, 280, 230], sky: '#141a4a', rug: [460, 200, mix('#ffb3c7', '#5d4a8a', k), mix('#ffd9e3', '#6b5899', k)],
      winDraw: (c, x, y, w, h) => {
        for (let i = 0; i < 22; i++) sparkle(c, x + rnd(i + 3) * w, y + rnd(i + 60) * h, 4 + rnd(i) * 5, t * 0.5 + i, '#fff');
        moon(c, x + 215, y + 62, 34);
        ST.forEach(([sx, sy, T], i) => { const g = t > T ? backOut(seg(t, T, T + 0.5)) : 0; star(c, x + sx, y + sy, 9 + g * 16 + Math.sin(t * 4 + i) * 2, g ? '#ffe66d' : '#fff', Math.sin(t + i) * 0.2); });
        if (t > 44 && t < 45.3) { const u = (t - 44) / 1.3, sx = x + w - u * w * 1.1, sy = y + 20 + u * 120; line(c, sx, sy, sx + 70, sy - 30, 4, 'rgba(255,255,255,.6)'); star(c, sx, sy, 10, '#fff'); }
      } });
    ST.forEach(([sx, sy, T], i) => popText(c, t, T + 0.2, Math.min(T + 5, 20.5), String(i + 1), 300 + i * 0, 180, 150, '#ffd23f'));
    // yuva + Cik
    ell(c, 520, 340, 46, 16, '#9a6234'); cik(c, 518, 338, t, { s: 0.8, sleep: true, face: 1 }); ell(c, 520, 346, 50, 12, '#b9794a');
    if (t > 20.5) zzz(c, 540, 290, t * 0.8, '#fff');
    // komodin + lamba
    rr(c, 690, GY - 80, 80, 80, 10, mix('#b9794a', '#5b3f52', k)); circ(c, 730, GY - 44, 6, '#ffd23f');
    if (k < 1) { c.save(); c.globalAlpha = (1 - k) * 0.35; circ(c, 730, GY - 150, 130, '#fff6c9'); c.restore(); }
    line(c, 730, GY - 80, 730, GY - 120, 8, '#8a8fb8'); c.beginPath(); c.moveTo(700, GY - 118); c.lineTo(760, GY - 118); c.lineTo(748, GY - 172); c.lineTo(712, GY - 172); c.closePath(); c.fillStyle = mix('#ffe66d', '#8a84b0', k); c.fill();
    bed(c, 780, GY, { pillow: mix('#fff7d6', '#b9b3d6', k) });
    const inBed = t >= 29;
    if (inBed) {
      teddy(c, 975, GY - 96, 0.62, t, 0.5);
      c.save(); c.translate(888, GY - 118); c.scale(S, S); c.rotate(-1.25); head(c, { t, mood: t > 34.5 ? 'sleep' : 'happy' }); c.restore();
      blanket(c, 780, GY, t, mix('#9b8cf2', '#5d55b5', k), 1);
      if (t > 37) zzz(c, 900, GY - 190, t, '#fff');
    } else {
      blanket(c, 780, GY, t, '#9b8cf2', 0.45); teddy(c, 1010, GY - 100, 0.62, t, 0.2);
      const yawn = pulse(t, 1, 5.5, 0.5), point = [8, 13, 16.5].reduce((s, T) => Math.max(s, pulse(t, T - 0.5, T + 2.5, 0.4)), 0);
      if (t < 28) actor(c, t, [[0, 360], [24, 360], [27.5, 690]], { pj: true, mood: yawn > 0.5 ? 'o' : t > 20.5 && t < 24 ? 'o' : point > 0.5 ? 'wow' : 'happy', blink: yawn > 0.5 ? 1 : undefined, armR: yawn > 0.2 ? 0.25 + yawn * 2.35 : 0.25 + point * 1.9, armL: t > 21 && t < 24 ? 2.62 : 0.25, face: t > 6 && t < 24 ? 0.8 : 0, tilt: point * -0.1 });
      else { const u = t - 28; pitir(c, { x: lerp(690, 900, u), y: GY, t, pj: true, jump: lerp(0, -110, u) - 130 * Math.sin(PI * u), mood: 'joy', armL: 2.3, armR: 2.3, noShadow: true }); }
    }
    if (k > 0) { c.fillStyle = `rgba(12,14,60,${0.38 * k})`; c.fillRect(0, 0, W, H); c.save(); c.globalAlpha = 0.1 * k; c.beginPath(); c.moveTo(470, 330); c.lineTo(750, 330); c.lineTo(1000, 720); c.lineTo(420, 720); c.closePath(); c.fillStyle = '#cfd6ff'; c.fill(); c.restore(); }
  }
};

module.exports = [ep1, ep2, ep3, ep4, ep5, ep6, ep7, ep8, ep9, ep10];
