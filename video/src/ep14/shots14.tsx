/* Planos reutilizables del episodio 14: la mesa en el monte (3D + monte 2D), el corte del suelo en pergamino, el
   bólido que cruza el cielo, la fila de cartas del gancho y el corte 3D del suelo con la masa enterrada. */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeInOut, easeOut, prog, rnd, shake} from '../lib/anim';
import {K, F, ar, fr, fell, jm, mix, fadeIO, Vignette} from './kit14';
import {MonteBackdrop, ForeGrass, type Mood} from './art14';
import {Stage14, SkyLights, Ground, IronMass, MESON, ContactShadow, Blast, Glow, horizonY, project, type Cam, type V3} from './three14';
import {geoNaturalEarth1, geoPath, geoInterpolate} from 'd3-geo';
import countries from '../data/ep04/countries110.json';

/* ================================================================== LA MESA EN EL MONTE */
const yawOf = (c: Cam) => Math.atan2(c.look[0] - c.pos[0], -(c.look[2] - c.pos[2]));
export type SlabShotProps = {
  t: number; cam: Cam; mood: Mood; slabO?: number; slabRot?: V3; slabPos?: V3; dig?: number; blast?: number; blastS?: number; lantern?: {pos: V3; k: number}; exposure?: number;
  grass?: number; extra?: React.ReactNode; shakeAt?: number; dim?: number; heat?: number; outline?: number; children?: React.ReactNode; light?: number;
};
/** plano de la mesa: monte 2D con paralaje alineado al horizonte de la cámara 3D, suelo y mesa en 3D, luz de farol */
export const SlabShot: React.FC<SlabShotProps> = ({t, cam, mood, slabO = 1, slabRot = [0.04, 0.5, -0.03], slabPos = [0, 0.12, 0], dig = 0, blast, blastS = 1, lantern, exposure = 1.05, grass = 1, extra, shakeAt, dim = 0, heat = 0, outline = 0, children, light = 1}) => {
  const sh = shakeAt !== undefined ? shake(t, shakeAt, 0.12, 0.9) : {x: 0, y: 0};
  const c: Cam = {...cam, pos: [cam.pos[0] + sh.x, cam.pos[1] + sh.y, cam.pos[2]]};
  const hy = horizonY(c);
  const pan = yawOf(c) * 1400;
  const lp = lantern ? project(c, lantern.pos) : null;
  // contorno punteado donde estaba la mesa (proyección de un óvalo en el suelo)
  const ring = outline > 0 ? Array.from({length: 48}, (_, i) => {
    const a = (i / 48) * Math.PI * 2;
    return project(c, [slabPos[0] + Math.cos(a) * 1.35, 0.02, slabPos[2] + Math.sin(a) * 1.1]);
  }) : [];
  return (
    <AbsoluteFill style={{background: K.void}}>
      <MonteBackdrop t={t} mood={mood} horizon={hy} pan={pan} />
      <Stage14 cam={c} exposure={exposure} env={0.25}>
        <SkyLights mood={mood} k={light} />
        <Ground tint={mood === 'golden' ? '#FFFFFF' : mood === 'night' ? '#4A4F66' : '#6E6470'} dig={dig} />
        {slabO > 0.01 ? (
          <>
            <ContactShadow w={4.6} d={3.8} rot={slabRot[1]} o={slabO} />
            <IronMass shape={MESON} pos={slabPos} rot={slabRot} o={slabO} heat={heat} />
          </>
        ) : null}
        {lantern && lantern.k > 0 ? <pointLight position={lantern.pos} intensity={9 * lantern.k * (0.92 + 0.08 * Math.sin(t * 13) * Math.sin(t * 7.3))} distance={14} decay={1.6} color="#FFB060" /> : null}
        {blast !== undefined ? <Blast t={t} t0={blast} pos={[slabPos[0] + 0.3, 0, slabPos[2] + 0.9]} s={blastS} /> : null}
        {extra}
      </Stage14>
      {lp && lantern && lantern.k > 0 ? (
        <>
          <div style={{position: 'absolute', left: lp[0] - 260, top: lp[1] - 260, width: 520, height: 520, borderRadius: 260, background: 'radial-gradient(circle, rgba(255,190,110,0.32) 0%, rgba(255,150,60,0.1) 40%, rgba(0,0,0,0) 70%)', opacity: lantern.k}} />
          <div style={{position: 'absolute', left: lp[0] - 7, top: lp[1] - 7, width: 14, height: 14, borderRadius: 7, background: '#FFE6B8', boxShadow: '0 0 24px 8px rgba(255,170,80,0.8)', opacity: lantern.k}} />
        </>
      ) : null}
      {outline > 0 ? (
        <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
          <path d={ring.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + 'Z'} fill="none" stroke={K.ember} strokeWidth={3} strokeDasharray="10 12" opacity={outline} style={{filter: 'drop-shadow(0 0 6px rgba(255,140,60,0.8))'}} />
        </svg>
      ) : null}
      {grass > 0 ? <ForeGrass t={t} pan={pan} o={grass} color={mood === 'golden' ? '#1A140E' : '#06050A'} /> : null}
      {dim > 0 ? <AbsoluteFill style={{background: `rgba(2,3,9,${dim})`}} /> : null}
      {children}
      <Vignette k={0.55} />
    </AbsoluteFill>
  );
};

/* ================================================================== EL BÓLIDO EN EL CIELO (2D) */
/** bólido que cruza el cielo de (x0,y0) a (x1,y1) entre t0 y t0+dur: cabeza blanca, estela naranja, destello final */
export const Streak: React.FC<{t: number; t0: number; dur?: number; x0: number; y0: number; x1: number; y1: number; w?: number; color?: string; flash?: boolean}> = ({t, t0, dur = 1.2, x0, y0, x1, y1, w = 1, color = '#FF8A3C', flash = false}) => {
  const a = (t - t0) / dur;
  if (a < 0 || a > 1.8) return null;
  const k = easeOut(clamp(a));
  const hx = mix(x0, x1, k), hy = mix(y0, y1, k);
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const len = 520 * w * clamp(a * 3) * (a > 1 ? clamp(1 - (a - 1) / 0.8) : 1);
  const o = a > 1 ? clamp(1 - (a - 1) / 0.8) : 1;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none', overflow: 'visible'}}>
      <defs>
        <linearGradient id={`st${Math.round(t0 * 100)}`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#FFF6E2" stopOpacity={0.95} />
          <stop offset="0.12" stopColor={color} stopOpacity={0.85} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g transform={`translate(${hx},${hy}) rotate(${(ang * 180) / Math.PI})`} opacity={o}>
        <rect x={-len} y={-7 * w} width={len} height={14 * w} rx={7 * w} fill={`url(#st${Math.round(t0 * 100)})`} style={{filter: 'blur(3px)'}} />
        <rect x={-len * 0.6} y={-2.5 * w} width={len * 0.6} height={5 * w} rx={2.5 * w} fill={`url(#st${Math.round(t0 * 100)})`} />
        <circle r={9 * w} fill="#FFFBF0" style={{filter: 'blur(1px)'}} />
        <circle r={26 * w} fill="rgba(255,190,110,0.45)" style={{filter: 'blur(8px)'}} />
      </g>
      {flash && a > 0.85 ? (
        <>
          <radialGradient id={`sf${Math.round(t0 * 100)}`}>
            <stop offset="0" stopColor="#FFF6E6" stopOpacity={0.95} />
            <stop offset="0.25" stopColor="#FFC27A" stopOpacity={0.45} />
            <stop offset="1" stopColor="#FF8A3C" stopOpacity={0} />
          </radialGradient>
          <circle cx={x1} cy={y1} r={260 * w * (0.6 + 0.4 * clamp((a - 0.85) / 0.3))} fill={`url(#sf${Math.round(t0 * 100)})`} opacity={clamp(1 - (a - 0.85) / 0.6)} />
        </>
      ) : null}
    </svg>
  );
};

/* ================================================================== CORTE DEL SUELO (PERGAMINO) */
/** corte del suelo dibujado con tinta: la mesa en la superficie, la excavación, las palancas, los dos hornillos con
    pólvora y, debajo, la "mina" imaginada (veta punteada en plata). Cada parte con su opacidad/progreso. */
export const CrossSection: React.FC<{t: number; x?: number; y?: number; s?: number; dig?: number; lever?: number; charges?: number; vein?: number; veinGone?: number; soil?: number; boom?: number; o?: number; labels?: boolean}> = ({
  t, x = 960, y = 560, s = 1, dig = 0, lever = 0, charges = 0, vein = 0, veinGone = 0, soil = 1, boom = 0, o = 1, labels = true,
}) => {
  const ink = 'rgba(42,32,22,0.88)';
  const lift = lever * 0.14;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: o, overflow: 'visible'}}>
      <g transform={`translate(${x},${y}) scale(${s})`} style={{filter: 'url(#quill14)'}}>
        {/* capas del suelo (rayado) */}
        <g opacity={soil}>
          <rect x={-760} y={0} width={1520} height={380} fill="rgba(122,90,52,0.16)" />
          {Array.from({length: 36}, (_, i) => (
            <line key={i} x1={-760 + i * 44} y1={30 + (i % 3) * 8} x2={-730 + i * 44} y2={60 + (i % 3) * 8} stroke="rgba(80,56,30,0.35)" strokeWidth={2} />
          ))}
          {Array.from({length: 22}, (_, i) => (
            <circle key={'p' + i} cx={-740 + rnd(i * 3) * 1480} cy={90 + rnd(i * 7) * 270} r={3 + rnd(i * 11) * 6} fill="none" stroke="rgba(80,56,30,0.35)" strokeWidth={1.5} />
          ))}
          <line x1={-760} y1={0} x2={760} y2={0} stroke={ink} strokeWidth={3} />
          {/* pasto en la superficie */}
          {Array.from({length: 60}, (_, i) => {
            const gx = -750 + i * 25 + rnd(i) * 10;
            if (Math.abs(gx) < 260 * (dig > 0 ? 1.35 : 1)) return null;
            return <path key={'g' + i} d={`M${gx} 0 l${-4 + rnd(i * 5) * 8} ${-12 - rnd(i * 9) * 14}`} stroke={ink} strokeWidth={1.6} fill="none" />;
          })}
        </g>
        {/* excavación alrededor */}
        {dig > 0 ? <path d={`M${-260 - 90 * dig} 0 Q${-250} ${110 * dig} 0 ${120 * dig} Q250 ${110 * dig} ${260 + 90 * dig} 0`} fill="rgba(60,40,20,0.22)" stroke={ink} strokeWidth={2.5} strokeDasharray="8 6" /> : null}
        {/* hornillos: dos cargas de pólvora en pozos bajo la mesa */}
        {charges > 0
          ? [-120, 120].map((cx, i) => (
              <g key={i} opacity={clamp(charges * 2 - i * 0.5)}>
                <path d={`M${cx - 26} 30 L${cx - 18} 90 L${cx + 18} 90 L${cx + 26} 30`} fill="rgba(30,22,14,0.35)" stroke={ink} strokeWidth={2.2} />
                <circle cx={cx} cy={74} r={13} fill={K.inkRed} opacity={0.85} />
                <path d={`M${cx} 61 C${cx + 10} 40 ${cx - 6} 30 ${cx + 30} 12`} stroke={ink} strokeWidth={1.8} fill="none" strokeDasharray="4 4" />
              </g>
            ))
          : null}
        {/* la mesa (de perfil), con palanca */}
        <g transform={`translate(0,${-boom * 40}) rotate(${-lift * 57} 230 0)`}>
          <path d="M-235 0 C-240 -30 -220 -58 -170 -62 L150 -66 C205 -64 236 -40 232 -6 L228 18 C150 30 -140 28 -228 18 Z" fill="rgba(70,62,56,0.85)" stroke={ink} strokeWidth={3} />
          {Array.from({length: 9}, (_, i) => (
            <ellipse key={i} cx={-190 + i * 46} cy={-40 + (i % 2) * 8} rx={12} ry={6} fill="none" stroke="rgba(20,16,12,0.5)" strokeWidth={1.5} />
          ))}
        </g>
        {lever > 0 ? (
          <g opacity={clamp(lever * 3)}>
            <line x1={260} y1={20} x2={420} y2={-150 + lift * 300} stroke={ink} strokeWidth={6} strokeLinecap="round" />
            <path d="M250 22 l20 -12 l6 16 z" fill={ink} />
          </g>
        ) : null}
        {/* la "mina" imaginada: veta de plata que baja */}
        {vein > 0 ? (
          <g opacity={vein * (1 - veinGone)}>
            <path d={`M-200 30 C-260 120 -120 170 -170 260 C-210 330 -40 380 60 372 C160 365 200 300 150 230 C110 170 230 120 190 30 Z`} fill="rgba(213,221,234,0.25)" stroke="#8C98AA" strokeWidth={3} strokeDasharray="12 9" />
            {Array.from({length: 14}, (_, i) => (
              <path key={i} d={`M${-150 + rnd(i * 3) * 300} ${70 + rnd(i * 5) * 270} l10 -6 l4 10 z`} fill="#C9D3E2" opacity={0.6 + 0.4 * Math.sin(t * 4 + i)} />
            ))}
            {labels ? <text x={0} y={230} textAnchor="middle" style={{...fell(44, '#55627A', true)} as React.CSSProperties}>¿una mina de plata?</text> : null}
          </g>
        ) : null}
        {veinGone > 0 && labels ? (
          <text x={0} y={240} textAnchor="middle" opacity={veinGone} style={{...fell(52, K.inkRed, true)} as React.CSSProperties}>solo tierra</text>
        ) : null}
      </g>
    </svg>
  );
};

/* ================================================================== FILA DE CARTAS (el gancho) */
export type Card = {at: number; node: React.ReactNode; year: string; label: string};
/** cuatro cartas que entran una por una en fila, levemente giradas, cada una con año y rótulo */
export const CardRow: React.FC<{t: number; cards: Card[]; out?: number; y?: number}> = ({t, cards, out = Infinity, y = 500}) => {
  const n = cards.length;
  const W = 400, H = 520, gap = 36;
  const x0 = 960 - ((n - 1) * (W + gap)) / 2;
  const ko = t > out ? easeInOut(clamp((t - out) / 0.7)) : 0;
  return (
    <AbsoluteFill>
      {cards.map((c, i) => {
        const p = prog(t, c.at, 0.7, easeOut);
        if (p <= 0) return null;
        const rot = [-3.5, 2.5, -2, 3][i % 4] * (1 - 0.4 * p);
        return (
          <div key={i} style={{position: 'absolute', left: x0 + i * (W + gap), top: y + (1 - p) * 140 - ko * (i % 2 ? -1 : 1) * 900, width: W, transform: `translate(-50%,-50%) rotate(${rot + ko * (i % 2 ? 20 : -20)}deg) scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 1.5) * (1 - ko)}}>
            <div style={{width: W, height: H, background: '#0B0F1A', border: '1px solid rgba(241,238,232,0.16)', boxShadow: '0 40px 80px rgba(0,0,0,0.65)', overflow: 'hidden', position: 'relative', borderRadius: 4}}>
              {c.node}
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '60px 22px 20px', background: 'linear-gradient(180deg, rgba(6,8,14,0) 0%, rgba(6,8,14,0.92) 55%)'}}>
                <div style={{...jm(22, K.ember, 600, 0.06)}}>{c.year}</div>
                <div style={{...fr(34, 460, K.bone, 72, 50), lineHeight: 1.05, marginTop: 6}}>{c.label}</div>
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
export const fontsOK = F;

/* ================================================================== CORTE DEL SUELO (NOCHE, HOY) */
/** corte del suelo de hoy: cielo y monte arriba, estratos abajo con años, masas enterradas, detector en la
    superficie y pozo con agua. dy desplaza todo hacia arriba (la cámara "baja" bajo tierra) */
export const BuriedSection: React.FC<{
  t: number; dy?: number; masses?: {x: number; y: number; w: number; h: number; o: number; glow?: number; label?: string}[]; strata?: number; years?: number;
  detector?: {x: number; o: number; beep?: number}; depth?: {x: number; y0: number; y1: number; o: number; label: string}; pit?: {x: number; w: number; o: number; water: number}; o?: number;
}> = ({t, dy = 0, masses = [], strata = 1, years = 0, detector, depth, pit, o = 1}) => {
  const G0 = 420; // nivel del suelo
  const layers = ['#3A2C20', '#33261C', '#2C2118', '#251C15', '#1F1712', '#19130F'];
  const YRS = ['2026', '1950', '1900', '1850', '1800', '1783'];
  return (
    <AbsoluteFill style={{opacity: o, overflow: 'hidden', background: '#04060C'}}>
      <div style={{position: 'absolute', left: 0, top: -dy, width: 1920, height: 2400}}>
        <svg width={1920} height={2400} style={{position: 'absolute', left: 0, top: 0}}>
          <defs>
            <linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#03050C" />
              <stop offset="1" stopColor="#141C33" />
            </linearGradient>
            <pattern id="bdots" width="38" height="38" patternUnits="userSpaceOnUse">
              <circle cx="7" cy="9" r="2.2" fill="rgba(255,255,255,0.05)" />
              <circle cx="26" cy="27" r="1.6" fill="rgba(255,255,255,0.04)" />
            </pattern>
          </defs>
          <rect x={0} y={0} width={1920} height={G0} fill="url(#bsky)" />
          {Array.from({length: 90}, (_, i) => <circle key={i} cx={rnd(i * 3) * 1920} cy={rnd(i * 7) * (G0 - 120)} r={0.6 + rnd(i * 11) * 1.4} fill="#fff" opacity={0.3 + 0.5 * rnd(i * 13) * (0.7 + 0.3 * Math.sin(t * 2 + i))} />)}
          {/* monte en la superficie */}
          <path d={Array.from({length: 97}, (_, i) => `${i ? 'L' : 'M'}${i * 20} ${G0 - 30 - Math.abs(Math.sin(i * 0.41) * Math.sin(i * 0.17)) * 110 - rnd(i) * 26}`).join(' ') + ` L1920 ${G0} L0 ${G0} Z`} fill="#070A12" style={{filter: 'url(#quill14)'}} />
          {/* estratos */}
          {layers.map((c, i) => {
            const y0 = G0 + i * 160 * strata, h = 160 * strata;
            return (
              <g key={i}>
                <path d={`M0 ${y0} ` + Array.from({length: 25}, (_, k) => `L${k * 80} ${y0 + Math.sin(k * 0.7 + i) * 8}`).join(' ') + ` L1920 ${y0} L1920 ${y0 + h + 10} L0 ${y0 + h + 10} Z`} fill={c} />
                <rect x={0} y={y0} width={1920} height={h} fill="url(#bdots)" />
                {years > 0 ? (
                  <text x={70} y={y0 + 40} opacity={clamp(years * layers.length - i)} style={{...jm(20, 'rgba(241,238,232,0.45)', 500, 0.1)} as React.CSSProperties}>{YRS[i]}</text>
                ) : null}
              </g>
            );
          })}
          {/* pozo con agua (Gancedo, 2016) */}
          {pit && pit.o > 0 ? (
            <g opacity={pit.o}>
              <path d={`M${pit.x - pit.w / 2} ${G0} L${pit.x - pit.w * 0.36} ${G0 + 360} L${pit.x + pit.w * 0.36} ${G0 + 360} L${pit.x + pit.w / 2} ${G0} Z`} fill="#0E0B08" />
              <rect x={pit.x - pit.w * 0.4} y={G0 + 360 - 300 * pit.water} width={pit.w * 0.8} height={300 * pit.water} fill="rgba(70,110,150,0.55)" />
              <path d={`M${pit.x - pit.w * 0.4} ${G0 + 360 - 300 * pit.water} ` + Array.from({length: 12}, (_, k) => `L${pit.x - pit.w * 0.4 + (k * pit.w * 0.8) / 11} ${G0 + 360 - 300 * pit.water + Math.sin(t * 3 + k) * 4}`).join(' ')} fill="none" stroke="rgba(180,215,255,0.6)" strokeWidth={2} />
            </g>
          ) : null}
          {/* masas enterradas */}
          {masses.map((m, i) =>
            m.o > 0 ? (
              <g key={i} opacity={m.o}>
                {m.glow ? <ellipse cx={m.x} cy={m.y} rx={m.w * 0.9} ry={m.h * 1.2} fill={`rgba(255,140,60,${0.2 * m.glow})`} style={{filter: 'blur(24px)'}} /> : null}
                <path d={`M${m.x - m.w / 2} ${m.y + m.h * 0.1} C${m.x - m.w / 2} ${m.y - m.h / 2} ${m.x - m.w * 0.2} ${m.y - m.h * 0.62} ${m.x + m.w * 0.1} ${m.y - m.h * 0.55} C${m.x + m.w * 0.45} ${m.y - m.h * 0.5} ${m.x + m.w / 2} ${m.y - m.h * 0.1} ${m.x + m.w * 0.46} ${m.y + m.h * 0.3} C${m.x + m.w * 0.3} ${m.y + m.h * 0.55} ${m.x - m.w * 0.3} ${m.y + m.h * 0.52} ${m.x - m.w / 2} ${m.y + m.h * 0.1} Z`} fill="#4A4038" stroke="#8A6A4A" strokeWidth={2} />
                {Array.from({length: 6}, (_, k) => <ellipse key={k} cx={m.x - m.w * 0.3 + k * m.w * 0.12} cy={m.y - m.h * 0.2 + (k % 2) * m.h * 0.2} rx={m.w * 0.05} ry={m.h * 0.06} fill="rgba(0,0,0,0.3)" />)}
                {m.label ? <text x={m.x + m.w * 0.6} y={m.y} style={{...ar(22, 650, K.ember, 85, 0.16)} as React.CSSProperties}>{m.label}</text> : null}
              </g>
            ) : null,
          )}
          {/* detector y su señal */}
          {detector && detector.o > 0 ? (
            <g opacity={detector.o} transform={`translate(${detector.x},${G0})`}>
              <line x1={0} y1={-6} x2={-40} y2={-150} stroke="#C9CDD4" strokeWidth={5} strokeLinecap="round" />
              <ellipse cx={4} cy={-4} rx={34} ry={7} fill="#5FE3FF" opacity={0.8} />
              {Array.from({length: 4}, (_, k) => {
                const ph = ((t * 1.2 + k * 0.25) % 1);
                return <ellipse key={k} cx={4} cy={20 + ph * 220} rx={40 + ph * 120} ry={10 + ph * 30} fill="none" stroke={K.cyan} strokeWidth={2} opacity={(1 - ph) * 0.7 * (detector.beep ?? 1)} />;
              })}
            </g>
          ) : null}
          {/* cota de profundidad */}
          {depth && depth.o > 0 ? (
            <g opacity={depth.o}>
              <line x1={depth.x} y1={depth.y0} x2={depth.x} y2={depth.y0 + (depth.y1 - depth.y0) * clamp(depth.o * 1.5)} stroke={K.glow} strokeWidth={2.5} strokeDasharray="8 6" />
              <line x1={depth.x - 16} y1={depth.y0} x2={depth.x + 16} y2={depth.y0} stroke={K.glow} strokeWidth={2.5} />
              <line x1={depth.x - 16} y1={depth.y1} x2={depth.x + 16} y2={depth.y1} stroke={K.glow} strokeWidth={2.5} />
              <text x={depth.x + 30} y={(depth.y0 + depth.y1) / 2} style={{...fr(64, 460, K.bone, 72, 0)} as React.CSSProperties}>{depth.label}</text>
            </g>
          ) : null}
          <line x1={0} y1={G0} x2={1920} y2={G0} stroke="rgba(241,238,232,0.25)" strokeWidth={1.5} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== MAPA DEL MUNDO (2012: Kassel) */
/** mundo oscuro con un arco de A a B que se dibuja (p) y se corta (cut) */
export const WorldArc: React.FC<{t: number; from: [number, number]; to: [number, number]; p: number; cut?: number; o?: number; labels?: [string, string]; center?: [number, number]; scale?: number}> = ({
  t, from, to, p, cut = 0, o = 1, labels, center = [-20, -5], scale = 520,
}) => {
  const proj = geoNaturalEarth1().center(center).scale(scale).translate([960, 540]);
  const path = geoPath(proj);
  const ip = geoInterpolate(from, to);
  const pts = Array.from({length: 81}, (_, i) => proj(ip(i / 80)) as [number, number]);
  // el arco se levanta como una trayectoria (offset perpendicular)
  const arc = pts.map((q, i) => {
    const u = i / 80, h = Math.sin(u * Math.PI) * 180;
    return [q[0], q[1] - h] as [number, number];
  });
  const n = Math.max(2, Math.round(80 * clamp(p)) + 1);
  const d = arc.slice(0, n).map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
  const A = proj(from) as [number, number], B = proj(to) as [number, number];
  const mid = arc[40];
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
      {(countries as any).features.map((f: any, i: number) => (
        <path key={i} d={path(f) ?? ''} fill={f.properties.a3 === 'ARG' ? 'rgba(255,154,60,0.22)' : f.properties.a3 === 'DEU' ? 'rgba(134,182,255,0.22)' : 'rgba(226,232,245,0.06)'} stroke="rgba(226,232,245,0.22)" strokeWidth={0.8} />
      ))}
      <path d={d} fill="none" stroke={K.ember} strokeWidth={4} strokeLinecap="round" strokeDasharray={cut > 0 ? '14 10' : undefined} opacity={1 - cut * 0.6} />
      {cut > 0 ? (
        <g transform={`translate(${mid[0]},${mid[1]})`} opacity={cut}>
          <circle r={40} fill="rgba(4,6,14,0.85)" stroke={K.red} strokeWidth={4} />
          <line x1={-18} y1={-18} x2={18} y2={18} stroke={K.red} strokeWidth={6} strokeLinecap="round" />
          <line x1={18} y1={-18} x2={-18} y2={18} stroke={K.red} strokeWidth={6} strokeLinecap="round" />
        </g>
      ) : null}
      <circle cx={A[0]} cy={A[1]} r={9} fill={K.ember} />
      <circle cx={B[0]} cy={B[1]} r={9} fill={K.sky} opacity={prog(p, 0.95, 0.05)} />
      {labels ? (
        <>
          <text x={A[0] + 18} y={A[1] + 34} style={{...ar(22, 650, K.ember, 85, 0.14)} as React.CSSProperties}>{labels[0]}</text>
          <text x={B[0] + 18} y={B[1] - 16} opacity={clamp((p - 0.85) * 6)} style={{...ar(22, 650, K.sky, 85, 0.14)} as React.CSSProperties}>{labels[1]}</text>
        </>
      ) : null}
    </svg>
  );
};

/* ================================================================== VENTA POR INTERNET */
/** grilla genérica de publicaciones (sin marcas) que se multiplican */
export const Listings: React.FC<{t: number; t0: number; n?: number; o?: number}> = ({t, t0, n = 18, o = 1}) => {
  const items = ['10 g', '25 g', '50 g', '100 g', '250 g', '1 kg'];
  const price = ['US$ 12', 'US$ 25', 'US$ 39', 'US$ 69', 'US$ 149', 'US$ 480'];
  return (
    <AbsoluteFill style={{opacity: o}}>
      {Array.from({length: n}, (_, i) => {
        const col = i % 6, row = Math.floor(i / 6);
        const p = prog(t, t0 + i * 0.09, 0.4);
        if (p <= 0) return null;
        const k = i % 6;
        return (
          <div key={i} style={{position: 'absolute', left: 120 + col * 290, top: 170 + row * 290, width: 260, height: 262, background: '#F4F2EE', borderRadius: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + 0.1 * p})`, overflow: 'hidden'}}>
            <div style={{height: 150, background: `radial-gradient(circle at ${40 + rnd(i) * 20}% ${40 + rnd(i * 3) * 20}%, #6E6058 0%, #2E2622 60%, #E8E4DE 61%)`}} />
            <div style={{padding: '10px 14px'}}>
              <div style={{...ar(17, 600, '#2A2A2A', 92, 0.01), lineHeight: 1.2}}>Meteorito Campo del Cielo · {items[k]}</div>
              <div style={{...ar(24, 800, '#111', 95, 0), marginTop: 6}}>{price[k]}</div>
              <div style={{...ar(13, 600, '#2E7D32', 92, 0.02), marginTop: 4}}>Envío internacional</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
