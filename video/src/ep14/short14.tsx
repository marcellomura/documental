/* Short vertical (1080×1920) del episodio 14 (CAMPO DEL CIELO): el gancho de 1783 (la mesa de hierro, la pólvora y la
   desaparición), la caída de hace 4.000 años hasta el impacto, la grúa de 1990 y el cierre al video completo
   (ver tools/short_ep14.py). Mismo sistema visual que el episodio: el monte en capas, la masa de hierro 3D, Fraunces y
   Archivo condensada. */
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {LogoMark} from '../ep04/kit';
import short from '../data/ep14/short.json';
import words from '../data/ep14/words.json';
import wordsX from '../data/ep14/words_short.json';
import {cue as cueMain, ins} from './lib';
import {K, ar, fr, jm, mix, clamp, easeIn, easeInOut, easeOut, pop, prog, fadeIO, Defs14, NightSky, Vignette, Title14, Kicker14, YearRoll, Stat14, SearchHUD, FilmLook} from './kit14';
import {MonteBackdrop, ForeGrass, CraneTruck, PoliceCar, Truck, type Mood} from './art14';
import {Streak} from './shots14';
import {Map14, PT} from './map14';
import {Stage14, SkyLights, Ground, IronMass, MESON, ContactShadow, Blast, Earth, Meteor, Fragments, IronRain, Stars3D, horizonY, project, camPath, type Cam, type V3, type Drop} from './three14';
import {globeRot} from '../ep06/three6';
import {rnd} from '../lib/anim';

const VW = 1080, VH = 1920;
const SC = VH / 1080; // escala de los fondos pensados en 1920×1080 para cubrir el alto vertical
type Part = {id: string; seg: string; from: number; to: number; at: number};
const TL = short as unknown as {fps: number; parts: Part[]; cta: number; total: number};
type Wd = {w: string; s: number; e: number};
const WS = {...(words as Record<string, Wd[]>), ...(wordsX as Record<string, Wd[]>)};
const P = Object.fromEntries(TL.parts.map((p) => [p.id, p])) as Record<string, Part>;
const cue = (seg: string, phrase: string, n = 0) => (seg === 'x01' ? WS.x01.find((w) => w.w.toLowerCase().startsWith(phrase.toLowerCase()))!.s : cueMain(seg, phrase, n));
/** un fondo de 1920×1080 escalado para cubrir el cuadro vertical, centrado en fx (px del fondo) */
const Cover: React.FC<{fx?: number; children: React.ReactNode}> = ({fx = 960, children}) => (
  <div style={{position: 'absolute', left: VW / 2 - fx * SC, top: 0, width: 1920, height: 1080, transform: `scale(${SC})`, transformOrigin: '0 0'}}>{children}</div>
);

/* ---------- subtítulos palabra por palabra (con cifras) ---------- */
const NUMS: [string, string][] = [['mil setecientos ochenta y tres,', '1783,'], ['dos metros y medio', '2,5 metros'], ['catorce', '14'], ['cuarenta mil', '40.000'], ['Veintiuno', '21'], ['mil novecientos noventa.', '1990.']];
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
  const s = '#03040A';
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: y, textAlign: 'center', transform: `scale(${0.88 + 0.12 * k})`}}>
      {c.words.map((w, i) => {
        const on = T >= w.s - 0.03 && T < w.e + 0.15;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', margin: '0 12px', lineHeight: 1.1, textTransform: 'uppercase', ...ar(96, 800, on ? K.ember : '#FFFFFF', 88, 0.0),
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

/* ---------- la mesa en el monte, en vertical ---------- */
const yawOf = (c: Cam) => Math.atan2(c.look[0] - c.pos[0], -(c.look[2] - c.pos[2]));
const VSlab: React.FC<{t: number; cam: Cam; mood: Mood; slabO?: number; slabRot?: V3; dig?: number; blast?: number; lantern?: {pos: V3; k: number}; outline?: number; children?: React.ReactNode}> = ({
  t, cam, mood, slabO = 1, slabRot = [0.04, 0.5, -0.03], dig = 0, blast, lantern, outline = 0, children,
}) => {
  const hy = horizonY(cam, VH);
  const pan = yawOf(cam) * 1400;
  const lp = lantern ? project(cam, lantern.pos, VW, VH) : null;
  const ring = outline > 0 ? Array.from({length: 48}, (_, i) => {
    const a = (i / 48) * Math.PI * 2;
    return project(cam, [Math.cos(a) * 1.35, 0.02, Math.sin(a) * 1.1], VW, VH);
  }) : [];
  return (
    <AbsoluteFill style={{background: K.void}}>
      <Cover>
        <MonteBackdrop t={t} mood={mood} horizon={hy / SC} pan={pan / SC} />
      </Cover>
      <Stage14 cam={cam} exposure={1.05} env={0.25} w={VW} h={VH}>
        <SkyLights mood={mood} />
        <Ground tint={mood === 'night' ? '#4A4F66' : '#6E6470'} dig={dig} />
        {slabO > 0.01 ? (
          <>
            <ContactShadow w={4.6} d={3.8} rot={slabRot[1]} o={slabO} />
            <IronMass shape={MESON} pos={[0, 0.12, 0]} rot={slabRot} o={slabO} />
          </>
        ) : null}
        {lantern && lantern.k > 0 ? <pointLight position={lantern.pos} intensity={9 * lantern.k * (0.92 + 0.08 * Math.sin(t * 13) * Math.sin(t * 7.3))} distance={14} decay={1.6} color="#FFB060" /> : null}
        {blast !== undefined ? <Blast t={t} t0={blast} pos={[0.3, 0, 0.9]} s={1} /> : null}
      </Stage14>
      {lp && lantern && lantern.k > 0 ? (
        <div style={{position: 'absolute', left: lp[0] - 240, top: lp[1] - 240, width: 480, height: 480, borderRadius: 240, background: 'radial-gradient(circle, rgba(255,190,110,0.32) 0%, rgba(255,150,60,0.1) 40%, rgba(0,0,0,0) 70%)', opacity: lantern.k}} />
      ) : null}
      {outline > 0 ? (
        <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0}}>
          <path d={ring.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + 'Z'} fill="none" stroke={K.ember} strokeWidth={4} strokeDasharray="12 14" opacity={outline} />
        </svg>
      ) : null}
      <div style={{position: 'absolute', left: VW / 2 - 960 * 1.25, top: VH - 1080 * 1.25, width: 1920, height: 1080, transform: 'scale(1.25)', transformOrigin: '0 0'}}>
        <ForeGrass t={t} pan={pan} color={mood === 'golden' ? '#1A140E' : '#06050A'} />
      </div>
      {children}
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- 1 · el gancho (1783) ---------- */
const Gancho: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s01', p, n);
  const tCielo = c('Esa mesa había'), tCavar = c('El oficial hizo'), tVuelta = c('la dio vuelta'), tBoom = ins('s01', 1) + 0.05, tFue = c('Después se fue'), tNadie = c('Y desde ese');
  const tMesa = c('una mesa de hierro'), tTon = c('Pesaba unas');
  const cam: Cam = camPath(s, [
    [-3, {pos: [5.5, 3.6, 9.5], look: [0, 4.5, -20], fov: 62}],
    [-0.4, {pos: [4.6, 1.7, 8.0], look: [0, 0.4, 0], fov: 60}],
    [tMesa - 0.6, {pos: [3.2, 1.4, 5.2], look: [0, 0.3, 0], fov: 56}],
    [tTon, {pos: [2.6, 1.15, 4.0], look: [0, 0.25, 0], fov: 54}],
    [tCielo - 0.2, {pos: [2.8, 1.2, 4.2], look: [-5, 11, -14], fov: 64}],
    [tCavar - 0.3, {pos: [4.0, 2.0, 6.2], look: [0, 0.4, 0], fov: 58}],
    [tFue, {pos: [5.0, 2.3, 8.0], look: [0, 0.5, 0], fov: 60}],
  ], 2.2);
  const lift = prog(s, tVuelta, 1.2, easeInOut) * (1 - prog(s, tBoom, 0.35, easeIn) * 0.6);
  const lanternK = prog(s, c('un oficial español') - 0.3, 1.2) * (1 - prog(s, tFue + 0.2, 1.6));
  const lanternX = mix(-6, -1.8, prog(s, c('un oficial español') - 0.3, 3, easeOut)) + mix(0, 8, prog(s, tFue + 0.2, 2.4, easeIn));
  return (
    <AbsoluteFill>
      <VSlab t={s} cam={cam} mood={s > tNadie ? 'night' : 'dusk'} slabO={1 - prog(s, tNadie + 1.2, 1.6, easeInOut)} slabRot={[0.04 + lift * 0.22, 0.5, -0.03]}
        dig={prog(s, tCavar, 1.5)} blast={tBoom} lantern={{pos: [lanternX, 0.9, 1.6], k: lanternK}} outline={prog(s, tNadie + 1.6, 0.8)}>
        <Streak t={s} t0={tCielo + 1.2} dur={1.6} x0={80} y0={260} x1={900} y1={760} w={1.5} flash />
      </VSlab>
      <AbsoluteFill style={{background: '#FFE7C4', opacity: clamp(1 - Math.abs(s - tBoom - 0.05) / 0.2) * 0.7}} />
      <YearRoll t={s} t0={-0.1} t1={c('un oficial español') + 0.6} text="1783" x={540} y={420} size={250} />
      <Kicker14 t={s} t0={c('en el medio del monte')} t1={c('un oficial español') + 0.6} text="El monte chaqueño" x={540} y={600} align="center" size={30} />
      <Stat14 t={s} t0={tTon + 0.25} t1={tCielo - 0.1} x={540} y={300} value={14} label="Pesaba unas" suffix="toneladas" size={190} align="center" w={1000} />
      <Title14 t={s} t0={tCielo + 0.1} t1={ins('s01', 0) + 0.7} text={'Había caído\ndel cielo'} size={120} x={540} y={380} maxW={1000} italic w0={250} w1={480} />
      <Title14 t={s} t0={c('y le puso pólvora') + 0.3} t1={tBoom + 0.8} text="Pólvora." size={170} x={540} y={420} maxW={1000} italic w0={400} w1={720} hot={0.6} />
      <SearchHUD t={s} t0={tNadie + 1.4} x={1870} y={170} />
    </AbsoluteFill>
  );
};

/* ---------- 2 · la caída (hace 4.000 años) ---------- */
const Caida: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s02', p, n);
  const tBloque = c('Un bloque'), tChoca = c('choca contra'), tParte = c('lo parte'), tLluvia = c('Y una lluvia');
  const T_IMP = ins('s02', 1) + 0.1;
  const k = clamp((s - tBloque + 1) / (tLluvia - tBloque + 1));
  const kk = easeInOut(k);
  const mPos: V3 = [mix(-2.6, 0.4, kk), mix(5.2, 0.6, kk), mix(2, 3, k)];
  const heat = prog(s, tChoca - 0.3, 1.6);
  const camS: Cam = {pos: [0, mix(1.0, 0.4, k), mix(16, 12, kk)], look: [mix(-0.6, 0.2, kk), mix(2.4, -0.6, kk), 1], fov: 60};
  const drops: Drop[] = Array.from({length: 22}, (_, i) => ({x: -30 + rnd(i * 3) * 60 + (i === 0 ? 30 : 0), z: -50 - rnd(i * 7) * 50, at: T_IMP - 1.4 + (i === 0 ? 1.4 : rnd(i * 11) * 2.2), s: i === 0 ? 2.4 : 0.6 + rnd(i * 5) * 0.9}));
  const ground = s > tLluvia - 0.3;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {!ground || s < tLluvia + 0.2 ? (
        <AbsoluteFill>
          <Stage14 cam={camS} env={0} w={VW} h={VH}>
            <ambientLight intensity={0.06} />
            <Stars3D />
            <Earth r={6.5} pos={[0.6, -8.6, -3]} rot={globeRot(-60, -52)} sun={[-1, 0.6, 0.5]} />
            {s < tParte + 0.1 ? <Meteor pos={mPos} vel={[0.45, -0.85, 0.15]} s={mix(0.9, 0.65, heat)} heat={heat} trail={heat} t={s} /> : null}
            {s >= tParte ? <Fragments t={s} t0={tParte} base={mPos} vel={[0.45, -0.85, 0.15]} n={14} s={0.6} spread={1.2} /> : null}
          </Stage14>
          <Kicker14 t={s} t0={tBloque + 0.1} t1={tChoca} text="Hace 4.000 años" x={540} y={260} align="center" size={34} />
          <Stat14 t={s} t0={c('cuarenta mil') - 0.3} t1={c('El aire lo')} x={540} y={240} value={40000} label="Velocidad de entrada" suffix="km/h" size={170} align="center" w={1000} color={K.fire} dur={1.4} />
        </AbsoluteFill>
      ) : null}
      {ground ? (
        <AbsoluteFill style={{opacity: prog(s, tLluvia - 0.3, 0.4)}}>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, #03050C 0%, #0D1428 60%, #1A1A24 100%)'}} />
          <NightSky t={s} milky={0.5} horizon={0} w={VW} h={VH} />
          <Stage14 cam={{pos: [0, 2.2, 22], look: [3, 9 - prog(s, T_IMP - 0.6, 0.8) * 7, -40], fov: 66}} env={0.2} fog={['#0E1322', 30, 200]} w={VW} h={VH}>
            <SkyLights mood="night" />
            <Ground r={160} tint="#3A3F52" />
            <IronRain t={s} drops={drops} len={70} />
          </Stage14>
          <AbsoluteFill style={{background: '#FFE3B8', opacity: clamp(1 - Math.abs(s - T_IMP - 0.06) / 0.25) * 0.75}} />
          <Title14 t={s} t0={tLluvia + 0.1} t1={T_IMP - 0.1} text={'Una lluvia\nde hierro'} size={130} x={540} y={420} maxW={1000} italic w0={260} w1={520} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- 3 · la grúa de 1990 ---------- */
const Grua: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s06', p, n);
  const tVein = c('Veintiuno de enero'), tPol = c('La policía'), tCam = c('En el camión');
  const fx = mix(560, 1560, prog(s, tPol + 1.0, tCam - tPol, easeInOut));
  const zoom = 1 + prog(s, tCam - 0.2, 1.2, easeInOut) * 0.35;
  return (
    <AbsoluteFill style={{background: K.void}}>
      {s < tVein + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(s, tVein, 0.3)}}>
          <Img src={staticFile('ep14/img/piguen2.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '28% 50%', transform: `scale(${1.1 + 0.03 * (s - 16)})`, filter: 'saturate(0.8) contrast(1.06) brightness(0.8)'}} />
          <AbsoluteFill style={{background: 'rgba(120,0,0,0.35)', mixBlendMode: 'multiply'}} />
          <Title14 t={s} t0={c('Y alguien') - 0.05} text={'Y alguien\nla quiere.'} size={140} x={540} y={420} maxW={1000} italic w0={280} w1={540} />
        </AbsoluteFill>
      ) : null}
      {s > tVein - 0.3 && s < tPol + 0.3 ? (
        <AbsoluteFill style={{opacity: prog(s, tVein - 0.3, 0.3) * (1 - prog(s, tPol, 0.3))}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 80% at 50% 50%, #0E1526 0%, #03050A 100%)'}} />
          <Cover>
            <Map14 t={s} view={{lon: -61.74, lat: -27.57, scale: 70000}} style="modern" gridO={0.6} provO={0.8} riverO={0.4} border={{o: 0.9, p: prog(s, c('Paraje La Tota') + 0.5, 1.2), color: K.ember}}
              marks={[{at: PT['La Tota'], label: 'Paraje La Tota', o: prog(s, c('Paraje La Tota'), 0.5), kind: 'pin', pulse: 1, color: K.red}, {at: PT.Gancedo, label: 'Gancedo', o: prog(s, c('Paraje La Tota') - 0.2, 0.5), kind: 'dot'}]} />
          </Cover>
          {/* el límite cruza toda la pantalla: abajo se oscurece para que no pase por encima de los subtítulos */}
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(3,5,10,0) 58%, rgba(3,5,10,0.9) 78%)'}} />
          <YearRoll t={s} t0={tVein - 0.1} text="21.01.1990" x={540} y={380} size={120} mono />
        </AbsoluteFill>
      ) : null}
      {s > tPol - 0.3 ? (
        <AbsoluteFill style={{opacity: prog(s, tPol - 0.3, 0.3)}}>
          <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '50% 45%'}}>
            <AbsoluteFill style={{background: 'linear-gradient(180deg, #02040A 0%, #0A1022 52%, #120F0C 53%, #070605 100%)'}} />
            <Cover fx={fx}>
              <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
                <path d="M0 640 L1920 600 L1920 1080 L0 1080 Z" fill="#100C09" />
                <g opacity={prog(s, tPol + 0.6, 0.5)}><CraneTruck x={1180} y={690} s={0.9} arm={0.25} lights={1} /></g>
                <g opacity={prog(s, tPol + 1.2, 0.5)}>
                  <Truck x={1580} y={700} s={0.85} cargo={<path d="M-210 -120 C-200 -190 -120 -215 -40 -200 C20 -190 40 -150 30 -120 Z" fill="#4A4038" stroke="#8A6A4A" strokeWidth={2} />} />
                </g>
                <PoliceCar x={520} y={712} s={1} t={s} />
              </svg>
            </Cover>
          </div>
          <Kicker14 t={s} t0={c('patente de Tucumán') - 0.2} text="Patente de Tucumán" x={540} y={300} align="center" size={34} color={K.glow} />
          <Title14 t={s} t0={tCam + 0.1} text={'En el camión,\nel meteorito'} size={110} x={540} y={430} maxW={1000} italic w0={260} w1={520} />
          <FilmLook t={s} k={0.7} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- 4 · cierre ---------- */
const Cta: React.FC<{T: number; t0: number}> = ({T, t0}) => {
  const t = T - t0;
  const bob = Math.sin(t * 5) * 14;
  return (
    <AbsoluteFill>
      <NightSky t={t + 60} milky={1.3} horizon={0.6} w={VW} h={VH} />
      <Streak t={t} t0={-0.6} dur={0.75} x0={-160} y0={300} x1={620} y1={640} w={1.6} flash />
      <Title14 t={t} t0={0.0} text={'Campo\ndel Cielo'} size={190} x={540} y={600} maxW={1000} w0={300} w1={560} hot={1.4} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', ...ar(32, 650, K.mute, 82, 0.34), opacity: prog(t, 0.9, 0.6)}}>LA MESA DE HIERRO QUE NADIE ENCUENTRA</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, opacity: prog(t, 1.3, 0.5)}}>
        <LogoMark size={110} t={t} t0={1.3} />
        <div style={{...ar(40, 750, K.bone, 85, 0.12)}}>VIDEO COMPLETO EN EL CANAL</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', opacity: prog(t, cue('x01', 'Tocá') - 0.2, 0.3)}}>
        <div style={{display: 'inline-block', background: K.fire, padding: '18px 42px 14px', borderRadius: 14, ...ar(60, 800, '#fff', 88, 0.02)}}>TOCÁ EL ENLACE DE ABAJO</div>
        <div style={{...fr(190, 600, K.fire, 144, 0), lineHeight: 1, transform: `translateY(${bob}px)`, marginTop: 6}}>↓</div>
      </div>
      <SearchHUD t={t} t0={0.6} x={1870} y={170} />
    </AbsoluteFill>
  );
};

export const ShortCielo: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / TL.fps;
  const segT = (id: string) => T - P[id].at + P[id].from;
  const nextAt = (i: number) => (i + 1 < TL.parts.length ? TL.parts[i + 1].at : TL.total + 1);
  return (
    <AbsoluteFill style={{background: K.void}}>
      <Defs14 />
      {TL.parts.map((p, i) => {
        const a = p.at - 0.25, b = nextAt(i) - 0.1;
        if (T < a || T >= b) return null;
        const s = segT(p.id);
        const enter = i ? prog(T, a, 0.35) : 1;
        return (
          <AbsoluteFill key={p.id} style={{clipPath: i ? `circle(${enter * 1250}px at 50% 50%)` : undefined}}>
            {p.id === 'gancho' ? <Gancho s={s} /> : p.id === 'caida' ? <Caida s={s} /> : p.id === 'grua' ? <Grua s={s} /> : <Cta T={T} t0={p.at} />}
          </AbsoluteFill>
        );
      })}
      {T < TL.cta + cue('x01', 'Tocá') - 0.25 ? <Captions T={T} y={1400} /> : null}
    </AbsoluteFill>
  );
};
export const SHORT14_TOTAL = TL.total;
