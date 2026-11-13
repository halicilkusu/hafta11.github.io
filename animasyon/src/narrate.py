# Anlatım: altyazı metinlerini Piper (tr_TR-fettah, CC0) ile seslendirir ve müziğin üstüne bindirir.
# Kullanım: python3 narrate.py caps.json muzik.wav model.onnx cikti.wav
import json, sys, wave, io
import numpy as np
from piper import PiperVoice, SynthesisConfig

caps = json.load(open(sys.argv[1])); SR = 44100; INTRO = 5; EP = 60
w = wave.open(sys.argv[2]); bed = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2).astype(np.float32) / 32768
voice = PiperVoice.load(sys.argv[3], config_path=sys.argv[3] + '.json')
FIX = {'Zırrr! Zırrr!': 'Zırr, zırr!', 'Şşşt!': 'Şşş.', 'Uçuyoruum!': 'Uçuyorum!', 'Aa!': 'A!', 'Aa,': 'A,', 'Vaay!': 'Vay!'}

def say(text, scale):
    for a, b in FIX.items(): text = text.replace(a, b)
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as o: voice.synthesize_wav(text, o, syn_config=SynthesisConfig(length_scale=scale))
    buf.seek(0); r = wave.open(buf); sr = r.getframerate()
    x = np.frombuffer(r.readframes(r.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    nz = np.where(np.abs(x) > 0.01)[0]; x = x[max(0, nz[0] - 400): nz[-1] + 2000]
    return np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x).astype(np.float32)

sp = np.zeros(len(bed), dtype=np.float32); worst = 0
for i, ep in enumerate(caps):
    for k, (a, b, text) in enumerate(ep):
        limit = (ep[k + 1][0] if k + 1 < len(ep) else 52.5) - a - 0.35
        x = say(text, 1.12)
        if len(x) / SR > limit: x = say(text, max(0.85, 1.12 * limit / (len(x) / SR) * 0.98))
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
