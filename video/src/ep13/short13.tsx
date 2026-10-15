/* Short vertical (1080×1920) del episodio 13 (EL LOTE 31.202): el aviso de la inspección y las nueve barreras que
   atravesó el lote, «Sí, lo sé», «hoy quemamos todo», el equipo de hospital que se dio cuenta y el cierre al video
   completo (ver tools/short_ep13.py). Mismo sistema visual que el episodio: Geist, Geist Mono e Instrument Serif. */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Grain} from '../components/base';
import {LogoMark} from '../ep04/kit';
import short from '../data/ep13/short.json';
import words from '../data/ep13/words.json';
import wordsX from '../data/ep13/words_short.json';
import {cue as cueMain, cueE as cueEMain} from './lib';
import {
  K, F, gs, gm, mix, clamp, easeInOut, easeOut, pop, prog, rnd, fadeIO, ClinicBg, Kicker, Quote13, Stat13, DateRoll, ChatPanel, Recreation, Odo13, ramp, Vignette, Defs13, BurnAway,
} from './kit13';
import {StackView, travelZ, passed} from './stack13';
import {Stage13, Lights13, Ampoule, camPath, breathe, sliceZ} from './three13';
import type {Cam} from './three13';

const VW = 1080, VH = 1920;
type Part = {id: string; seg: string; from: number; to: number; at: number};
const TL = short as unknown as {fps: number; parts: Part[]; cta: number; total: number};
type Wd = {w: string; s: number; e: number};
const WS = {...(words as Record<string, Wd[]>), ...(wordsX as Record<string, Wd[]>)};
const P = Object.fromEntries(TL.parts.map((p) => [p.id, p])) as Record<string, Part>;
const cue = (seg: string, phrase: string, n = 0) => (seg === 'x01' ? WS.x01.find((w) => w.w.toLowerCase().startsWith(phrase.toLowerCase()))!.s : cueMain(seg, phrase, n));
const between = (t: number, a: number, b: number) => t >= a && t < b;
/** capa con fundido de entrada y salida */
const Layer: React.FC<{t: number; a: number; b: number; d?: number; children: React.ReactNode}> = ({t, a, b, d = 0.35, children}) => {
  const o = Math.min(prog(t, a, d), 1 - prog(t, b - d, d));
  if (t < a - 0.01 || t > b + 0.01 || o <= 0) return null;
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

/* ---------- subtítulos palabra por palabra (con cifras) ---------- */
const NUMS: [string, string][] = [
  ['veintisiete', '27'], ['dos mil veinticuatro,', '2024,'], ['dieciocho', '18'], ['noventa', '90'], ['nueve', '9'], ['veintiséis', '26'], ['catorce', '14'],
];
const key = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
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
      const punct = /[.,:;?!]$/.test(last) && !/[.,:;?!]$/.test(hit[1]) ? last.slice(-1) : '';
      out.push({w: hit[1] + punct, s: ws[i].s, e: ws[i + n - 1].e});
      i += n;
    } else out.push(ws[i++]);
  }
  return out;
};
const CHUNKS = (() => {
  const list: Wd[] = [];
  for (const p of TL.parts) for (const w of mergeNums(WS[p.seg])) if (w.s >= p.from - 0.01 && w.e <= p.to + 0.05) list.push({w: w.w, s: p.at + w.s - p.from, e: p.at + w.e - p.from});
  const out: {words: Wd[]; s: number; e: number}[] = [];
  let cur: Wd[] = [];
  list.forEach((w, i) => {
    cur.push(w);
    const txt = cur.map((x) => x.w).join(' ');
    if (cur.length >= 3 || /[.,:?!]$/.test(w.w) || txt.length > 15 || i === list.length - 1) {
      out.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = i < out.length - 1 ? Math.min(out[i + 1].s, c.e + 0.35) : c.e + 0.3));
  return out;
})();
const Captions: React.FC<{T: number; y: number}> = ({T, y}) => {
  const c = CHUNKS.find((x) => T >= x.s - 0.05 && T < x.e);
  if (!c) return null;
  const k = pop(T, c.s - 0.05, 1.4);
  const s = '#020607';
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: y, textAlign: 'center', transform: `scale(${0.88 + 0.12 * k})`}}>
      {c.words.map((w, i) => {
        const on = T >= w.s - 0.03 && T < w.e + 0.15;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', margin: '0 12px', lineHeight: 1.12, textTransform: 'uppercase', ...gs(90, 800, on ? K.cheese : '#FFFFFF', -0.02),
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

/** rótulo grande centrado que entra palabra por palabra */
const VTitle: React.FC<{t: number; t0: number; t1?: number; text: string; y: number; size?: number; color?: string; hl?: Record<string, string>}> = ({t, t0, t1 = Infinity, text, y, size = 110, color = K.bone, hl = {}}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: y, textAlign: 'center', opacity: o}}>
      {text.split('\n').map((line, li) => (
        <div key={li} style={{lineHeight: 1.0}}>
          {line.split(' ').map((w, wi) => {
            const p = prog(t, t0 + (li * 3 + wi) * 0.07, 0.45, easeOut);
            return (
              <span key={wi} style={{display: 'inline-block', margin: `0 ${size * 0.12}px`, opacity: p, transform: `translateY(${(1 - p) * size * 0.4}px)`, ...gs(size, 800, hl[w] ?? color, -0.03)}}>
                {w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ---------- 1 · el aviso y las nueve barreras ---------- */
const Gancho: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s01', p, n);
  const tOut = c('es cierto'), tIn = c('Ella le contesta'), tNight = c('Esa misma noche'), tTasks = c('dieciocho tareas'), tHide = c('para que nadie vea');
  const t3 = c('Tres semanas después'), t90 = c('noventa muertes'), tVena = c('Para llegar'), t9 = c('nueve barreras'), tAll = c('Las atravesó todas');
  const N = 9;
  // encuadres verticales calculados proyectando la pila (ver la búsqueda de cámara en el historial del episodio)
  const heroCam: Cam = {pos: [Math.sin(0.5 + (s - t3) * 0.1) * 3.9, 0.85, Math.cos(0.5 + (s - t3) * 0.1) * 3.9], look: [0, 0.5, 0], fov: 36};
  const camStack = camPath(s, [
    [tVena - 0.3, {pos: [0.7, 5.6, -14.6], look: [-0.15, 0, -1.8], fov: 38}],
    [tAll - 0.2, {pos: [0.5, 4.6, -12.6], look: [-0.15, 0, -0.6], fov: 38}],
    [tAll + 1.4, {pos: [0.4, 4.2, -11.4], look: [-0.1, 0, 0.6], fov: 38}],
  ], 1.4);
  const z = s < tAll ? travelZ(0, 0, 1, N) : travelZ(s, tAll + 0.05, 1.6, N);
  const pass = passed(z, N);
  return (
    <AbsoluteFill>
      <ClinicBg t={s} light={0.75} grid={0.5} w={VW} h={VH} alarm={between(s, t90, tVena) ? 0.5 : 0} />
      {/* el chat de la noche anterior */}
      <Layer t={s} a={-0.3} b={tNight + 0.1}>
        <DateRoll t={s} t0={0.05} text="27.11.2024" label="La noche anterior" x={540} y={330} size={128} labelColor={K.amber} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 450, textAlign: 'center', opacity: prog(s, 1.0, 0.5), ...gm(25, K.mute, 500, 0.14), lineHeight: 1.7}}>
          <div>
            <span style={{color: K.bone}}>DE:</span> ALGUIEN DE UN LABORATORIO
          </div>
          <div>
            <span style={{color: K.bone}}>PARA:</span> UNA FUNCIONARIA DEL ESTADO
          </div>
        </div>
        <ChatPanel
          t={s} t0={0.3} x={540} y={930} w={940} h={560} title="Funcionaria del Estado" sub="chat incorporado a la causa" avatar="F" date="27 de noviembre de 2024"
          msgs={[
            {side: 'out', text: 'Me comentaron que mañana van a ir a Ramallo', at: tOut},
            {side: 'in', text: 'Sí, es una inspección que deviene de reportes de productos', at: tIn + 0.1},
          ]}
        />
        <Recreation x={1870} y={1240} />
      </Layer>
      {/* esa noche: dieciocho tareas */}
      <Layer t={s} a={tNight - 0.15} b={t3 + 0.15}>
        <Kicker t={s} t0={tNight} text="Esa noche · grupo del laboratorio" x={540} y={300} color={K.amber} align="center" size={24} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 340, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 20, opacity: prog(s, tTasks - 0.45, 0.3)}}>
          <Odo13 value={ramp(s, tTasks - 0.3, 18, 1.4)} size={300} color={K.bone} />
          <span style={{...gs(84, 700, K.bone)}}>tareas</span>
        </div>
        {Array.from({length: 7}, (_, i) => {
          const p = prog(s, tTasks + i * 0.2, 0.4);
          return (
            <div key={i} style={{position: 'absolute', left: i % 2 ? 300 : 90, top: 740 + i * 82, opacity: p, transform: `translateY(${(1 - p) * 16}px)`}}>
              <div style={{background: i % 2 ? K.bubbleOut : K.bubbleIn, borderRadius: 20, padding: '16px 22px', width: 470 + rnd(i + 2) * 220, filter: `blur(${mix(0, 8, prog(s, tHide, 0.8))}px)`}}>
                <div style={{height: 13, width: '86%', background: 'rgba(236,243,241,0.6)', borderRadius: 3}} />
                <div style={{height: 13, width: `${40 + rnd(i) * 40}%`, background: 'rgba(236,243,241,0.4)', borderRadius: 3, marginTop: 8}} />
              </div>
            </div>
          );
        })}
      </Layer>
      {/* la ampolla del lote: noventa muertes */}
      <Layer t={s} a={t3 - 0.1} b={tVena + 0.3}>
        <Stage13 cam={heroCam} exposure={1.1} envKind="studio" env={1.0} w={VW} h={VH}>
          <Lights13 key0={[2, 5, 4]} keyI={2.4} rim={2.2} />
          <spotLight position={[0, 4, 0]} angle={0.5} penumbra={0.8} intensity={30} distance={10} color="#E9FFF9" />
          <Ampoule pos={[0, 0, 0]} rot={[0, s * 0.35, 0]} s={1} cloud={prog(s, t90, 1.2) * 0.35} glow={prog(s, t90, 1.0) * 0.4} studio />
        </Stage13>
        <Kicker t={s} t0={t3 + 0.2} text="Diciembre de 2024 · la planta de Ramallo" x={540} y={235} color={K.teal} align="center" size={23} />
        <Stat13 t={s} t0={t90 - 0.15} x={540} y={285} value={90} dur={1.0} label="Muertes que le atribuye la Justicia" color={K.red} valColor={K.red} size={230} w={1000} align="center" />
      </Layer>
      {/* la pila: nueve barreras, las atravesó todas */}
      <Layer t={s} a={tVena - 0.25} b={P.gancho.to - P.gancho.from + 0.6}>
        <StackView
          t={s} cam={breathe(camStack, s, 0.5)} n={N} w={VW} h={VH}
          state={(i) => {
            const appear = prog(s, tVena + 0.25 + i * 0.12, 0.5);
            const flash = i <= pass ? Math.max(0, 1 - (s - (tAll + 0.05 + ((i + 0.5) / N) * 1.6)) / 0.7) : 0;
            return {o: appear, open: 1, align: 1, glow: flash};
          }}
          traveler={{kind: 'ampoule', z, glow: 0.7, spin: s * 0.6, o: prog(s, tVena, 0.5)}}
          overlay={() => (
            <div style={{position: 'absolute', left: 0, right: 0, top: 185, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 22, opacity: prog(s, t9 - 0.2, 0.4)}}>
              <Odo13 value={ramp(s, t9 - 0.2, 9, 0.8)} size={230} color={K.cheese} />
              <span style={{...gs(84, 700, K.bone)}}>barreras</span>
            </div>
          )}
        />
      </Layer>
    </AbsoluteFill>
  );
};

/* ---------- 2 · «Sí, lo sé» ---------- */
const SiLoSe: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s08', p, n);
  const t26 = c('El veintiséis de febrero'), tPel = c('es peligroso'), tPers = c('Una persona que reporte'), tExp = c('Según el expediente'), tGuita = c('es un montón de guita'), tSe = c('sí, lo sé');
  return (
    <AbsoluteFill>
      <ClinicBg t={s} light={0.6} grid={0.5} w={VW} h={VH} alarm={s > tSe ? 0.7 : 0.15} />
      <DateRoll t={s} t0={t26 - 0.05} t1={tSe + 0.9} text="26.02.2025" label="Una técnica del INAME" x={540} y={300} size={128} labelColor={K.amber} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 395, textAlign: 'center', opacity: fadeIO(s, t26 + 0.6, tSe + 0.9, 0.4), ...gm(25, K.mute, 500, 0.16)}}>LE ESCRIBE A SU JEFA</div>
      <Kicker t={s} t0={tExp} t1={tSe + 0.9} text="Según el expediente" x={540} y={470} color={K.red} align="center" size={24} />
      <div style={{position: 'absolute', inset: 0, opacity: 1 - prog(s, tSe + 0.9, 0.5) * 0.85}}>
        <ChatPanel
          t={s} t0={t26 - 0.1} x={540} y={960} w={960} h={760} title="Gabriela Mantecón Fumadó" sub="Directora del INAME · chat de la causa" avatar="G" date="26 de febrero de 2025"
          msgs={[
            {side: 'out', text: 'Es peligroso.', at: tPel},
            {side: 'out', text: 'Una persona que reporte evento adverso o se muera, es nuestra responsabilidad.', at: tPers},
            {side: 'in', text: 'Es un montón de guita que está en la calle.', at: tGuita},
            {side: 'in', text: 'Sí, lo sé.', at: tSe},
          ]}
          focus={s > tSe + 0.3 ? 3 : -1}
        />
        <Recreation x={1870} y={1356} />
      </div>
      <Quote13 t={s} t0={tSe + 0.95} text="Sí, lo sé." by="Gabriela Mantecón Fumadó · directora del INAME · según el expediente" x={540} y={760} w={980} size={190} accent={K.red} />
    </AbsoluteFill>
  );
};

/* ---------- 3 · «hoy quemamos todo» ---------- */
const Quemamos: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s11', p, n);
  const tCat = c('El catorce de mayo'), tQuem = c('hoy quemamos todo');
  const burn = clamp((s - (cueEMain('s11', 'hoy quemamos todo') + 0.05)) / 1.0);
  return (
    <AbsoluteFill>
      <ClinicBg t={s} light={0.55} grid={0.5} w={VW} h={VH} alarm={0.25} />
      <DateRoll t={s} t0={tCat - 0.05} text="14.05.2025" label="Un empleado le escribe a una compañera" x={540} y={330} size={128} labelColor={K.amber} />
      <ChatPanel
        t={s} t0={tCat} x={540} y={900} w={900} h={460} title="Compañera de trabajo" sub="chat incorporado a la causa" avatar="C" date="14 de mayo de 2025"
        msgs={[{side: 'out', text: 'Hoy quemamos todo', at: tQuem}]} focus={s > tQuem + 0.3 ? 0 : -1} scale={1.08}
      />
      <Recreation x={1870} y={1170} />
      <BurnAway k={burn} t={s} w={VW} h={VH} id="burnshort" />
    </AbsoluteFill>
  );
};

/* ---------- 4 · la barrera que funcionó ---------- */
const Hospital: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s10', p, n);
  const tBarr = c('La barrera que funcionó'), tFue = c('Fue un equipo');
  const N = 9;
  const s0 = P.hospital.from;
  const k = easeInOut(clamp((s - s0) / 5.2));
  const cam: Cam = {pos: [mix(2.6, 1.7, k), mix(1.6, 1.1, k), sliceZ(N - 1, N) + mix(7.4, 6.2, k)], look: [0.25, mix(0.15, 0, k), sliceZ(N - 1, N) - 0.6], fov: 44};
  const tenth = prog(s, tBarr + 0.2, 0.8, easeOut);
  return (
    <AbsoluteFill>
      <ClinicBg t={s} light={0.6} grid={0.4} w={VW} h={VH} />
      <StackView
        t={s} cam={cam} n={N} w={VW} h={VH}
        state={() => ({o: 1, open: 1, align: 1, glow: 0.2})}
        tenth={{o: tenth, glow: 0.35 + 0.3 * prog(s, tFue, 0.6)}}
        traveler={{kind: 'ampoule', z: sliceZ(N - 1, N) + 0.62, glow: 0.8, spin: s * 0.5, o: 1}}
      />
      <Kicker t={s} t0={tBarr} text="La barrera que funcionó" x={540} y={290} color={K.teal} align="center" size={26} />
      <VTitle t={s} t0={tFue - 0.1} text={'HOSPITAL ITALIANO\nDE LA PLATA'} y={340} size={92} color={K.bone} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: F.serif, fontStyle: 'italic', fontSize: 50, color: K.mint, opacity: prog(s, tFue + 0.7, 0.5)}}>abril de 2025: un brote extraño</div>
    </AbsoluteFill>
  );
};

/* ---------- 5 · cierre ---------- */
const Cta: React.FC<{T: number; t0: number}> = ({T, t0}) => {
  const t = T - t0;
  const bob = Math.sin(t * 5) * 14;
  const items = [
    {at: cue('x01', 'Cuáles') + 0.1, n: '9', title: 'Las nueve barreras', sub: 'y cómo falló cada una'},
    {at: cue('x01', 'quién') + 0.05, n: '✎', title: 'Quién firmó y quién no', sub: 'los chats y las cartas de la causa'},
    {at: cue('x01', 'Justicia') - 0.3, n: '⚖', title: 'Qué dijo la Justicia', sub: 'procesados, detenidas y apelaciones'},
  ];
  return (
    <AbsoluteFill>
      <ClinicBg t={t + 40} light={0.7} grid={0.5} w={VW} h={VH} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, 0.05, 1)})`}}>
        <div style={{width: 940, padding: '40px 44px', background: 'rgba(4,10,11,0.88)', border: `1px solid ${K.line2}`, borderRadius: 26, boxShadow: '0 40px 90px rgba(0,0,0,0.6)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
            <LogoMark size={150} t={t} t0={0.1} />
            <div>
              <div style={{...gm(22, K.red, 600, 0.26)}}>EDICIÓN ESPECIAL</div>
              <div style={{...gs(84, 800, K.bone, -0.03), lineHeight: 1.0, marginTop: 6}}>EL LOTE 31.202</div>
              <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 42, color: K.mute, marginTop: 4}}>Nueve barreras, noventa muertes</div>
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
              position: 'absolute', left: 70, width: 940, top: 600 + i * 170, height: 146, display: 'flex', alignItems: 'center', gap: 28, padding: '0 28px', boxSizing: 'border-box',
              background: 'rgba(4,10,11,0.84)', border: `1px solid ${K.line2}`, borderLeft: `5px solid ${K.cheese}`, borderRadius: 16, opacity: q, transform: `translateX(${(1 - q) * 60}px)`,
            }}
          >
            <div style={{width: 96, height: 96, borderRadius: 14, background: 'rgba(242,193,78,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...gs(60, 800, K.cheese, 0), flexShrink: 0}}>{it.n}</div>
            <div>
              <div style={{...gs(50, 760, K.bone, -0.02), lineHeight: 1.05}}>{it.title}</div>
              <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 34, color: K.mute}}>{it.sub}</div>
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', opacity: prog(t, cue('x01', 'Tocá') - 0.2, 0.3)}}>
        <div style={{display: 'inline-block', background: K.cheese, color: K.ink, padding: '18px 42px 14px', borderRadius: 14, ...gs(62, 800, K.ink, -0.01)}}>TOCÁ EL ENLACE DE ABAJO</div>
        <div style={{...gs(190, 700, K.cheese, 0), lineHeight: 1, transform: `translateY(${bob}px)`, marginTop: 6}}>↓</div>
      </div>
    </AbsoluteFill>
  );
};

export const ShortLote: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / TL.fps;
  const segT = (id: string) => T - P[id].at + P[id].from;
  const nextAt = (i: number) => (i + 1 < TL.parts.length ? TL.parts[i + 1].at : TL.total + 1);
  return (
    <AbsoluteFill style={{background: K.void}}>
      <Defs13 />
      {TL.parts.map((p, i) => {
        const a = p.at - 0.25, b = nextAt(i) - 0.1;
        if (T < a || T >= b) return null;
        const s = segT(p.id);
        const enter = i ? prog(T, a, 0.35) : 1;
        return (
          <AbsoluteFill key={p.id} style={{clipPath: i ? `circle(${enter * 1250}px at 50% 50%)` : undefined}}>
            {p.id === 'gancho' ? <Gancho s={s} /> : p.id === 'silose' ? <SiLoSe s={s} /> : p.id === 'quemamos' ? <Quemamos s={s} /> : p.id === 'hospital' ? <Hospital s={s} /> : <Cta T={T} t0={p.at} />}
          </AbsoluteFill>
        );
      })}
      <Vignette k={0.4} />
      {T < TL.cta + cue('x01', 'Tocá') - 0.25 ? <Captions T={T} y={1430} /> : null}
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
export const SHORT13_TOTAL = TL.total;
