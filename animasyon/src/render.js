// Kullanım:
//   node render.js ep <n> <cikti.mp4>      -> n. bölümü (60 sn) işler
//   node render.js png <n> <saniye> <cikti.png>
//   node render.js events <cikti.json>     -> ses efektleri zaman çizelgesi
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const L = require('./lib');
const EPS = require('./episodes');
GlobalFonts.registerFromPath(path.join(__dirname, 'Baloo2-ExtraBold.ttf'), L.FONT);
const { W, H, FPS, clamp, eseg, seg, pulse, backOut, circ, rr, text, star, pitir, cik, rnd, TAU } = L;
const SERIES = "Pıtır'ın Maceraları";
const INTRO = 5, STORY_END = 57, EP_LEN = 60;

function titleCard(c, ep, n, te) {
  c.fillStyle = ep.color; c.fillRect(0, 0, W, H);
  c.save(); c.translate(W / 2, H / 2); c.rotate(te * 0.15); c.globalAlpha = 0.13; c.fillStyle = '#fff';
  for (let i = 0; i < 12; i++) { c.rotate(TAU / 12); c.beginPath(); c.moveTo(0, 0); c.lineTo(1000, -130); c.lineTo(1000, 130); c.fill(); }
  c.restore();
  for (let i = 0; i < 14; i++) star(c, rnd(i + n) * W, ((rnd(i + 20) * H + te * 30 * (0.5 + rnd(i))) % (H + 40)) - 20, 10 + rnd(i + 4) * 14, 'rgba(255,255,255,.55)', te + i);
  text(c, SERIES, W / 2, 80, 46, '#fff', { stroke: 'rgba(0,0,0,.18)', sw: 10 });
  const k = backOut(seg(te, 0.3, 0.9));
  c.save(); c.translate(W / 2, 250); c.scale(k, k); circ(c, 0, 0, 96, '#fff'); circ(c, 0, 0, 82, '#ffd23f');
  text(c, String(n), 0, 8, 120, '#fff', { stroke: '#e58a00', sw: 14 }); c.restore();
  const k2 = backOut(seg(te, 0.8, 1.4));
  c.save(); c.translate(W / 2, 400); c.scale(k2, k2); text(c, n + '. BÖLÜM', 0, 0, 44, '#fff', { stroke: 'rgba(0,0,0,.2)', sw: 9 }); c.restore();
  const k3 = backOut(seg(te, 1.2, 1.9));
  c.font = `84px ${L.FONT}`; const ts = Math.min(84, 84 * 720 / c.measureText(ep.title).width);
  c.save(); c.translate(W / 2 + 30, 490); c.scale(k3, k3); text(c, ep.title, 0, 0, ts, '#fff', { stroke: '#3d2a70', sw: 18 }); c.restore();
  const px = -200 + 350 * backOut(seg(te, 0.2, 1.1));
  pitir(c, { x: px, y: 660, s: 0.95, t: te, mood: 'joy', armR: 2.5 + Math.sin(te * 9) * 0.35, armL: 0.5, jump: L.hops(te, [2.2, 3.0], 0.5, 40) });
  cik(c, W + 160 - 330 * backOut(seg(te, 0.6, 1.4)), 650 + L.hops(te, [1.8, 2.5, 3.2, 3.9], 0.35, 30), te, { s: 1.5, face: -1, flap: 1 });
}
function caption(c, ep, t) {
  for (const [a, b, s] of ep.caps) {
    if (t < a || t > b) continue;
    const al = pulse(t, a, b, 0.3);
    c.save(); c.globalAlpha = al; c.font = `36px ${L.FONT}`;
    let size = 36, w = c.measureText(s).width; if (w > W - 140) { size = 36 * (W - 140) / w; w = W - 140; }
    const y = 668 + (1 - al) * 16;
    rr(c, W / 2 - w / 2 - 34, y - 34, w + 68, 66, 33, 'rgba(255,255,255,.94)');
    c.lineWidth = 5; c.strokeStyle = ep.color; c.stroke();
    text(c, s, W / 2, y + 2, size, '#3d2a70'); c.restore();
  }
}
function badge(c, ep, n) {
  c.font = `26px ${L.FONT}`; const s = `${n}. Bölüm  •  ${ep.title}`, w = c.measureText(s).width;
  rr(c, 22, 20, w + 44, 48, 24, ep.color); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke();
  text(c, s, 44, 46, 26, '#fff', { align: 'left' });
}
function frame(c, n, te) {
  const ep = EPS[n - 1];
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
  if (te < INTRO) {
    titleCard(c, ep, n, te);
    const f = Math.max(1 - eseg(te, 0, 0.4), 0); if (f > 0) { c.globalAlpha = f; c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
    return;
  }
  const t = te - INTRO;
  c.save(); ep.draw(c, t); c.restore(); c.globalAlpha = 1;
  if (te < STORY_END) caption(c, ep, t);
  badge(c, ep, n);
  const fin = 1 - eseg(te, INTRO, INTRO + 0.5); // başlangıçta beyazdan aç
  if (fin > 0) { c.globalAlpha = fin; c.fillStyle = ep.color; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
  if (te >= STORY_END) { // iris kapanışı + bölüm sonu kartı
    const u = eseg(te, STORY_END, STORY_END + 1.2), [fx, fy] = ep.focus || [W / 2, 400];
    const R = (1 - u) * 900;
    c.beginPath(); c.rect(0, 0, W, H); c.arc(fx, fy, Math.max(R, 0.01), 0, TAU, true); c.fillStyle = ep.color; c.fill('evenodd');
    const k = backOut(seg(te, STORY_END + 1.0, STORY_END + 1.6));
    if (k > 0) {
      c.save(); c.translate(W / 2, H / 2); c.scale(k, k);
      star(c, 0, -20, 190, '#ffd23f', Math.sin(te * 2) * 0.1); star(c, 0, -20, 150, '#ffe98a', Math.sin(te * 2) * 0.1);
      text(c, n === EPS.length ? 'SON' : 'Aferin!', 0, -12, n === EPS.length ? 80 : 62, '#fff', { stroke: '#e58a00', sw: 14 });
      text(c, n === EPS.length ? 'Görüşmek üzere, hoşça kalın!' : `${n}. bölüm bitti`, 0, 220, 44, '#fff', { stroke: 'rgba(0,0,0,.2)', sw: 9 });
      c.restore();
    }
    const fo = eseg(te, EP_LEN - 0.35, EP_LEN); if (fo > 0) { c.globalAlpha = fo; c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
  }
}

async function main() {
  const [mode, a, b, d] = process.argv.slice(2);
  if (mode === 'events') {
    fs.writeFileSync(a, JSON.stringify(EPS.map(e => ({ title: e.title, music: e.music, sfx: e.sfx || [] })), null, 1)); return;
  }
  const canvas = createCanvas(W, H), c = canvas.getContext('2d');
  if (mode === 'png') { frame(c, +a, +b); fs.writeFileSync(d, canvas.toBuffer('image/png')); return; }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-g', '60', b], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = EP_LEN * FPS;
  for (let i = 0; i < N; i++) {
    frame(c, +a, i / FPS);
    if (!ff.stdin.write(canvas.data())) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
main();
