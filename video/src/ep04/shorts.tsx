/* Shorts verticales (1080x1920) del episodio 4: uno para YouTube Shorts y otro para TikTok.
   Reutilizan la narración del episodio (partes recortadas, ver tools/shorts_ep04.py) y los gráficos rediseñados en vertical. */
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {F} from '../theme';
import {Grain} from '../components/base';
import {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog} from '../lib/anim';
import shorts from '../data/ep04/shorts.json';
import words from '../data/ep04/words.json';
import same from '../data/ep04/samedate.json';
import {cue} from './lib';
import {Cloud, Fan, Flash, Frame, Headline, HeatText, LogoMark, N, Num, Ocean, Rain} from './kit';
import {FlatMap, lerpCam, RegionBox, Cam} from './flatmap';
import {Globe, arcPath, visible} from './globe';
import {ArgMap, PLACES} from './argmap';
import {Section} from './section';
import {heat} from './charts';

const VW = 1080, VH = 1920;
type Part = {id: string; seg: string; from: number; to: number; at: number};
type TLs = {fps: number; parts: Part[]; endCard: number; total: number};
export type ShortKind = 'yt' | 'tt';
const DATA = shorts as unknown as Record<ShortKind, TLs>;
const WS = words as Record<string, {w: string; s: number; e: number}[]>;
const ramp = (t: number, a: number, b: number, e = easeInOut) => e(clamp((t - a) / (b - a)));

/* ---------- subtítulos palabra por palabra ---------- */
const chunksFor = (tl: TLs) => {
  const list: {w: string; s: number; e: number}[] = [];
  for (const p of tl.parts) for (const w of WS[p.seg]) if (w.s >= p.from - 0.01 && w.e <= p.to + 0.05) list.push({w: w.w, s: p.at + w.s - p.from, e: p.at + w.e - p.from});
  const out: {words: typeof list; s: number; e: number}[] = [];
  let cur: typeof list = [];
  list.forEach((w, i) => {
    cur.push(w);
    const txt = cur.map((x) => x.w).join(' ');
    if (cur.length >= 3 || /[.,:?!»]$/.test(w.w) || txt.length > 14 || i === list.length - 1) {
      out.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = i < out.length - 1 ? Math.min(out[i + 1].s, c.e + 0.35) : c.e + 0.3));
  return out;
};
const CH: Record<ShortKind, ReturnType<typeof chunksFor>> = {yt: chunksFor(DATA.yt), tt: chunksFor(DATA.tt)};

const Captions: React.FC<{T: number; kind: ShortKind; y?: number}> = ({T, kind, y = 1330}) => {
  const c = CH[kind].find((x) => T >= x.s - 0.05 && T < x.e);
  if (!c || T > DATA[kind].endCard - 0.1) return null;
  const k = pop(T, c.s - 0.05, 1.4);
  const stroke = '#05090E';
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: y, textAlign: 'center', transform: `scale(${0.86 + 0.14 * k})`}}>
      {c.words.map((w, i) => {
        const on = T >= w.s - 0.03 && T < w.e + 0.15;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', margin: '0 12px', fontFamily: F.head, fontSize: 96, lineHeight: 1.15, textTransform: 'uppercase',
              color: on ? N.yellow : '#fff',
              textShadow: `6px 6px 0 ${stroke}, -6px -6px 0 ${stroke}, 6px -6px 0 ${stroke}, -6px 6px 0 ${stroke}, 0 6px 0 ${stroke}, 6px 0 0 ${stroke}, -6px 0 0 ${stroke}, 0 -6px 0 ${stroke}, 0 16px 30px rgba(0,0,0,0.6)`,
            }}
          >
            {w.w.replace(/[«»]/g, '')}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- piezas comunes ---------- */
const Top: React.FC<{children: React.ReactNode; y?: number}> = ({children, y = 260}) => (
  <div style={{position: 'absolute', left: 60, right: 60, top: y, textAlign: 'center'}}>{children}</div>
);
const TopShade: React.FC<{h?: number}> = ({h = 700}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h, background: 'linear-gradient(180deg, rgba(4,10,17,0.92) 0%, rgba(4,10,17,0.65) 55%, rgba(4,10,17,0) 100%)'}} />
);
const BottomShade: React.FC = () => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 760, background: 'linear-gradient(0deg, rgba(4,10,17,0.9) 0%, rgba(4,10,17,0.5) 55%, rgba(4,10,17,0) 100%)'}} />
);
const Chip: React.FC<{t: number; t0: number; text: string; color?: string; dark?: boolean}> = ({t, t0, text, color = N.yellow, dark = true}) => (
  <div style={{display: 'inline-block', background: color, color: dark ? N.bg0 : '#fff', fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 5, padding: '8px 20px', transform: `scale(${pop(t, t0)})`, opacity: clamp((t - t0) / 0.1)}}>
    {text}
  </div>
);
const Big: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({children, color = N.text, size = 150, style}) => (
  <div style={{fontFamily: F.head, fontSize: size, lineHeight: 1, color, textTransform: 'uppercase', ...style}}>{children}</div>
);

/** barras verticales: Niño 3.4 cada 16 de septiembre (NOAA CPC) */
const VBars: React.FC<{t: number; t0: number; tLast: number}> = ({t, t0, tLast}) => {
  const rows = (same as any).same as [number, number, number][];
  const n = rows.length, xL = 110, xR = 1000, base = 1090, sc = 150;
  const bw = (xR - xL) / n;
  return (
    <svg width={VW} height={VH} style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="vb-glow" x="-200%" y="-30%" width="500%" height="160%">
          <feGaussianBlur stdDeviation="12" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[-1, 0, 1, 2, 3].map((v) => (
        <g key={v} opacity={prog(t, t0, 0.4)}>
          <line x1={xL} x2={xR} y1={base - v * sc} y2={base - v * sc} stroke={v === 0 ? 'rgba(255,255,255,0.6)' : N.line} strokeWidth={v === 0 ? 3 : 1.5} />
          <text x={xL - 14} y={base - v * sc + 9} textAnchor="end" fill={N.mute} fontFamily="JetBrains Mono" fontSize={26}>
            {v > 0 ? '+' : ''}
            {v}°
          </text>
        </g>
      ))}
      <g opacity={prog(t, t0 + 2.6, 0.5)}>
        <line x1={xL} x2={xR} y1={base - 2 * sc} y2={base - 2 * sc} stroke={N.yellow} strokeWidth={3} strokeDasharray="12 9" />
        <text x={xL + 6} y={base - 2 * sc - 16} fill={N.yellow} fontFamily="Inter" fontWeight={800} fontSize={27} letterSpacing={2}>
          RÉCORD ANTERIOR: +2,0° (2015)
        </text>
      </g>
      {rows.map(([y, v], i) => {
        const last = i === n - 1;
        const p = last ? pop(t, tLast, 0.9) : prog(t, t0 + 0.3 + i * 0.06, 0.45);
        const h = v * sc * p;
        const x = xL + i * bw + bw * 0.14;
        return <rect key={y} x={x} y={h >= 0 ? base - h : base} width={bw * 0.72} height={Math.abs(h)} fill={last ? N.hot : heat(v)} opacity={last ? 1 : 0.85} filter={last ? 'url(#vb-glow)' : undefined} />;
      })}
      <text x={xL} y={base + 1.2 * sc + 20} fill={N.mute} fontFamily="JetBrains Mono" fontSize={28}>
        1982
      </text>
      <text x={xR} y={base + 1.2 * sc + 20} textAnchor="end" fill={N.yellow} fontFamily="JetBrains Mono" fontWeight={800} fontSize={30} opacity={prog(t, tLast, 0.3)}>
        2026
      </text>
    </svg>
  );
};

/** transición vertical entre partes: banda amarilla y azul que sube */
const VWipe: React.FC<{t: number; at: number}> = ({t, at}) => {
  const d = 0.5;
  const k = (t - (at - d / 2)) / d;
  if (k <= 0 || k >= 1) return null;
  const y1 = VH - easeInOut(clamp(k / 0.55)) * (VH + 200);
  const y2 = VH + 200 - easeInOut(clamp((k - 0.45) / 0.55)) * (VH + 400);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: Math.max(-200, y1), bottom: Math.max(0, VH - y2), background: N.yellow}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: Math.max(-200, y1 + 60), bottom: Math.max(0, VH - y2 + 60), background: N.bg1}} />
    </AbsoluteFill>
  );
};

/* =====================================================================
   Escenas por parte (ts = tiempo relativo al segmento de narración original)
   ===================================================================== */
const DatoScene: React.FC<{ts: number; kind: ShortKind}> = ({ts, kind}) => {
  const s = 's01';
  const tCuatro = cue(s, 'cuatro'), tSeis = cue(s, 'seis'), tMedio = cue(s, 'En el medio'), tTres = cue(s, 'tres grados'), tMas = cue(s, 'En más');
  const tTan = cue(s, 'tan caliente');
  const camA: Cam = {lon: 281.5, lat: -6, deg: 22}, camA1: Cam = {lon: 280.5, lat: -6, deg: 18}, camB: Cam = {lon: 213, lat: 0, deg: 64};
  let cam = lerpCam(camA, camA1, ramp(ts, -0.4, tMedio));
  if (ts > tMedio) cam = lerpCam(camA1, camB, ramp(ts, tMedio - 0.1, tTres - 0.3));
  const mapO = 1 - prog(ts, tMas - 0.3, 0.5);
  const K = VW / cam.deg;
  const P = (lon: number, lat: number) => [VW / 2 + ((((lon % 360) + 360) % 360) - cam.lon) * K, VH / 2 - (lat - cam.lat) * K];
  const peru = t2(ts < tMedio - 0.1);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {mapO > 0 ? (
        <AbsoluteFill style={{opacity: mapO}}>
          <FlatMap cam={cam} W={VW} H={VH} reveal={{lon: -81, lat: -4, r: 2 + ramp(ts, 0.2, 5.4, easeOut) * 80}}>
            {(Pp) => (
              <>
                <RegionBox P={Pp} lon0={-90} lon1={-80} lat0={-10} lat1={0} p={prog(ts, 0.6, 0.8)} label="NIÑO 1+2" />
                <RegionBox P={Pp} lon0={-170} lon1={-120} lat0={-5} lat1={5} p={prog(ts, tMedio + 0.5, 0.9)} label="NIÑO 3.4" />
              </>
            )}
          </FlatMap>
          <TopShade h={760} />
          <Top y={250}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: N.mute}}>TEMPERATURA DEL MAR · 16/9/2026</div>
            <div style={{fontFamily: F.head, fontSize: 88, color: N.text, marginTop: 14, textTransform: 'uppercase'}}>{peru ? 'Frente a Perú' : 'Pacífico central'}</div>
            <Big size={230} color={N.yellow} style={{marginTop: 4, opacity: peru ? prog(ts, tCuatro - 0.35, 0.2) : prog(ts, tTres - 0.4, 0.2)}}>
              {peru ? <Num t={ts} t0={tCuatro - 0.3} t1={tSeis + 0.3} to={4.6} dec={1} prefix="+" suffix="°C" /> : <Num t={ts} t0={tTres - 0.35} t1={tTres + 0.4} to={3} dec={1} prefix="+" suffix="°C" />}
            </Big>
            <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 34, color: N.text, opacity: prog(ts, tCuatro + 0.4, 0.4) * (peru ? 1 : prog(ts, tTres - 0.4, 0.2))}}>más caliente de lo normal</div>
          </Top>
          {(() => {
            const [x, y] = P(peru ? -85 : -145, peru ? -5 : 0);
            const pulse = (ts % 1.4) / 1.4;
            return (
              <svg width={VW} height={VH} style={{position: 'absolute', inset: 0}}>
                <circle cx={x} cy={y} r={16 + pulse * 50} fill="none" stroke={N.yellow} strokeWidth={4} opacity={(1 - pulse) * prog(ts, tCuatro - 0.4, 0.4)} />
                <circle cx={x} cy={y} r={12} fill={N.yellow} opacity={prog(ts, tCuatro - 0.4, 0.3)} />
              </svg>
            );
          })()}
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 440, textAlign: 'center', fontFamily: F.mono, fontSize: 22, color: 'rgba(210,225,238,0.7)'}}>NOAA OISST v2.1 · satélites</div>
        </AbsoluteFill>
      ) : null}
      {kind === 'yt' && ts > tMas - 0.4 ? (
        <AbsoluteFill style={{opacity: prog(ts, tMas - 0.4, 0.5)}}>
          <Ocean grid={0.25} />
          <Top y={250}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: N.mute}}>PACÍFICO CENTRAL · CADA 16 DE SEPTIEMBRE</div>
            <div style={{marginTop: 20}}>
              <Headline t={ts} t0={tMas} size={104} text="Nunca visto en 45 años de satélites" hl={['Nunca', 'visto']} hlColor={N.hot} style={{textAlign: 'center'}} />
            </div>
          </Top>
          <VBars t={ts} t0={tMas + 0.1} tLast={tTan - 0.05} />
          <div style={{position: 'absolute', left: 560, top: 600, opacity: prog(ts, tTan + 0.2, 0.3), transform: `scale(${pop(ts, tTan + 0.2)})`, transformOrigin: 'right'}}>
            <Big size={120} color={N.yellow}>2026: +3,0°</Big>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 440, textAlign: 'center', fontFamily: F.mono, fontSize: 22, color: 'rgba(210,225,238,0.7)'}}>NOAA CPC · índice semanal Niño 3.4</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
const t2 = (b: boolean) => b;

const CiudadScene: React.FC<{ts: number}> = ({ts}) => {
  const s = 's01';
  const tLoQue = cue(s, 'Y lo que'), tMiles = cue(s, 'miles'), tLlueve = cue(s, 'llueve'), tCiudad = cue(s, 'tu ciudad');
  const g = ramp(ts, tLoQue - 0.3, tMiles + 1.2);
  const view = {lon: -140 + 75 * g, lat: -4 - 18 * g, r: 470, cx: 540, cy: 960};
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(30,90,150,0.35)" />
      <Globe view={view} tex="sst2026" W={VW} H={VH}>
        {(proj, path) => {
          const ba: [number, number] = [-58.4, -34.6];
          const pB = proj(ba);
          const aP = prog(ts, tMiles - 0.3, 1.3);
          const pulse = (ts % 1.4) / 1.4;
          return (
            <g>
              <path d={path({type: 'Polygon', coordinates: [[[-170, -5], [-120, -5], [-120, 5], [-170, 5], [-170, -5]]]} as any) ?? ''} fill="rgba(255,204,51,0.12)" stroke={N.yellow} strokeWidth={4} />
              {aP > 0 ? <path d={arcPath(path, [-145, 0], ba, aP)} fill="none" stroke={N.yellow} strokeWidth={7} strokeDasharray="2 14" strokeLinecap="round" /> : null}
              {ts > tCiudad - 0.2 && pB && visible(view, ba[0], ba[1]) ? (
                <g transform={`translate(${pB[0]},${pB[1]})`}>
                  <circle r={16 + pulse * 46} fill="none" stroke={N.rain} strokeWidth={4} opacity={1 - pulse} />
                  <circle r={14 * pop(ts, tCiudad - 0.2)} fill={N.rain} stroke="#fff" strokeWidth={4} />
                </g>
              ) : null}
              {ts > tLlueve - 0.3 && pB ? (
                <g opacity={prog(ts, tLlueve - 0.3, 0.5)}>
                  <Cloud x={pB[0] + 10} y={pB[1] - 150} s={1.2} color="#E3EEF7" />
                  <Rain t={ts} x={pB[0] - 55} y={pB[1] - 125} w={130} h={110} n={16} />
                </g>
              ) : null}
            </g>
          );
        }}
      </Globe>
      <TopShade h={560} />
      <Top y={260}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: N.mute, opacity: prog(ts, tMiles, 0.4)}}>A ≈ 9.700 KM DE DISTANCIA</div>
        <div style={{marginTop: 16}}>
          <Headline t={ts} t0={tLoQue} size={100} text="Decide cuánto llueve en tu ciudad" hl={['llueve']} hlColor={N.rain} style={{textAlign: 'center'}} />
        </div>
      </Top>
    </AbsoluteFill>
  );
};

const TituloScene: React.FC<{ts: number}> = ({ts}) => {
  const s = 's01';
  const tSuper = cue(s, 'Súper'), tYa = cue(s, 'Y ya');
  const blink = Math.floor(ts * 2) % 2 === 0;
  const z = 1.12 - 0.12 * easeOut(clamp((ts - tSuper) / 1.2));
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <AbsoluteFill style={{filter: 'blur(6px) brightness(0.6)'}}>
        <Globe view={{lon: -118 + ts * 3, lat: -2, r: 1100, cx: 540, cy: 980}} tex="sst2026" W={VW} H={VH} />
      </AbsoluteFill>
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${z})`}}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 12, color: N.text, marginBottom: 70, opacity: prog(ts, tSuper - 1.2, 0.5)}}>ESTO ES EL</div>
        <div style={{opacity: prog(ts, tSuper - 0.1, 0.2)}}>
          <HeatText text="Súper" size={300} t={ts} />
        </div>
        <div style={{marginTop: 30, opacity: prog(ts, tSuper + 0.25, 0.2)}}>
          <HeatText text="Niño" size={300} t={ts + 3} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 40, opacity: prog(ts, tYa - 0.1, 0.3)}}>
          <div style={{width: 26, height: 26, borderRadius: 13, background: N.red, opacity: blink ? 1 : 0.35, boxShadow: `0 0 24px ${N.red}`}} />
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 44, letterSpacing: 10, color: N.text}}>YA ESTÁ ACÁ</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const STRONG = ['Misiones', 'Corrientes', 'Chaco', 'Formosa', 'Santa Fe', 'Entre Ríos'];
const MOD = ['Buenos Aires', 'Ciudad de Buenos Aires', 'Córdoba', 'La Pampa', 'San Luis', 'Mendoza', 'Neuquén', 'Río Negro'];
const MapaScene: React.FC<{ts: number}> = ({ts}) => {
  const s = 's07';
  const tLluv = cue(s, 'Lluvias'), tGran = cue(s, 'gran parte'), tPar = cue(s, 'Paraná');
  const tProv = STRONG.map((p) => cue(s, p === 'Santa Fe' ? 'Santa Fe' : p === 'Entre Ríos' ? 'Entre Ríos.' : p + ','));
  const fills: Record<string, {c: string; o: number}> = {};
  MOD.forEach((p, i) => (fills[p] = {c: '#3F86C9', o: 0.7 * prog(ts, tGran - 0.4 + i * 0.05, 0.5)}));
  STRONG.forEach((p, i) => (fills[p] = {c: '#1F5FB4', o: Math.max(0.7 * prog(ts, tGran - 0.4, 0.5), prog(ts, tProv[i] - 0.15, 0.3))}));
  const labels: Record<string, number> = {};
  STRONG.forEach((p, i) => (labels[p] = prog(ts, tProv[i] - 0.15, 0.3)));
  const z = 1 + 0.35 * ramp(ts, tProv[0] - 1, tProv[5] + 0.5);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(63,134,201,0.18)" />
      <ArgMap cam={{box: [160, 420, 920, 1780], z, focus: [-62, -30 - 2 * (1 - z)], at: [560, 980]}} W={VW} H={VH} fills={fills} labels={labels} labelSize={28}
        rivers={1} riverColor={ts > tPar - 0.2 ? '#7FE0FF' : '#5CC8FF'} t={ts}>
        {(proj) => {
          const [x0, y0] = proj([-62.5, -24])!;
          const [x1, y1] = proj([-53.5, -33.5])!;
          return (
            <g opacity={prog(ts, tProv[0] - 0.2, 0.6)}>
              <Rain t={ts} x={x0} y={y0} w={x1 - x0} h={y1 - y0} n={110} color="#A9D8FF" />
            </g>
          );
        }}
      </ArgMap>
      <TopShade h={520} />
      <Top y={250}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: N.mute}}>PRONÓSTICO PARA ESTE VERANO</div>
        <div style={{marginTop: 16}}>
          <Headline t={ts} t0={tLluv - 0.1} size={104} text="Más lluvia de lo normal" hl={['lluvia']} hlColor={N.rain} style={{textAlign: 'center'}} />
        </div>
        <div style={{marginTop: 14, opacity: prog(ts, tPar - 0.2, 0.4)}}>
          <Chip t={ts} t0={tPar - 0.2} text="PARANÁ Y URUGUAY: BAJO VIGILANCIA" color="#7FE0FF" />
        </div>
      </Top>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 440, textAlign: 'center', fontFamily: F.mono, fontSize: 22, color: 'rgba(210,225,238,0.7)'}}>SMN · CRC-SAS · ECMWF (mapa ilustrativo)</div>
    </AbsoluteFill>
  );
};

const DengueScene: React.FC<{ts: number}> = ({ts}) => {
  const s = 's08';
  const tLluvia = cue(s, 'más lluvia'), tCalor = cue(s, 'más calor'), tMosq = cue(s, 'mosquitos.'), tDengue = cue(s, 'dengue.');
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Frame src="img/ep04/aedes.jpg" t={ts} t0={cue(s, 'Pero') - 0.4} x={540} y={960} w={1080} h={1920} radius={0} zoom={[1.1, 1.3]} focus="58% 45%" enter="fade" grade="linear-gradient(180deg, rgba(4,10,17,0.9) 0%, rgba(4,10,17,0.35) 40%, rgba(4,10,17,0.2) 60%, rgba(4,10,17,0.85) 100%)" />
      <Top y={260}>
        <div style={{display: 'flex', justifyContent: 'center', gap: 30}}>
          <Big size={110} color={N.rain} style={{opacity: prog(ts, tLluvia - 0.2, 0.3)}}>+ lluvia</Big>
          <Big size={110} color={N.hot} style={{opacity: prog(ts, tCalor - 0.2, 0.3)}}>+ calor</Big>
        </div>
        <Big size={170} color={N.yellow} style={{marginTop: 10, opacity: prog(ts, tMosq - 0.3, 0.3), transform: `scale(${0.85 + 0.15 * pop(ts, tMosq - 0.3)})`}}>= mosquitos</Big>
        <div style={{marginTop: 30, display: 'inline-flex', alignItems: 'center', gap: 20, background: N.red, padding: '14px 32px', opacity: prog(ts, tDengue - 0.6, 0.3), transform: `scale(${pop(ts, tDengue - 0.6)})`, boxShadow: `0 0 ${30 + 20 * Math.sin(ts * 8)}px rgba(226,59,46,0.7)`}}>
          <svg width={70} height={62} viewBox="0 0 64 58">
            <path d="M32 3 L62 55 L2 55 Z" fill="#fff" />
            <rect x={29} y={20} width={6} height={20} fill={N.red} />
            <rect x={29} y={44} width={6} height={6} fill={N.red} />
          </svg>
          <Big size={84} color="#fff">Riesgo de dengue</Big>
        </div>
      </Top>
    </AbsoluteFill>
  );
};

/** corte del océano reencuadrado en vertical: se escala y se paneo sobre la acción */
const SectionV: React.FC<{ts: number; seg: 's03' | 's04'}> = ({ts, seg}) => {
  let k = 0, wind = 1, rk = 0, fx = 800;
  let c: any = {};
  let label = 'AÑO NORMAL', lc = N.cold, head = '', off = 0;
  if (seg === 's03') {
    const tAlis = cue('s03', 'vientos'), tGig = cue('s03', 'gigante.'), tEmp = cue('s03', 'Empujan'), tAlla = cue('s03', 'allá');
    c = {wind: tAlis - 0.2, warm: tEmp - 0.2, high: tAlla, up: 99, chips: [99, 99, 99]};
    fx = ts < tEmp - 0.3 ? 1400 - 700 * ramp(ts, tAlis, tGig + 0.3) : 700 - 280 * ramp(ts, tEmp - 0.2, tAlla + 0.3);
    head = ts < tEmp - 0.3 ? 'Los alisios soplan de este a oeste' : 'El agua caliente se amontona en el oeste';
  } else {
    const tDeb = cue('s04', 'debilitan.'), tApaga = cue('s04', 'apaga.'), tToda = cue('s04', 'toda'), tEcu = cue('s04', 'Ecuador.'), tLluv = cue('s04', 'lluvias', 0), tMudan = cue('s04', 'mudan.');
    wind = 1 - 0.85 * ramp(ts, 0.8, tDeb + 0.6);
    k = ramp(ts, tToda - 0.1, tEcu + 0.4);
    rk = ramp(ts, tLluv - 0.5, tMudan + 0.4);
    off = prog(ts, tApaga, 0.5);
    c = {wind: -5, warm: -5, up: -5, high: -5, chips: [-5, -5, -5], evap: cue('s04', 'evapora') - 0.3};
    fx = 420 + 900 * ramp(ts, tToda - 0.3, tMudan + 0.3);
    label = ts > tDeb - 0.3 ? 'EL NIÑO' : 'AÑO NORMAL';
    lc = ts > tDeb - 0.3 ? N.hot : N.cold;
    head = ts < tToda - 0.2 ? 'Los alisios se debilitan' : ts < cue('s04', 'Como') - 0.2 ? 'El agua caliente vuelve al este' : 'Y las lluvias se mudan';
  }
  const S = 1.05;
  const left = 540 - fx * S;
  const clampedLeft = Math.min(0, Math.max(VW - 1920 * S, left));
  const ta = cue('s04', 'apaga.') - 0.6;
  const dd = Math.min(Math.max(ts - ta, 0), 2.2);
  const spin = seg === 's03' || ts < ta ? ts * 576 : ta * 576 + 576 * (dd - (dd * dd) / 4.4);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(40,110,170,0.22)" />
      <div style={{position: 'absolute', left: clampedLeft, top: 350, width: 1920, height: 1080, transform: `scale(${S})`, transformOrigin: '0 0'}}>
        <Section t={ts} k={k} wind={wind} rk={rk} c={c} />
      </div>
      <TopShade h={640} />
      <Top y={250}>
        <div style={{display: 'inline-block', background: lc, color: N.bg0, fontFamily: F.head, fontSize: 80, padding: '4px 28px'}}>{label}</div>
        <div style={{marginTop: 26, fontFamily: F.head, fontSize: 84, lineHeight: 1.05, color: N.text, textTransform: 'uppercase'}}>{head}</div>
      </Top>
      <div style={{position: 'absolute', right: 50, top: 560, opacity: 0.95}}>
        <svg width={200} height={220} viewBox="-100 -90 200 250">
          <Fan x={0} y={0} s={0.8} angle={-spin} off={off} color={off > 0.5 ? N.mute : N.text} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

const LluviasScene: React.FC<{ts: number}> = ({ts}) => {
  const s = 's04';
  const tY = cue(s, 'Y las'), tNuestro = cue(s, 'nuestro');
  const g = ramp(ts, tY - 0.4, tNuestro + 0.4);
  const view = {lon: -100 + 38 * g, lat: -10 - 18 * g, r: 520, cx: 540, cy: 1000};
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(30,90,150,0.35)" />
      <Globe view={view} tex="sst2026" W={VW} H={VH}>
        {(proj) => {
          const p = proj([-59, -30]);
          if (!p) return null;
          const a = prog(ts, tNuestro - 0.4, 0.5);
          return (
            <g opacity={a}>
              <circle cx={p[0]} cy={p[1]} r={110} fill={N.rain} opacity={0.22} />
              <Cloud x={p[0] + 10} y={p[1] - 110} s={1.3} color="#E3EEF7" />
              <Rain t={ts} x={p[0] - 70} y={p[1] - 80} w={150} h={150} n={24} />
            </g>
          );
        }}
      </Globe>
      <TopShade h={560} />
      <Top y={260}>
        <Headline t={ts} t0={tY} size={104} text="Y las lluvias vienen para acá" hl={['acá']} hlColor={N.rain} style={{textAlign: 'center'}} />
      </Top>
    </AbsoluteFill>
  );
};

const InundacionScene: React.FC<{ts: number}> = ({ts}) => {
  const s = 's06';
  const tAnio = cue(s, 'mil novecientos'), tLit = cue(s, 'Litoral'), tInund = cue(s, 'inundó:'), tCiento = cue(s, 'ciento'), tDiec = cue(s, 'diecisiete'), tCuatro = cue(s, 'cuatro millones');
  const zl = ramp(ts, tAnio, tLit + 0.4);
  const fl = prog(ts, tInund - 0.3, 0.8);
  const fills: Record<string, {c: string; o: number}> = {'Santa Fe': {c: 'url(#floodV)', o: fl}, 'Entre Ríos': {c: 'url(#floodV)', o: fl * 0.75}, Corrientes: {c: 'url(#floodV)', o: fl * 0.75}, Chaco: {c: 'url(#floodV)', o: fl * 0.6}};
  const stat = (t0: number, big: React.ReactNode, lab: string, color = N.text) => (
    <div style={{opacity: prog(ts, t0 - 0.2, 0.4), transform: `translateY(${(1 - prog(ts, t0 - 0.2, 0.5)) * 30}px)`, textAlign: 'center', flex: 1}}>
      <Big size={88} color={color}>{big}</Big>
      <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: N.mute, marginTop: 4}}>{lab}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(46,127,208,0.16)" />
      <ArgMap cam={{box: [160, 420, 920, 1780], z: 1 + 1.6 * zl, focus: [-64 + 3.5 * zl, -38 + 7.5 * zl], at: [540, 1060]}} W={VW} H={VH} fills={fills} rivers={1} t={ts}
        labels={{'Santa Fe': fl, 'Entre Ríos': fl, Corrientes: fl, Chaco: fl}} labelSize={28}>
        {() => (
          <defs>
            <pattern id="floodV" width={40} height={16} patternUnits="userSpaceOnUse" patternTransform={`translate(${(ts * 30) % 40},0)`}>
              <rect width={40} height={16} fill="#2E7FD0" />
              <path d="M0 8 Q10 2 20 8 T40 8" fill="none" stroke="#8CC8FF" strokeWidth={2} opacity={0.7} />
            </pattern>
          </defs>
        )}
      </ArgMap>
      <TopShade h={700} />
      <Top y={240}>
        <Big size={200} color={N.yellow} style={{opacity: prog(ts, tAnio - 0.1, 0.2), transform: `scale(${1.25 - 0.25 * pop(ts, tAnio - 0.1)})`}}>1998</Big>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 32, letterSpacing: 6, color: N.text, opacity: prog(ts, tLit, 0.4)}}>EL LITORAL BAJO EL AGUA</div>
        <div style={{display: 'flex', marginTop: 30}}>
          {stat(tCiento, <Num t={ts} t0={tCiento - 0.2} t1={tCiento + 0.8} to={120000} />, 'EVACUADOS')}
          {stat(tDiec, '17', 'MUERTOS', N.red)}
          {stat(tCuatro, '4 M ha', 'BAJO EL AGUA', '#8CC8FF')}
        </div>
      </Top>
    </AbsoluteFill>
  );
};

const CierreScene: React.FC<{ts: number}> = ({ts}) => {
  const tP = cue('s10', 'La pregunta');
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <AbsoluteFill style={{filter: 'blur(7px) brightness(0.55)'}}>
        <Globe view={{lon: -130 + ts * 4, lat: 0, r: 620, cx: 540, cy: 960}} tex="sst2026" W={VW} H={VH} />
      </AbsoluteFill>
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60}}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 36, letterSpacing: 10, color: N.text, marginBottom: 40}}>LA PREGUNTA ES</div>
        <Headline t={ts} t0={tP + 0.1} size={130} text="¿Esta vez vamos a estar preparados?" hl={['preparados?']} style={{textAlign: 'center'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const EndCardV: React.FC<{t: number; kind: ShortKind}> = ({t, kind}) => {
  const a = prog(t, 0, 0.4);
  return (
    <AbsoluteFill style={{background: '#0B0B0C', opacity: a}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(255,204,51,0.12) 0%, rgba(0,0,0,0) 60%)'}} />
      <div style={{position: 'absolute', left: 540 - 190, top: 360}}>
        <LogoMark size={380} t={t} t0={0.05} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', opacity: prog(t, 0.5, 0.4)}}>
        <Big size={130} color="#fff" style={{letterSpacing: 6}}>Contexto</Big>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1010, textAlign: 'center', opacity: prog(t, 0.9, 0.4), transform: `translateY(${(1 - prog(t, 0.9, 0.5)) * 30}px)`}}>
        <div style={{fontFamily: F.head, fontSize: 84, color: N.yellow, lineHeight: 1.05}}>{kind === 'yt' ? 'MIRÁ EL VIDEO COMPLETO' : 'VIDEO COMPLETO EN MI PERFIL'}</div>
        <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 38, color: N.text, marginTop: 16}}>{kind === 'yt' ? 'Tocá el enlace de acá abajo ↓' : 'Seguinos para no perderte el próximo'}</div>
      </div>
    </AbsoluteFill>
  );
};

const SCENE: Record<string, (ts: number, kind: ShortKind) => React.ReactNode> = {
  dato: (ts, kind) => <DatoScene ts={ts} kind={kind} />,
  ciudad: (ts) => <CiudadScene ts={ts} />,
  titulo: (ts) => <TituloScene ts={ts} />,
  mapa: (ts) => <MapaScene ts={ts} />,
  dengue: (ts) => <DengueScene ts={ts} />,
  normal: (ts) => <SectionV ts={ts} seg="s03" />,
  pileta: (ts) => <SectionV ts={ts} seg="s03" />,
  nino: (ts) => <SectionV ts={ts} seg="s04" />,
  lluvias: (ts) => <LluviasScene ts={ts} />,
  inundacion: (ts) => <InundacionScene ts={ts} />,
  cierre: (ts) => <CierreScene ts={ts} />,
};

export const ShortNino: React.FC<{kind: ShortKind}> = ({kind}) => {
  const tl = DATA[kind];
  const T = useCurrentFrame() / tl.fps;
  const parts = tl.parts;
  const cut = (i: number) => (i === 0 ? -1 : parts[i].at - 0.15);
  let idx = 0;
  parts.forEach((p, i) => {
    if (T >= cut(i)) idx = i;
  });
  const p = parts[idx];
  const ts = T - p.at + p.from;
  const end = T >= tl.endCard - 0.1;
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {!end ? <AbsoluteFill key={p.id} style={{isolation: 'isolate'}}>{SCENE[p.id](ts, kind)}</AbsoluteFill> : <EndCardV t={T - tl.endCard + 0.1} kind={kind} />}
      <Captions T={T} kind={kind} />
      {/* marca y barra de progreso */}
      {!end && kind === 'yt' ? (
        <div style={{position: 'absolute', left: 60, top: 64, display: 'flex', alignItems: 'center', gap: 14, opacity: 0.95}}>
          <Img src={staticFile('brand/logo_transparente.png')} style={{width: 64, height: 64, objectFit: 'contain'}} />
          <div style={{fontFamily: F.head, fontSize: 40, color: '#fff', letterSpacing: 3}}>CONTEXTO</div>
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 0, top: 0, height: 10, width: `${clamp(T / tl.endCard) * 100}%`, background: N.yellow}} />
      {parts.slice(1).map((q, i) => (q.id === 'titulo' ? <Flash key={q.id} t={T} at={cut(i + 1)} color={N.amber} max={0.7} dur={0.6} /> : <VWipe key={q.id} t={T} at={cut(i + 1)} />))}
      <Grain opacity={0.04} />
    </AbsoluteFill>
  );
};

export const SHORT_TOTAL = (k: ShortKind) => DATA[k].total;
