// YouTube profil fotoğrafı (kare; daire kırpmasına uygun). Kullanım: node profil.js cikti.png
const { createCanvas } = require('@napi-rs/canvas');
const L = require('./lib'), fs = require('fs');
const N = 1024, cv = createCanvas(N, N), c = cv.getContext('2d');
const g = c.createRadialGradient(N / 2, N / 2, 60, N / 2, N / 2, N * 0.75); g.addColorStop(0, '#ffd76a'); g.addColorStop(1, '#ff9f43');
c.fillStyle = g; c.fillRect(0, 0, N, N);
c.save(); c.translate(N / 2, N / 2); c.globalAlpha = 0.16; c.fillStyle = '#fff';
for (let i = 0; i < 12; i++) { c.rotate(L.TAU / 12); c.beginPath(); c.moveTo(0, 0); c.lineTo(900, -120); c.lineTo(900, 120); c.fill(); }
c.restore();
for (const [x, y, r, a] of [[205, 300, 30, 0.3], [820, 290, 36, -0.2], [170, 620, 24, 0.5], [850, 610, 26, 0.1]]) L.star(c, x, y, r, 'rgba(255,255,255,.85)', a);
// omuzdan yukarı büyük Pıtır: daire içine sığacak şekilde ortalanır
L.pitir(c, { x: N / 2, y: 1290, s: 2.75, t: 0.6, mood: 'joy', armL: 2.45, armR: 2.45, noShadow: true, bob: 0 });
fs.writeFileSync(process.argv[2], cv.toBuffer('image/png'));
