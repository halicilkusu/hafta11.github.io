# Pıtır'ın Maceraları — müzik ve ses efektleri (tamamı sentezlenir, hazır kayıt kullanılmaz)
# Kullanım: python3 audio.py events.json cikti.wav
import json, sys, wave
import numpy as np

SR = 44100
EP_LEN, INTRO, STORY_END = 60, 5, 57
events = json.load(open(sys.argv[1]))
N = len(events) * EP_LEN * SR
mixL = np.zeros(N + SR * 4, dtype=np.float32)
mixR = np.zeros(N + SR * 4, dtype=np.float32)


def add(buf, t, vol=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0 or i >= N: return
    buf = buf[: len(mixL) - i]
    mixL[i:i + len(buf)] += buf * vol * (1 - max(0, pan))
    mixR[i:i + len(buf)] += buf * vol * (1 + min(0, pan))


def tt(d): return np.arange(int(d * SR)) / SR
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def fade(x, a=0.005, r=0.02):
    n = len(x); a = min(int(a * SR), n // 2); r = min(int(r * SR), n // 2)
    e = np.ones(n, dtype=np.float32)
    if a: e[:a] = np.linspace(0, 1, a)
    if r: e[-r:] = np.linspace(1, 0, r)
    return x * e
def lowpass(x, k):  # basit hareketli ortalama
    return np.convolve(x, np.ones(k) / k, mode='same')
rng = np.random.default_rng(7)
def noise(d): return rng.uniform(-1, 1, int(d * SR)).astype(np.float32)

_cache = {}
def tone(kind, m, d):
    key = (kind, m, round(d, 3))
    if key in _cache: return _cache[key]
    f = mtof(m); t = tt(d + 0.25)
    if kind == 'marimba':
        x = np.sin(2 * np.pi * f * t) * np.exp(-t * 7) + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 18) + 0.15 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 9)
    elif kind == 'bell':
        x = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.5) + 0.4 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 7) + 0.2 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t * 12)
    elif kind == 'bass':
        t = tt(d); x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 3.5)
    elif kind == 'pad':
        t = tt(d); x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t + 1)) * np.minimum(1, t / 0.25) * 0.6
        x = fade(x, 0.2, 0.4)
    elif kind == 'uke':
        x = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) + 0.25 * np.sin(2 * np.pi * 3 * f * t)) * np.exp(-t * 9)
    x = fade(x.astype(np.float32), 0.003, 0.03)
    _cache[key] = x
    return x

def kick():
    t = tt(0.22); return (np.sin(2 * np.pi * (50 * t + 60 * (1 - np.exp(-t * 30)) / 30 * 8)) * np.exp(-t * 16)).astype(np.float32)
def shaker(): return fade(noise(0.05) - lowpass(noise(0.05), 8), 0.002, 0.04).astype(np.float32) * 0.6
def clap():
    x = noise(0.09); x = x - lowpass(x, 20); return (x * np.exp(-tt(0.09) * 40)).astype(np.float32)
KICK, SHAK, CLAP = kick(), shaker(), clap()

MAJ = [0, 2, 4, 5, 7, 9, 11]
def deg(root, d):  # gam derecesi -> midi
    return root + 12 * (d // 7) + MAJ[d % 7]

PROGS = [[0, 4, 5, 3], [0, 3, 4, 0], [0, 5, 3, 4], [0, 3, 0, 4]]
RHY = [[1, 1, 1, 1], [1, .5, .5, 1, 1], [.5, .5, 1, .5, .5, 1], [1, 1, 2], [1.5, .5, 1, 1], [.5, .5, .5, .5, 2]]

def make_tune(seed, bars=8):
    r = np.random.default_rng(seed)
    prog = PROGS[seed % len(PROGS)]
    chords = [prog[b % 4] for b in range(bars)]
    chords[-1] = 0; chords[-2] = 4
    def phrase(ch, start):
        notes, d = [], start
        for bar in range(2):
            c = ch[bar]; rh = RHY[r.integers(len(RHY))]
            for k, L in enumerate(rh):
                if k == 0: d = c + [0, 2, 4][r.integers(3)] + (7 if c < 3 else 0)
                else: d += int(r.choice([-2, -1, -1, 1, 1, 2]))
                d = int(np.clip(d, 2, 12)); notes.append((d, L))
        return notes
    A = phrase(chords[0:2], 4); B = phrase(chords[4:6], 7)
    A2 = list(A); C = phrase(chords[6:8], 6)
    C = C[:-1] + [(7, C[-1][1])]  # tonikte bitir
    A2 = A2[:-1] + [(A2[-1][0] + 1, A2[-1][1])]
    return chords, A + A2 + B + C

def music(off, spec, t0, t1):
    bpm, root, seed, style = spec['bpm'], spec['root'], spec['seed'], spec['style']
    beat = 60 / bpm; chords, tune = make_tune(seed)
    loop = 8 * 4 * beat; start = off + t0; end = off + t1
    i0 = len(mixL); seg0 = int(start * SR); seg1 = int(end * SR)
    saveL, saveR = mixL[seg0:seg1 + SR * 2].copy(), mixR[seg0:seg1 + SR * 2].copy()
    mixL[seg0:seg1 + SR * 2] = 0; mixR[seg0:seg1 + SR * 2] = 0
    n = 0
    while start + n * loop < end:
        base = start + n * loop; lead = 'bell' if style == 'lullaby' else ('marimba' if n % 2 == 0 else 'uke')
        up = 12 if (n % 2 == 1 and style != 'lullaby') else 0
        p = 0.0
        for d, L in tune:
            add(tone(lead, deg(root + 12 + up, d), L * beat), base + p * beat, 0.32 if style != 'lullaby' else 0.3, -0.15)
            if n >= 2 and style != 'lullaby' and L >= 1: add(tone('bell', deg(root + 12, d + 2), L * beat), base + p * beat, 0.08, 0.3)
            p += L
        for b in range(8):
            c = chords[b]; bt = base + b * 4 * beat
            if style == 'lullaby':
                for k, dd in enumerate([0, 4, 2, 4, 0, 4, 2, 4]): add(tone('bell', deg(root, c + dd), beat * 0.5), bt + k * beat * 0.5, 0.12, 0.2)
                for dd in (0, 2, 4): add(tone('pad', deg(root, c + dd), beat * 4), bt, 0.05)
                add(tone('bass', deg(root - 24, c), beat * 4), bt, 0.25)
            else:
                for k in range(4):
                    add(tone('bass', deg(root - 24, c + (0 if k % 2 == 0 else 4)), beat * 0.9), bt + k * beat, 0.32)
                    for dd in (0, 2, 4): add(tone('uke', deg(root, c + dd), beat * 0.4), bt + (k + 0.5) * beat, 0.07, 0.35)
                    add(SHAK, bt + (k + 0.5) * beat, 0.12, -0.3); add(SHAK, bt + k * beat, 0.06, -0.3)
                add(KICK, bt, 0.5); add(KICK, bt + 2 * beat, 0.45)
                add(CLAP, bt + beat, 0.12); add(CLAP, bt + 3 * beat, 0.12)
        n += 1
    L = seg1 - seg0; env = np.ones(L + SR * 2, dtype=np.float32)
    fi, fo = int(0.4 * SR), int(1.8 * SR)
    env[:fi] = np.linspace(0, 1, fi); env[L - fo:L] = np.linspace(1, 0, fo); env[L:] = 0
    mixL[seg0:seg1 + SR * 2] = mixL[seg0:seg1 + SR * 2] * env * 0.8 + saveL
    mixR[seg0:seg1 + SR * 2] = mixR[seg0:seg1 + SR * 2] * env * 0.8 + saveR

def jingle(off, root):
    for k, d in enumerate([0, 2, 4, 7, 9, 11, 14]): add(tone('bell', deg(root + 12, d), 0.5), off + 0.25 + k * 0.11, 0.3, (k - 3) * 0.1)
    for k, d in enumerate([7, 7, 9, 7, 11, 14]):
        add(tone('marimba', deg(root + 12, d), 0.3), off + 1.3 + [0, .25, .5, .75, 1.25, 1.75][k], 0.4)
    for d in (0, 2, 4, 7): add(tone('bell', deg(root + 12, d), 1.6), off + 3.05, 0.2); add(tone('pad', deg(root, d), 1.6), off + 3.05, 0.12)
    add(KICK, off + 1.3, 0.5); add(KICK, off + 3.05, 0.6); add(CLAP, off + 2.55, 0.2)
def outro(off, root):
    for d in (4, 6, 8): add(tone('marimba', deg(root + 12, d), 0.4), off + 58.0, 0.3)
    for d in (0, 2, 4, 7): add(tone('bell', deg(root + 12, d), 1.5), off + 58.5, 0.26); add(tone('marimba', deg(root + 12, d), 1.0), off + 58.5, 0.26)
    add(KICK, off + 58.5, 0.6)

# ---------- ses efektleri ----------
def sweep(f0, f1, d, shape=1.0):
    t = tt(d); u = (t / d) ** shape; f = f0 + (f1 - f0) * u
    return np.sin(2 * np.pi * np.cumsum(f) / SR).astype(np.float32)
def sfx(name, arg):
    if name == 'pop': return fade(sweep(900, 200, 0.07) * np.exp(-tt(0.07) * 30), 0.001, 0.02), 0.6
    if name == 'ding': return tone('bell', 91, 0.8) + 0.5 * tone('bell', 96, 0.8), 0.3
    if name == 'count': return tone('bell', [72, 74, 76, 77, 79][int(arg)], 1.0) + tone('marimba', [72, 74, 76, 77, 79][int(arg)], 1.0), 0.45
    if name == 'boing':
        t = tt(0.32); return fade(sweep(220, 660, 0.32, 0.6) * (1 + 0.3 * np.sin(2 * np.pi * 28 * t)) * np.exp(-t * 5), 0.005, 0.05), 0.3
    if name == 'slide': return fade(sweep(400, 1300, 0.45) * 0.7, 0.02, 0.12), 0.22
    if name == 'slidedown': return fade(sweep(1300, 350, 0.5) * 0.7, 0.02, 0.12), 0.22
    if name == 'tweet':
        x = np.concatenate([fade(sweep(2600, 3800, 0.07), 0.005, 0.02), np.zeros(int(0.05 * SR), dtype=np.float32), fade(sweep(3000, 4200, 0.08), 0.005, 0.02)]); return x, 0.16
    if name == 'quack':
        t = tt(0.16); x = np.sign(np.sin(2 * np.pi * 420 * t)) * 0.5 + np.sin(2 * np.pi * 840 * t); x = lowpass(x * (1 + 0.5 * np.sin(2 * np.pi * 60 * t)), 12)
        x = fade(x.astype(np.float32), 0.01, 0.05); return np.concatenate([x, np.zeros(int(0.06 * SR), dtype=np.float32), x * 0.8]), 0.2
    if name == 'alarm':
        t = tt(0.9); x = (np.sin(2 * np.pi * 2100 * t) + 0.6 * np.sin(2 * np.pi * 3150 * t)) * (np.sin(2 * np.pi * 22 * t) > 0); return fade(x.astype(np.float32), 0.005, 0.05), 0.1
    if name == 'munch':
        x = noise(0.12); x = lowpass(x, 6) - lowpass(x, 60); return fade((x * np.exp(-tt(0.12) * 22)).astype(np.float32), 0.002, 0.03), 0.9
    if name == 'splash':
        x = noise(0.5); x = lowpass(x, 5) - lowpass(x, 40); return fade((x * np.exp(-tt(0.5) * 7)).astype(np.float32), 0.005, 0.1), 0.55
    if name in ('rain', 'water', 'brush'):
        d = float(arg); x = noise(d)
        if name == 'rain': x = (lowpass(x, 4) - lowpass(x, 30)) * 0.5
        elif name == 'water': x = (lowpass(x, 3) - lowpass(x, 14)) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tt(d))) * 0.5
        else: x = (x - lowpass(x, 6)) * (0.5 + 0.5 * np.sin(2 * np.pi * 4.4 * tt(d))) ** 2 * 0.35
        return fade(x.astype(np.float32), 0.5, 0.8), 0.35
    if name == 'grow':
        d = float(arg); t = tt(d); x = sweep(260, 780, d, 1.2) * (0.5 + 0.5 * np.sin(2 * np.pi * 6 * t)); return fade(x.astype(np.float32), 0.3, 0.6), 0.1
    raise KeyError(name)

for i, ep in enumerate(events):
    off = i * EP_LEN; root = ep['music']['root']
    jingle(off, root)
    music(off, ep['music'], INTRO, STORY_END + 0.5)
    outro(off, root)
    for ev in ep['sfx']:
        x, vol = sfx(ev[1], ev[2] if len(ev) > 2 else None)
        add(np.asarray(x, dtype=np.float32), off + INTRO + ev[0], vol, 0.0)

L, R = mixL[:N], mixR[:N]
peak = max(np.abs(L).max(), np.abs(R).max())
g = 0.9 / peak * 1.6  # hafif yumuşak sınırlama
L, R = np.tanh(L * g) , np.tanh(R * g)
st = (np.stack([L, R], axis=1) * 0.92 * 32767).astype(np.int16)
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
print('ok', N / SR, 'sn, tepe', float(peak))
