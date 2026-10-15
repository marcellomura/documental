"""Procesa la narración: recorta silencios de borde, compacta pausas y acelera.
Salida: audio/final/sXX.wav (44.1 kHz mono) listo para Remotion.
PAUSAS=respirar (voces que ya vienen con buen ritmo, p. ej. eleven_v4): no compacta; alarga un poco las pausas
de fin de frase (las de 0,22 s o más, x1,4 con tope de 0,65 s) para que el relato respire."""
import subprocess, numpy as np, json, os, sys
SR = 44100
TEMPO = float(os.environ.get("TEMPO", "1.10"))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = os.environ.get("EP", "")
A = os.path.join(ROOT, "audio", EP) if EP else os.path.join(ROOT, "audio")
OUT = os.path.join(A, "final"); os.makedirs(OUT, exist_ok=True)
NSEG = int(os.environ.get("NSEG", "12"))
RESPIRAR = os.environ.get("PAUSAS", "compactar") == "respirar"

def decode(p):
    raw = subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()

def compact(x):
    hop = int(SR*0.01)
    n = len(x)//hop
    rms = np.sqrt(np.mean(x[:n*hop].reshape(n,hop)**2, axis=1) + 1e-12)
    db = 20*np.log10(rms)
    thr = max(db.max()-42, -55)
    voiced = db > thr
    idx = np.where(voiced)[0]
    start, end = max(idx[0]-3,0), min(idx[-1]+8, n)   # 30 ms antes, 80 ms después
    out = []; i = start
    while i < end:
        if not voiced[i]:
            j = i
            while j < end and not voiced[j]: j += 1
            p = (j-i)*0.01
            if RESPIRAR:
                seg = x[i*hop:j*hop].copy()
                if p >= 0.22:
                    extra = int((min(p*1.4, 0.65) - p)*SR)
                    if extra > 0:
                        h = len(seg)//2; f = min(int(SR*0.005), h)
                        a1, a2 = seg[:h].copy(), seg[h:].copy()
                        if f: a1[-f:] *= np.linspace(1,0,f); a2[:f] *= np.linspace(0,1,f)
                        seg = np.concatenate([a1, np.zeros(extra, dtype=np.float32), a2])
                out.append(seg)
            elif p > 0.26:
                newp = 0.26 + 0.35*(p-0.26)
                keep = int(newp*100)
                half = keep//2
                seg = np.concatenate([x[i*hop:(i+half)*hop], x[(j-(keep-half))*hop:j*hop]])
                # crossfade corto en la unión
                out.append(seg)
            else:
                out.append(x[i*hop:j*hop])
            i = j
        else:
            j = i
            while j < end and voiced[j]: j += 1
            out.append(x[i*hop:j*hop]); i = j
    y = np.concatenate(out)
    f = int(SR*0.01); y[:f] *= np.linspace(0,1,f); y[-f:] *= np.linspace(1,0,f)
    return y

info = {}
for k in range(1, NSEG + 1):
    sid = f"s{k:02d}"
    wav = os.path.join(A, f"{sid}_raw.wav")   # toma corregida (empalme sin recomprimir) si existe
    x = decode(wav if os.path.exists(wav) else os.path.join(A, f"{sid}_raw.mp3"))
    y = compact(x)
    tmp = os.path.join(OUT, f"{sid}_c.f32")
    y.astype(np.float32).tofile(tmp)
    dst = os.path.join(OUT, f"{sid}.wav")
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i",tmp,
                    "-af",f"atempo={TEMPO},highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=80:makeup=2,alimiter=limit=0.93",
                    "-ar",str(SR),"-c:a","pcm_s16le",dst], check=True)
    os.remove(tmp)
    d = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",dst],capture_output=True,text=True).stdout)
    info[sid] = round(d,3)
    print(sid, round(len(x)/SR,2), "->", round(len(y)/SR,2), "->", round(d,2))
print("TOTAL", round(sum(info.values()),2))
json.dump(info, open(os.path.join(OUT,"durations.json"),"w"), indent=1)
