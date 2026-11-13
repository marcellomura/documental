/* Sistema visual 2D del ep16 (EL PUNTO DÉBIL): instrumento científico de noche. Fondo de espacio, tinta fría para lo
   que mide y protege (turquesa, hielo), brasa para lo débil y lo que entra (ámbar, rojo). Geist Mono para todo dato,
   Archivo expandido para los títulos, Instrument Serif para las voces (citas). Todo se dibuja en SVG o DOM, atado al
   tiempo absoluto t (s). */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp, easeIn, easeInOut, easeOut, rnd} from '../lib/anim';
import {fmtN} from './lib16';

export const K = {
  bg: '#010207', ink: '#ECF1F6', dim: '#8E9CAE', faint: 'rgba(236,241,246,0.32)', line: 'rgba(236,241,246,0.22)',
  hot: '#FF7A1F', hot2: '#FFC24A', deep: '#D11F3A', cool: '#48F3D2', ice: '#8DB8FF', warn: '#FF4130', ok: '#7CF29A',
  mono: "'Geist Mono', 'JetBrains Mono', monospace", sans: "'Geist', 'Inter', sans-serif", wide: "'Archivo', 'Geist', sans-serif", serif: "'Instrument Serif', serif",
};
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const ss = (a: number, b: number, x: number) => {
  const k = clamp((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};
/** entra en t0 (din s) y sale en t1 (dout s) */
export const vis = (t: number, t0: number, t1 = Infinity, din = 0.5, dout = 0.5) =>
  Math.min(easeOut(clamp((t - t0) / din)), t1 === Infinity ? 1 : 1 - easeIn(clamp((t - (t1 - dout)) / dout)));
export const P = (t: number, t0: number, d = 0.6, e = easeInOut) => e(clamp((t - t0) / d));

/* ------------------------------------------------------------------ acabado */
/** grano de película animado, viñeta y una leve aberración en los bordes */
export const Finish: React.FC<{t: number; grain?: number; vig?: number}> = ({t, grain = 0.06, vig = 0.55}) => {
  const g = Math.floor(t * 24) % 8;
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 70% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vig}) 100%)`, pointerEvents: 'none'}} />
      <Img src={staticFile(`tex/grain${g}.png`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'overlay', opacity: grain * 4}} />
    </>
  );
};
export const Black: React.FC<{k: number}> = ({k}) => (k > 0 ? <AbsoluteFill style={{background: '#000', opacity: k}} /> : null);

/* ------------------------------------------------------------------ tipografía de datos */
export const Mono: React.FC<{size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties; weight?: number; track?: number}> = ({size = 22, color = K.ink, children, style, weight = 500, track = 0.06}) => (
  <div style={{fontFamily: K.mono, fontSize: size, color, fontWeight: weight, letterSpacing: `${track}em`, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', ...style}}>{children}</div>
);
export const Caps: React.FC<{size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 18, color = K.dim, children, style}) => (
  <Mono size={size} color={color} weight={500} track={0.22} style={{textTransform: 'uppercase', ...style}}>{children}</Mono>
);

/** rótulo con línea guía: punto en (x, y) y texto desplazado (dx, dy) */
export const Label: React.FC<{x: number; y: number; dx?: number; dy?: number; k: number; title?: string; value?: React.ReactNode; unit?: string; color?: string; align?: 'left' | 'right'; size?: number; dot?: boolean; sub?: string}> = ({x, y, dx = 120, dy = -80, k, title, value, unit, color = K.ink, align, size = 44, dot = true, sub}) => {
  if (k <= 0.001) return null;
  const right = align ? align === 'right' : dx < 0;
  const ex = x + dx, ey = y + dy;
  const len = Math.hypot(dx, dy);
  const lk = clamp(k * 1.6);
  const tk = clamp(k * 1.6 - 0.6);
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
        {dot ? <circle cx={x} cy={y} r={7 * lk} fill="none" stroke={color} strokeWidth={2} opacity={0.9} /> : null}
        {dot ? <circle cx={x} cy={y} r={2.6} fill={color} opacity={lk} /> : null}
        <line x1={x} y1={y} x2={x + dx * lk} y2={y + dy * lk} stroke={color} strokeWidth={1.6} opacity={0.75} strokeDasharray={`${len} ${len}`} />
        <line x1={ex} y1={ey} x2={ex + (right ? -1 : 1) * 46 * tk} y2={ey} stroke={color} strokeWidth={1.6} opacity={0.75 * tk} />
      </svg>
      <div style={{position: 'absolute', left: right ? undefined : ex + 58, right: right ? 1920 - ex + 58 : undefined, top: ey - (value !== undefined ? size * 0.95 : 14), opacity: tk, transform: `translateY(${(1 - tk) * 10}px)`, textAlign: right ? 'right' : 'left'}}>
        {title ? <Caps size={16} color={K.dim} style={{marginBottom: 6}}>{title}</Caps> : null}
        {value !== undefined ? (
          <div style={{fontFamily: K.mono, fontSize: size, color, fontWeight: 500, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', lineHeight: 1}}>
            {value}{unit ? <span style={{fontSize: size * 0.45, color: K.dim, marginLeft: 10, letterSpacing: '0.1em'}}>{unit}</span> : null}
          </div>
        ) : null}
        {sub ? <Mono size={17} color={K.dim} style={{marginTop: 8}}>{sub}</Mono> : null}
      </div>
    </>
  );
};

/** número que corre de a hasta b (formato es-AR) */
export const Count: React.FC<{t: number; t0: number; d?: number; a: number; b: number; dec?: number; e?: (k: number) => number}> = ({t, t0, d = 1.2, a, b, dec = 0, e = easeOut}) => {
  const k = e(clamp((t - t0) / d));
  return <>{fmtN(mix(a, b, k), dec)}</>;
};

/** esquinas de visor (corchetes) alrededor de un rectángulo */
export const Corners: React.FC<{x: number; y: number; w: number; h: number; k: number; color?: string; s?: number}> = ({x, y, w, h, k, color = K.ink, s = 26}) => {
  if (k <= 0) return null;
  const o = (1 - easeOut(k)) * 30;
  const L = (px: number, py: number, sx: number, sy: number) => <path d={`M ${px} ${py + sy * s} L ${px} ${py} L ${px + sx * s} ${py}`} fill="none" stroke={color} strokeWidth={2} />;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: k}} width={1} height={1}>
      {L(x - o, y - o, 1, 1)}{L(x + w + o, y - o, -1, 1)}{L(x - o, y + h + o, 1, -1)}{L(x + w + o, y + h + o, -1, -1)}
    </svg>
  );
};

/* ------------------------------------------------------------------ títulos y textos */
/** título del episodio: letras expandidas que se abren desde el centro */
export const Title16: React.FC<{t: number; t0: number; t1: number; title: string; sub?: string; size?: number; y?: number}> = ({t, t0, t1, title, sub, size = 150, y = 470}) => {
  const k = vis(t, t0, t1, 1.2, 0.8);
  if (k <= 0) return null;
  const sp = mix(0.5, 0.06, easeOut(clamp((t - t0) / 2.6)));
  const wd = mix(125, 112, easeOut(clamp((t - t0) / 3)));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: k}}>
      <div style={{fontFamily: K.wide, fontWeight: 800, fontSize: size, color: K.ink, letterSpacing: `${sp}em`, fontStretch: `${wd}%`, lineHeight: 1, textShadow: '0 0 40px rgba(255,140,60,0.25)'}}>{title}</div>
      {sub ? <div style={{marginTop: 34, fontFamily: K.serif, fontStyle: 'italic', fontSize: 46, color: K.dim, opacity: vis(t, t0 + 1.0, t1, 1.0, 0.6)}}>{sub}</div> : null}
    </div>
  );
};
/** capítulo: número y nombre, arriba a la izquierda */
export const Chapter: React.FC<{t: number; t0: number; t1: number; n: string; name: string}> = ({t, t0, t1, n, name}) => {
  const k = vis(t, t0, t1, 0.8, 0.8);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 96, top: 84, opacity: k, display: 'flex', alignItems: 'baseline', gap: 22}}>
      <Mono size={18} color={K.hot} track={0.3}>{n}</Mono>
      <div style={{width: 60 * k, height: 1.5, background: K.faint, alignSelf: 'center'}} />
      <Caps size={18} color={K.ink}>{name}</Caps>
    </div>
  );
};
/** tarjeta de nombre (persona o máquina) */
export const NameTag: React.FC<{t: number; t0: number; t1: number; name: string; role: string; x?: number; y?: number}> = ({t, t0, t1, name, role, x = 96, y = 860}) => {
  const k = vis(t, t0, t1, 0.6, 0.5);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: k}}>
      <div style={{width: 340 * easeOut(k), height: 2, background: K.hot, marginBottom: 16}} />
      <div style={{fontFamily: K.wide, fontWeight: 700, fontStretch: '112%', fontSize: 52, color: K.ink, letterSpacing: '0.02em'}}>{name}</div>
      <Caps size={18} color={K.dim} style={{marginTop: 10}}>{role}</Caps>
    </div>
  );
};
/** cita: Instrument Serif itálica grande, con la fuente abajo */
export const Quote16: React.FC<{t: number; t0: number; t1: number; text: string; who: string; x?: number; y?: number; w?: number; size?: number; color?: string}> = ({t, t0, t1, text, who, x = 160, y = 380, w = 1600, size = 84, color = K.ink}) => {
  const k = vis(t, t0, t1, 0.8, 0.6);
  if (k <= 0) return null;
  const words = text.split(' ');
  const per = 0.9 / Math.max(words.length, 1);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, opacity: k}}>
      <div style={{fontFamily: K.serif, fontStyle: 'italic', fontSize: size, lineHeight: 1.12, color}}>
        {words.map((wd, i) => {
          const a = clamp((t - t0) / 1.4 - i * per * 0.9);
          return <span key={i} style={{opacity: clamp(a * 3), filter: `blur(${(1 - clamp(a * 3)) * 6}px)`}}>{wd} </span>;
        })}
      </div>
      <Caps size={18} color={K.dim} style={{marginTop: 34}}>{who}</Caps>
    </div>
  );
};
/** fuente o crédito en el borde inferior */
export const Credit16: React.FC<{t: number; t0: number; t1: number; text: string; right?: boolean}> = ({t, t0, t1, text, right}) => {
  const k = vis(t, t0, t1, 0.6, 0.4);
  if (k <= 0) return null;
  return <Mono size={15} color="rgba(236,241,246,0.55)" track={0.08} style={{position: 'absolute', bottom: 44, left: right ? undefined : 96, right: right ? 96 : undefined, opacity: k}}>{text}</Mono>;
};
/** palabra o frase grande centrada (para golpes de guion) */
export const Big: React.FC<{t: number; t0: number; t1: number; text: React.ReactNode; size?: number; y?: number; color?: string; font?: 'wide' | 'mono' | 'serif'; track?: number}> = ({t, t0, t1, text, size = 120, y = 440, color = K.ink, font = 'wide', track = 0.04}) => {
  const k = vis(t, t0, t1, 0.5, 0.45);
  if (k <= 0) return null;
  const ff = font === 'wide' ? K.wide : font === 'mono' ? K.mono : K.serif;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: k, transform: `scale(${mix(1.04, 1, easeOut(k))})`}}>
      <div style={{fontFamily: ff, fontWeight: font === 'wide' ? 800 : 400, fontStretch: font === 'wide' ? '118%' : undefined, fontStyle: font === 'serif' ? 'italic' : undefined, fontSize: size, color, letterSpacing: `${track}em`, lineHeight: 1.05}}>{text}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ fotos */
export const Photo16: React.FC<{t: number; t0: number; t1: number; file: string; z0?: number; z1?: number; x0?: number; x1?: number; y0?: number; y1?: number; grade?: number; bw?: boolean; fit?: 'cover' | 'contain'; style?: React.CSSProperties}> = ({t, t0, t1, file, z0 = 1.04, z1 = 1.14, x0 = 0, x1 = 0, y0 = 0, y1 = 0, grade = 0.25, bw, fit = 'cover', style}) => {
  const k = vis(t, t0, t1, 0.7, 0.7);
  if (k <= 0) return null;
  const p = clamp((t - t0) / Math.max(t1 - t0, 0.1));
  const z = mix(z0, z1, p), x = mix(x0, x1, p), y = mix(y0, y1, p);
  return (
    <AbsoluteFill style={{opacity: k, overflow: 'hidden', ...style}}>
      <Img src={staticFile(file)} style={{width: '100%', height: '100%', objectFit: fit, transform: `translate(${x}px, ${y}px) scale(${z})`, filter: `${bw ? 'grayscale(1) ' : ''}contrast(1.06) saturate(${bw ? 0 : 0.92}) brightness(${1 - grade * 0.4})`}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(1,2,7,${grade}) 0%, rgba(1,2,7,0) 30%, rgba(1,2,7,0) 62%, rgba(1,2,7,${grade * 2.4}) 100%)`}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ fallas: radiación sobre la electrónica */
/** bloques de corrupción digital y corrimiento de color sobre lo que haya abajo */
export const Corrupt: React.FC<{t: number; k: number; seed?: number; w?: number; h?: number}> = ({t, k, seed = 1, w = 1920, h = 1080}) => {
  if (k <= 0) return null;
  const f = Math.floor(t * 30);
  const n = Math.floor(6 + 26 * k);
  const blocks = [];
  for (let i = 0; i < n; i++) {
    const r = (q: number) => rnd(seed * 101 + i * 13.7 + q + Math.floor(f / 2) * 7.1);
    if (r(1) > 0.35 + 0.6 * k) continue;
    const bw = 40 + r(2) * (w * 0.4), bh = 4 + r(3) * 60;
    const x = r(4) * (w - bw), y = r(5) * (h - bh);
    const c = r(6) < 0.33 ? 'rgba(255,60,60,0.55)' : r(6) < 0.66 ? 'rgba(60,255,220,0.45)' : 'rgba(236,241,246,0.6)';
    blocks.push(<div key={i} style={{position: 'absolute', left: x, top: y, width: bw, height: bh, background: c, mixBlendMode: 'screen', opacity: 0.4 + 0.6 * r(7)}} />);
    if (r(8) < 0.4) blocks.push(<div key={`d${i}`} style={{position: 'absolute', left: x + 30, top: y + bh, width: bw * 0.6, height: 2, background: 'rgba(255,255,255,0.8)'}} />);
  }
  return <AbsoluteFill style={{pointerEvents: 'none'}}>{blocks}</AbsoluteFill>;
};
/** «nieve» en el sensor: píxeles calientes que aparecen y se quedan (más con rate alto) */
export const Snow: React.FC<{t: number; t0: number; rate: number; w?: number; h?: number; seed?: number; max?: number}> = ({t, t0, rate, w = 1920, h = 1080, seed = 3, max = 1400}) => {
  const n = Math.min(max, Math.floor(Math.max(0, t - t0) * rate));
  if (n <= 0) return null;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const x = rnd(seed * 7 + i * 1.37) * w, y = rnd(seed * 11 + i * 2.91) * h;
    const age = t - t0 - i / rate;
    const s = rnd(i * 5.3 + seed) < 0.12 ? 3 : rnd(i * 3.1) < 0.4 ? 2 : 1.4;
    const flash = Math.exp(-age * 6);
    const streak = rnd(i * 8.7 + seed) < 0.08;
    pts.push(streak
      ? <rect key={i} x={x} y={y} width={2} height={8 + rnd(i) * 26} fill="#FFFFFF" opacity={0.55 + 0.45 * flash} transform={`rotate(${rnd(i * 2.2) * 180} ${x} ${y})`} />
      : <rect key={i} x={x} y={y} width={s} height={s} fill={rnd(i * 4.4) < 0.2 ? '#FFD7D7' : '#FFFFFF'} opacity={0.6 + 0.4 * flash} />);
  }
  return <svg style={{position: 'absolute', left: 0, top: 0}} width={w} height={h}>{pts}</svg>;
};
/** destellos con los ojos cerrados: puntos, rayas y «cometas» que cruzan la oscuridad */
export const Phosphenes: React.FC<{t: number; t0: number; t1: number; rate?: number; w?: number; h?: number; seed?: number; warm?: number}> = ({t, t0, t1, rate = 1.6, w = 1920, h = 1080, seed = 9, warm = 0.15}) => {
  if (t < t0 || t > t1 + 1) return null;
  const n = Math.ceil((t1 - t0) * rate) + 2;
  const out = [];
  for (let i = 0; i < n; i++) {
    const ti = t0 + (i + rnd(seed + i * 3.3) * 0.8) / rate;
    const age = t - ti;
    if (age < 0 || age > 0.6) continue;
    const r = (q: number) => rnd(seed * 31 + i * 7.13 + q);
    const x = (0.12 + r(1) * 0.76) * w, y = (0.15 + r(2) * 0.7) * h;
    const kind = r(3);
    const a = Math.exp(-age * 9) * (0.7 + 0.3 * r(4));
    if (kind < 0.45) {
      out.push(<circle key={i} cx={x} cy={y} r={3 + r(5) * 6} fill="#FFFFFF" opacity={a} />);
      out.push(<circle key={`g${i}`} cx={x} cy={y} r={24 + r(6) * 40} fill="url(#ph)" opacity={a * 0.8} />);
    } else if (kind < 0.85) {
      const ang = r(7) * Math.PI, len = 120 + r(8) * 420, prog = clamp(age / 0.12);
      const dx = Math.cos(ang) * len, dy = Math.sin(ang) * len;
      out.push(<line key={i} x1={x - dx / 2} y1={y - dy / 2} x2={x - dx / 2 + dx * prog} y2={y - dy / 2 + dy * prog} stroke="#FFFFFF" strokeWidth={2 + r(9) * 2.5} strokeLinecap="round" opacity={a} />);
    } else {
      // «hada»: un racimo de chispas que se abre
      for (let j = 0; j < 7; j++) {
        const an = r(10 + j) * Math.PI * 2, d = age * (160 + r(20 + j) * 200);
        out.push(<circle key={`${i}-${j}`} cx={x + Math.cos(an) * d} cy={y + Math.sin(an) * d} r={2.2} fill="#FFF4D6" opacity={a} />);
      }
    }
  }
  return (
    <svg style={{position: 'absolute', left: 0, top: 0}} width={w} height={h}>
      <defs><radialGradient id="ph"><stop offset="0%" stopColor={warm > 0.1 ? '#FFE7C2' : '#FFFFFF'} stopOpacity={0.9} /><stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} /></radialGradient></defs>
      {out}
    </svg>
  );
};

/* ------------------------------------------------------------------ gráficos */
export type Pt = [number, number];
/** gráfico de línea que se dibuja de izquierda a derecha; xr/yr = rangos de datos; box = [x, y, w, h] en px */
export const LineChart: React.FC<{t: number; t0: number; d?: number; k: number; data: Pt[]; xr: Pt; yr: Pt; box: [number, number, number, number]; color?: string; width?: number; dash?: string; dots?: boolean; area?: boolean; xticks?: number[]; yticks?: number[]; yfmt?: (v: number) => string; xfmt?: (v: number) => string; grid?: boolean}> = ({t, t0, d = 2.5, k, data, xr, yr, box, color = K.cool, width = 3, dash, dots, area, xticks = [], yticks = [], yfmt = (v) => fmtN(v), xfmt = (v) => String(v), grid = true}) => {
  if (k <= 0) return null;
  const [bx, by, bw, bh] = box;
  const X = (v: number) => bx + ((v - xr[0]) / (xr[1] - xr[0])) * bw;
  const Y = (v: number) => by + bh - ((v - yr[0]) / (yr[1] - yr[0])) * bh;
  const p = easeInOut(clamp((t - t0) / d));
  const xEnd = mix(xr[0], xr[1], p);
  const pts = data.filter((q) => q[0] <= xEnd);
  if (pts.length && pts[pts.length - 1][0] < xEnd) {
    const nx = data.find((q) => q[0] > xEnd);
    if (nx) {
      const a = pts[pts.length - 1], kk = (xEnd - a[0]) / (nx[0] - a[0]);
      pts.push([xEnd, a[1] + (nx[1] - a[1]) * kk]);
    }
  }
  const path = pts.map((q, i) => `${i ? 'L' : 'M'} ${X(q[0]).toFixed(1)} ${Y(q[1]).toFixed(1)}`).join(' ');
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: k}} width={1} height={1}>
      {grid ? yticks.map((v) => <line key={`gy${v}`} x1={bx} x2={bx + bw} y1={Y(v)} y2={Y(v)} stroke={K.line} strokeWidth={1} strokeDasharray="2 8" />) : null}
      {yticks.map((v) => <text key={`ty${v}`} x={bx - 18} y={Y(v) + 6} fill={K.dim} fontFamily={K.mono} fontSize={17} textAnchor="end">{yfmt(v)}</text>)}
      {xticks.map((v) => <text key={`tx${v}`} x={X(v)} y={by + bh + 36} fill={K.dim} fontFamily={K.mono} fontSize={17} textAnchor="middle">{xfmt(v)}</text>)}
      <line x1={bx} x2={bx + bw} y1={by + bh} y2={by + bh} stroke={K.faint} strokeWidth={1.5} />
      {area && pts.length > 1 ? <path d={`${path} L ${X(pts[pts.length - 1][0])} ${by + bh} L ${X(pts[0][0])} ${by + bh} Z`} fill={color} opacity={0.12} /> : null}
      <path d={path} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={dash} />
      {dots ? pts.filter((_, i) => i % 1 === 0).map((q, i) => <circle key={i} cx={X(q[0])} cy={Y(q[1])} r={2.6} fill={color} />) : null}
      {pts.length ? <circle cx={X(pts[pts.length - 1][0])} cy={Y(pts[pts.length - 1][1])} r={7} fill={color} /> : null}
    </svg>
  );
};

/* ------------------------------------------------------------------ mapa plano (equirectangular) */
export type MapView = {lon0: number; lon1: number; lat0: number; lat1: number; x: number; y: number; w: number; h: number};
export const mapXY = (v: MapView, lat: number, lon: number): Pt => [v.x + ((lon - v.lon0) / (v.lon1 - v.lon0)) * v.w, v.y + ((v.lat1 - lat) / (v.lat1 - v.lat0)) * v.h];
/** fondo del mapa: Blue Marble (o luces de noche) recortado a la ventana, con tono oscuro para que se lean los datos */
export const MapBase: React.FC<{v: MapView; k: number; night?: boolean; dark?: number}> = ({v, k, night, dark = 0.55}) => {
  if (k <= 0) return null;
  const sx = v.w / ((v.lon1 - v.lon0) / 360), sy = v.h / ((v.lat1 - v.lat0) / 180);
  const ox = v.x - ((v.lon0 + 180) / 360) * sx, oy = v.y - ((90 - v.lat1) / 180) * sy;
  return (
    <div style={{position: 'absolute', left: v.x, top: v.y, width: v.w, height: v.h, overflow: 'hidden', opacity: k}}>
      <Img src={staticFile(night ? 'ep16/tex/night_2k.jpg' : 'ep16/tex/day_2k.jpg')} style={{position: 'absolute', left: ox - v.x, top: oy - v.y, width: sx, height: sy, filter: `saturate(0.75) brightness(${1 - dark})`}} />
    </div>
  );
};

/* ------------------------------------------------------------------ subtítulos del vertical */
export const Captions16: React.FC<{t: number; words: {w: string; s: number; e: number}[]; y?: number; hide?: boolean}> = ({t, words, y = 1330, hide}) => {
  if (hide) return null;
  const chunks: {w: string; s: number; e: number}[][] = [];
  let cur: {w: string; s: number; e: number}[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const gap = next ? next.s - w.e : 9;
    if (cur.length >= 3 || /[.,:;?!…»]$/.test(w.w) || gap > 0.35) { chunks.push(cur); cur = []; }
  });
  if (cur.length) chunks.push(cur);
  const ch = chunks.find((c, i) => t >= c[0].s - 0.05 && t < (chunks[i + 1] ? Math.min(chunks[i + 1][0].s - 0.05, c[c.length - 1].e + 0.6) : c[c.length - 1].e + 0.6));
  if (!ch) return null;
  const O = 4;
  const outline = [[O, 0], [-O, 0], [0, O], [0, -O], [O * 0.7, O * 0.7], [-O * 0.7, O * 0.7], [O * 0.7, -O * 0.7], [-O * 0.7, -O * 0.7]].map(([x, yy]) => `${x}px ${yy}px 0 #000`).join(', ');
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: y - 70, height: 240, background: 'radial-gradient(ellipse 62% 50% at 50% 50%, rgba(1,2,7,0.6) 0%, rgba(1,2,7,0.3) 45%, rgba(1,2,7,0) 100%)'}} />
      <div style={{position: 'absolute', left: 50, right: 50, top: y, textAlign: 'center', fontFamily: K.wide, fontWeight: 800, fontStretch: '108%', fontSize: 74, lineHeight: 1.1, letterSpacing: '0.01em', textTransform: 'uppercase'}}>
        {ch.map((w, i) => {
          const on = t >= w.s - 0.03;
          return <span key={i} style={{color: on ? (t < w.e + 0.05 ? K.hot2 : K.ink) : 'rgba(236,241,246,0.5)', textShadow: `${outline}, 0 6px 0 #000, 0 0 30px rgba(0,0,0,0.9)`, marginRight: 18}}>{w.w.replace(/[«»"]/g, '')}</span>;
        })}
      </div>
    </>
  );
};
