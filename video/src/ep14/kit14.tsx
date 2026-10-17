/* Sistema visual del episodio 14 (CAMPO DEL CIELO): "cielo y hierro".
   Negro de cielo austral con estrellas, el gris del hierro meteórico con su óxido, el naranja incandescente de la caída y
   la voladura, el pergamino de los papeles coloniales con tinta sepia, y el cian de los instrumentos (magnetómetros,
   detectores). Cada época tiene su tratamiento: el cielo (hace 4.000 años), el pergamino (1576-1825), la película
   granulada (1969-1990) y la interfaz limpia de hoy.
   Tipografía nueva: Fraunces (titulares, peso, óptica y "suavidad" animables), IM Fell English (los papeles del siglo
   XVIII), Pinyon Script (la letra manuscrita de Rubín de Celis), Archivo condensada (rótulos) y JetBrains Mono (datos).
   Recursos que atraviesan el episodio: la cinta de los años abajo y el rótulo «PARADERO DESCONOCIDO» de la mesa. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd} from '../lib/anim';
import {fadeIO, lerpHex, mix, ramp} from '../ep13/kit13';
export {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd, fadeIO, lerpHex, mix, ramp};

export const K = {
  void: '#020309',
  night: '#060A15',
  deep: '#0B1222',
  slate: '#141D31',
  line: 'rgba(226,232,245,0.14)',
  line2: 'rgba(226,232,245,0.3)',
  bone: '#F1EEE8',
  mute: '#A39E95',
  dim: '#5E6475',
  iron: '#8C9099',
  ironLight: '#CDD1D8',
  ironDark: '#383C44',
  rust: '#A2552A',
  fire: '#FF6A1A',
  ember: '#FF9A3C',
  glow: '#FFD49A',
  hot: '#FFF2D8',
  silver: '#D5DDEA',
  parch: '#E9DDC3',
  parch2: '#D8C7A2',
  parchDark: '#B79E73',
  ink: '#2A2016',
  sepia: '#6E4F2D',
  inkRed: '#8F2A1A',
  sky: '#86B6FF',
  cyan: '#5FE3FF',
  monte: '#56704A',
  earth: '#8A6A45',
  red: '#FF4036',
  police: '#3D7BFF',
};
export const F = {
  display: 'Fraunces, Georgia, serif',
  caps: 'Cinzel, Georgia, serif',
  fell: '"IM Fell English", Georgia, serif',
  script: '"Pinyon Script", cursive',
  sans: 'Archivo, Inter, sans-serif',
  mono: '"JetBrains Mono", "IBM Plex Mono", monospace',
};
/** Fraunces con peso, tamaño óptico y suavidad */
export const fr = (size: number, w = 400, color: string = K.bone, opsz = 144, soft = 0, track = -0.01): React.CSSProperties => ({
  fontFamily: F.display, fontSize: size, fontWeight: Math.round(w), color, fill: color, letterSpacing: `${track}em`,
  fontVariationSettings: `"opsz" ${opsz}, "SOFT" ${soft}, "WONK" 0`,
});
/** Archivo (rótulos): ancho variable */
export const ar = (size: number, w = 600, color: string = K.bone, stretch = 80, track = 0.18): React.CSSProperties => ({
  fontFamily: F.sans, fontSize: size, fontWeight: Math.round(w), color, fill: color, fontStretch: `${stretch}%`, letterSpacing: `${track}em`,
});
/** JetBrains Mono (datos, coordenadas) */
export const jm = (size: number, color: string = K.bone, w = 500, track = 0.04): React.CSSProperties => ({
  fontFamily: F.mono, fontSize: size, color, fill: color, fontWeight: w, letterSpacing: `${track}em`,
});
/** IM Fell (papeles coloniales) */
export const fell = (size: number, color: string = K.ink, italic = false): React.CSSProperties => ({
  fontFamily: F.fell, fontSize: size, color, fill: color, fontStyle: italic ? 'italic' : 'normal', fontWeight: 400,
});
export const between = (t: number, a: number, b: number) => t >= a && t < b;
/** acercamiento lento y continuo para que ningún plano quede quieto */
export const drift = (t: number, t0: number, k = 0.012) => 1 + k * Math.max(0, t - t0);

/* ================================================================== FILTROS */
export const Defs14: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="ink14">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={5} result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="2.4" numOctaves={1} seed={9} result="g" />
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.7" result="holes" />
        <feComposite in="d" in2="holes" operator="in" />
      </filter>
      {/* trazo de pluma: borde apenas irregular */}
      <filter id="quill14">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={2} seed={2} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={2.2} />
      </filter>
      <filter id="parch14" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves={4} seed={21} result="big" />
        <feColorMatrix in="big" type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.30  0 0 0 0 0.16  0 0 0 0.55 -0.12" result="stains" />
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={7} result="fine" />
        <feColorMatrix in="fine" type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0.2 0" result="fiber" />
        <feMerge>
          <feMergeNode in="stains" />
          <feMergeNode in="fiber" />
        </feMerge>
      </filter>
      <filter id="glow14" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="soft14" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
      {/* nube de polvo o humo: ruido recortado por la forma */}
      <filter id="smoke14" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={4} seed={13} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={60} result="d" />
        <feGaussianBlur in="d" stdDeviation="6" />
      </filter>
    </defs>
  </svg>
);

/* ================================================================== FONDOS */
type Star = {x: number; y: number; r: number; o: number; f: number; ph: number; c: string};
const STARS: Star[] = Array.from({length: 520}, (_, i) => {
  const big = rnd(i * 13 + 2) > 0.965;
  const hue = rnd(i * 7 + 5);
  return {
    x: rnd(i * 3 + 1), y: rnd(i * 5 + 3), r: big ? 1.6 + rnd(i) * 1.6 : 0.5 + rnd(i * 11) * 1.0, o: big ? 0.9 : 0.25 + rnd(i * 17) * 0.55,
    f: 0.6 + rnd(i * 19) * 2.4, ph: rnd(i * 23) * 6.28, c: hue > 0.85 ? '#FFD9B0' : hue > 0.7 ? '#BFD4FF' : '#FFFFFF',
  };
});
/** cielo austral nocturno: estrellas que titilan, la Vía Láctea en diagonal y el resplandor del horizonte */
export const NightSky: React.FC<{t: number; o?: number; milky?: number; horizon?: number; hColor?: string; dx?: number; dy?: number; density?: number; w?: number; h?: number}> = ({
  t, o = 1, milky = 1, horizon = 0.5, hColor = '#2A3A63', dx = 0, dy = 0, density = 1, w = 1920, h = 1080,
}) => (
  <AbsoluteFill style={{opacity: o, background: `linear-gradient(180deg, ${K.void} 0%, ${K.night} 55%, ${K.deep} 100%)`}}>
    {milky > 0 ? (
      <AbsoluteFill
        style={{
          opacity: 0.55 * milky,
          background: 'radial-gradient(ellipse 70% 16% at 50% 50%, rgba(190,200,255,0.34) 0%, rgba(120,110,170,0.16) 45%, rgba(0,0,0,0) 100%)',
          transform: `translate(${dx * 0.3}px, ${dy * 0.3}px) rotate(-28deg) scale(1.6)`,
          filter: 'blur(2px)',
        }}
      />
    ) : null}
    <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
      {STARS.slice(0, Math.round(STARS.length * density)).map((s, i) => {
        const tw = 0.65 + 0.35 * Math.sin(t * s.f + s.ph);
        const x = (((s.x * (w + 200) + dx) % (w + 200)) + (w + 200)) % (w + 200) - 100;
        const y = (((s.y * (h + 200) + dy) % (h + 200)) + (h + 200)) % (h + 200) - 100;
        return <circle key={i} cx={x} cy={y} r={s.r} fill={s.c} opacity={s.o * tw} />;
      })}
    </svg>
    {horizon > 0 ? <AbsoluteFill style={{background: `linear-gradient(0deg, ${hColor} 0%, rgba(0,0,0,0) ${30 + 25 * horizon}%)`, opacity: horizon}} /> : null}
  </AbsoluteFill>
);

/** pergamino: papel cálido, manchas, fibras, bordes tostados */
export const Parchment: React.FC<{o?: number; tint?: string; edge?: number; children?: React.ReactNode}> = ({o = 1, tint = K.parch, edge = 1, children}) => (
  <AbsoluteFill style={{opacity: o, background: tint}}>
    <Img src={staticFile('tex/paper.png')} style={{position: 'absolute', width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: 0.6}} />
    <AbsoluteFill style={{filter: 'url(#parch14)', opacity: 0.9}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse 72% 70% at 50% 48%, rgba(255,250,235,0.35) 0%, rgba(0,0,0,0) 55%, rgba(92,58,22,${0.42 * edge}) 100%)`}} />
    {children}
  </AbsoluteFill>
);

export const Vignette: React.FC<{k?: number; color?: string}> = ({k = 0.7, color = '0,0,0'}) => (
  <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse at 50% 50%, rgba(${color},0) 42%, rgba(${color},${k}) 100%)`}} />
);
export const Letterbox: React.FC<{k: number}> = ({k}) =>
  k <= 0 ? null : (
    <>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 110 * k, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, width: 1920, height: 110 * k, background: '#000'}} />
    </>
  );

/** película de los 70-90: grano, parpadeo, rayas verticales y deriva del cuadro */
export const FilmLook: React.FC<{t: number; k?: number}> = ({t, k = 1}) => {
  if (k <= 0) return null;
  const fr0 = Math.floor(t * 24);
  const flick = 0.04 * Math.sin(fr0 * 1.7) * Math.sin(fr0 * 0.37);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: k}}>
      <AbsoluteFill style={{background: `rgba(255,236,200,${0.05 + flick})`, mixBlendMode: 'overlay'}} />
      <Img src={staticFile(`tex/grain${fr0 % 8}.png`)} style={{position: 'absolute', width: '100%', height: '100%', mixBlendMode: 'screen', opacity: 0.16}} />
      {[0, 1, 2].map((i) => {
        const on = rnd(fr0 * 7 + i) > 0.55;
        return on ? <div key={i} style={{position: 'absolute', left: rnd(fr0 * 3 + i * 11) * 1920, top: 0, width: 1.5, height: 1080, background: 'rgba(255,255,255,0.18)'}} /> : null;
      })}
      <Vignette k={0.55} color="20,12,4" />
    </AbsoluteFill>
  );
};

/* ================================================================== TIPOGRAFÍA */
/** rótulo chico: rombo + línea + Archivo condensada */
export const Kicker14: React.FC<{t: number; t0: number; t1?: number; text: string; x: number; y: number; color?: string; size?: number; align?: 'left' | 'center' | 'right'; shadow?: boolean; dark?: boolean}> = ({
  t, t0, t1 = Infinity, text, x, y, color = K.ember, size = 22, align = 'left', shadow = true, dark = false,
}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  if (o <= 0) return null;
  const p = prog(t, t0, 0.6);
  const n = Math.floor(clamp((t - t0) * 60, 0, text.length));
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${tx}, -50%)`, display: 'flex', alignItems: 'center', gap: 14, opacity: o, whiteSpace: 'nowrap'}}>
      <span style={{width: 10, height: 10, background: color, transform: 'rotate(45deg)', boxShadow: dark ? undefined : `0 0 12px ${color}`}} />
      <span style={{width: 40 * p, height: 2, background: color}} />
      <span style={{...ar(size, 650, color, 82, 0.24), textTransform: 'uppercase', textShadow: shadow && !dark ? '0 2px 12px rgba(0,0,0,0.9)' : undefined}}>{text.slice(0, n)}</span>
    </div>
  );
};

type TitleProps = {
  t: number; t0: number; t1?: number; text: string; size?: number; x?: number; y?: number; align?: 'left' | 'center' | 'right'; color?: string;
  w0?: number; w1?: number; stagger?: number; dur?: number; lh?: number; maxW?: number; upper?: boolean; o?: number; italic?: boolean;
  hot?: number; hl?: Record<string, string>; soft?: number; track?: number;
};
/** título por letras en Fraunces: cada letra sube desde la máscara mientras gana peso; con hot > 0 la letra entra
    incandescente (blanco, naranja) y se enfría hasta el color final, como hierro recién forjado */
export const Title14: React.FC<TitleProps> = ({
  t, t0, t1 = Infinity, text, size = 140, x = 960, y = 540, align = 'center', color = K.bone, w0 = 200, w1 = 640, stagger = 0.03, dur = 0.9,
  lh = 0.98, maxW = 1780, upper = false, o = 1, italic = false, hot = 0, hl = {}, soft = 0, track = -0.02,
}) => {
  if (t < t0 - 0.05 || t > t1 + 0.6) return null;
  const lines = (upper ? text.toUpperCase() : text).split('\n');
  const out = t1 === Infinity ? 0 : prog(t, t1, 0.45, easeIn);
  let ci = 0;
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${tx}, -50%)`, width: maxW, textAlign: align, opacity: o}}>
      {lines.map((ln, li) => (
        <div key={li} style={{overflow: 'hidden', lineHeight: lh, paddingBottom: size * 0.1, paddingTop: size * 0.04, marginTop: li ? -size * 0.06 : 0}}>
          {ln.split(' ').map((word, wi) => {
            const key = word.replace(/[^\wÁÉÍÓÚÑÜáéíóúñü%.]/g, '');
            const wc = hl[key] ?? color;
            return (
              <span key={wi} style={{display: 'inline-block', whiteSpace: 'nowrap', marginRight: size * 0.22}}>
                {[...word].map((ch, k) => {
                  const i = ci++;
                  const p = prog(t, t0 + i * stagger, dur, easeOut);
                  // enfriamiento: 0 = blanco caliente, 1 = color final
                  const cool = hot > 0 ? clamp((t - (t0 + i * stagger)) / (1.6 * hot)) : 1;
                  const c = hot > 0 ? (cool < 0.35 ? lerpHex(K.hot, K.ember, cool / 0.35) : lerpHex(K.ember, wc, (cool - 0.35) / 0.65)) : wc;
                  const glowK = hot > 0 ? (1 - cool) : 0;
                  return (
                    <span
                      key={k}
                      style={{
                        display: 'inline-block', ...fr(size, mix(w0, w1, p), c, 144, soft, mix(0.08, track, p)), fontStyle: italic ? 'italic' : 'normal',
                        transform: `translateY(${(1 - p) * 105 - out * 110}%)`, opacity: Math.min(1, p * 1.6) * (1 - out),
                        textShadow: glowK > 0.02 ? `0 0 ${18 * glowK}px rgba(255,140,40,${0.9 * glowK}), 0 0 ${50 * glowK}px rgba(255,90,20,${0.6 * glowK})` : '0 6px 30px rgba(0,0,0,0.5)',
                      }}
                    >
                      {ch}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export type WordCue = {w: string; t: number; color?: string; italic?: boolean; big?: boolean; strike?: number};
/** frase palabra por palabra sincronizada con la locución (Fraunces) */
export const SyncWords14: React.FC<{t: number; words: WordCue[]; size?: number; x?: number; y?: number; w?: number; align?: 'left' | 'center'; t1?: number; color?: string; lh?: number; weight?: number}> = ({
  t, words, size = 72, x = 960, y = 540, w = 1500, align = 'center', t1 = Infinity, color = K.bone, lh = 1.1, weight = 420,
}) => {
  const out = t1 === Infinity ? 0 : prog(t, t1, 0.4, easeIn);
  if (out >= 1) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(${align === 'center' ? '-50%' : '0'}, -50%)`, textAlign: align, lineHeight: lh, opacity: 1 - out}}>
      {words.map((c, i) => {
        const p = prog(t, c.t - 0.05, 0.45);
        const sk = c.strike !== undefined ? prog(t, c.strike, 0.4) : 0;
        return (
          <span
            key={i}
            style={{
              position: 'relative', display: 'inline-block', marginRight: size * 0.24, ...fr(c.big ? size * 1.25 : size, c.big ? 700 : weight, c.color ?? color, 144, 0, -0.015),
              fontStyle: c.italic ? 'italic' : 'normal', opacity: p, filter: `blur(${(1 - p) * 10}px)`, transform: `translateY(${(1 - p) * 26}px)`, textShadow: '0 4px 24px rgba(0,0,0,0.55)',
            }}
          >
            {c.w}
            {sk > 0 ? <span style={{position: 'absolute', left: -4, top: '56%', height: size * 0.08, width: `calc(${sk * 100}% + 8px)`, background: K.red}} /> : null}
          </span>
        );
      })}
    </div>
  );
};

/** cita impresa (IM Fell itálica) con comillas latinas y atribución */
export const Quote14: React.FC<{t: number; t0: number; t1?: number; text: string; by?: string; size?: number; x?: number; y?: number; w?: number; color?: string; align?: 'left' | 'center'; accent?: string; byColor?: string}> = ({
  t, t0, t1 = Infinity, text, by, size = 76, x = 960, y = 540, w = 1500, color = K.bone, align = 'center', accent = K.ember, byColor = K.mute,
}) => {
  const o = fadeIO(t, t0, t1, 0.45);
  if (o <= 0) return null;
  const words = text.split(' ');
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(${align === 'center' ? '-50%' : '0'}, -50%)`, textAlign: align, opacity: o}}>
      <div style={{...fell(size, color, true), lineHeight: 1.12}}>
        <span style={{color: accent, opacity: prog(t, t0, 0.4)}}>«</span>
        {words.map((wd, i) => {
          const p = prog(t, t0 + 0.1 + i * 0.07, 0.5);
          return (
            <span key={i} style={{display: 'inline-block', marginRight: i < words.length - 1 ? size * 0.22 : 0, opacity: p, filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * 16}px)`}}>
              {wd}
            </span>
          );
        })}
        <span style={{color: accent, opacity: prog(t, t0 + 0.1 + words.length * 0.07, 0.4)}}>»</span>
      </div>
      {by ? <div style={{...ar(22, 600, byColor, 85, 0.2), textTransform: 'uppercase', marginTop: 24, opacity: prog(t, t0 + 0.5 + words.length * 0.05, 0.5)}}>{by}</div> : null}
    </div>
  );
};

/** escritura a mano con pluma (Pinyon Script): el texto aparece de izquierda a derecha detrás de una máscara que avanza,
    con la punta de la pluma brillando en el frente; p de 0 a 1 */
export const Handwrite: React.FC<{text: string; p: number; size?: number; color?: string; x: number; y: number; w?: number; align?: 'left' | 'center'; nib?: boolean}> = ({
  text, p, size = 80, color = K.ink, x, y, w = 1400, align = 'left', nib = true,
}) => {
  const k = clamp(p);
  if (k <= 0) return null;
  const edge = k * 100;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(${align === 'center' ? '-50%' : '0'}, -50%)`, textAlign: align}}>
      <div
        style={{
          display: 'inline-block', position: 'relative', fontFamily: F.script, fontSize: size, color, lineHeight: 1.25, whiteSpace: 'nowrap', filter: 'url(#quill14)',
          WebkitMaskImage: `linear-gradient(90deg, #000 0%, #000 ${edge - 2}%, rgba(0,0,0,0) ${edge + 1}%)`,
          maskImage: `linear-gradient(90deg, #000 0%, #000 ${edge - 2}%, rgba(0,0,0,0) ${edge + 1}%)`,
          padding: '0 0.3em',
        }}
      >
        {text}
      </div>
      {nib && k < 1 ? (
        <div style={{position: 'absolute', left: align === 'center' ? `calc(50% + ${(k - 0.5) * 100}%)` : `${k * 100}%`, top: '55%', width: 6, height: 6, borderRadius: 3, background: K.ember, boxShadow: `0 0 14px ${K.ember}`, opacity: 0.8}} />
      ) : null}
    </div>
  );
};

/** año grande con dígitos que ruedan y rótulo (las cartas de época) */
export const YearRoll: React.FC<{t: number; t0: number; t1?: number; text: string; label?: string; sub?: string; x?: number; y?: number; size?: number; color?: string; align?: 'left' | 'center'; labelColor?: string; mono?: boolean}> = ({
  t, t0, t1 = Infinity, text, label, sub, x = 960, y = 540, size = 200, color = K.bone, align = 'center', labelColor = K.ember, mono = false,
}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${align === 'center' ? '-50%' : '0'}, -50%)`, opacity: o, textAlign: align}}>
      {label ? <div style={{...ar(26, 650, labelColor, 80, 0.3), textTransform: 'uppercase', marginBottom: 10, opacity: prog(t, t0, 0.4)}}>{label}</div> : null}
      <div style={{display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', ...(mono ? jm(size, color, 500, -0.02) : fr(size, 300, color, 144, 0, -0.02)), lineHeight: 1, fontVariantNumeric: 'tabular-nums lining-nums'}}>
        {[...text].map((c, i) => {
          if (!/\d/.test(c)) return <span key={i} style={{opacity: 0.5, margin: '0 0.04em'}}>{c}</span>;
          const d = Number(c);
          const spin = 1 - prog(t, t0 + i * 0.06, 0.9 + i * 0.05, easeOut);
          const v = d + spin * (10 + (i % 3) * 10);
          return (
            <span key={i} style={{display: 'inline-block', height: '1.04em', overflow: 'hidden'}}>
              <span style={{display: 'flex', flexDirection: 'column', transform: `translateY(${-(v % 10) * 1.04}em)`}}>
                {Array.from({length: 11}, (_, k) => (
                  <span key={k} style={{height: '1.04em'}}>{k % 10}</span>
                ))}
              </span>
            </span>
          );
        })}
      </div>
      {sub ? <div style={{...fr(size * 0.2, 300, K.mute, 72, 100), fontStyle: 'italic', marginTop: 8, opacity: prog(t, t0 + 0.5, 0.5)}}>{sub}</div> : null}
    </div>
  );
};

/** odómetro con números Fraunces */
export const Odo14: React.FC<{value: number; size?: number; color?: string; dec?: number; prefix?: string; suffix?: string; weight?: number; mono?: boolean}> = ({
  value, size = 160, color = K.bone, dec = 0, prefix = '', suffix = '', weight = 400, mono = false,
}) => {
  const s = dec === 0 ? fmt(Math.floor(Math.max(0, value) + 1e-6)) : fmt(Math.max(0, value), dec);
  const frac = value - Math.floor(value);
  const digits = [...s];
  const lastDigit = digits.reduce((a, c, i) => (/\d/.test(c) ? i : a), -1);
  const base = mono ? jm(size, color, 500, -0.03) : fr(size, weight, color, 144, 0, -0.03);
  return (
    <span style={{display: 'inline-flex', alignItems: 'baseline', ...base, lineHeight: 1, fontVariantNumeric: 'tabular-nums lining-nums'}}>
      {prefix ? <span style={{marginRight: size * 0.08}}>{prefix}</span> : null}
      {digits.map((c, i) => {
        if (!/\d/.test(c)) return <span key={i}>{c}</span>;
        const d = Number(c);
        const off = i === lastDigit && dec === 0 ? frac : 0;
        return (
          <span key={i} style={{display: 'inline-block', height: '1.04em', overflow: 'hidden'}}>
            <span style={{display: 'flex', flexDirection: 'column', transform: `translateY(${-(d + off) * 1.04}em)`}}>
              {Array.from({length: 11}, (_, k) => (
                <span key={k} style={{height: '1.04em', lineHeight: '1.04em'}}>{k % 10}</span>
              ))}
            </span>
          </span>
        );
      })}
      {suffix ? <span style={{marginLeft: size * 0.08, ...ar(size * 0.3, 600, color, 85, 0.06), alignSelf: 'flex-end', marginBottom: size * 0.12}}>{suffix}</span> : null}
    </span>
  );
};

/** dato grande con rótulo */
export const Stat14: React.FC<{t: number; t0: number; t1?: number; x: number; y: number; value: number; from?: number; dur?: number; dec?: number; prefix?: string; suffix?: string; label: string; sub?: string; color?: string; size?: number; align?: 'left' | 'center'; w?: number; valColor?: string; mono?: boolean}> = ({
  t, t0, t1 = Infinity, x, y, value, from = 0, dur = 1.3, dec = 0, prefix, suffix, label, sub, color = K.ember, size = 170, align = 'left', w = 900, valColor = K.bone, mono = false,
}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const p = prog(t, t0, 0.7);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(${align === 'center' ? '-50%' : '0'}, ${(1 - p) * 30}px)`, opacity: o, textAlign: align}}>
      <div style={{...ar(24, 650, color, 82, 0.24), textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14, justifyContent: align === 'center' ? 'center' : 'flex-start', textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>
        <span style={{display: 'inline-block', width: 48 * p, height: 3, background: color}} />
        {label}
      </div>
      <Odo14 value={ramp(t, t0, value, dur, from)} size={size} dec={dec} prefix={prefix} suffix={suffix} color={valColor} mono={mono} />
      {sub ? <div style={{...fr(size * 0.22, 300, K.mute, 72, 100), fontStyle: 'italic', marginTop: 10}}>{sub}</div> : null}
    </div>
  );
};

/** nombre + rol (personas sin foto: rótulo editorial) */
export const NameCard14: React.FC<{t: number; t0: number; t1?: number; name: string; role: string; note?: string; noteColor?: string; x?: number; y?: number; size?: number; align?: 'left' | 'center'; color?: string; roleColor?: string}> = ({
  t, t0, t1 = Infinity, name, role, note, noteColor = K.ember, x = 110, y = 860, size = 72, align = 'left', color = K.bone, roleColor = K.bone,
}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const p = prog(t, t0, 0.8);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o, transform: align === 'center' ? 'translateX(-50%)' : undefined, textAlign: align}}>
      <div style={{width: 80 * p, height: 3, background: noteColor, marginBottom: 14, marginLeft: align === 'center' ? 'auto' : 0, marginRight: align === 'center' ? 'auto' : 0}} />
      <div style={{...fr(size, 380, color, 144, 50), fontStyle: 'italic', lineHeight: 1, whiteSpace: 'nowrap', filter: `blur(${(1 - p) * 6}px)`, textShadow: '0 4px 20px rgba(0,0,0,0.7)'}}>{name}</div>
      <div style={{...ar(23, 600, roleColor, 82, 0.2), textTransform: 'uppercase', whiteSpace: 'nowrap', marginTop: 14, opacity: prog(t, t0 + 0.3, 0.5), textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>{role}</div>
      {note ? (
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 12, padding: '6px 14px', border: `1.5px solid ${noteColor}`, borderRadius: 4, opacity: prog(t, t0 + 0.55, 0.5)}}>
          <span style={{width: 8, height: 8, background: noteColor, transform: 'rotate(45deg)'}} />
          <span style={{...ar(19, 650, noteColor, 85, 0.18), textTransform: 'uppercase'}}>{note}</span>
        </div>
      ) : null}
    </div>
  );
};

/* ================================================================== SELLOS Y PAPELES */
export const Stamp14: React.FC<{t: number; t0: number; t1?: number; text: string; x: number; y: number; color?: string; rot?: number; size?: number; sub?: string; dark?: boolean; serif?: boolean}> = ({
  t, t0, t1 = Infinity, text, x, y, color = K.inkRed, rot = -8, size = 64, sub, dark = false, serif = false,
}) => {
  const o = fadeIO(t, t0, t1, 0.12);
  if (o <= 0) return null;
  const s = 1 + (1 - pop(t, t0, 1.5)) * 0.85;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: o * 0.92,
        border: `${size * 0.09}px solid ${color}`, borderRadius: size * 0.1, padding: `${size * 0.14}px ${size * 0.36}px`, color, textAlign: 'center',
        filter: 'url(#ink14)', mixBlendMode: dark ? 'screen' : 'multiply', whiteSpace: 'nowrap',
      }}
    >
      <div style={serif ? {...fell(size, color), lineHeight: 1, letterSpacing: '0.04em'} : {...ar(size, 800, color, 90, 0.06), lineHeight: 1}}>{text}</div>
      {sub ? <div style={{...ar(size * 0.32, 700, color, 90, 0.16), marginTop: size * 0.12}}>{sub}</div> : null}
    </div>
  );
};

/** hoja de papel colonial (pergamino recortado con sombra) para cartas, órdenes y análisis */
export const OldSheet: React.FC<{t: number; t0: number; t1?: number; x: number; y: number; w: number; h: number; rot?: number; o?: number; children?: React.ReactNode; scale?: number}> = ({
  t, t0, t1 = Infinity, x, y, w, h, rot = 0, o = 1, children, scale = 1,
}) => {
  const oo = fadeIO(t, t0, t1, 0.35) * o;
  if (oo <= 0) return null;
  const p = pop(t, t0, 1.0);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${scale * (0.94 + 0.06 * p)}) translateY(${(1 - p) * 40}px)`, opacity: oo}}>
      <div style={{position: 'absolute', inset: 0, background: K.parch, boxShadow: '0 30px 80px rgba(0,0,0,0.55)', overflow: 'hidden', borderRadius: 3}}>
        <Img src={staticFile('tex/paper.png')} style={{position: 'absolute', width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: 0.65}} />
        <AbsoluteFill style={{filter: 'url(#parch14)', opacity: 0.85}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(92,58,22,0.35) 100%)'}} />
        {children}
      </div>
    </div>
  );
};

/** renglones manuscritos simulados (cuerpo de una carta) */
export const InkLines: React.FC<{n: number; w: number; seed?: number; color?: string; gap?: number; reveal?: number}> = ({n, w, seed = 1, color = 'rgba(42,32,22,0.55)', gap = 34, reveal = 1}) => (
  <svg width={w} height={n * gap} style={{overflow: 'visible', filter: 'url(#quill14)'}}>
    {Array.from({length: n}, (_, i) => {
      const last = i === n - 1;
      const ww = (last ? 0.4 + rnd(seed + i) * 0.25 : 0.84 + rnd(seed + i) * 0.16) * w;
      const pr = clamp(reveal * n - i);
      if (pr <= 0) return null;
      const pts: string[] = [];
      const steps = Math.max(2, Math.round((ww * pr) / 9));
      for (let k = 0; k <= steps; k++) {
        const xx = (k / steps) * ww * pr;
        const yy = i * gap + gap * 0.6 + Math.sin(xx * 0.09 + i * 3 + seed) * 2.6 + Math.sin(xx * 0.31 + i) * 1.4;
        pts.push(`${k ? 'L' : 'M'}${xx.toFixed(1)} ${yy.toFixed(1)}`);
      }
      return <path key={i} d={pts.join(' ')} fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeDasharray="14 5 22 4 9 6" />;
    })}
  </svg>
);

/* ================================================================== RÓTULOS FIJOS */
/** «PARADERO DESCONOCIDO»: el estado de la búsqueda (arriba a la derecha) */
export const SearchHUD: React.FC<{t: number; t0: number; t1?: number; x?: number; y?: number; label?: string; status?: string; coord?: string; color?: string}> = ({
  t, t0, t1 = Infinity, x = 1848, y = 74, label = 'MESÓN DE FIERRO', status = 'PARADERO DESCONOCIDO', coord = '27° S · 61° O · ±?', color = K.ember,
}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const p = prog(t, t0, 0.7);
  const blink = 0.35 + 0.65 * (Math.sin(t * 5.2) > 0 ? 1 : 0.25);
  return (
    <div style={{position: 'absolute', right: 1920 - x, top: y, opacity: o, transform: `translateX(${(1 - p) * 40}px)`, textAlign: 'right'}}>
      <div style={{...ar(19, 650, K.mute, 82, 0.28)}}>{label}</div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 6}}>
        <span style={{width: 9, height: 9, borderRadius: 5, background: color, opacity: blink, boxShadow: `0 0 10px ${color}`}} />
        <span style={{...ar(22, 750, color, 82, 0.2)}}>{status}</span>
      </div>
      <div style={{...jm(17, 'rgba(241,238,232,0.6)', 500, 0.08), marginTop: 6}}>{coord}</div>
    </div>
  );
};

/** cinta de los años (abajo): escala comprimida de hace 4.000 años a hoy, con la marca en el año del relato */
export const YEARS14: [number, string][] = [
  [-2000, 'HACE 4.000 AÑOS'], [1576, '1576'], [1774, '1774'], [1783, '1783'], [1803, '1803'], [1825, '1825'], [1969, '1969'], [1990, '1990'], [2012, '2012'], [2016, '2016'], [2026, 'HOY'],
];
const yearX = (y: number, x0: number, w: number) => {
  // tramo comprimido: -2000 → 1500 ocupa el 9 %; 1500 → 2026 el resto, lineal
  if (y < 1500) return x0 + w * 0.09 * clamp((y + 2000) / 3500);
  return x0 + w * (0.09 + 0.91 * clamp((y - 1500) / 526));
};
export const YearRibbon: React.FC<{t: number; t0: number; t1?: number; year: number; from?: number; dur?: number; y?: number; x0?: number; w?: number; dark?: boolean}> = ({
  t, t0, t1 = Infinity, year, from, dur = 1.2, y = 1010, x0 = 150, w = 1620, dark = false,
}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const k = easeInOut(clamp((t - t0) / dur));
  const yy = from === undefined ? year : mix(from, year, k);
  const mx = yearX(yy, x0, w);
  const base = dark ? 'rgba(42,32,22,0.5)' : 'rgba(241,238,232,0.35)';
  const txt = dark ? K.ink : K.bone;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: o, pointerEvents: 'none', overflow: 'visible'}}>
      <line x1={x0} y1={y} x2={x0 + w} y2={y} stroke={base} strokeWidth={1.5} />
      <line x1={x0} y1={y} x2={mx} y2={y} stroke={K.ember} strokeWidth={2.5} />
      {YEARS14.map(([yr, lb], i) => {
        const xx = yearX(yr, x0, w);
        const passed = yr <= yy + 0.5;
        const near = Math.abs(yr - yy) < 0.6;
        return (
          <g key={i} opacity={near ? 1 : passed ? 0.75 : 0.42}>
            <line x1={xx} y1={y - 7} x2={xx} y2={y + 7} stroke={passed ? K.ember : base} strokeWidth={2} />
            {near || i === 0 || i === YEARS14.length - 1 ? (
              <text x={xx} y={y + 30} textAnchor="middle" style={{...ar(15, 650, near ? K.ember : txt, 82, 0.16)} as React.CSSProperties}>
                {lb}
              </text>
            ) : null}
          </g>
        );
      })}
      <circle cx={mx} cy={y} r={7} fill={K.ember} />
      <circle cx={mx} cy={y} r={13} fill="none" stroke={K.ember} strokeWidth={1.5} opacity={0.6} />
    </svg>
  );
};

/* ================================================================== ARCHIVO */
const GRADES: Record<string, string> = {
  warm: 'saturate(0.85) contrast(1.08) brightness(0.92) sepia(0.12)',
  night: 'saturate(0.55) contrast(1.15) brightness(0.62) hue-rotate(-8deg)',
  museum: 'saturate(0.8) contrast(1.1) brightness(0.88)',
  film: 'saturate(0.7) contrast(1.12) brightness(0.9) sepia(0.25)',
  print: 'grayscale(0.2) sepia(0.35) contrast(1.05) brightness(0.95)',
  none: '',
};
type Move = {s: number; x: number; y: number};
/** foto de archivo a pantalla completa con movimiento de cámara y etalonaje por época */
export const Photo14: React.FC<{
  src: string; t: number; t0: number; t1?: number; from?: Move; to?: Move; dur?: number; grade?: keyof typeof GRADES; credit?: string; dim?: number; fit?: 'cover' | 'contain'; focus?: string; warm?: number; o?: number;
}> = ({src, t, t0, t1 = Infinity, from = {s: 1.04, x: 0, y: 0}, to = {s: 1.14, x: 0, y: 0}, dur, grade = 'warm', credit, dim = 0.3, fit = 'cover', focus = '50% 50%', warm = 0, o = 1}) => {
  const oo = fadeIO(t, t0, t1, 0.45) * o;
  if (oo <= 0) return null;
  const span = dur ?? (t1 === Infinity ? 8 : t1 - t0);
  const k = easeInOut(clamp((t - t0) / span));
  const s = mix(from.s, to.s, k), xx = mix(from.x, to.x, k), yy = mix(from.y, to.y, k);
  return (
    <AbsoluteFill style={{opacity: oo, overflow: 'hidden', background: K.void}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: fit, objectPosition: focus, transform: `translate(${xx}px, ${yy}px) scale(${s})`, filter: GRADES[grade]}} />
      {warm ? <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(120,70,20,${warm}) 0%, rgba(20,10,4,${warm * 0.6}) 100%)`, mixBlendMode: 'multiply'}} /> : null}
      {dim ? <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,${Math.min(0.85, dim * 1.5)}) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,${dim * 1.6}) 100%)`}} /> : null}
      {credit ? <Credit14 text={credit} /> : null}
    </AbsoluteFill>
  );
};
export const Credit14: React.FC<{text: string; x?: number; y?: number; align?: 'left' | 'right'; o?: number; dark?: boolean}> = ({text, x = 60, y = 1042, align = 'right', o = 1, dark = true}) => (
  <div style={{position: 'absolute', [align]: x, top: y, transform: 'translateY(-50%)', ...ar(15, 600, dark ? 'rgba(241,238,232,0.72)' : 'rgba(42,32,22,0.65)', 85, 0.12), textTransform: 'uppercase', opacity: o, textShadow: dark ? '0 1px 6px rgba(0,0,0,0.9)' : undefined} as React.CSSProperties}>
    {text}
  </div>
);
/** foto enmarcada como pieza de museo: marco fino, epígrafe en Fraunces y ficha en Archivo */
export const Plate14: React.FC<{
  src: string; t: number; t0: number; t1?: number; x: number; y: number; w: number; h: number; rot?: number; caption?: string; note?: string; credit?: string; grade?: keyof typeof GRADES; focus?: string;
  zoom?: [number, number]; dark?: boolean; border?: string;
}> = ({src, t, t0, t1 = Infinity, x, y, w, h, rot = 0, caption, note, credit, grade = 'museum', focus = '50% 50%', zoom = [1.0, 1.08], dark = true, border = 'rgba(241,238,232,0.18)'}) => {
  const o = fadeIO(t, t0, t1, 0.35);
  if (o <= 0) return null;
  const p = pop(t, t0, 0.9);
  const span = t1 === Infinity ? 8 : t1 - t0;
  const sc = mix(zoom[0], zoom[1], clamp((t - t0) / span));
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(-50%,-50%) rotate(${rot * p}deg) translateY(${(1 - p) * 60}px)`, opacity: o}}>
      <div style={{width: w, height: h, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.6)', outline: `1px solid ${border}`, outlineOffset: 8, background: '#000'}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${sc})`, filter: GRADES[grade]}} />
      </div>
      {caption ? <div style={{...fr(28, 420, dark ? K.bone : K.ink, 72, 50), fontStyle: 'italic', marginTop: 22}}>{caption}</div> : null}
      {note ? <div style={{...ar(17, 600, dark ? K.mute : K.sepia, 85, 0.14), marginTop: 6, textTransform: 'uppercase'}}>{note}</div> : null}
      {credit ? <div style={{...ar(13, 600, dark ? 'rgba(241,238,232,0.5)' : 'rgba(42,32,22,0.55)', 85, 0.1), marginTop: 4, textTransform: 'uppercase'}}>{credit}</div> : null}
    </div>
  );
};

/** fuente en pantalla (abajo a la izquierda) */
export const Source14: React.FC<{t: number; t0: number; t1?: number; text: string; dark?: boolean; x?: number; y?: number}> = ({t, t0, t1 = Infinity, text, dark = true, x = 72, y = 1042}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translateY(-50%)', ...ar(16, 600, dark ? 'rgba(241,238,232,0.66)' : 'rgba(42,32,22,0.66)', 85, 0.1), opacity: o, whiteSpace: 'nowrap', textTransform: 'uppercase'}}>
      <span style={{color: dark ? K.ember : K.inkRed}}>FUENTE · </span>
      {text}
    </div>
  );
};

/** encuesta de cierre con tres opciones */
export const Poll14: React.FC<{t: number; t0: number; t1?: number; q: string; opts: [string, number][]; x?: number; y?: number}> = ({t, t0, t1 = Infinity, q, opts, x = 960, y = 540}) => {
  const o = fadeIO(t, t0, t1, 0.35);
  if (o <= 0) return null;
  const p = pop(t, t0, 0.9);
  const colors = [K.ember, K.sky, '#B9D98A'];
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 1260, transform: `translate(-50%,-50%) scale(${0.92 + 0.08 * p})`, opacity: o, padding: '44px 52px', background: 'rgba(4,6,14,0.84)', border: `1px solid ${K.line}`, borderRadius: 18, boxShadow: '0 40px 90px rgba(0,0,0,0.6)'}}>
      <div style={{...ar(21, 650, K.ember, 82, 0.3)}}>RESPONDÉ EN LOS COMENTARIOS</div>
      <div style={{...fr(64, 520, K.bone, 144, 30, -0.015), marginTop: 14, lineHeight: 1.04}}>{q}</div>
      {opts.map(([txt, at], i) => {
        const pp = prog(t, at, 0.5);
        const c = colors[i % 3];
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '18px 26px', border: `2px solid ${c}`, borderRadius: 12, marginTop: 18, opacity: pp, transform: `translateX(${(1 - pp) * 40}px)`, background: 'rgba(4,6,14,0.6)'}}>
            <span style={{width: 46, height: 46, borderRadius: 23, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', ...ar(26, 800, K.void, 100, 0)}}>{'ABC'[i]}</span>
            <span style={{...fr(40, 420, K.bone, 72, 30)}}>{txt}</span>
          </div>
        );
      })}
    </div>
  );
};
