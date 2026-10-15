/* Short vertical (1080×1920) del episodio 5 (Tu reloj está mal) en tres versiones: YouTube Shorts, Reels de Instagram
   y TikTok. El cuerpo es el mismo (Mendoza y Ushuaia de noche, la hora de Brasilia, el jet lag social y la pregunta);
   cambia el cierre de cada plataforma (ver tools/short_ep05.py). Mismo sistema visual del episodio: Anton e Inter,
   globo con día y noche reales, relojes 3D y la transición de aguja de reloj. Lo importante queda entre y=200 y y=1500,
   fuera de los botones de las tres aplicaciones. */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Grain} from '../components/base';
import {F} from '../theme';
import {N, Ocean, Vignette, Headline, Flash, LogoMark} from '../ep04/kit';
import {PLACES} from '../ep04/argmap';
import {clamp, easeIn, easeInOut, easeOut, pop, prog, shake} from '../lib/anim';
import short from '../data/ep05/short.json';
import words from '../data/ep05/words.json';
import wordsX from '../data/ep05/words_short.json';
import {cue as cueMain} from './lib';
import {Globe5, subsolar, zoneBand, View5} from './globe5';
import {Clock3D, DAWN, FlipClock, Icon, NightSchool, SUN} from './art5';
import {ArgOnGlobe, Pin} from './scenes5a';

export type Variant = 'yt' | 'ig' | 'tt';
const VW = 1080, VH = 1920;
type Part = {id: string; seg: string; from: number; to: number; at: number};
const TL = short as unknown as {fps: number; parts: Part[]; cta: number; variants: Record<Variant, {seg: string; dur: number; total: number}>};
type Wd = {w: string; s: number; e: number};
const WS = {...(words as Record<string, Wd[]>), ...(wordsX as Record<string, Wd[]>)};
const P = Object.fromEntries(TL.parts.map((p) => [p.id, p])) as Record<string, Part>;
const key = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
/** cue para los cierres (x01–x03): frase de una o más palabras */
const cueX = (seg: string, phrase: string) => {
  const list = WS[seg], tg = phrase.split(' ').map(key);
  for (let i = 0; i + tg.length <= list.length; i++) if (tg.every((t, k) => key(list[i + k].w) === t)) return list[i].s;
  throw new Error(`cue no encontrado: ${seg} "${phrase}"`);
};
const cue = (seg: string, phrase: string, n = 0) => (seg.startsWith('x') ? cueX(seg, phrase) : cueMain(seg, phrase, n));
const ramp = (t: number, a: number, b: number, e = easeInOut) => e(clamp((t - a) / (b - a)));
const hm = (h: number, m: number) => h * 60 + m;
const JUN21 = 172;
const LAST: Record<Variant, string> = {yt: 'Tocá', ig: 'El link', tt: 'buscá'};

/* ---------- subtítulos palabra por palabra ---------- */
const NUMS: [string, string][] = [['siete y media', '7:30'], ['diez', '10'], ['menos tres', '−3']];
const mergeNums = (ws: Wd[]) => {
  const out: Wd[] = [];
  for (let i = 0; i < ws.length; ) {
    const hit = NUMS.find(([a]) => {
      const toks = a.split(' ');
      return i + toks.length <= ws.length && toks.every((tk, k) => key(ws[i + k].w) === key(tk));
    });
    if (hit) {
      const n = hit[0].split(' ').length;
      const last = ws[i + n - 1].w;
      const punct = /[.,:;?!]$/.test(last) ? last.slice(-1) : '';
      out.push({w: hit[1] + punct, s: ws[i].s, e: ws[i + n - 1].e});
      i += n;
    } else out.push(ws[i++]);
  }
  return out;
};
const chunksFor = (v: Variant) => {
  const all = [...TL.parts, {id: 'cta', seg: TL.variants[v].seg, from: 0, to: TL.variants[v].dur, at: TL.cta}];
  const list: Wd[] = [];
  for (const p of all) for (const w of mergeNums(WS[p.seg])) if (w.s >= p.from - 0.01 && w.e <= p.to + 0.05) list.push({w: w.w, s: p.at + w.s - p.from, e: p.at + w.e - p.from});
  const out: {words: Wd[]; s: number; e: number}[] = [];
  let cur: Wd[] = [];
  list.forEach((w, i) => {
    cur.push(w);
    const txt = cur.map((x) => x.w).join(' ');
    if (cur.length >= 3 || /[.,:?!]$/.test(w.w) || txt.length > 14 || i === list.length - 1) {
      out.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = i < out.length - 1 ? Math.min(out[i + 1].s, c.e + 0.35) : c.e + 0.3));
  return out;
};
const CHUNKS: Record<Variant, ReturnType<typeof chunksFor>> = {yt: chunksFor('yt'), ig: chunksFor('ig'), tt: chunksFor('tt')};
const Captions: React.FC<{T: number; v: Variant; y: number}> = ({T, v, y}) => {
  const c = CHUNKS[v].find((x) => T >= x.s - 0.05 && T < x.e);
  if (!c) return null;
  const k = pop(T, c.s - 0.05, 1.4);
  const s = '#02060C';
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: y, textAlign: 'center', transform: `scale(${0.88 + 0.12 * k})`}}>
      {c.words.map((w, i) => {
        const on = T >= w.s - 0.03 && T < w.e + 0.15;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', margin: '0 12px', fontFamily: F.head, fontSize: 96, lineHeight: 1.08, textTransform: 'uppercase', letterSpacing: 1, color: on ? SUN : '#FFFFFF',
              textShadow: `5px 5px 0 ${s}, -5px -5px 0 ${s}, 5px -5px 0 ${s}, -5px 5px 0 ${s}, 0 5px 0 ${s}, 5px 0 0 ${s}, -5px 0 0 ${s}, 0 -5px 0 ${s}, 0 16px 30px rgba(0,0,0,0.6)`,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- transición de aguja de reloj, en vertical ---------- */
const VClockWipe: React.FC<{t: number; at: number; colors: [string, string, string]; dur?: number; ccw?: boolean}> = ({t, at, colors, dur = 1.1, ccw = false}) => {
  const k = (t - (at - dur / 2)) / dur;
  if (k <= 0 || k >= 1) return null;
  const cx = 540, cy = 960, R = 1180, sg = ccw ? -1 : 1, rad = Math.PI / 180;
  const pt = (a: number, r = R) => `${(cx + sg * r * Math.sin(a * rad)).toFixed(1)} ${(cy - r * Math.cos(a * rad)).toFixed(1)}`;
  const wedge = (a0: number, a1: number) => {
    if (a1 - a0 < 0.2) return '';
    const pts = [`M ${cx} ${cy}`];
    for (let a = a0; a < a1; a += 3) pts.push(`L ${pt(a)}`);
    pts.push(`L ${pt(a1)} Z`);
    return pts.join(' ');
  };
  const L = [0, 1, 2].map((i) => ({a1: 360 * easeInOut(clamp((k - i * 0.05) / 0.38)), a0: 360 * easeInOut(clamp((k - 0.5 - (2 - i) * 0.05) / 0.38))}));
  const hand = k < 0.5 ? L[0].a1 : L[0].a0;
  const face = Math.sin(k * Math.PI);
  return (
    <svg width={VW} height={VH} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {L.map((l, i) => (
        <path key={i} d={wedge(l.a0, l.a1)} fill={colors[i]} />
      ))}
      <g opacity={face * 0.55}>
        {Array.from({length: 12}).map((_, i) => (
          <line key={i} x1={cx + Math.sin(i * 30 * rad) * 330} y1={cy - Math.cos(i * 30 * rad) * 330} x2={cx + Math.sin(i * 30 * rad) * (i % 3 ? 360 : 390)} y2={cy - Math.cos(i * 30 * rad) * (i % 3 ? 360 : 390)} stroke="#fff" strokeWidth={i % 3 ? 5 : 10} strokeLinecap="round" />
        ))}
      </g>
      {hand > 0.5 && hand < 359.5 ? (
        <g>
          <line x1={cx} y1={cy} x2={cx + sg * R * Math.sin(hand * rad)} y2={cy - R * Math.cos(hand * rad)} stroke="#fff" strokeWidth={9} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={22} fill="#fff" />
          <circle cx={cx} cy={cy} r={9} fill={N.red} />
        </g>
      ) : null}
    </svg>
  );
};

const Center: React.FC<{y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({y, children, style}) => (
  <div style={{position: 'absolute', left: 60, right: 60, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', ...style}}>{children}</div>
);
const skyMix = (a: string, b: string, k: number) => {
  const pa = a.match(/\w\w/g)!.map((h) => parseInt(h, 16)), pb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',')})`;
};

/* ---------- 1 · Mendoza y Ushuaia de noche: tu reloj está mal ---------- */
const Gancho: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s01', p, n);
  const tSiete = c('siete'), tInv = c('invierno.'), tMiles = c('Miles'), tAfuera = c('afuera'), tSol = c('El sol'), tHora = c('hora.');
  const tUsh = c('En Ushuaia'), tDiez = c('diez.'), tYno = c('Y no,'), tCulpa = c('Es culpa', 1), tReloj = c('reloj.'), tPorque = c('Porque');
  const tZona = c('zona'), tTu = c('Tu reloj está'), tTodo = c('Y el de');
  let clock = hm(7, 30);
  if (s > tSol - 0.2 && s < tUsh - 0.4) clock = hm(7, 30) + (hm(8, 38) - hm(7, 30)) * ramp(s, tSol, tHora + 0.3);
  if (s >= tUsh - 0.4) clock = hm(7, 30) + (hm(9, 59) - hm(7, 30)) * ramp(s, tUsh - 0.2, tDiez + 0.1);
  const vA: View5 = {lon: -68.5 + 1.5 * ramp(s, -0.5, tMiles), lat: -33, r: 520 + 560 * ramp(s, -0.5, tMiles, easeOut), cx: 540, cy: 1180};
  const vD: View5 = {lon: -66 - 2 * ramp(s, tUsh, tDiez), lat: -46 - 6 * ramp(s, tUsh, tDiez), r: 900, cx: 540, cy: 1220};
  const vF: View5 = {lon: -56 + 4 * ramp(s, tPorque, tTu), lat: -26, r: 560, cx: 540, cy: 1060};
  const dawn = ramp(s, tSol, tHora + 0.4);
  const ex = shake(s, tReloj, 16, 0.5);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {s < tMiles - 0.3 ? (
        <AbsoluteFill>
          <Ocean glow="rgba(20,40,90,0.4)" />
          <Globe5 view={vA} sun={subsolar(JUN21, clock / 60 + 3)} W={VW} H={VH}>
            {(proj, path) => (
              <>
                <ArgOnGlobe path={path} o={0.5} fill="rgba(0,0,0,0)" />
                <Pin proj={proj} lon={PLACES.Mendoza[0]} lat={PLACES.Mendoza[1]} t={s} t0={c('Mendoza.') - 0.2} label="MENDOZA" view={vA} />
              </>
            )}
          </Globe5>
          <Vignette k={0.6} />
          <Center y={250} style={{opacity: prog(s, tSiete - 0.3, 0.3), transform: `scale(${0.9 + 0.1 * pop(s, tSiete - 0.3)})`}}>
            <FlipClock t={s} value={() => hm(7, 30)} size={230} glow="rgba(255,90,60,0.35)" />
            <div style={{marginTop: 34, display: 'inline-block', background: N.cold, color: N.bg0, fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 5, padding: '8px 20px', opacity: prog(s, tInv - 0.3, 0.3), transform: `scale(${pop(s, tInv - 0.3)})`}}>
              21 DE JUNIO · INVIERNO
            </div>
          </Center>
        </AbsoluteFill>
      ) : null}
      {s >= tMiles - 0.3 && s < tUsh - 0.3 ? (
        <AbsoluteFill style={{opacity: prog(s, tMiles - 0.3, 0.4), background: skyMix('050A1A', '2A3E6E', dawn)}}>
          <div style={{position: 'absolute', left: -756, top: 462, width: 1920, height: 1080, transform: 'scale(1.35)', transformOrigin: 'top left'}}>
            <NightSchool t={s} dawn={dawn} kids={prog(s, tMiles, 1.2)} />
          </div>
          <Center y={210}>
            <FlipClock t={s} value={() => clock} size={150} label={s > tSol ? 'SALE EL SOL · 08:38' : 'MENDOZA'} />
          </Center>
          <Center y={560} style={{opacity: prog(s, tAfuera, 0.4) * (1 - prog(s, tSol - 0.3, 0.3))}}>
            <Headline t={s} t0={tAfuera} size={124} text="Afuera es de noche" style={{textShadow: '0 6px 30px rgba(0,0,0,0.7)', textAlign: 'center'}} />
          </Center>
          <Center y={540} style={{opacity: prog(s, tSol, 0.4)}}>
            <Headline t={s} t0={tSol} size={112} text="El sol sale una hora después" hl={['sol']} hlColor={SUN} style={{textShadow: '0 6px 30px rgba(0,0,0,0.7)', textAlign: 'center', width: 900}} />
          </Center>
        </AbsoluteFill>
      ) : null}
      {s >= tUsh - 0.3 && s < tYno - 0.2 ? (
        <AbsoluteFill>
          <Ocean glow="rgba(20,40,90,0.4)" />
          <Globe5 view={vD} sun={subsolar(JUN21, clock / 60 + 3)} W={VW} H={VH}>
            {(proj, path) => (
              <>
                <ArgOnGlobe path={path} o={0.45} fill="rgba(0,0,0,0)" />
                <Pin proj={proj} lon={-68.3} lat={-54.8} t={s} t0={tUsh} label="USHUAIA" view={vD} />
              </>
            )}
          </Globe5>
          <Vignette k={0.6} />
          <Center y={240}>
            <FlipClock t={s} value={() => clock} size={230} />
            <div style={{marginTop: 30, fontFamily: F.head, fontSize: 84, color: SUN, opacity: prog(s, tDiez - 0.2, 0.3), textShadow: '0 6px 24px rgba(0,0,0,0.7)'}}>AMANECE 09:59</div>
          </Center>
        </AbsoluteFill>
      ) : null}
      {s >= tYno - 0.2 && s < tPorque - 0.3 ? (
        <AbsoluteFill>
          <Ocean glow="rgba(226,59,46,0.14)" />
          <div style={{position: 'absolute', left: 540 - 330, top: 300, transform: `translate(${ex.x}px,${ex.y}px)`}}>
            <Clock3D size={660} minutes={hm(7, 30) + (s > tCulpa ? (s - tCulpa) * 400 : 0)} rx={12 + Math.sin(s * 0.8) * 8} ry={-22 + Math.sin(s * 0.6) * 18} crack={prog(s, tReloj - 0.1, 0.2)} glowColor={s > tReloj ? 'rgba(226,59,46,0.6)' : undefined} />
          </div>
          <Center y={1060}>
            {s < tCulpa - 0.1 ? (
              <div style={{fontFamily: F.head, fontSize: 104, lineHeight: 1.05, color: N.text, opacity: prog(s, tYno, 0.3)}}>
                NO ES{' '}
                <span style={{position: 'relative', display: 'inline-block'}}>
                  EL INVIERNO
                  <span style={{position: 'absolute', left: -8, right: -8, top: '52%', height: 12, background: N.red, transformOrigin: 'left', transform: `scaleX(${prog(s, c('culpa del') + 0.2, 0.4)})`}} />
                </span>
              </div>
            ) : (
              <div style={{fontFamily: F.head, fontSize: 140, color: N.red, transform: `scale(${pop(s, tCulpa - 0.1)})`}}>ES TU RELOJ</div>
            )}
          </Center>
        </AbsoluteFill>
      ) : null}
      {s >= tPorque - 0.3 && s < tTu - 0.15 ? (
        <AbsoluteFill style={{opacity: prog(s, tPorque - 0.3, 0.4)}}>
          <Ocean glow="rgba(30,90,150,0.3)" />
          <Globe5 view={vF} sun={subsolar(JUN21, 15)} dayOnly W={VW} H={VH}>
            {(proj, path) => {
              const a = prog(s, tPorque, 0.6);
              return (
                <>
                  <path d={path(zoneBand(-3)) ?? ''} fill={SUN} fillOpacity={0.28 * a} stroke={SUN} strokeWidth={3} opacity={a} />
                  <ArgOnGlobe path={path} o={prog(s, tPorque + 0.4, 0.6)} fill="rgba(116,172,223,0.25)" />
                  <Pin proj={proj} lon={-47.88} lat={-15.79} t={s} t0={tZona} label="BRASILIA" view={vF} />
                </>
              );
            }}
          </Globe5>
          <Vignette k={0.5} />
          <Center y={215}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: SUN, opacity: prog(s, tPorque, 0.4)}}>LA FRANJA QUE USAMOS: UTC−3</div>
            <div style={{marginTop: 22}}>
              <Headline t={s} t0={tPorque + 0.3} size={104} text="Ninguna ciudad argentina está adentro" hl={['Ninguna']} hlColor={N.red} style={{textAlign: 'center', width: 940, textShadow: '0 6px 24px rgba(0,0,0,0.6)'}} />
            </div>
          </Center>
        </AbsoluteFill>
      ) : null}
      {s >= tTu - 0.15 ? <VTitle s={s} t0={tTu - 0.15} tTodo={tTodo} /> : null}
      <Flash t={s} at={tTu - 0.15} color="#fff" max={0.6} dur={0.5} />
    </AbsoluteFill>
  );
};

const VTitle: React.FC<{s: number; t0: number; tTodo: number}> = ({s, t0, tTodo}) => {
  const k = s - t0;
  const glitch = k < 0.5 ? Math.sin(k * 90) * (1 - k / 0.5) * 18 : 0;
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(255,181,71,0.12)" grid={0.25} />
      {Array.from({length: 9}).map((_, i) => {
        const a = (i / 9) * Math.PI * 2 + k * 0.25;
        const x = 540 + Math.cos(a) * 470, y = 860 + Math.sin(a) * 640;
        const sz = 120 + (i % 3) * 40;
        return (
          <div key={i} style={{position: 'absolute', left: x - sz / 2, top: y - sz / 2, opacity: 0.5 * prog(s, tTodo - 0.2 + i * 0.05, 0.4)}}>
            <Clock3D size={sz} minutes={i * 97 + k * (60 + i * 30)} rx={20} ry={Math.cos(a) * 50} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 540 - 170, top: 250, opacity: 0.95}}>
        <Clock3D size={340} minutes={hm(12, 0) + k * 720} rx={10} ry={Math.sin(k * 1.4) * 25} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', transform: `translateX(${glitch}px) scale(${1.08 - 0.08 * easeOut(clamp(k / 0.6))})`}}>
        <div style={{fontFamily: F.head, fontSize: 230, lineHeight: 1, color: N.text, letterSpacing: 4}}>TU RELOJ</div>
        <div style={{fontFamily: F.head, fontSize: 230, lineHeight: 1, color: N.red, letterSpacing: 4, textShadow: glitch ? `${-glitch}px 0 0 #00E5FF, ${glitch}px 0 0 ${SUN}` : undefined}}>ESTÁ MAL</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1220, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 10, color: N.mute, opacity: prog(s, tTodo, 0.5)}}>Y EL DE TODO EL PAÍS</div>
    </AbsoluteFill>
  );
};

/* ---------- 2 · usamos la hora de Brasilia ---------- */
const Adelantados: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s04', p, n);
  const tMenos = c('Menos'), tBras = c('Brasilia,'), tDiez = c('diez'), tViv = c('vivimos'), tCord = c('cordillera,');
  const view: View5 = {lon: -60, lat: -27, r: 700, cx: 600, cy: 1170};
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(30,90,150,0.3)" />
      <Globe5 view={view} sun={subsolar(80, 12 - view.lon / 15)} dayOnly W={VW} H={VH}>
        {(proj, path) => {
          const red = prog(s, tMenos - 0.2, 0.3);
          const blink = s > tMenos && s < tMenos + 1.2 ? 0.5 + 0.5 * Math.sin(s * 18) : 1;
          const pB = proj([-47.88, -15.79]), pA = proj([-58.38, -34.6]);
          return (
            <>
              <path d={path(zoneBand(-4)) ?? ''} fill={SUN} fillOpacity={0.18} stroke={SUN} strokeWidth={2} />
              <path d={path(zoneBand(-5)) ?? ''} fill={DAWN} fillOpacity={0.18} stroke={DAWN} strokeWidth={2} />
              <path d={path(zoneBand(-3)) ?? ''} fill={N.red} fillOpacity={0.32 * red * blink} stroke={N.red} strokeWidth={4} opacity={red} />
              <ArgOnGlobe path={path} fill="rgba(0,0,0,0.12)" />
              <Pin proj={proj} lon={-47.88} lat={-15.79} t={s} t0={tBras - 0.2} label="BRASILIA" view={view} dx={-170} />
              <Pin proj={proj} lon={-58.38} lat={-34.6} t={s} t0={tBras} label="BUENOS AIRES" view={view} dx={-250} />
              {pA && pB && s > tDiez - 0.2 ? (
                <g opacity={prog(s, tDiez - 0.2, 0.3)}>
                  <line x1={pA[0]} y1={pA[1] - 70} x2={pA[0] + (pB[0] - pA[0]) * prog(s, tDiez - 0.2, 0.6)} y2={pA[1] - 70} stroke={SUN} strokeWidth={7} />
                  <text x={(pA[0] + pB[0]) / 2} y={pA[1] - 92} textAnchor="middle" fill={SUN} fontFamily="Anton" fontSize={50} style={{paintOrder: 'stroke'}} stroke="rgba(0,0,0,0.8)" strokeWidth={6}>
                    10° MÁS AL ESTE
                  </text>
                </g>
              ) : null}
            </>
          );
        }}
      </Globe5>
      <Vignette k={0.45} />
      <Center y={200}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 32, letterSpacing: 6, color: N.mute}}>LA HORA QUE USAMOS</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 26, marginTop: 4}}>
          <div style={{fontFamily: F.head, fontSize: 210, lineHeight: 1, color: N.red, transform: `scale(${pop(s, tMenos - 0.2)})`}}>UTC−3</div>
          <div style={{fontFamily: F.head, fontSize: 64, lineHeight: 1, color: N.text, textAlign: 'left', opacity: prog(s, tBras - 0.2, 0.3)}}>
            LA DE
            <br />
            BRASILIA
          </div>
        </div>
      </Center>
      <div style={{position: 'absolute', left: 0, right: 0, top: 540, display: 'flex', justifyContent: 'center', gap: 22}}>
        <span style={{display: 'inline-block', background: SUN, color: N.bg0, fontFamily: F.head, fontSize: 72, padding: '4px 22px', opacity: prog(s, tViv - 0.2, 0.3), transform: `scale(${pop(s, tViv - 0.2)})`}}>+1 HORA</span>
        <span style={{display: 'inline-block', background: DAWN, color: N.bg0, fontFamily: F.head, fontSize: 72, padding: '4px 22px', opacity: prog(s, tCord - 0.2, 0.3), transform: `scale(${pop(s, tCord - 0.2)})`}}>+2 CORDILLERA</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 3 · tu cuerpo lee la luz ---------- */
const Importa: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s07', p, n);
  const tImp = c('Importa,', 1), tNo = c('no lee'), tLee = c('lee la luz');
  const sun = ramp(s, tLee - 0.4, tLee + 1.2, easeOut);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(78,168,222,0.14)" />
      {/* el sol que sube detrás */}
      <div style={{position: 'absolute', left: 540 - 700, top: 1500 - 560 * sun, width: 1400, height: 1400, borderRadius: 700, background: `radial-gradient(circle, rgba(255,214,140,${0.95 * sun}) 0%, rgba(255,181,71,${0.6 * sun}) 18%, rgba(255,122,69,${0.22 * sun}) 40%, rgba(0,0,0,0) 66%)`}} />
      <Center y={640} style={{opacity: 1 - prog(s, tImp - 0.2, 0.3)}}>
        <div style={{fontFamily: F.head, fontSize: 170, lineHeight: 1, color: N.text, transform: `scale(${0.9 + 0.1 * pop(s, -0.1)})`}}>¿Y QUÉ IMPORTA?</div>
      </Center>
      <Center y={300} style={{opacity: prog(s, tImp + 0.3, 0.3)}}>
        <Headline t={s} t0={tImp + 0.4} size={124} text="Tu cuerpo no lee el reloj" hl={['no']} hlColor={N.red} style={{textAlign: 'center', width: 900}} />
        <div style={{marginTop: 60, fontFamily: F.head, fontSize: 200, lineHeight: 1, color: SUN, opacity: prog(s, tLee - 0.1, 0.3), transform: `scale(${pop(s, tLee - 0.1)})`, textShadow: '0 10px 40px rgba(0,0,0,0.45)'}}>LEE LA LUZ</div>
      </Center>
      {s > tNo ? <div style={{position: 'absolute', left: 540 - 90, top: 980, opacity: prog(s, tNo, 0.3) * (1 - prog(s, tLee - 0.2, 0.3))}}><Clock3D size={180} minutes={hm(7, 30) + s * 120} rx={10} ry={-20} crack={1} /></div> : null}
    </AbsoluteFill>
  );
};

/* ---------- 4 · jet lag social ---------- */
const JetLag: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s07', p, n);
  const tSi = c('Si'), tAdel = c('adelantada,'), tJet = c('jet lag permanente'), tSin = c('sin haberte'), tAvion = c('avión.'), tCient = c('Los científicos'), tSocial = c('jet lag social');
  const off = ramp(s, tAdel - 0.1, tAdel + 1.1);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {s < tSin - 0.2 ? (
        <AbsoluteFill>
          <Ocean glow="rgba(226,59,46,0.1)" grid={0.2} />
          <Center y={210}>
            <Headline t={s} t0={tSi} size={92} text="Si la hora oficial va adelantada..." hl={['adelantada...']} hlColor={N.red} style={{textAlign: 'center', width: 920}} />
          </Center>
          <div style={{position: 'absolute', left: 540 - 250, top: 470}}>
            <Clock3D size={500} minutes={hm(7, 0) + 60 * off} rx={12 + Math.sin(s * 0.8) * 6} ry={-18 + Math.sin(s * 0.6) * 14} glowColor={off > 0.5 ? 'rgba(226,59,46,0.45)' : undefined} />
          </div>
          <div style={{position: 'absolute', left: 780, top: 470, fontFamily: F.head, fontSize: 96, color: N.red, opacity: prog(s, tAdel + 0.6, 0.3), transform: `scale(${pop(s, tAdel + 0.6)})`}}>+1 H</div>
          <Center y={1010} style={{opacity: prog(s, tJet - 0.1, 0.3), transform: `scale(${pop(s, tJet - 0.1)})`}}>
            <div style={{fontFamily: F.head, fontSize: 130, lineHeight: 1, color: N.text}}>JET LAG</div>
            <div style={{fontFamily: F.head, fontSize: 130, lineHeight: 1, color: N.red}}>PERMANENTE</div>
          </Center>
        </AbsoluteFill>
      ) : s < tCient - 0.3 ? (
        <AbsoluteFill style={{opacity: prog(s, tSin - 0.2, 0.3)}}>
          <Ocean glow="rgba(78,168,222,0.12)" grid={0.2} />
          <Center y={240}>
            <div style={{fontFamily: F.head, fontSize: 124, lineHeight: 1.04, color: N.text, width: 900}}>SIN HABERTE SUBIDO NUNCA A UN AVIÓN</div>
          </Center>
          <div style={{position: 'absolute', left: 540 - 190, top: 760, width: 380, height: 380, opacity: prog(s, tAvion - 0.4, 0.3)}}>
            <Icon name="plane" size={380} color={N.text} />
            <svg width={380} height={380} style={{position: 'absolute', inset: 0}}>
              <circle cx={190} cy={190} r={168} fill="none" stroke={N.red} strokeWidth={22} opacity={prog(s, tAvion - 0.1, 0.2)} />
              <line x1={72} y1={308} x2={308} y2={72} stroke={N.red} strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray={`${prog(s, tAvion - 0.1, 0.3)} 1`} />
            </svg>
          </div>
          {s > tSin - 0.4 && s < tAvion + 1.2
            ? (() => {
                const k = ramp(s, tSin - 0.4, tAvion + 1.2, (x) => x);
                const x = -260 + k * 1600, y = 640 + Math.sin(k * 3) * 26;
                return (
                  <svg width={VW} height={VH} style={{position: 'absolute', inset: 0}}>
                    <line x1={Math.max(-260, x - 700)} y1={y + 18} x2={x - 50} y2={y} stroke="rgba(255,255,255,0.5)" strokeWidth={4} strokeDasharray="16 12" />
                    <g transform={`translate(${x - 50},${y - 50})`}>
                      <Icon name="plane" size={100} color="#fff" />
                    </g>
                  </svg>
                );
              })()
            : null}
        </AbsoluteFill>
      ) : (
        <AbsoluteFill>
          <Ocean glow="rgba(255,181,71,0.12)" />
          {Array.from({length: 9}).map((_, i) => (
            <div key={i} style={{position: 'absolute', top: 0, bottom: 0, left: ((i * 160 + (s - tCient) * 120) % 1440) - 160, width: 80, background: i % 2 ? 'rgba(255,181,71,0.05)' : 'rgba(78,168,222,0.05)'}} />
          ))}
          <Center y={380}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 40, letterSpacing: 10, color: N.mute, opacity: prog(s, tCient, 0.4)}}>LOS CIENTÍFICOS LO LLAMAN</div>
            {(() => {
              const g = s > tSocial && s < tSocial + 0.5 ? Math.sin((s - tSocial) * 80) * (1 - (s - tSocial) / 0.5) * 16 : 0;
              return (
                <div style={{marginTop: 40, opacity: prog(s, tSocial - 0.1, 0.2), transform: `scale(${1.25 - 0.25 * pop(s, tSocial - 0.1)}) translateX(${g}px)`}}>
                  <div style={{fontFamily: F.head, fontSize: 270, lineHeight: 1, color: N.text, textShadow: g ? `${-g}px 0 0 #00E5FF, ${g}px 0 0 ${N.red}` : undefined}}>JET LAG</div>
                  <div style={{fontFamily: F.head, fontSize: 270, lineHeight: 1, color: SUN}}>SOCIAL</div>
                </div>
              );
            })()}
          </Center>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ---------- 5 · la pregunta ---------- */
const Pregunta: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s10', p, n);
  const tPreg = c('La pregunta'), tMan = c('luz a la mañana'), tTarde = c('luz a la tarde'), tDej = c('Dejalo');
  const card = (i: number, t0: number, label: string, sub: string, grad: string, sunY: (k: number) => number, letter: string) => {
    const p = prog(s, tPreg + 0.25 + i * 0.2, 0.4);
    const on = prog(s, t0 - 0.15, 0.3);
    const k = clamp((s - t0) / 3);
    return (
      <div style={{position: 'absolute', left: 70, width: 940, top: 300 + i * 440, height: 400, borderRadius: 28, overflow: 'hidden', background: grad, opacity: p * (0.4 + 0.6 * on), filter: `saturate(${0.35 + 0.65 * on})`, transform: `translateY(${(1 - p) * 40}px) scale(${0.96 + 0.04 * pop(s, t0 - 0.15)})`, boxShadow: '0 30px 80px rgba(0,0,0,0.5)'}}>
        <div style={{position: 'absolute', left: 620, top: sunY(k), width: 220, height: 220, borderRadius: 110, background: 'radial-gradient(circle, #FFF3D1 0%, #FFD27A 45%, rgba(255,181,71,0) 72%)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, background: 'rgba(8,12,28,0.55)'}} />
        <div style={{position: 'absolute', left: 44, top: 44, width: 96, height: 96, borderRadius: 48, background: 'rgba(4,10,17,0.75)', color: '#fff', fontFamily: F.head, fontSize: 64, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{letter}</div>
        <div style={{position: 'absolute', left: 44, top: 168, fontFamily: F.head, fontSize: 112, lineHeight: 1, color: '#fff', textShadow: '0 6px 24px rgba(0,0,0,0.45)'}}>{label}</div>
        <div style={{position: 'absolute', left: 44, bottom: 22, fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: 'rgba(255,255,255,0.9)'}}>{sub}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(116,172,223,0.16)" grid={0.2} />
      <Center y={205} style={{opacity: prog(s, tPreg, 0.4)}}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 38, letterSpacing: 10, color: N.mute}}>¿VOS QUÉ PREFERÍS?</div>
      </Center>
      {card(0, tMan, 'LUZ A LA MAÑANA', 'AMANECE ANTES', 'linear-gradient(180deg, #3A5BA0 0%, #E8896A 70%, #FFC27A 100%)', (k) => 210 - 120 * k, 'A')}
      {card(1, tTarde, 'LUZ A LA TARDE', 'ANOCHECE MÁS TARDE', 'linear-gradient(180deg, #2A2F6B 0%, #8E4B7A 55%, #F08A4B 100%)', (k) => 90 + 120 * k, 'B')}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1170, textAlign: 'center', opacity: prog(s, tDej - 0.2, 0.3), transform: `scale(${pop(s, tDej - 0.2)})`}}>
        <span style={{display: 'inline-block', background: SUN, color: N.bg0, fontFamily: F.head, fontSize: 64, padding: '6px 30px', borderRadius: 12}}>COMENTÁ: ¿A O B?</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 6 · cierre de cada plataforma ---------- */
const Cta: React.FC<{T: number; v: Variant}> = ({T, v}) => {
  const t = T - TL.cta;
  const x = TL.variants[v].seg;
  const bob = Math.sin(t * 5) * 14;
  const tLast = cue(x, LAST[v]);
  const items = [
    {at: cue(x, 'Cómo') + 0.1, title: 'Cómo llegamos acá', sub: '1894, 1930, 1942, 1970… y el caos de 2008'},
    {at: cue(x, 'proyecto') - 0.1, title: 'El proyecto para atrasar el reloj', sub: 'lo que aprobó Diputados y el Senado no votó'},
  ];
  const typed = v === 'tt' ? 'CONTEXTO'.slice(0, Math.floor(clamp((t - tLast - 0.3) / 0.8) * 8)) : '';
  return (
    <AbsoluteFill>
      <Ocean glow="rgba(255,181,71,0.12)" grid={0.25} />
      <div style={{position: 'absolute', left: 540 - 420, top: 1100, opacity: 0.12}}>
        <Clock3D size={840} minutes={hm(7, 30) + t * 90} rx={8} ry={0} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, 0.05, 1)})`}}>
        <div style={{width: 940, padding: '38px 42px', background: 'rgba(4,10,17,0.88)', border: `1px solid ${N.line}`, borderRadius: 26, boxShadow: '0 40px 90px rgba(0,0,0,0.6)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
            <LogoMark size={150} t={t} t0={0.1} />
            <div>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 6, color: SUN}}>VIDEO COMPLETO</div>
              <div style={{fontFamily: F.head, fontSize: 82, lineHeight: 1, color: N.text, marginTop: 4, whiteSpace: 'nowrap'}}>
                TU RELOJ <span style={{color: N.red}}>ESTÁ MAL</span>
              </div>
              <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 32, color: N.mute, marginTop: 6}}>Por qué vivimos una hora adelantados</div>
            </div>
          </div>
        </div>
      </div>
      {items.map((it, i) => {
        const q = prog(t, it.at, 0.45);
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: 70, width: 940, top: 590 + i * 170, height: 146, display: 'flex', alignItems: 'center', gap: 26, padding: '0 28px', boxSizing: 'border-box',
              background: 'rgba(4,10,17,0.84)', border: `1px solid ${N.line}`, borderLeft: `6px solid ${SUN}`, borderRadius: 16, opacity: q, transform: `translateX(${(1 - q) * 60}px)`,
            }}
          >
            <div style={{width: 92, height: 92, borderRadius: 14, background: 'rgba(255,181,71,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <Clock3D size={70} minutes={i ? hm(10, 10) - t * 60 : hm(3, 0) + t * 60} rx={0} ry={0} />
            </div>
            <div>
              <div style={{fontFamily: F.head, fontSize: 46, lineHeight: 1.04, color: N.text}}>{it.title.toUpperCase()}</div>
              <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 28, color: N.mute}}>{it.sub}</div>
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', opacity: prog(t, tLast - 0.2, 0.3), transform: `scale(${0.9 + 0.1 * pop(t, tLast - 0.2)})`}}>
        {v === 'yt' ? (
          <>
            <div style={{display: 'inline-block', background: SUN, color: N.bg0, fontFamily: F.head, fontSize: 76, padding: '10px 40px', borderRadius: 14}}>TOCÁ EL ENLACE DE ABAJO</div>
            <div style={{fontFamily: F.head, fontSize: 220, color: SUN, lineHeight: 1, transform: `translateY(${bob}px)`, marginTop: 10}}>↓</div>
          </>
        ) : v === 'ig' ? (
          <>
            <div style={{display: 'inline-block', background: SUN, color: N.bg0, fontFamily: F.head, fontSize: 80, padding: '10px 40px', borderRadius: 14}}>EL LINK ESTÁ EN LA BIO</div>
            <div style={{marginTop: 34, display: 'inline-flex', alignItems: 'center', gap: 18, background: 'rgba(4,10,17,0.85)', border: `1px solid ${N.line}`, borderRadius: 999, padding: '14px 30px 14px 16px'}}>
              <LogoMark size={64} />
              <span style={{fontFamily: F.body, fontWeight: 800, fontSize: 36, color: N.text}}>@contexto.ar</span>
              <span style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: '#fff', background: N.red, borderRadius: 8, padding: '4px 12px'}}>YOUTUBE</span>
            </div>
          </>
        ) : (
          <>
            <div style={{display: 'inline-flex', alignItems: 'center', gap: 22, width: 820, height: 120, background: '#F4F1EA', borderRadius: 60, padding: '0 40px', boxSizing: 'border-box', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'}}>
              <svg width={56} height={56} viewBox="0 0 24 24">
                <circle cx={10} cy={10} r={7} fill="none" stroke="#161513" strokeWidth={2.6} />
                <line x1={15} y1={15} x2={21} y2={21} stroke="#161513" strokeWidth={2.6} strokeLinecap="round" />
              </svg>
              <span style={{fontFamily: F.head, fontSize: 72, color: '#161513', letterSpacing: 2}}>
                {typed}
                <span style={{opacity: Math.sin(t * 10) > 0 ? 1 : 0}}>|</span>
              </span>
            </div>
            <div style={{marginTop: 30}}>
              <span style={{display: 'inline-block', background: N.red, color: '#fff', fontFamily: F.head, fontSize: 70, padding: '8px 34px', borderRadius: 14}}>EN YOUTUBE</span>
            </div>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- armado ---------- */
const WIPES: Record<string, {colors: [string, string, string]; ccw?: boolean} | 'flash'> = {
  adelantados: {colors: [SUN, N.deep, N.bg1]},
  importa: {colors: [DAWN, '#5E4A1F', N.bg0], ccw: true},
  jetlag: 'flash',
  pregunta: {colors: ['#F08A4B', '#8E4B7A', '#2A2F6B']},
  cta: {colors: ['#74ACDF', N.deep, N.bg0]},
};
export const ShortReloj: React.FC<{v: Variant}> = ({v}) => {
  const frame = useCurrentFrame();
  const T = frame / TL.fps;
  const all = [...TL.parts.map((p) => p.id), 'cta'];
  const atOf = (id: string) => (id === 'cta' ? TL.cta : P[id].at);
  const sw = (i: number) => (i === 0 ? -1 : atOf(all[i]) - 0.2);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {all.map((id, i) => {
        const a = sw(i), b = i + 1 < all.length ? sw(i + 1) : TL.variants[v].total + 1;
        if (T < a || T >= b) return null;
        const s = id === 'cta' ? 0 : T - P[id].at + P[id].from;
        return (
          <AbsoluteFill key={id} style={{isolation: 'isolate'}}>
            {id === 'gancho' ? <Gancho s={s} /> : id === 'adelantados' ? <Adelantados s={s} /> : id === 'importa' ? <Importa s={s} /> : id === 'jetlag' ? <JetLag s={s} /> : id === 'pregunta' ? <Pregunta s={s} /> : <Cta T={T} v={v} />}
          </AbsoluteFill>
        );
      })}
      {all.slice(1).map((id, j) => {
        const w = WIPES[id];
        const at = sw(j + 1);
        return w === 'flash' ? <Flash key={id} t={T} at={at} color="#fff" max={0.5} dur={0.4} /> : <VClockWipe key={id} t={T} at={at} colors={w.colors} ccw={w.ccw} />;
      })}
      <Vignette k={0.35} />
      {T < TL.cta + cue(TL.variants[v].seg, LAST[v]) - 0.25 ? <Captions T={T} v={v} y={1290} /> : null}
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
export const SHORT05 = TL.variants;
