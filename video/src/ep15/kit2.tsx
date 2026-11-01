/* Piezas gráficas del ep15 que no son ni fotos ni 3D: neón del boliche, luces de la camioneta que se aleja, polaroid
   con flash, tartamudeo, el baúl, años que corren, listas que se escriben, nombres tachados, el haz de un proyector,
   palabras grandes y el título. Miden el cuadro con useVideoConfig (sirven para el largo y el vertical). */
import React from 'react';
import {AbsoluteFill, Img, staticFile, useVideoConfig} from 'remotion';
import {K, F, clamp, easeIn, easeOut, easeInOut, prog, rnd, mix, credito} from './kit';

const useV = () => {
  const {width, height} = useVideoConfig();
  return {W: width, H: height, v: height > width};
};

/** cartel de neón que se enciende con parpadeos (el boliche) */
export const Neon: React.FC<{t: number; t0: number; text: string; x?: number; y?: number; size?: number; color?: string; sub?: string; out?: number}> = ({t, t0, text, x, y, size, color = '#FF3B6B', sub, out = 999}) => {
  const {W, H, v} = useV();
  if (t < t0) return null;
  const dt = t - t0;
  const on = dt < 0.7 ? (rnd(Math.floor(t * 24) * 3.7) > 0.45 ? 1 : 0.12) : rnd(Math.floor(t * 12) * 1.3) > 0.97 ? 0.5 : 1;
  const fs = size ?? (v ? 120 : 140);
  const o = 1 - prog(t, out, 0.4);
  return (
    <div style={{position: 'absolute', left: x ?? 0, right: x === undefined ? 0 : undefined, top: y ?? H * 0.38, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: '"Bungee", Anton, sans-serif', fontSize: fs, letterSpacing: fs * 0.06, color: on > 0.5 ? '#FFE3EC' : 'rgba(255,227,236,0.25)', textShadow: on > 0.5 ? `0 0 6px ${color}, 0 0 18px ${color}, 0 0 42px ${color}, 0 0 90px ${color}` : 'none', lineHeight: 1}}>{text}</div>
      {sub ? <div style={{fontFamily: F.mono, fontSize: v ? 28 : 24, letterSpacing: 8, color: K.ash, marginTop: 28, opacity: prog(t, t0 + 0.8, 0.5)}}>{sub}</div> : null}
    </div>
  );
};
/** luces de ciudad desenfocadas (fondo de noche) */
export const Bokeh: React.FC<{t: number; n?: number; colors?: string[]; seed?: number; k?: number}> = ({t, n = 40, colors = ['#FF6A3D', '#FFB86B', '#6FA8FF', '#FF3B6B', '#FFE0A8'], seed = 3, k = 1}) => {
  const {W, H} = useV();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, #120E14 0%, #050407 75%)'}}>
      {Array.from({length: n}, (_, i) => {
        const r = 20 + rnd(seed + i * 3.1) * 90;
        const x = rnd(seed + i * 1.7) * W + Math.sin(t * 0.2 + i) * 20, y = H * 0.25 + rnd(seed + i * 2.3) * H * 0.6 + Math.cos(t * 0.15 + i) * 10;
        return <div key={i} style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: colors[i % colors.length], opacity: (0.1 + rnd(seed + i * 5.3) * 0.25) * k * (0.8 + 0.2 * Math.sin(t * 1.3 + i)), filter: `blur(${4 + rnd(i) * 10}px)`}} />;
      })}
    </AbsoluteFill>
  );
};
/** la camioneta que se aleja en la madrugada: dos luces rojas, el reflejo en el asfalto mojado */
export const TailLights: React.FC<{t: number; t0: number; dur?: number}> = ({t, t0, dur = 6}) => {
  const {W, H, v} = useV();
  const k = easeIn(clamp((t - t0) / dur));
  const s = mix(1, 0.08, k);
  const cx = W / 2 + mix(0, W * 0.04, k), cy = mix(H * 0.62, H * 0.5, k);
  const gap = (v ? 260 : 340) * s;
  const glow = (x: number) => (
    <>
      <div style={{position: 'absolute', left: x - 60 * s, top: cy - 22 * s, width: 120 * s, height: 44 * s, borderRadius: 12 * s, background: '#FF2A1A', boxShadow: `0 0 ${40 * s}px ${12 * s}px rgba(255,40,20,0.6), 0 0 ${120 * s}px ${40 * s}px rgba(255,40,20,0.25)`}} />
      <div style={{position: 'absolute', left: x - 10 * s, top: cy + 40 * s, width: 20 * s, height: (H - cy) * 0.9, background: 'linear-gradient(180deg, rgba(255,50,30,0.45), rgba(255,50,30,0))', filter: `blur(${6 * s + 2}px)`}} />
    </>
  );
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #030406 0%, #07090C 55%, #0B0E12 100%)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: H * 0.5, height: H * 0.5, background: 'linear-gradient(180deg, rgba(40,50,60,0.0), rgba(40,50,60,0.25))'}} />
      {glow(cx - gap / 2)}
      {glow(cx + gap / 2)}
      <div style={{position: 'absolute', left: cx - gap / 2 - 70 * s, top: cy - 70 * s, width: gap + 140 * s, height: 120 * s, background: 'rgba(0,0,0,0.0)', borderTop: `${3 * s}px solid rgba(80,80,90,${0.3 * (1 - k)})`}} />
    </AbsoluteFill>
  );
};
/** polaroid con foto real, flash de cámara y epígrafe a mano */
export const Polaroid: React.FC<{t: number; t0: number; file: string; caption: string; x?: number; y?: number; w?: number; rot?: number; flashAt?: number; grade?: string; out?: number}> = ({t, t0, file, caption, x, y, w, rot = -4, flashAt, grade = 'sepia(0.35) saturate(0.7) contrast(1.05)', out = 9999}) => {
  const {W, H, v} = useV();
  if (t < t0 - 0.5 || t > out + 0.5) return null;
  const a = prog(t, t0 - 0.5, 0.7) * (1 - prog(t, out, 0.45));
  const ww = w ?? (v ? 760 : 620);
  const dev = flashAt !== undefined ? clamp((t - flashAt) / 2.2) : 1;   // la foto se «revela»
  return (
    <div style={{position: 'absolute', left: x ?? (W - ww) / 2, top: y ?? (H - ww * 1.18) / 2, width: ww, padding: ww * 0.05, paddingBottom: ww * 0.2, background: '#F1ECE1', boxShadow: '0 40px 90px rgba(0,0,0,0.7)', transform: `rotate(${rot}deg) translateY(${(1 - a) * 80}px) scale(${mix(1.06, 1, a)})`, opacity: a}}>
      <div style={{width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', background: '#1A1A1A', position: 'relative'}}>
        <Img src={staticFile(`ep15/img/${file}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `${grade} brightness(${mix(0.15, 1, easeOut(dev))})`, opacity: mix(0.3, 1, dev)}} />
      </div>
      <div style={{fontFamily: '"Caveat", cursive', fontSize: ww * 0.075, color: '#2A2A2A', marginTop: ww * 0.04, textAlign: 'center'}}>{caption}</div>
    </div>
  );
};
/** tartamudeo: la palabra se traba (sílabas que se repiten) y una onda de audio que se corta */
export const Stutter: React.FC<{t: number; t0: number; word: string; reps?: number; y?: number; size?: number; color?: string; out?: number}> = ({t, t0, word, reps = 3, y, size, color = K.bone, out = 999}) => {
  const {W, H, v} = useV();
  if (t < t0) return null;
  const syl = word.slice(0, 2);
  const parts = [...Array.from({length: reps}, () => syl + '-'), word];
  const per = 0.22;
  const fs = size ?? (v ? 110 : 130);
  const o = 1 - prog(t, out, 0.35);
  const bars = 64;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y ?? H * 0.36, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: F.title, fontSize: fs, letterSpacing: 2, color, whiteSpace: 'nowrap'}}>
        {parts.map((p, i) => {
          const on = t >= t0 + i * per;
          const shake = on && t < t0 + i * per + 0.12 ? (rnd(Math.floor(t * 30) + i) - 0.5) * 14 : 0;
          return <span key={i} style={{opacity: on ? (i < parts.length - 1 ? 0.55 : 1) : 0, display: 'inline-block', transform: `translateX(${shake}px)`, color: i < parts.length - 1 ? K.ash : color}}>{p}</span>;
        })}
      </div>
      <svg width={W * 0.8} height={v ? 160 : 140} style={{marginTop: 30}}>
        {Array.from({length: bars}, (_, i) => {
          const u = i / bars;
          const gapK = [0.18, 0.36, 0.54].some((g) => Math.abs(u - g) < 0.025) ? 0.05 : 1;    // cortes del tartamudeo
          const amp = gapK * (0.25 + 0.75 * Math.abs(Math.sin(u * 23 + t * 9) * Math.sin(u * 7 + 1))) * prog(t, t0 + u * 1.2, 0.2);
          const hh = amp * (v ? 140 : 120);
          return <rect key={i} x={(W * 0.8 * i) / bars + 2} y={(v ? 80 : 70) - hh / 2} width={W * 0.8 / bars - 4} height={hh} rx={2} fill={gapK < 1 ? K.blood : 'rgba(238,231,217,0.7)'} />;
        })}
      </svg>
    </div>
  );
};
/** adentro del baúl: oscuridad, una rendija de luz que tiembla con el auto */
export const Trunk: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const {W, H} = useV();
  const sh = Math.sin(t * 13) * 3 + Math.sin(t * 29) * 1.5 + (rnd(Math.floor(t * 8)) - 0.5) * 6;
  const k = prog(t, t0, 1.2);
  return (
    <AbsoluteFill style={{background: '#020203', transform: `translateY(${sh}px)`}}>
      <div style={{position: 'absolute', left: W * 0.08, right: W * 0.08, top: H * 0.42, height: 6 + 4 * Math.sin(t * 3), background: 'linear-gradient(90deg, rgba(255,210,150,0), rgba(255,220,170,0.85) 30%, rgba(255,230,190,0.95) 50%, rgba(255,220,170,0.85) 70%, rgba(255,210,150,0))', filter: 'blur(2px)', opacity: k, boxShadow: '0 0 40px 10px rgba(255,200,140,0.18)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 30% at 50% 42%, rgba(255,190,120,0.10), rgba(0,0,0,0) 70%)', opacity: k}} />
    </AbsoluteFill>
  );
};
/** años que corren (2005 → 2009) */
export const YearRoll: React.FC<{t: number; t0: number; from: number; to: number; dur?: number; label?: string; y?: number; size?: number; color?: string; out?: number}> = ({t, t0, from, to, dur = 3, label, y, size, color = K.bone, out = 999}) => {
  const {H, v} = useV();
  if (t < t0) return null;
  const val = Math.round(mix(from, to, easeInOut(clamp((t - t0) / dur))));
  const fs = size ?? (v ? 260 : 240);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y ?? H * 0.3, textAlign: 'center', opacity: prog(t, t0, 0.3) * (1 - prog(t, out, 0.4))}}>
      <div style={{fontFamily: F.title, fontSize: fs, color, lineHeight: 1, letterSpacing: 4, textShadow: '0 10px 50px rgba(0,0,0,0.6)'}}>{val}</div>
      {label ? <div style={{fontFamily: F.mono, fontSize: v ? 30 : 26, letterSpacing: 6, color: K.ash, marginTop: 16, opacity: prog(t, t0 + 0.4, 0.4)}}>{label}</div> : null}
    </div>
  );
};
/** lista que se escribe renglón por renglón, con una raya roja al costado */
export const Lines: React.FC<{t: number; items: {text: string; at: number; red?: boolean; big?: boolean}[]; x?: number; y?: number; size?: number; out?: number; w?: number; align?: 'left' | 'center'}> = ({t, items, x, y, size, out = 999, w, align = 'left'}) => {
  const {W, H, v} = useV();
  const fs = size ?? (v ? 44 : 40);
  const o = 1 - prog(t, out, 0.35);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x ?? (v ? 70 : 120), top: y ?? H * 0.3, width: w ?? (v ? W - 140 : 1100), opacity: o, textAlign: align}}>
      {items.map((it, i) => {
        if (t < it.at) return null;
        const n = Math.floor(clamp((t - it.at) * 30, 0, it.text.length));
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: align === 'center' ? 'center' : 'flex-start', gap: fs * 0.5, marginBottom: fs * 0.45}}>
            {align === 'left' ? <div style={{width: 46 * prog(t, it.at, 0.3), height: 4, background: it.red ? K.blood : K.ember, flexShrink: 0}} /> : null}
            <div style={{fontFamily: it.big ? F.title : F.mono, fontWeight: 500, fontSize: it.big ? fs * 1.6 : fs, letterSpacing: it.big ? 2 : fs * 0.08, color: it.red ? '#FF6B5E' : K.bone, textShadow: '0 3px 14px rgba(0,0,0,0.85)', textTransform: 'uppercase', whiteSpace: 'pre-wrap'}}>{it.text.slice(0, n)}</div>
          </div>
        );
      })}
    </div>
  );
};
/** un nombre que se tacha con una raya roja (el nombre falso que se cae) */
export const Strike: React.FC<{t: number; t0: number; text: string; strikeAt: number; y?: number; size?: number; out?: number}> = ({t, t0, text, strikeAt, y, size, out = 999}) => {
  const {H, v} = useV();
  if (t < t0) return null;
  const fs = size ?? (v ? 150 : 170);
  const k = prog(t, strikeAt, 0.35);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y ?? H * 0.33, textAlign: 'center', opacity: prog(t, t0, 0.3) * (1 - prog(t, out, 0.3))}}>
      <span style={{position: 'relative', display: 'inline-block', fontFamily: F.title, fontSize: fs, color: k > 0 ? K.ash : K.bone, letterSpacing: 3, lineHeight: 1}}>
        {text}
        <span style={{position: 'absolute', left: -20, top: '52%', height: fs * 0.08, width: `calc(${k * 100}% + ${k * 40}px)`, background: K.blood, transform: 'rotate(-3deg)', boxShadow: '0 0 20px rgba(192,53,43,0.7)'}} />
      </span>
    </div>
  );
};
/** haz de un proyector de cine con polvo y una tira de película que corre (Nozzi, productor) */
export const FilmBeam: React.FC<{t: number; k?: number}> = ({t, k = 1}) => {
  const {W, H, v} = useV();
  const fl = 0.85 + 0.15 * Math.sin(t * 47) * Math.sin(t * 13);
  const fh = v ? 230 : 190, fw = fh * 1.35, y0 = v ? H * 0.68 : H * 0.72;
  const off = -((t * 260) % (fw + 24));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 15% 45%, #17130F 0%, #050506 70%)'}}>
      <div style={{position: 'absolute', left: -W * 0.05, top: H * 0.0, width: W * 1.2, height: H * 0.95, background: `conic-gradient(from 96deg at 0% 42%, rgba(255,236,200,0) 0deg, rgba(255,236,200,${0.28 * fl * k}) 5deg, rgba(255,240,215,${0.42 * fl * k}) 9deg, rgba(255,236,200,${0.28 * fl * k}) 13deg, rgba(255,236,200,0) 19deg)`, filter: 'blur(18px)'}} />
      <div style={{position: 'absolute', left: -60, top: H * 0.42 - 70, width: 140, height: 140, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,245,225,${0.95 * fl * k}) 0%, rgba(255,220,170,0.35) 35%, rgba(255,200,140,0) 70%)`}} />
      {Array.from({length: 130}, (_, i) => {
        const x = rnd(i * 1.7) * W, y = H * 0.42 + (rnd(i * 2.9) - 0.5) * H * 0.55 * (x / W) + Math.sin(t * 0.4 + i) * 12;
        const s = 1.5 + rnd(i * 4.1) * 3.5;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: '#FFEBD0', opacity: (0.3 + rnd(i) * 0.6) * k * (0.6 + 0.4 * Math.sin(t * 2 + i))}} />;
      })}
      {/* tira de película */}
      <div style={{position: 'absolute', left: 0, right: 0, top: y0, height: fh + 56, background: '#0B0B0C', opacity: 0.92 * k, transform: 'rotate(-2deg)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)'}}>
        {Array.from({length: Math.ceil(W / (fw + 24)) + 2}, (_, i) => (
          <div key={i} style={{position: 'absolute', left: off + i * (fw + 24), top: 28, width: fw, height: fh, background: `linear-gradient(135deg, rgba(227,155,71,${0.18 + 0.1 * rnd(i)}), rgba(30,22,16,0.9))`, border: '2px solid rgba(255,235,205,0.12)'}} />
        ))}
        {Array.from({length: Math.ceil(W / 34) + 2}, (_, i) => (
          <React.Fragment key={'h' + i}>
            <div style={{position: 'absolute', left: (off % 34) + i * 34, top: 8, width: 16, height: 12, borderRadius: 3, background: 'rgba(240,230,210,0.5)'}} />
            <div style={{position: 'absolute', left: (off % 34) + i * 34, top: fh + 36, width: 16, height: 12, borderRadius: 3, background: 'rgba(240,230,210,0.5)'}} />
          </React.Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};
/** palabra grande centrada que entra con un leve zoom */
export const BigWord: React.FC<{t: number; t0: number; text: string; out?: number; size?: number; color?: string; y?: number; sub?: string; subColor?: string; font?: string; spacing?: number}> = ({t, t0, text, out = 999, size, color = K.bone, y, sub, subColor = K.ash, font, spacing = 4}) => {
  const {H, v} = useV();
  if (t < t0 || t > out + 0.5) return null;
  const fs = size ?? (v ? 170 : 190);
  const a = prog(t, t0, 0.35), o = 1 - prog(t, out, 0.4, easeIn);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y ?? H * 0.36, textAlign: 'center', opacity: a * o, padding: '0 40px'}}>
      <div style={{fontFamily: font ?? F.title, fontSize: fs, lineHeight: 1, letterSpacing: spacing, color, transform: `scale(${mix(1.08, 1, easeOut(clamp((t - t0) / 1.4)))})`, textShadow: '0 10px 50px rgba(0,0,0,0.7)'}}>{text}</div>
      {sub ? <div style={{fontFamily: F.mono, fontSize: v ? 32 : 28, letterSpacing: 7, color: subColor, marginTop: 22, opacity: prog(t, t0 + 0.35, 0.4), textTransform: 'uppercase'}}>{sub}</div> : null}
    </div>
  );
};
/** etiqueta chica de atribución («según un abogado», «según el gobierno del Chubut») */
export const Tag: React.FC<{t: number; t0: number; text: string; x?: number; y?: number; out?: number; color?: string}> = ({t, t0, text, x, y, out = 999, color = K.ember}) => {
  const {H, v} = useV();
  if (t < t0) return null;
  return (
    <div style={{position: 'absolute', left: x ?? (v ? 70 : 110), top: y ?? (v ? H * 0.2 : 110), opacity: prog(t, t0, 0.3) * (1 - prog(t, out, 0.3)), display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(5,6,8,0.62)', padding: '8px 16px 8px 12px', borderRadius: 4}}>
      <div style={{width: 10, height: 10, background: color, borderRadius: 2}} />
      <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: v ? 26 : 22, letterSpacing: 4, color, textTransform: 'uppercase'}}>{text}</div>
    </div>
  );
};
/** el título del documental: letras que se arman desde el polvo de la cabeza */
export const TitleCard: React.FC<{t: number; t0: number; dur: number}> = ({t, t0, dur}) => {
  const {W, H, v} = useV();
  if (t < t0 - 0.2 || t > t0 + dur + 0.6) return null;
  const words = ['EL', 'HOMBRE', 'DE', 'LAS', 'MIL', 'CARAS'];
  const o = 1 - prog(t, t0 + dur - 0.5, 0.8, easeIn);
  const fs = v ? 132 : 150;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: o}}>
      <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: v ? 28 : 24, letterSpacing: 14, color: K.ash, opacity: 0.85 * prog(t, t0 + 0.1, 0.5), marginBottom: 26}}>CONTEXTO PRESENTA</div>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', maxWidth: v ? W - 80 : W - 200, columnGap: fs * 0.28, rowGap: 0}}>
        {words.map((wd, i) => {
          const ti = t0 + 0.25 + i * 0.12;
          const k = easeOut(clamp((t - ti) / 0.9));
          const blur = (1 - k) * 18;
          return <span key={i} style={{fontFamily: F.title, fontSize: fs, lineHeight: 1.02, color: wd === 'MIL' ? K.blood : K.bone, letterSpacing: `${mix(0.4, 0.04, k)}em`, opacity: k, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, transform: `translateY(${(1 - k) * 30}px)`, textShadow: '0 10px 60px rgba(0,0,0,0.8)'}}>{wd}</span>;
        })}
      </div>
      <div style={{width: 160 * prog(t, t0 + 1.1, 0.7), height: 3, background: K.blood, marginTop: 34}} />
      <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: v ? 44 : 40, color: K.ash, marginTop: 26, opacity: prog(t, t0 + 1.3, 0.6), textAlign: 'center', padding: '0 60px'}}>El Gusano Menocchio y el crimen de La Fidelidad</div>
    </AbsoluteFill>
  );
};
/** crédito de foto suelto (para imágenes dentro de otros elementos, como la polaroid) */
export const PhotoCredit: React.FC<{file: string; o?: number; extra?: string}> = ({file, o = 1, extra}) => {
  const {v, H} = useV();
  const c = credito(file);
  return c ? <div style={{position: 'absolute', right: v ? 40 : 34, bottom: v ? 360 : 22, fontFamily: F.mono, fontSize: v ? 19 : 15, letterSpacing: 0.4, color: 'rgba(238,231,217,0.62)', textShadow: '0 1px 3px rgba(0,0,0,0.9)', opacity: o, textAlign: 'right'}}>{extra ? <div>{extra}</div> : null}{c}</div> : null;
};
