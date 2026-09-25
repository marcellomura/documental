import React from 'react';
import {AbsoluteFill} from 'remotion';
import {geoCentroid} from 'd3-geo';
import {F} from '../theme';
import {cue} from './lib';
import {clamp, easeIn, easeInOut, easeOut, pop, prog, shake} from '../lib/anim';
import {Frame, Headline, Kicker, LogoMark, N, Num, Ocean, Src, Vignette} from '../ep04/kit';
import {Globe5, subsolar, zoneBand, View5} from './globe5';
import {Clock3D, DAWN, FlipClock, Icon, Map3D, SUN} from './art5';
import {ArgOnGlobe, Pin, Timeline} from './scenes5a';
import prov from '../data/ep04/arg_provincias.json';
import countries from '../data/ep04/countries50.json';

type P = {t: number};
const ramp = (t: number, a: number, b: number, e = easeInOut) => e(clamp((t - a) / (b - a)));
const hm = (h: number, m: number) => h * 60 + m;
const BLUE = '#3A78B8';
const VIOLET = '#A66BFF';
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * clamp(k))).join(',')})`;
};
const PROVF = (prov as any).features as any[];
const PROVN: string[] = PROVF.map((f) => f.properties.n);
const PCENT: Record<string, [number, number]> = Object.fromEntries(PROVF.map((f) => [f.properties.n, geoCentroid(f) as [number, number]]));
const COUNTRY = (n: string) => (countries as any).features.find((f: any) => f.properties.n === n);

const SvgLabel: React.FC<{x: number; y: number; text: string; color?: string; size?: number; o?: number; font?: string}> = ({x, y, text, color = '#fff', size = 46, o = 1, font = 'Anton'}) => (
  <text x={x} y={y} textAnchor="middle" fill={color} fontFamily={font} fontWeight={font === 'Anton' ? 400 : 800} fontSize={size} opacity={o} style={{paintOrder: 'stroke'}} stroke="rgba(4,10,17,0.9)" strokeWidth={size * 0.16}>
    {text}
  </text>
);

const Chip: React.FC<{color: string; text: string; o?: number; s?: number; dark?: boolean}> = ({color, text, o = 1, s = 1, dark = true}) => (
  <div style={{display: 'inline-block', background: color, color: dark ? N.bg0 : '#fff', fontFamily: F.head, fontSize: 60, padding: '2px 22px', opacity: o, transform: `scale(${s})`, transformOrigin: 'left'}}>{text}</div>
);

const Stamp: React.FC<{t: number; t0: number; text: string; size?: number; rot?: number}> = ({t, t0, text, size = 130, rot = -7}) =>
  t < t0 ? null : (
    <div style={{display: 'inline-block', fontFamily: F.head, fontSize: size, lineHeight: 1.05, color: N.red, border: `${size * 0.07}px solid ${N.red}`, padding: `0 ${size * 0.25}px`, background: 'rgba(4,10,17,0.6)', transform: `rotate(${rot}deg) scale(${1 + 0.6 * (1 - pop(t, t0))})`, opacity: clamp((t - t0) / 0.08)}}>
      {text}
    </div>
  );

/* =====================================================================
   S06 — el caos: 1974 (petróleo), 2008 (media Argentina), 2009 (San Luis)
   El mapa 3D sube una "hora" por cada hora de adelanto.
   ===================================================================== */
const ADOPT08 = ['Misiones', 'Corrientes', 'Entre Ríos', 'Buenos Aires', 'Ciudad de Buenos Aires', 'Formosa', 'Chaco', 'Santa Fe', 'Tucumán', 'Santiago del Estero', 'Córdoba'];
const LV = 42; // píxeles por hora de adelanto
const levelColor = (lv: number) => (lv >= 1 ? mix(BLUE, SUN, lv - 1) : mix(VIOLET, BLUE, lv));

const ClockTunnel: React.FC<{t: number; o?: number}> = ({t, o = 1}) => {
  const items = Array.from({length: 20})
    .map((_, i) => {
      const z = (rnd(i + 7) + t * 0.3) % 1;
      const a = rnd(i + 31) * Math.PI * 2;
      const f = 1 / (1.12 - z);
      return {i, z, x: 960 + Math.cos(a) * 190 * f, y: 540 + Math.sin(a) * 150 * f, size: 70 * f};
    })
    .sort((a, b) => a.z - b.z);
  return (
    <AbsoluteFill style={{opacity: o}}>
      {items.map(({i, z, x, y, size}) => (
        <div key={i} style={{position: 'absolute', left: x - size / 2, top: y - size / 2, opacity: Math.min(1, z * 4, (1 - z) * 6), filter: z < 0.35 ? `blur(${(0.35 - z) * 8}px)` : undefined}}>
          <Clock3D size={size} minutes={i * 131 + t * (300 + i * 60) * (i % 2 ? 1 : -1)} rx={20 * Math.sin(i + t)} ry={35 * Math.cos(i * 1.3 + t * 0.7)} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

export const S06: React.FC<P> = ({t}) => {
  const s = 's06';
  const tCaos = cue(s, 'caos.'), t74 = cue(s, 'setenta'), tPetro = cue(s, 'petróleo,'), tAdel = cue(s, 'adelantamos'), t08 = cue(s, 'dos mil ocho');
  const tMedia = cue(s, 'media'), tOtra = cue(s, 'otra mitad'), tViaj = cue(s, 'viajabas'), tAtr = cue(s, 'atrasar'), t09 = cue(s, 'dos mil nueve');
  const tSL = cue(s, 'San Luis', 0), tPropia = cue(s, 'propia'), tDurante = cue(s, 'Durante'), tMenos = cue(s, 'una hora menos');
  const chaos = t < t74 - 0.3;
  const ph = t < t08 - 0.4 ? 74 : t < t09 - 0.3 ? 8 : 9;
  const lv = (n: string) => {
    let v = 1 + ramp(t, tAdel - 0.1, tAdel + 0.6, easeOut) - ramp(t, t08 - 0.4, t08 + 0.3);
    if (ADOPT08.includes(n)) v += ramp(t, tMedia, tMedia + 0.7, easeOut) - ramp(t, t09, t09 + 0.7);
    if (n === 'San Luis') v -= ramp(t, tSL, tSL + 0.8, easeOut);
    return v;
  };
  const lift: Record<string, number> = {}, fills: Record<string, string> = {}, sides: Record<string, string> = {};
  for (const n of PROVN) {
    const v = lv(n);
    lift[n] = v * LV;
    fills[n] = levelColor(v);
    sides[n] = mix('#000000', levelColor(v), 0.42);
  }
  const zoom = ramp(t, t09 - 0.3, tSL + 0.8);
  const bus = t > tViaj - 0.3 && t < t09 - 0.3;
  const B0: [number, number] = [-64.19, -31.42], BX: [number, number] = [-65.25, -32.55], B1: [number, number] = [-68.84, -32.89];
  const u1 = ramp(t, tViaj, tAtr), u2 = ramp(t, tAtr, tAtr + 1.4);
  const lerp2 = (a: [number, number], b: [number, number], u: number): [number, number] => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  const busPos = u2 > 0 ? lerp2(BX, B1, u2) : lerp2(B0, BX, u1);
  const busZ = lift['Córdoba'] + (lift['San Luis'] - lift['Córdoba']) * ramp(t, tAtr - 0.05, tAtr + 0.3, easeIn);
  const year = ph === 74 ? 1974 : ph === 8 ? 2008 : 2009;
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {chaos ? (
        <AbsoluteFill>
          <Ocean glow="rgba(226,59,46,0.14)" />
          <ClockTunnel t={t} />
          <Vignette k={0.7} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', transform: `translate(${shake(t, tCaos, 14, 0.5).x}px, ${shake(t, tCaos, 14, 0.5).y}px)`}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 40, letterSpacing: 12, color: N.text, opacity: prog(t, 0.9, 0.4)}}>Y LA HORA SE VOLVIÓ</div>
            <div style={{fontFamily: F.head, fontSize: 260, lineHeight: 1.1, color: N.red, opacity: t > tCaos - 0.1 ? 1 : 0, transform: `scale(${1.4 - 0.4 * pop(t, tCaos - 0.1)})`, textShadow: '0 0 60px rgba(226,59,46,0.5)'}}>UN CAOS</div>
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{opacity: prog(t, t74 - 0.3, 0.4)}}>
          <Ocean glow={ph === 9 ? 'rgba(166,107,255,0.14)' : 'rgba(255,181,71,0.12)'} grid={0.2} />
          <Map3D
            t={t} tilt={50 + 6 * zoom} rotZ={-10 + 4 * ramp(t, t74, t09)} cx={1250 + 70 * zoom} cy={540 + 130 * zoom} scale={1.0 + 0.4 * zoom}
            fills={fills} lift={lift} sides={sides}
          >
            {(P3) => {
              const lab = (n: string, text: string, color: string, o: number, dy = 34, at?: [number, number]) => {
                const c = at ?? PCENT[n];
                const [x, y] = P3(c[0], c[1], lift[n] + dy);
                return <SvgLabel x={x} y={y} text={text} color={color} o={o} size={50} />;
              };
              return (
                <>
                  {ph === 74 ? lab('La Pampa', 'UTC−2', SUN, prog(t, tAdel + 0.3, 0.4), 40, [-65, -36]) : null}
                  {ph === 8 ? (
                    <>
                      {lab('Santa Fe', 'UTC−2', SUN, prog(t, tMedia + 0.4, 0.4), 40, [-59.6, -29.2])}
                      {lab('Río Negro', 'UTC−3', '#9CC8F0', prog(t, tOtra, 0.4), 40, [-68.5, -41])}
                    </>
                  ) : null}
                  {ph === 9 ? lab('San Luis', 'UTC−4', VIOLET, prog(t, tPropia - 0.2, 0.4), 30) : null}
                  {bus
                    ? (() => {
                        const route = [...Array.from({length: 13}).map((_, i) => lerp2(B0, BX, i / 12)), ...Array.from({length: 13}).map((_, i) => lerp2(BX, B1, i / 12))];
                        const d = route
                          .map((p, i) => {
                            const [x, y] = P3(p[0], p[1], (i < 13 ? lift['Córdoba'] : lift['San Luis']) + 4);
                            return `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                          })
                          .join(' ');
                        const [bx, by] = P3(busPos[0], busPos[1], busZ + 6);
                        const [ex, ey] = P3(BX[0] - 1.2, BX[1] - 1.6, lift['Córdoba'] + 95);
                        return (
                          <g opacity={prog(t, tViaj - 0.3, 0.3)}>
                            <path d={d} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="12 10" strokeDashoffset={-t * 40} opacity={0.9} />
                            <g transform={`translate(${bx - 45},${by - 80})`}>
                              <rect x={2} y={10} width={86} height={62} rx={12} fill="rgba(4,10,17,0.75)" />
                              <Icon name="bus" size={90} color="#fff" />
                            </g>
                            {t > tAtr - 0.1 ? (
                              <g transform={`translate(${ex},${ey}) scale(${pop(t, tAtr - 0.1)})`}>
                                <SvgLabel x={0} y={0} text="−1 H" color={N.red} size={64} />
                              </g>
                            ) : null}
                          </g>
                        );
                      })()
                    : null}
                </>
              );
            }}
          </Map3D>
          <div style={{position: 'absolute', left: 110, top: 110, width: 680}}>
            <div key={year} style={{fontFamily: F.head, fontSize: 190, lineHeight: 0.95, color: ph === 9 ? VIOLET : SUN, transform: `translateY(${(1 - prog(t, ph === 74 ? t74 - 0.2 : ph === 8 ? t08 - 0.3 : t09 - 0.3, 0.4)) * 40}px)`}}>{year}</div>
            {ph === 74 ? (
              <>
                <div style={{display: 'flex', gap: 14, marginTop: 20, alignItems: 'center'}}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{transform: `scale(${pop(t, tPetro - 0.5 + i * 0.12)})`, opacity: t > tPetro - 0.5 + i * 0.12 ? 1 : 0}}>
                      <Icon name="barrel" size={96} color={i === 1 ? SUN : N.text} />
                    </div>
                  ))}
                </div>
                <div style={{fontFamily: F.head, fontSize: 62, color: N.text, marginTop: 10, opacity: prog(t, tPetro - 0.3, 0.3)}}>CRISIS DEL PETRÓLEO</div>
                <div style={{marginTop: 30}}>
                  <Chip color={SUN} text="+1 HORA MÁS" o={prog(t, tAdel, 0.3)} s={pop(t, tAdel)} />
                </div>
              </>
            ) : null}
            {ph === 8 ? (
              <>
                <div style={{marginTop: 26}}>
                  <Headline t={t} t0={tMedia - 0.1} size={70} text="Media Argentina cambió la hora" hl={['Media']} hlColor={SUN} />
                </div>
                <div style={{marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 2, color: N.text}}>
                  <div style={{opacity: prog(t, tMedia + 0.5, 0.3), display: 'flex', alignItems: 'center', gap: 14}}><span style={{width: 30, height: 30, background: SUN, display: 'inline-block'}} />UTC−2 · ADELANTÓ</div>
                  <div style={{opacity: prog(t, tOtra, 0.3), display: 'flex', alignItems: 'center', gap: 14}}><span style={{width: 30, height: 30, background: BLUE, display: 'inline-block'}} />UTC−3 · NO CAMBIÓ</div>
                </div>
                <div style={{marginTop: 34, opacity: prog(t, tViaj - 0.2, 0.3)}}>
                  <FlipClock t={t} value={(x) => (x < tAtr ? hm(14, 0) : hm(13, 0))} size={96} label="CÓRDOBA → MENDOZA" glow={t > tAtr && t < tAtr + 1 ? 'rgba(226,59,46,0.6)' : undefined} />
                </div>
              </>
            ) : null}
            {ph === 9 ? (
              <>
                <div style={{marginTop: 26}}>
                  <Headline t={t} t0={tSL - 0.1} size={72} text="San Luis se puso su propia hora" hl={['San', 'Luis']} hlColor={VIOLET} />
                </div>
                <div style={{marginTop: 26}}>
                  <Chip color={VIOLET} text="UTC−4" o={prog(t, tPropia - 0.2, 0.3)} s={pop(t, tPropia - 0.2)} />
                </div>
                <div style={{marginTop: 22, fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: N.mute, opacity: prog(t, tDurante, 0.4)}}>MARZO → OCTUBRE DE 2009</div>
                <div style={{marginTop: 14, fontFamily: F.head, fontSize: 54, color: N.text, opacity: prog(t, tMenos - 0.2, 0.4)}}>UNA HORA MENOS QUE EL RESTO</div>
              </>
            ) : null}
          </div>
          <Src t={t} t0={t74} x={1810} y={940} align="right" text="Altura del mapa = horas de adelanto · fuente: historia de la hora oficial argentina" />
          <Timeline t={t} at={year} o={prog(t, t74, 0.5)} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* =====================================================================
   S07 — el cuerpo lee la luz: reloj biológico, jet lag social, el estudio del CONICET
   ===================================================================== */
const HEAD =
  'M 400 690 C 400 620 420 580 450 540 C 520 450 530 300 470 200 C 410 100 280 70 190 110 C 110 145 80 220 95 290 C 95 320 70 350 55 380 L 90 395 L 85 425 L 100 440 L 90 460 C 100 500 130 510 180 505 C 200 540 205 600 200 690';

const HeadScene: React.FC<{t: number; tImp: number; tNo: number; tLee: number; tTenes: number; tSol: number}> = ({t, tImp, tNo, tLee, tTenes, tSol}) => {
  const draw = prog(t, tImp - 0.2, 1.0);
  const phi = (205 + 62 * ramp(t, tTenes, tSol + 0.3)) * (Math.PI / 180);
  const sx = 0 + 430 * Math.cos(phi), sy = 430 + 430 * Math.sin(phi);
  const eye: [number, number] = [140, 290], brain: [number, number] = [320, 250];
  const light = prog(t, tLee - 0.2, 0.5);
  const bio = prog(t, tTenes, 0.5);
  const handA = (phi * 180) / Math.PI - 205;
  return (
    <svg viewBox="-520 -60 1080 780" width={1188} height={858} style={{position: 'absolute', left: 620, top: 150, overflow: 'visible'}}>
      <defs>
        <radialGradient id="h-glow">
          <stop offset="0%" stopColor={SUN} stopOpacity={0.95} />
          <stop offset="100%" stopColor={SUN} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* sol y rayos */}
      <g opacity={light}>
        <circle cx={sx} cy={sy} r={120} fill="url(#h-glow)" />
        <circle cx={sx} cy={sy} r={46} fill={SUN} />
        {Array.from({length: 12}).map((_, i) => {
          const a = (i * 30 + t * 20) * (Math.PI / 180);
          return <line key={i} x1={sx + Math.cos(a) * 60} y1={sy + Math.sin(a) * 60} x2={sx + Math.cos(a) * 82} y2={sy + Math.sin(a) * 82} stroke={SUN} strokeWidth={7} strokeLinecap="round" />;
        })}
        <line x1={sx} y1={sy} x2={eye[0]} y2={eye[1]} stroke={SUN} strokeWidth={6} strokeDasharray="18 14" strokeDashoffset={-t * 90} opacity={0.9} />
        <line x1={eye[0]} y1={eye[1]} x2={brain[0]} y2={brain[1]} stroke={SUN} strokeWidth={5} strokeDasharray="10 10" strokeDashoffset={-t * 70} opacity={0.8} />
      </g>
      <path d={HEAD} fill="rgba(78,168,222,0.08)" stroke={N.cold} strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} />
      <circle cx={eye[0]} cy={eye[1]} r={9} fill={light > 0 ? SUN : N.cold} opacity={draw} />
      {/* reloj de pared adentro: el cuerpo no lo lee */}
      {t < tLee + 0.2 ? (
        <g transform={`translate(${brain[0]},${brain[1]}) scale(${pop(t, tImp + 0.3)})`} opacity={1 - prog(t, tLee - 0.1, 0.3)}>
          <circle r={70} fill="#F4F1EA" stroke="#C9A24A" strokeWidth={8} />
          <line x1={0} y1={0} x2={0} y2={-48} stroke="#161513" strokeWidth={7} strokeLinecap="round" />
          <line x1={0} y1={0} x2={34} y2={10} stroke="#161513" strokeWidth={7} strokeLinecap="round" />
          <g stroke={N.red} strokeWidth={14} strokeLinecap="round" opacity={prog(t, tNo + 0.3, 0.2)}>
            <line x1={-80} y1={-80} x2={80} y2={80} />
            <line x1={80} y1={-80} x2={-80} y2={80} />
          </g>
        </g>
      ) : null}
      {/* reloj biológico: brilla con la luz y sigue al sol */}
      {t > tLee - 0.2 ? (
        <g transform={`translate(${brain[0]},${brain[1]})`}>
          <circle r={150 * light} fill="url(#h-glow)" opacity={0.6} />
          <g opacity={bio}>
            <circle r={78} fill="rgba(4,10,17,0.7)" stroke={SUN} strokeWidth={5} />
            {Array.from({length: 24}).map((_, i) => {
              const a = (i * 15 * Math.PI) / 180;
              return <line key={i} x1={Math.sin(a) * (i % 6 ? 64 : 56)} y1={-Math.cos(a) * (i % 6 ? 64 : 56)} x2={Math.sin(a) * 72} y2={-Math.cos(a) * 72} stroke={SUN} strokeWidth={i % 6 ? 2 : 5} />;
            })}
            <g transform={`rotate(${-60 + handA * 2})`}>
              <line x1={0} y1={0} x2={0} y2={-58} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
            </g>
            <circle r={9} fill={N.red} />
          </g>
        </g>
      ) : null}
      {t > tSol - 0.2 ? (
        <g transform={`translate(${brain[0] + 120},${brain[1] - 120}) scale(${pop(t, tSol - 0.2)})`}>
          <rect x={-10} y={-34} width={210} height={56} rx={28} fill={N.teal} />
          <text x={95} y={4} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={26} letterSpacing={2} fill={N.bg0}>✓ EN HORA</text>
        </g>
      ) : null}
    </svg>
  );
};

/** dial de 24 h en 3D: anillo interior = el sol (y tu cuerpo), anillo exterior = el reloj oficial */
const Dial3D: React.FC<{t: number; off: number; o?: number; cx?: number; cy?: number; size?: number}> = ({t, off, o = 1, cx = 1330, cy = 560, size = 860}) => {
  const rad = Math.PI / 180;
  const ang = (h: number) => (h - 12) * 15; // mediodía arriba
  const arc = (r: number, a0: number, a1: number) => {
    const p = (a: number) => `${(Math.sin(a * rad) * r).toFixed(1)} ${(-Math.cos(a * rad) * r).toFixed(1)}`;
    return `M ${p(a0)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p(a1)}`;
  };
  const layers = [-40, -32, -24, -16, -8];
  return (
    <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, perspective: 2400, opacity: o}}>
      <div style={{position: 'relative', width: size, height: size, transformStyle: 'preserve-3d', transform: `rotateX(${34 + Math.sin(t * 0.5) * 4}deg) rotateY(${Math.sin(t * 0.35) * 10}deg)`}}>
        {layers.map((z, i) => (
          <div key={i} style={{position: 'absolute', inset: 0, borderRadius: '50%', background: i === 0 ? '#02060B' : '#0A1826', transform: `translateZ(${z}px)`, boxShadow: i === 0 ? '0 60px 90px rgba(0,0,0,0.6)' : undefined}} />
        ))}
        <svg viewBox="-500 -500 1000 1000" width={size} height={size} style={{position: 'absolute', inset: 0, transform: 'translateZ(0px)'}}>
          <circle r={480} fill="#0E2236" stroke="rgba(150,195,230,0.35)" strokeWidth={4} />
          {/* sol: día arriba, noche abajo */}
          <path d={arc(290, ang(6), ang(18))} stroke={SUN} strokeWidth={62} fill="none" />
          <path d={arc(290, ang(18), ang(30))} stroke="#152A4A" strokeWidth={62} fill="none" />
          <circle cx={0} cy={-290} r={22} fill="#fff" />
          <text x={0} y={-110} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={28} letterSpacing={4} fill={SUN}>EL SOL · TU CUERPO</text>
          <text x={0} y={140} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={26} letterSpacing={4} fill="#7F95B0">NOCHE</text>
          {/* reloj oficial: gira `off` horas */}
          <g transform={`rotate(${-off * 15})`}>
            <circle r={400} fill="none" stroke="rgba(238,244,248,0.9)" strokeWidth={50} />
            {Array.from({length: 24}).map((_, h) => {
              const a = ang(h);
              return (
                <g key={h} transform={`rotate(${a})`}>
                  {h % 3 === 0 ? (
                    <text x={0} y={-386} textAnchor="middle" fontFamily="Anton" fontSize={34} fill={h === 12 ? N.red : '#0B1A2C'}>
                      {h}
                    </text>
                  ) : (
                    <line x1={0} y1={-412} x2={0} y2={-392} stroke="#0B1A2C" strokeWidth={4} />
                  )}
                </g>
              );
            })}
          </g>
          {off > 0.02 ? <path d={arc(462, -off * 15, 0)} stroke={N.red} strokeWidth={18} fill="none" strokeLinecap="round" /> : null}
          {/* aguja "ahora": el sol en lo más alto */}
          <path d="M -26 -500 L 26 -500 L 0 -452 Z" fill={N.red} />
          <circle r={16} fill="#fff" />
        </svg>
      </div>
    </div>
  );
};

export const S07: React.FC<P> = ({t}) => {
  const s = 's07';
  const tImp = cue(s, 'Importa,', 1), tNo = cue(s, 'no lee'), tLee = cue(s, 'lee la luz'), tTenes = cue(s, 'Tenés'), tBio = cue(s, 'biológico'), tSol = cue(s, 'sol.');
  const tPone = cue(s, 'pone en hora'), tSi = cue(s, 'Si'), tAdel = cue(s, 'adelantada,'), tJet = cue(s, 'jet lag permanente'), tSin = cue(s, 'sin haberte'), tAvion = cue(s, 'avión.');
  const tCient = cue(s, 'Los científicos'), tSocial = cue(s, 'jet lag social'), tEst = cue(s, 'estudio'), tConicet = cue(s, 'CONICET'), tSet = cue(s, 'setecientos');
  const tMan = cue(s, 'mañana'), tNoct = cue(s, 'nocturnos'), tRinden = cue(s, 'rinden'), tMat = cue(s, 'matemática.');
  const head = t < tSi - 0.3;
  const dial = t >= tSi - 0.3 && t < tCient - 0.3;
  const social = t >= tCient - 0.3 && t < tEst - 0.3;
  const study = t >= tEst - 0.3;
  const off = ramp(t, tAdel - 0.1, tAdel + 1.1);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {head ? (
        <AbsoluteFill>
          <Ocean glow="rgba(78,168,222,0.14)" />
          <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: F.head, fontSize: 170, color: N.text, opacity: 1 - prog(t, tImp - 0.2, 0.3), transform: `scale(${0.9 + 0.1 * pop(t, -0.1)})`}}>¿Y QUÉ IMPORTA?</div>
          <HeadScene t={t} tImp={tImp} tNo={tNo} tLee={tLee} tTenes={tTenes} tSol={tPone + 0.2} />
          <div style={{position: 'absolute', left: 110, top: 170, width: 640}}>
            {t < tTenes - 0.2 ? (
              <>
                <Headline t={t} t0={tImp + 0.5} size={84} text="Tu cuerpo no lee el reloj" hl={['no']} hlColor={N.red} />
                <div style={{marginTop: 30, fontFamily: F.head, fontSize: 130, color: SUN, opacity: prog(t, tLee - 0.1, 0.3), transform: `scale(${pop(t, tLee - 0.1)})`, transformOrigin: 'left'}}>LEE LA LUZ</div>
              </>
            ) : (
              <>
                <Kicker t={t} t0={tTenes} x={0} y={0} text="Tenés un reloj interno" color={SUN} />
                <div style={{marginTop: 70}}>
                  <Headline t={t} t0={tBio - 0.2} size={84} text="Se pone en hora con el sol" hl={['sol']} hlColor={SUN} />
                </div>
              </>
            )}
          </div>
        </AbsoluteFill>
      ) : null}
      {dial ? (
        <AbsoluteFill style={{opacity: prog(t, tSi - 0.3, 0.4)}}>
          <Ocean glow="rgba(226,59,46,0.1)" grid={0.2} />
          <Dial3D t={t} off={off} />
          <div style={{position: 'absolute', left: 1330 - 60, top: 60, fontFamily: F.head, fontSize: 70, color: N.red, opacity: prog(t, tAdel + 0.6, 0.3), transform: `scale(${pop(t, tAdel + 0.6)})`}}>+1 H</div>
          <div style={{position: 'absolute', left: 110, top: 170, width: 680}}>
            {t < tSin - 0.2 ? (
              <>
                <Headline t={t} t0={tSi} size={72} text="Si la hora oficial va adelantada..." hl={['adelantada...']} hlColor={N.red} />
                <div style={{marginTop: 40, opacity: prog(t, tJet - 0.1, 0.3), transform: `scale(${pop(t, tJet - 0.1)})`, transformOrigin: 'left'}}>
                  <div style={{fontFamily: F.head, fontSize: 130, lineHeight: 1, color: N.text}}>JET LAG</div>
                  <div style={{fontFamily: F.head, fontSize: 130, lineHeight: 1, color: N.red}}>PERMANENTE</div>
                </div>
              </>
            ) : (
              <>
                <div style={{fontFamily: F.head, fontSize: 96, lineHeight: 1.05, color: N.text, opacity: prog(t, tSin - 0.2, 0.3)}}>SIN HABERTE SUBIDO NUNCA A UN AVIÓN</div>
                <div style={{position: 'relative', width: 200, height: 200, marginTop: 30, opacity: prog(t, tAvion - 0.4, 0.3)}}>
                  <Icon name="plane" size={200} color={N.text} />
                  <svg width={200} height={200} style={{position: 'absolute', inset: 0}}>
                    <circle cx={100} cy={100} r={88} fill="none" stroke={N.red} strokeWidth={14} opacity={prog(t, tAvion - 0.1, 0.2)} />
                    <line x1={38} y1={162} x2={162} y2={38} stroke={N.red} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`${prog(t, tAvion - 0.1, 0.3)} 1`} />
                  </svg>
                </div>
              </>
            )}
          </div>
          {/* avión que cruza con estela */}
          {t > tSin - 0.4 && t < tAvion + 1.2
            ? (() => {
                const k = ramp(t, tSin - 0.4, tAvion + 1.2, (x) => x);
                const x = -300 + k * 2500, y = 130 + Math.sin(k * 3) * 30;
                return (
                  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
                    <line x1={Math.max(-300, x - 900)} y1={y + 20} x2={x - 60} y2={y} stroke="rgba(255,255,255,0.5)" strokeWidth={4} strokeDasharray="16 12" />
                    <g transform={`translate(${x - 60},${y - 60})`}>
                      <Icon name="plane" size={120} color="#fff" />
                    </g>
                  </svg>
                );
              })()
            : null}
        </AbsoluteFill>
      ) : null}
      {social ? (
        <AbsoluteFill>
          <Ocean glow="rgba(255,181,71,0.12)" />
          {Array.from({length: 14}).map((_, i) => (
            <div key={i} style={{position: 'absolute', top: 0, bottom: 0, left: ((i * 160 + (t - tCient) * 120) % 2240) - 160, width: 80, background: i % 2 ? 'rgba(255,181,71,0.04)' : 'rgba(78,168,222,0.04)'}} />
          ))}
          <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center'}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 38, letterSpacing: 12, color: N.mute, opacity: prog(t, tCient, 0.4)}}>LOS CIENTÍFICOS LO LLAMAN</div>
            {(() => {
              const g = t > tSocial && t < tSocial + 0.5 ? Math.sin((t - tSocial) * 80) * (1 - (t - tSocial) / 0.5) * 16 : 0;
              return (
                <div style={{marginTop: 30, opacity: prog(t, tSocial - 0.1, 0.2), transform: `scale(${1.25 - 0.25 * pop(t, tSocial - 0.1)}) translateX(${g}px)`}}>
                  <div style={{fontFamily: F.head, fontSize: 250, lineHeight: 1, color: N.text, textShadow: g ? `${-g}px 0 0 #00E5FF, ${g}px 0 0 ${N.red}` : undefined}}>JET LAG</div>
                  <div style={{fontFamily: F.head, fontSize: 250, lineHeight: 1, color: SUN}}>SOCIAL</div>
                </div>
              );
            })()}
          </div>
          <Src t={t} t0={tSocial} text="El término: Wittmann, Dinich, Merrow y Roenneberg, Chronobiology International (2006)" />
        </AbsoluteFill>
      ) : null}
      {study ? (
        <AbsoluteFill>
          <Ocean glow="rgba(57,208,200,0.1)" grid={0.2} />
          {/* el paper, en 3D */}
          <div style={{position: 'absolute', left: 110, top: 150, width: 720, height: 560, perspective: 1800}}>
            <div
              style={{
                width: 720, height: 560, background: '#F4F1EA', borderRadius: 8, padding: '46px 52px', boxSizing: 'border-box', boxShadow: '0 40px 90px rgba(0,0,0,0.6)',
                transform: `rotateY(${14 + 60 * (1 - prog(t, tEst - 0.3, 0.8))}deg) rotateX(4deg)`, transformOrigin: 'left center', opacity: prog(t, tEst - 0.3, 0.3),
              }}
            >
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 22, letterSpacing: 5, color: '#8A2A1E'}}>NATURE HUMAN BEHAVIOUR · 2020</div>
              <div style={{fontFamily: F.quote, fontWeight: 800, fontSize: 46, lineHeight: 1.15, color: '#161513', marginTop: 22}}>Interplay of chronotype and school timing predicts school performance</div>
              <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 24, color: '#4A4540', marginTop: 24}}>Goldin, Sigman, Braier, Golombek y Leone</div>
              <div style={{position: 'absolute', left: 52, bottom: 46, display: 'flex', gap: 14}}>
                <div style={{background: '#0B4F8A', color: '#fff', fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 3, padding: '8px 16px', transform: `scale(${pop(t, tConicet - 0.2)})`, opacity: t > tConicet - 0.2 ? 1 : 0}}>CONICET</div>
                <div style={{background: '#161513', color: '#fff', fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 3, padding: '8px 16px', transform: `scale(${pop(t, tSet)})`, opacity: t > tSet ? 1 : 0}}>753 ALUMNOS</div>
              </div>
            </div>
          </div>
          {/* archivo: escuela */}
          {t < tSet - 0.2 ? (
            <Frame src="img/ep05/escuela_guardapolvo.jpg" t={t} t0={tEst} t1={tSet - 0.2} x={1370} y={470} w={640} h={500} rot={3} zoom={[1.05, 1.12]} enter="right" grade="linear-gradient(rgba(120,90,40,0.18), rgba(120,90,40,0.18))" credit="Escuela argentina, archivo · dominio público" />
          ) : null}
          {/* 753 puntos = 753 alumnos */}
          {t >= tSet - 0.3 && t < tMan - 0.3 ? (
            <div style={{position: 'absolute', left: 960, top: 180, opacity: 1 - prog(t, tMan - 0.6, 0.3)}}>
              <div style={{fontFamily: F.head, fontSize: 120, lineHeight: 1, color: N.text}}>
                <Num t={t} t0={tSet - 0.2} t1={tSet + 1.0} to={753} />
                <span style={{fontSize: 56, color: N.mute, marginLeft: 20}}>ALUMNOS</span>
              </div>
              <svg width={850} height={420} style={{marginTop: 20}}>
                {Array.from({length: 753}).map((_, i) => {
                  const c = i % 38, r = Math.floor(i / 38);
                  const on = i < 753 * prog(t, tSet - 0.2, 1.2, (x) => x);
                  return <circle key={i} cx={11 + c * 22} cy={11 + r * 21} r={7} fill={on ? N.teal : 'rgba(255,255,255,0.08)'} />;
                })}
              </svg>
            </div>
          ) : null}
          {/* turnos y resultado */}
          {t >= tMan - 0.3 ? (
            <div style={{position: 'absolute', left: 930, top: 170, width: 880}}>
              <div style={{display: 'flex', gap: 24}}>
                {[
                  ['MAÑANA', '7:45'],
                  ['TARDE', '12:40'],
                  ['VESPERTINO', '17:20'],
                ].map(([n, h], i) => {
                  const hi = i === 0;
                  return (
                    <div
                      key={n}
                      style={{
                        width: 270, height: 300, borderRadius: 10, border: `4px solid ${hi ? SUN : 'rgba(255,255,255,0.2)'}`, background: hi ? 'rgba(255,181,71,0.1)' : 'rgba(255,255,255,0.03)',
                        textAlign: 'center', paddingTop: 30, boxSizing: 'border-box', opacity: prog(t, tMan - 0.3 + i * 0.12, 0.3) * (hi ? 1 : 1 - 0.55 * prog(t, tNoct - 0.3, 0.4)),
                        transform: `translateY(${(1 - prog(t, tMan - 0.3 + i * 0.12, 0.5)) * 40}px)`,
                      }}
                    >
                      <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: N.mute}}>{n}</div>
                      <div style={{fontFamily: F.head, fontSize: 84, color: hi ? SUN : N.text}}>{h}</div>
                      {hi ? (
                        <div style={{display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, tNoct - 0.2)})`, opacity: t > tNoct - 0.2 ? 1 : 0}}>
                          <Icon name="owl" size={110} color={VIOLET} />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: VIOLET, marginTop: 16, opacity: prog(t, tNoct, 0.3)}}>LOS MÁS NOCTURNOS, A LA MAÑANA...</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 30, opacity: prog(t, tRinden - 0.2, 0.3)}}>
                <svg width={110} height={130} style={{transform: `translateY(${(1 - prog(t, tRinden - 0.2, 0.5)) * -30}px)`}}>
                  <path d="M 30 0 L 80 0 L 80 70 L 110 70 L 55 130 L 0 70 L 30 70 Z" fill={N.red} />
                </svg>
                <div>
                  <div style={{fontFamily: F.head, fontSize: 110, lineHeight: 1, color: N.red}}>RINDEN PEOR</div>
                  <div style={{fontFamily: F.head, fontSize: 52, color: N.text, opacity: prog(t, tMat - 0.3, 0.3)}}>SOBRE TODO EN MATEMÁTICA</div>
                </div>
              </div>
            </div>
          ) : null}
          <Src t={t} t0={tEst} text="Goldin et al. (2020), Nature Human Behaviour · 753 alumnos asignados al azar a los turnos" />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* =====================================================================
   S08 — la hora adelantada tiene fans: luz a la tarde, Ushuaia 22:10, cenas tarde, España
   ===================================================================== */
const rnd = (i: number) => (((Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1) + 1) % 1;
const SKY = Array.from({length: 26}).map((_, i) => ({w: 50 + rnd(i) * 90, h: 90 + rnd(i + 50) * 260}));
const Skyline: React.FC<{t: number; lit: number; color?: string}> = ({t, lit, color = '#150D1E'}) => {
  let x = -20;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {SKY.map((b, i) => {
        const bx = x;
        x += b.w + 6;
        const cols = Math.floor((b.w - 16) / 18), rows = Math.floor((b.h - 20) / 26);
        return (
          <g key={i}>
            <rect x={bx} y={1080 - b.h} width={b.w} height={b.h} fill={color} />
            {Array.from({length: cols * rows}).map((_, k) => {
              const on = rnd(i * 97 + k) < lit * 0.55;
              return on ? <rect key={k} x={bx + 10 + (k % cols) * 18} y={1080 - b.h + 14 + Math.floor(k / cols) * 26} width={8} height={12} fill="#FFD27A" opacity={0.75 + 0.25 * Math.sin(t * 2 + k)} /> : null;
            })}
          </g>
        );
      })}
    </svg>
  );
};

export const S08: React.FC<P> = ({t}) => {
  const s = 's08';
  const tFans = cue(s, 'fans.'), tMasLuz = cue(s, 'Más luz'), tSalir = cue(s, 'salir,'), tComprar = cue(s, 'comprar,'), tTur = cue(s, 'turismo.');
  const tVer = cue(s, 'En verano,'), tUsh = cue(s, 'Ushuaia'), tDiez = cue(s, 'diez'), tHay = cue(s, 'Y hay'), tCen = cue(s, 'cenamos');
  const tIgual = cue(s, 'Igual'), tEsp = cue(s, 'España,'), t1940 = cue(s, 'mil novecientos cuarenta'), tAle = cue(s, 'Alemania.');
  const evening = t < tVer - 0.3;
  const ush = t >= tVer - 0.3 && t < tHay - 0.3;
  const dinner = t >= tHay - 0.3 && t < tIgual - 0.3;
  const spain = t >= tIgual - 0.3;
  const sunY = 560 + 180 * ramp(t, 0, tVer, (x) => x);
  const view: View5 = {lon: -8 + 12 * ramp(t, tIgual - 0.3, tAle + 0.5), lat: 44, r: 1150, cx: 1260, cy: 760};
  const esp = COUNTRY('España'), ale = COUNTRY('Alemania');
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {evening ? (
        <AbsoluteFill>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, #2A2F6B 0%, #8E4B7A 45%, #F08A4B 78%, #FFC46B 100%)'}} />
          <div style={{position: 'absolute', left: 1500 - 110, top: sunY - 110, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, #FFF3C4 0%, #FFC46B 45%, rgba(255,196,107,0) 70%)'}} />
          <Skyline t={t} lit={ramp(t, 0, tVer)} />
          <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(10,8,25,0.55) 0%, rgba(10,8,25,0) 55%)'}} />
          {t < tMasLuz - 0.2 ? (
            <div style={{position: 'absolute', left: 110, top: 170, width: 900}}>
              <Kicker t={t} t0={0} x={0} y={0} text="Pero ojo" color={SUN} />
              <div style={{marginTop: 70}}>
                <Headline t={t} t0={0.9} size={100} text="La hora adelantada también tiene fans" hl={['fans']} hlColor={SUN} style={{textShadow: '0 6px 30px rgba(0,0,0,0.5)'}} />
              </div>
              <div style={{marginTop: 20, fontSize: 90, opacity: prog(t, tFans, 0.3), transform: `scale(${pop(t, tFans)})`, transformOrigin: 'left'}}>
                <svg width={120} height={110} viewBox="-60 -55 120 110">
                  <path d="M 0 45 C -70 0 -50 -50 0 -20 C 50 -50 70 0 0 45 Z" fill={N.red} />
                </svg>
              </div>
            </div>
          ) : (
            <>
              <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center'}}>
                <div style={{fontFamily: F.head, fontSize: 130, color: '#fff', textShadow: '0 8px 40px rgba(0,0,0,0.45)', transform: `scale(${pop(t, tMasLuz - 0.2)})`}}>
                  MÁS LUZ <span style={{color: '#FFE3A3'}}>A LA TARDE</span>
                </div>
              </div>
              {[
                ['glass', 'SALIR', tSalir],
                ['bag', 'COMPRAR', tComprar],
                ['camera', 'TURISMO', tTur],
              ].map(([ic, lab, tt], i) => (
                <div
                  key={lab as string}
                  style={{
                    position: 'absolute', left: 560 + i * 400 - 150, top: 360, width: 300, height: 300, borderRadius: 24, background: 'rgba(12,10,30,0.72)', border: '3px solid rgba(255,227,163,0.6)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, opacity: t > (tt as number) - 0.25 ? 1 : 0, transform: `scale(${pop(t, (tt as number) - 0.25)}) rotate(${(i - 1) * 3}deg)`,
                  }}
                >
                  <Icon name={ic as 'glass'} size={150} color="#FFE3A3" />
                  <div style={{fontFamily: F.head, fontSize: 56, color: '#fff'}}>{lab as string}</div>
                </div>
              ))}
            </>
          )}
        </AbsoluteFill>
      ) : null}
      {ush ? (
        <AbsoluteFill>
          <Frame src="img/ep05/ushuaia_atardecer.jpg" t={t} t0={tVer - 0.3} x={960} y={540} w={1920} h={1080} radius={0} zoom={[1.04, 1.16]} enter="fade" focus="60% 45%" grade="linear-gradient(90deg, rgba(4,10,17,0.7) 0%, rgba(4,10,17,0.1) 60%)" />
          <div style={{position: 'absolute', left: 110, top: 200}}>
            <Kicker t={t} t0={tVer} x={0} y={0} text="En verano" color={SUN} />
            <div style={{marginTop: 60, fontFamily: F.head, fontSize: 180, lineHeight: 1, color: '#fff', opacity: prog(t, tUsh - 0.2, 0.3), transform: `translateY(${(1 - prog(t, tUsh - 0.2, 0.5)) * 30}px)`}}>USHUAIA</div>
            <div style={{marginTop: 30, opacity: prog(t, tUsh, 0.3)}}>
              <FlipClock t={t} value={(x) => hm(21, 30) + 40 * ramp(x, tUsh, tDiez + 0.2, easeOut)} size={150} label="SE PONE EL SOL · 21 DE DICIEMBRE" glow={t > tDiez ? 'rgba(255,122,69,0.6)' : undefined} />
            </div>
          </div>
          <Src t={t} t0={tVer} text="Atardecer en Ushuaia · Claudiainescastiglioni · CC BY-SA 4.0 · hora: cálculo astronómico" />
        </AbsoluteFill>
      ) : null}
      {dinner ? (
        <AbsoluteFill>
          <Ocean glow="rgba(255,122,69,0.16)" />
          <div style={{position: 'absolute', left: 250, top: 260, transform: `rotate(${-8 + 4 * ramp(t, tHay, tIgual)}deg) scale(${0.9 + 0.1 * pop(t, tHay - 0.2)})`}}>
            <Icon name="plate" size={520} color="#F4F1EA" />
          </div>
          <div style={{position: 'absolute', left: 900, top: 230, width: 900}}>
            <Kicker t={t} t0={tHay - 0.1} x={0} y={0} text="Hay quien dice" color={DAWN} />
            <div style={{marginTop: 70}}>
              <Headline t={t} t0={tHay + 0.3} size={96} text="¿Por eso cenamos tan tarde?" hl={['tarde?']} hlColor={DAWN} />
            </div>
            <div style={{marginTop: 40, opacity: prog(t, tCen, 0.3)}}>
              <FlipClock t={t} value={() => hm(22, 0)} size={120} label="LA CENA" />
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {spain ? (
        <AbsoluteFill style={{opacity: prog(t, tIgual - 0.3, 0.4)}}>
          <Ocean glow="rgba(30,90,150,0.3)" />
          <Globe5 view={view} sun={subsolar(172, 12 - view.lon / 15)} dayOnly>
            {(proj, path) => {
              const pM = proj([-3.7, 40.42]), pB = proj([13.4, 52.52]);
              return (
                <>
                  <path d={path(zoneBand(0)) ?? ''} fill={BLUE} fillOpacity={0.22} stroke={BLUE} strokeWidth={3} />
                  <path d={path(zoneBand(1)) ?? ''} fill={SUN} fillOpacity={0.2 * prog(t, tAle - 0.5, 0.4)} stroke={SUN} strokeWidth={3} opacity={0.4 + 0.6 * prog(t, tAle - 0.5, 0.4)} />
                  {esp ? <path d={path(esp) ?? ''} fill={DAWN} fillOpacity={0.75 * prog(t, tEsp - 0.2, 0.4)} stroke="#fff" strokeWidth={2} /> : null}
                  {ale ? <path d={path(ale) ?? ''} fill={SUN} fillOpacity={0.8 * prog(t, tAle - 0.4, 0.4)} stroke="#fff" strokeWidth={2} /> : null}
                  <Pin proj={proj} lon={-3.7} lat={40.42} t={t} t0={tEsp} label="MADRID" color={DAWN} view={view} />
                  <Pin proj={proj} lon={13.4} lat={52.52} t={t} t0={tAle - 0.3} label="BERLÍN" view={view} />
                  {(() => {
                    const a = proj([0, 33]), b = proj([15, 33]);
                    return (
                      <>
                        {a ? <SvgLabel x={a[0]} y={a[1]} text="UTC+0" color="#9CC8F0" o={prog(t, tEsp, 0.4)} /> : null}
                        {b ? <SvgLabel x={b[0]} y={b[1]} text="UTC+1" color={SUN} o={prog(t, tAle - 0.4, 0.4)} /> : null}
                      </>
                    );
                  })()}
                  {pM && pB && t > tAle - 0.2 ? (
                    <path d={`M ${pM[0]} ${pM[1]} Q ${(pM[0] + pB[0]) / 2} ${Math.min(pM[1], pB[1]) - 160} ${pB[0]} ${pB[1]}`} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="12 10" pathLength={1} opacity={0.9} style={{strokeDasharray: `${prog(t, tAle - 0.2, 0.6)} 1`}} />
                  ) : null}
                </>
              );
            }}
          </Globe5>
          <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(4,10,17,0.85) 0%, rgba(4,10,17,0) 45%)'}} />
          <div style={{position: 'absolute', left: 110, top: 190, width: 640}}>
            <div style={{fontFamily: F.head, fontSize: 150, lineHeight: 1, color: DAWN, opacity: prog(t, tEsp - 0.2, 0.3)}}>ESPAÑA</div>
            <div style={{fontFamily: F.head, fontSize: 70, color: N.text, marginTop: 10, opacity: prog(t, t1940 - 0.1, 0.3)}}>DESDE 1940</div>
            <div style={{marginTop: 20}}>
              <Headline t={t} t0={cue(s, 'vive')} size={64} text="vive con la hora de Alemania" hl={['Alemania']} hlColor={SUN} />
            </div>
          </div>
          <Src t={t} t0={tEsp} text="España pasó a la hora de Europa Central en 1940 · franjas: 15° por hora" />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* =====================================================================
   S09 — el proyecto: Diputados 2025, el 1° de abril de 2026 que no pasó, Golombek
   ===================================================================== */
const PAGES = ['AGO|2025', 'SEP|2025', 'OCT|2025', 'NOV|2025', 'DIC|2025', 'ENE|2026', 'FEB|2026', 'MAR|2026', 'ABRIL|2026'];
const CalPage: React.FC<{label: string; h: number; final?: boolean}> = ({label, h, final}) => {
  const [m, y] = label.split('|');
  return (
    <div style={{position: 'absolute', inset: 0, background: '#F4F1EA', borderRadius: 14, overflow: 'hidden', backfaceVisibility: 'hidden'}}>
      <div style={{height: h * 0.24, background: N.red, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: h * 0.13, letterSpacing: 4}}>
        {m} {y}
      </div>
      <div style={{textAlign: 'center', fontFamily: F.head, fontSize: h * 0.5, lineHeight: 1.15, color: '#161513'}}>1</div>
      {final ? <div style={{textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: h * 0.06, letterSpacing: 6, color: '#6A5A44'}}>MIÉRCOLES</div> : null}
    </div>
  );
};
const TearCal: React.FC<{t: number; t0: number; t1: number; w?: number; h?: number}> = ({t, t0, t1, w = 440, h = 500}) => {
  const n = PAGES.length - 1;
  const k = clamp((t - t0) / (t1 - t0)) * n;
  const c = Math.min(n, Math.floor(k));
  const f = c >= n ? 0 : k - c;
  return (
    <div style={{position: 'relative', width: w, height: h, perspective: 1600}}>
      <div style={{position: 'absolute', inset: 0, transform: 'translate(10px, 14px)', background: '#B8AE9C', borderRadius: 14}} />
      <CalPage label={PAGES[Math.min(n, c + 1)]} h={h} final={c + 1 >= n} />
      {c < n ? (
        <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 0%', transform: `rotateX(${easeIn(f) * 170}deg)`, transformStyle: 'preserve-3d', boxShadow: f > 0 ? `0 ${30 * f}px ${60 * f}px rgba(0,0,0,${0.5 * f})` : undefined}}>
          <CalPage label={PAGES[c]} h={h} />
        </div>
      ) : (
        <CalPage label={PAGES[n]} h={h} final />
      )}
      {/* anillas */}
      {[0.25, 0.5, 0.75].map((x) => (
        <div key={x} style={{position: 'absolute', left: w * x - 12, top: -26, width: 24, height: 52, borderRadius: 12, border: '6px solid #8E8A82', boxSizing: 'border-box'}} />
      ))}
    </div>
  );
};

const MONTHS = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export const S09: React.FC<P> = ({t}) => {
  const s = 's09';
  const tDip = cue(s, 'Diputados'), tAprobo = cue(s, 'aprobó'), tM4 = cue(s, 'menos cuatro'), tM3 = cue(s, 'menos tres'), tRel = cue(s, 'Los relojes'), tAtr = cue(s, 'atrasar');
  const tPrim = cue(s, 'primero'), t26 = cue(s, 'veintiséis.'), tNo = cue(s, 'No pasó:'), tSen = cue(s, 'Senado'), tVoto = cue(s, 'votó.');
  const tCient = cue(s, 'científicos'), tGol = cue(s, 'Diego Golombek,'), tAdv = cue(s, 'advierten'), tDos = cue(s, 'dos veces'), tCosto = cue(s, 'costo.');
  const vote = t < tRel - 0.3;
  const cal = t >= tRel - 0.3 && t < tCient - 0.3;
  const gol = t >= tCient - 0.3;
  const back = t < tNo ? -60 * ramp(t, tAtr, t26 + 0.2) : -60 * (1 - ramp(t, tNo, tNo + 0.35, easeOut));
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {vote ? (
        <AbsoluteFill>
          <Ocean glow="rgba(116,172,223,0.14)" />
          <Frame src="img/ep05/congreso.jpg" t={t} t0={-0.2} x={1330} y={450} w={1000} h={640} enter="right" zoom={[1.03, 1.12]} focus="50% 40%" credit="Congreso de la Nación · CC BY-SA 4.0" />
          <div style={{position: 'absolute', left: 110, top: 140, width: 640}}>
            <Kicker t={t} t0={0} x={0} y={0} text="Agosto de 2025" color={SUN} />
            <div style={{marginTop: 70}}>
              <Headline t={t} t0={tDip - 0.1} size={96} text="Diputados aprobó" hl={['aprobó']} hlColor={N.teal} />
            </div>
            <div style={{marginTop: 30, display: 'flex', flexDirection: 'column', gap: 6}}>
              {[
                [151, 'A FAVOR', N.teal],
                [66, 'EN CONTRA', N.red],
                [8, 'ABSTENCIONES', N.mute],
              ].map(([v, lab, c], i) => (
                <div key={lab as string} style={{display: 'flex', alignItems: 'baseline', gap: 18, opacity: prog(t, tAprobo + i * 0.15, 0.3)}}>
                  <div style={{fontFamily: F.head, fontSize: 84, color: c as string, width: 170, textAlign: 'right'}}>
                    <Num t={t} t0={tAprobo + i * 0.15} t1={tAprobo + 0.9 + i * 0.15} to={v as number} />
                  </div>
                  <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 4, color: N.text}}>{lab as string}</div>
                </div>
              ))}
            </div>
          </div>
          {/* el plan: −4 de abril a agosto, −3 el resto */}
          <div style={{position: 'absolute', left: 110, top: 850, display: 'flex', gap: 8, opacity: prog(t, tM4 - 0.3, 0.3)}}>
            {MONTHS.map((m, i) => {
              const win = i >= 3 && i <= 7;
              const on = win ? prog(t, tM4 - 0.2 + (i - 3) * 0.08, 0.3) : prog(t, tM3 - 0.2 + (i > 7 ? i - 8 : i + 4) * 0.05, 0.3);
              return (
                <div key={i} style={{width: 134, height: 110, borderRadius: 8, background: on > 0 ? (win ? BLUE : SUN) : 'rgba(255,255,255,0.06)', opacity: 0.35 + 0.65 * on, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                  <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, color: N.bg0, letterSpacing: 2}}>{m}</div>
                  <div style={{fontFamily: F.head, fontSize: 44, color: N.bg0}}>{win ? '−4' : '−3'}</div>
                </div>
              );
            })}
          </div>
          <Src t={t} t0={tM4} x={110} y={980} text="Media sanción de Diputados (agosto de 2025): UTC−4 de abril a agosto, UTC−3 el resto del año" />
        </AbsoluteFill>
      ) : null}
      {cal ? (
        <AbsoluteFill>
          <Ocean glow="rgba(226,59,46,0.12)" />
          {t > tSen - 0.4 ? (
            <Frame src="img/ep05/congreso_atardecer.jpg" t={t} t0={tSen - 0.4} x={960} y={540} w={1920} h={1080} radius={0} enter="fade" zoom={[1.02, 1.08]} grade="linear-gradient(180deg, rgba(4,10,17,0.72), rgba(4,10,17,0.9))" />
          ) : null}
          <div style={{position: 'absolute', left: 360, top: 200, transform: `translateY(${(1 - prog(t, tRel - 0.3, 0.6)) * 80}px)`, opacity: prog(t, tRel - 0.3, 0.3)}}>
            <TearCal t={t} t0={tRel} t1={tPrim + 0.3} />
          </div>
          <div style={{position: 'absolute', left: 1120, top: 170, textAlign: 'center', width: 560, transform: `translate(${shake(t, tNo, 12, 0.4).x}px, 0)`}}>
            <Clock3D size={480} minutes={hm(12, 0) + back} rx={8} ry={-16} glowColor={t > tAtr && t < tNo ? 'rgba(78,168,222,0.5)' : undefined} />
            <div style={{fontFamily: F.head, fontSize: 90, color: BLUE, marginTop: 10, opacity: prog(t, tAtr, 0.3) * (1 - prog(t, tNo, 0.2))}}>−1 H</div>
          </div>
          <div style={{position: 'absolute', left: 260, top: 420}}>
            <Stamp t={t} t0={tNo - 0.05} text="NO PASÓ" size={150} rot={-9} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 890, textAlign: 'center', opacity: prog(t, tSen - 0.2, 0.3)}}>
            <span style={{fontFamily: F.head, fontSize: 64, color: N.text}}>EL SENADO TODAVÍA NO LO VOTÓ</span>
            <span style={{fontFamily: F.head, fontSize: 64, color: SUN, marginLeft: 12}}>{'.'.repeat(1 + (Math.floor(Math.max(0, t - tVoto) * 3) % 3))}</span>
          </div>
        </AbsoluteFill>
      ) : null}
      {gol ? (
        <AbsoluteFill>
          <Ocean glow="rgba(57,208,200,0.12)" />
          <Frame src="img/ep05/golombek.jpg" t={t} t0={tCient - 0.3} x={500} y={480} w={680} h={760} zoom={[1.08, 1.16]} focus="20% 35%" enter="left" credit="Diego Golombek · Casa Rosada · CC BY 2.5 AR">
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '22px 28px', background: 'linear-gradient(0deg, rgba(4,10,17,0.92), rgba(4,10,17,0))', opacity: prog(t, tGol - 0.1, 0.4)}}>
              <div style={{fontFamily: F.head, fontSize: 64, color: '#fff'}}>DIEGO GOLOMBEK</div>
              <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 26, color: N.teal}}>Biólogo · investigador del CONICET</div>
            </div>
          </Frame>
          <div style={{position: 'absolute', left: 960, top: 150, width: 860}}>
            <Kicker t={t} t0={tCient} x={0} y={0} text="Científicos a favor del cambio" color={N.teal} />
            <div style={{marginTop: 70}}>
              <Headline t={t} t0={tAdv - 0.1} size={78} text="Cambiar la hora dos veces por año también tiene su costo" hl={['costo']} hlColor={N.red} />
            </div>
            <div style={{display: 'flex', gap: 60, marginTop: 40}}>
              {[
                ['OTOÑO', -60, '−1 H', BLUE],
                ['PRIMAVERA', 60, '+1 H', SUN],
              ].map(([lab, d, txt, c], i) => {
                const t0 = tDos - 0.2 + i * 0.35;
                return (
                  <div key={lab as string} style={{textAlign: 'center', opacity: prog(t, t0, 0.3), transform: `translateY(${(1 - prog(t, t0, 0.5)) * 30}px)`}}>
                    <Clock3D size={230} minutes={hm(12, 0) + (d as number) * ramp(t, t0 + 0.2, t0 + 1.0)} rx={8} ry={i ? -18 : 18} />
                    <div style={{fontFamily: F.head, fontSize: 56, color: c as string}}>{txt as string}</div>
                    <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: N.mute}}>{lab as string}</div>
                  </div>
                );
              })}
            </div>
          </div>
          {t > tCosto - 0.1 ? <AbsoluteFill style={{boxShadow: `inset 0 0 ${160 * (1 - prog(t, tCosto, 0.8))}px rgba(226,59,46,0.6)`}} /> : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* =====================================================================
   S10 — cierre: no es fiaca, es geografía · mapa del adelanto · la pregunta · pantalla final
   ===================================================================== */
const lateMin = (lon: number) => (-45 - lon) * 4; // minutos que el sol medio llega tarde respecto de UTC−3

export const S10: React.FC<P & {total: number}> = ({t, total}) => {
  const s = 's10';
  const tFiaca = cue(s, 'fiaca:'), tGeo = cue(s, 'geografía.'), tViv = cue(s, 'Vivimos'), tCord = cue(s, 'cordillera,'), tDos = cue(s, 'dos.');
  const tPreg = cue(s, 'La pregunta'), tLuzM = cue(s, 'luz a la mañana'), tLuzT = cue(s, 'luz a la tarde'), tDej = cue(s, 'Dejalo'), tSi = cue(s, 'Si te');
  const tSusc = cue(s, 'suscribite'), tComp = cue(s, 'compartilo'), tNos = cue(s, 'Nos vemos');
  const bed = t < tViv - 0.3;
  const map = t >= tViv - 0.3 && t < tPreg - 0.3;
  const poll = t >= tPreg - 0.3 && t < tSi + 0.4;
  const ring = t < 1.6 ? Math.sin(t * 60) * 6 * (1 - t / 1.6) : 0;
  const lift: Record<string, number> = {}, fills: Record<string, string> = {}, sides: Record<string, string> = {};
  const grow = ramp(t, tViv - 0.1, tViv + 1.4, easeOut);
  for (const n of PROVN) {
    const m = lateMin(PCENT[n][0]);
    const k = clamp((m - 50) / 60);
    lift[n] = m * 1.1 * grow;
    fills[n] = mix(SUN, DAWN, k);
    sides[n] = mix('#000000', mix(SUN, DAWN, k), 0.45);
  }
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {bed ? (
        <AbsoluteFill>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, #050B18 0%, #0C1830 100%)'}} />
          {/* ventana: afuera, de noche (y después, el planeta) */}
          <div style={{position: 'absolute', left: 1280, top: 110, width: 500, height: 440, borderRadius: 8, border: '14px solid #1E2C44', background: '#02050C', overflow: 'hidden'}}>
            {Array.from({length: 40}).map((_, i) => (
              <div key={i} style={{position: 'absolute', left: rnd(i) * 480, top: rnd(i + 9) * 420, width: 3, height: 3, borderRadius: 2, background: '#fff', opacity: (0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i))) * (1 - prog(t, tGeo - 0.3, 0.4))}} />
            ))}
            <div style={{position: 'absolute', left: 250 - 14, top: 0, width: 14, height: 440, background: '#1E2C44'}} />
          </div>
          {t > tGeo - 0.4 ? (
            <AbsoluteFill style={{opacity: prog(t, tGeo - 0.4, 0.4)}}>
              <Globe5 view={{lon: -64 + (t - tGeo) * 4, lat: -30, r: 190, cx: 1530, cy: 330}} sun={subsolar(172, 10)} nightBoost={1.4}>
                {(proj, path) => <ArgOnGlobe path={path} o={0.8} fill="rgba(0,0,0,0)" />}
              </Globe5>
            </AbsoluteFill>
          ) : null}
          {/* cama */}
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <rect x={900} y={760} width={1100} height={200} rx={20} fill="#16223A" />
            <rect x={940} y={700} width={240} height={90} rx={40} fill="#E8E4DA" opacity={0.85} />
            <path d="M 1150 760 C 1300 700 1600 720 2000 740 L 2000 960 L 1150 960 Z" fill="#2B4A7A" />
          </svg>
          <div style={{position: 'absolute', left: 150, top: 230, transform: `translate(${ring}px, ${ring * 0.4}px)`}}>
            <FlipClock t={t} value={() => hm(7, 0)} size={170} label="LUNES · INVIERNO" glow={t < 1.6 ? 'rgba(226,59,46,0.6)' : undefined} />
          </div>
          <div style={{position: 'absolute', left: 150, top: 560, width: 900}}>
            <div style={{fontFamily: F.head, fontSize: 96, color: N.text, opacity: prog(t, tFiaca - 0.8, 0.3)}}>
              NO ES SOLO{' '}
              <span style={{position: 'relative'}}>
                FIACA
                <span style={{position: 'absolute', left: -8, right: -8, top: '52%', height: 12, background: N.red, transformOrigin: 'left', transform: `scaleX(${prog(t, tFiaca + 0.3, 0.3)})`}} />
              </span>
            </div>
            <div style={{fontFamily: F.head, fontSize: 130, color: SUN, opacity: prog(t, tGeo - 0.2, 0.2), transform: `scale(${pop(t, tGeo - 0.2)})`, transformOrigin: 'left'}}>ES GEOGRAFÍA</div>
          </div>
        </AbsoluteFill>
      ) : null}
      {map ? (
        <AbsoluteFill style={{opacity: prog(t, tViv - 0.3, 0.4)}}>
          <Ocean glow="rgba(255,122,69,0.14)" grid={0.2} />
          <Map3D t={t} tilt={56} rotZ={-24 + 20 * ramp(t, tViv, tPreg)} cx={1250} cy={600} scale={1.15} fills={fills} lift={lift} sides={sides}>
            {(P3) => {
              const a = P3(-55.5, -36.5, lift['Buenos Aires'] + 60), b = P3(-77.5, -44, lift['Chubut'] + 90);
              return (
                <>
                  <SvgLabel x={a[0]} y={a[1]} text="+1 H" color={SUN} size={70} o={prog(t, tViv + 0.4, 0.4)} />
                  <SvgLabel x={b[0]} y={b[1]} text="HASTA +2 H" color={DAWN} size={60} o={prog(t, tCord, 0.4)} />
                </>
              );
            }}
          </Map3D>
          <div style={{position: 'absolute', left: 110, top: 180, width: 700}}>
            <Headline t={t} t0={tViv} size={90} text="Vivimos una hora adelantados" hl={['una', 'hora']} hlColor={SUN} />
            <div style={{marginTop: 30, fontFamily: F.head, fontSize: 72, color: DAWN, whiteSpace: 'nowrap', opacity: prog(t, tCord - 0.2, 0.3), transform: `scale(${pop(t, tDos - 0.1)})`, transformOrigin: 'left'}}>EN LA CORDILLERA, DOS</div>
          </div>
          <Src t={t} t0={tViv} text="Altura = cuánto más tarde pasa el sol medio respecto de la hora oficial (UTC−3)" />
        </AbsoluteFill>
      ) : null}
      {poll ? (
        <AbsoluteFill>
          {[0, 1].map((side) => {
            const k = prog(t, tPreg - 0.3 + side * 0.1, 0.6);
            const hi = side === 0 ? prog(t, tLuzM, 0.3) : prog(t, tLuzT, 0.3);
            const sunY = side === 0 ? 700 - 260 * ramp(t, tPreg, tSi) : 440 + 260 * ramp(t, tPreg, tSi);
            return (
              <div key={side} style={{position: 'absolute', top: 0, bottom: 0, left: side * 960, width: 960, overflow: 'hidden', transform: `translateX(${(1 - k) * (side ? 960 : -960)}px)`}}>
                <div style={{position: 'absolute', inset: 0, background: side === 0 ? 'linear-gradient(180deg, #1B3B6F 0%, #6C8FC7 55%, #F7C98B 100%)' : 'linear-gradient(180deg, #3D1A4F 0%, #B8456A 55%, #FF9A4D 100%)'}} />
                <div style={{position: 'absolute', left: 480 - 120, top: sunY - 120, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, #FFF6D8 0%, #FFD27A 40%, rgba(255,210,122,0) 70%)'}} />
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 220, background: side === 0 ? '#0E1F3A' : '#1F0C22'}} />
                <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', transform: `scale(${0.92 + 0.08 * hi})`, opacity: 0.35 + 0.65 * hi}}>
                  <div style={{fontFamily: F.head, fontSize: 120, lineHeight: 1, color: '#fff', textShadow: '0 8px 30px rgba(0,0,0,0.45)'}}>LUZ A LA</div>
                  <div style={{fontFamily: F.head, fontSize: 150, lineHeight: 1, color: side === 0 ? '#FFE3A3' : '#FFD0A0', textShadow: '0 8px 30px rgba(0,0,0,0.45)'}}>{side === 0 ? 'MAÑANA' : 'TARDE'}</div>
                  <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 5, color: '#fff', marginTop: 20}}>{side === 0 ? 'VOLVER A UTC−4' : 'QUEDARSE EN UTC−3'}</div>
                </div>
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 36, letterSpacing: 10, color: '#fff', opacity: prog(t, tPreg, 0.4), textShadow: '0 4px 20px rgba(0,0,0,0.5)'}}>¿CUÁL PREFERÍS?</div>
          <div style={{position: 'absolute', left: 960 - 80, top: 440 - 80, width: 160, height: 160, borderRadius: '50%', background: N.bg0, border: `6px solid ${SUN}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: 80, color: SUN, transform: `scale(${pop(t, tLuzT - 0.3)})`, opacity: t > tLuzT - 0.3 ? 1 : 0}}>VS</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center', opacity: prog(t, tDej - 0.2, 0.3), transform: `translateY(${(1 - prog(t, tDej - 0.2, 0.5)) * 40}px)`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 20, background: '#fff', borderRadius: 60, padding: '16px 40px'}}>
              <svg width={60} height={54} viewBox="0 0 60 54">
                <path d="M 6 4 L 54 4 Q 58 4 58 8 L 58 36 Q 58 40 54 40 L 24 40 L 12 52 L 12 40 L 6 40 Q 2 40 2 36 L 2 8 Q 2 4 6 4 Z" fill={N.bg0} />
              </svg>
              <div style={{fontFamily: F.head, fontSize: 52, color: N.bg0}}>DEJALO EN LOS COMENTARIOS</div>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {t > tSi - 0.5 ? <EndCard t={t} t0={tSi - 0.2} tSusc={tSusc} tComp={tComp} tNos={tNos} total={total} /> : null}
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{t: number; t0: number; tSusc: number; tComp: number; tNos: number; total: number}> = ({t, t0, tSusc, tComp, tNos, total}) => {
  const move = ramp(t, tNos - 1.6, tNos - 0.6);
  const size = 380 - 110 * move;
  const lx = 960 - size / 2 - 560 * move;
  const ly = 250 - 90 * move;
  const bg = prog(t, t0 - 0.3, 0.6);
  const fadeOut = prog(t, total - 0.6, 0.6);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: '#0B0B0C', opacity: bg}} />
      <AbsoluteFill style={{opacity: bg * 0.6, background: 'radial-gradient(ellipse at 30% 50%, rgba(255,181,71,0.12) 0%, rgba(0,0,0,0) 60%)'}} />
      {/* relojes lentos de fondo */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: [80, 640, 300][i], top: [640, 700, 90][i], opacity: 0.12 * bg}}>
          <Clock3D size={[260, 200, 160][i]} minutes={hm(10, 10) + (t - t0) * 30 * (i + 1)} rx={12} ry={20 - i * 15} />
        </div>
      ))}
      <div style={{position: 'absolute', left: lx, top: ly}}>
        <LogoMark size={size} t={t} t0={t0} />
      </div>
      <div style={{position: 'absolute', left: -560 * move, right: 560 * move, top: 680 - 220 * move, textAlign: 'center', opacity: prog(t, t0 + 0.5, 0.5)}}>
        <div style={{fontFamily: F.head, fontSize: 110 - 30 * move, color: '#fff', letterSpacing: 6}}>CONTEXTO</div>
      </div>
      <div style={{position: 'absolute', left: 960 - 190 - 560 * move, top: 830 - 240 * move, opacity: prog(t, tSusc - 0.2, 0.3), transform: `scale(${pop(t, tSusc - 0.2)})`}}>
        <div style={{width: 380, height: 84, background: N.red, borderRadius: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: '#fff', boxShadow: '0 10px 30px rgba(226,59,46,0.45)'}}>
          SUSCRIBITE
        </div>
      </div>
      <div style={{position: 'absolute', left: 960 - 360 - 560 * move, top: 945 - 240 * move, width: 720, textAlign: 'center', opacity: prog(t, tComp - 0.2, 0.3), fontFamily: F.body, fontWeight: 700, fontSize: 28, color: N.mute}}>
        Compartilo con el que siempre llega tarde
      </div>
      <div style={{position: 'absolute', left: 1010, top: 170, opacity: prog(t, tNos - 0.6, 0.5)}}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: N.mute, marginBottom: 16}}>SEGUÍ MIRANDO</div>
        {[0, 1].map((i) => (
          <div key={i} style={{width: 760, height: 330, marginBottom: 40, borderRadius: 10, border: '3px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.04)', transform: `translateX(${(1 - prog(t, tNos - 0.5 + i * 0.15, 0.6)) * 80}px)`}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 50, top: 850, width: 700, textAlign: 'center', opacity: prog(t, tNos, 0.5), fontFamily: F.head, fontSize: 56, color: '#fff'}}>NOS VEMOS EN EL PRÓXIMO VIDEO</div>
      <AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};
