# Anlatım: altyazı metinlerini Piper (tr_TR-fettah, CC0) ile seslendirir ve müziğin üstüne bindirir.
# Gerekenler: pip install piper-tts pyworld numpy
# Kullanım: python3 narrate.py caps.json muzik.wav model.onnx cikti.wav
import json, sys, wave, io
import numpy as np
from piper import PiperVoice, SynthesisConfig

caps = json.load(open(sys.argv[1])); SR = 44100; INTRO = 5; EP = 60
w = wave.open(sys.argv[2]); bed = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2).astype(np.float32) / 32768
voice = PiperVoice.load(sys.argv[3], config_path=sys.argv[3] + '.json')
import pyworld
# Okunan metin: ekrandaki ses taklitleri (fış fış, ham ham...) seslendirilmez
SAY = {
 'Zırrr! Zırrr! Saat çaldı. Günaydın Pıtır!': 'Saat çaldı! Günaydın Pıtır!',
 'Şimdi dişleri fırçalama zamanı. Fış fış fış!': 'Şimdi, dişleri fırçalama zamanı!',
 'Vaay! Dişler pırıl pırıl parlıyor.': 'Vay! Dişler pırıl pırıl parlıyor!',
 'Pıtır bahçede. Aa, gökyüzünde bir şey var!': 'Pıtır bahçede. Bak! Gökyüzünde bir şey var!',
 'Bir, iki, üç... Pıtır havalanıyor! Uçuyoruum!': 'Bir, iki, üç! Pıtır havalanıyor!',
 'Şıp şıp şıp! Yağmur yağıyor. Şemsiye açıldı!': 'Yağmur yağıyor! Şemsiye açıldı!',
 'Bir su birikintisi! Hop, şap! Hop, şap!': 'Bir su birikintisi! Haydi zıplayalım!',
 'Şır şır şır... Tohum su içmeyi çok sever.': 'Tohum, su içmeyi çok sever!',
 'Aa! Toprağın içinden minik bir filiz çıktı!': 'Bak! Toprağın içinden minik bir filiz çıktı!',
 'Tık! Bir elma düştü. Bir!': 'Bir elma düştü! Bir!',
 'Elma! Kıtır kıtır. Ham ham ham!': 'Elma! Kıtır kıtır bir elma!',
 'Muz! Yumuşacık ve tatlı. Ham ham ham!': 'Muz! Yumuşacık ve tatlı!',
 'Çilek! Mis gibi kokuyor. Ham ham ham!': 'Çilek! Mis gibi kokuyor!',
 'Portakal! Sulu sulu. Ham ham ham!': 'Portakal! Sulu mu sulu!',
 'Meyve yiyen Pıtır güçlendi! Hop hop, zıp zıp!': 'Meyve yiyen Pıtır güçlendi!',
 'Önce top. Hop, kutuya!': 'Önce top! Haydi kutuya!',
 'Sonra renkli küpler. Hop, kutuya!': 'Sonra renkli küpler! Onlar da kutuya!',
 'Kırmızı araba da yerine. Düt düt!': 'Kırmızı araba da yerine!',
 'Cup! Su ılık, köpükler yumuşacık.': 'Su ılık, köpükler yumuşacık!',
 'Köpükten şapka! Vak vak, ördek de geldi.': 'Köpükten şapka! Ördek de geldi!',
 'Baloncuklar uçuşuyor. Pat pat pat!': 'Baloncuklar uçuşuyor!',
 'Cik bile yuvasında uyumuş. Şşşt!': 'Cik bile yuvasında uyumuş. Sessiz olalım.',
}

def lively(x, sr, expand, shift):
    # tonlamayı canlandır: perde iniş çıkışlarını büyüt, sesi biraz incelt
    x64 = x.astype(np.float64)
    f0, t = pyworld.harvest(x64, sr, f0_floor=100, f0_ceil=500)
    spc = pyworld.cheaptrick(x64, f0, t, sr); ap = pyworld.d4c(x64, f0, t, sr)
    v = f0 > 0
    if v.sum() < 5: return x
    med = np.median(f0[v]); f0n = f0.copy()
    f0n[v] = np.clip(med * shift * (f0[v] / med) ** expand, 110, 520)
    return pyworld.synthesize(f0n, spc, ap, sr).astype(np.float32)

def say(text, scale, calm=False):
    text = SAY.get(text, text)
    buf = io.BytesIO()
    cfg = SynthesisConfig(length_scale=scale, noise_scale=0.6 if calm else 0.85, noise_w_scale=0.8 if calm else 0.95)
    with wave.open(buf, 'wb') as o: voice.synthesize_wav(text, o, syn_config=cfg)
    buf.seek(0); r = wave.open(buf); sr = r.getframerate()
    x = np.frombuffer(r.readframes(r.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    nz = np.where(np.abs(x) > 0.01)[0]; x = x[max(0, nz[0] - 400): nz[-1] + 2000]
    x = lively(x, sr, 1.15 if calm else 1.6, 1.0 if calm else 1.06)
    return np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x).astype(np.float32)

sp = np.zeros(len(bed), dtype=np.float32); worst = 0
for i, ep in enumerate(caps):
    for k, (a, b, text) in enumerate(ep):
        limit = (ep[k + 1][0] if k + 1 < len(ep) else 52.5) - a - 0.35
        calm = i == len(caps) - 1; base = 1.18 if calm else 1.04
        x = say(text, base, calm)
        if len(x) / SR > limit: x = say(text, max(0.85, base * limit / (len(x) / SR) * 0.98), calm)
        worst = max(worst, len(x) / SR - limit)
        x = x / max(0.05, np.abs(x).max()) * 0.8
        s = int((i * EP + INTRO + a + 0.25) * SR); sp[s:s + len(x)] += x[: len(sp) - s]
print('en kötü taşma (sn):', round(worst, 2))
# konuşma varken müziği kıs (yumuşak geçişli)
env = np.abs(sp); k = int(0.25 * SR); env = np.convolve((env > 0.01).astype(np.float32), np.ones(k) / k, 'same')
env = np.convolve(np.minimum(1, env * 3), np.ones(k) / k, 'same')
duck = 1 - 0.68 * env
out = bed * duck[:, None] + sp[:, None] * 0.95
out = np.tanh(out * 1.05)
with wave.open(sys.argv[4], 'wb') as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((out * 0.95 * 32767).astype(np.int16).tobytes())
print('ok')
