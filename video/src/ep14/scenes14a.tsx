/* Escenas 1 a 4 del episodio 14 (CAMPO DEL CIELO): el gancho de 1783, el título, la caída de hace 4.000 años y las
   expediciones coloniales hasta la voladura de Rubín de Celis. t = segundos desde el inicio del segmento. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {cue, cueE, ins, insEnd, T_IMP, T_BLAST, TITLE, HIT, TL} from './lib';
import {
  K, F, ar, fr, fell, jm, clamp, easeIn, easeInOut, easeOut, fadeIO, mix, pop, prog, rnd,
  NightSky, Parchment, Vignette, Kicker14, Title14, Quote14, Handwrite, YearRoll, Stat14, NameCard14, Stamp14, OldSheet, InkLines,
  SearchHUD, YearRibbon, Photo14, Plate14, Credit14, Source14, Letterbox,
} from './kit14';
import {CraneTruck, PoliceCar, Truck, FlintlockPistol, Volcano} from './art14';
import {SlabShot, Streak, CrossSection, CardRow} from './shots14';
import {Map14, Compass, PT, viewPath, smoothRoute, craterField, kmToDeg, type View} from './map14';
import {Stage14, Earth, Meteor, Fragments, IronRain, IronMass, ROCA, Stars3D, SkyLights, Ground, Blast, Glow, type Cam, type V3, type Drop} from './three14';
import {camPath, project} from './three14';
import {globeRot} from '../ep06/three6';
import {rnd as rr} from '../lib/anim';

type P = {t: number};
const st = TL.starts;

/* ================================================================== S01 · EL GANCHO (1783) */
export const S01: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s01', p, n);
  const tCielo = c('Esa mesa había'), tCavar = c('El oficial hizo'), tVuelta = c('la dio vuelta'), tPolv = c('y le puso pólvora');
  const tBoom = ins('s01', 1) + 0.05, tFue = c('Después se fue'), tNadie = c('Y desde ese'), tHist = c('En esta historia');
  const tPero = c('Pero la mesa'), tHace = c('Hace más de');
  const tMesa = c('una mesa de hierro'), tLargo = c('de dos metros'), tTon = c('Pesaba unas'), tFab = c('Nadie la había');
  // cámara: baja del cielo al monte, se acerca a la mesa, sube al cielo con la caída, vuelve, se aleja
  const cam: Cam = camPath(t, [
    [-3, {pos: [5.5, 3.2, 8.5], look: [0, 3.6, -20], fov: 38}],
    [-0.6, {pos: [5.2, 1.5, 7.6], look: [0, 0.3, 0], fov: 38}],
    [tMesa - 0.6, {pos: [3.6, 1.15, 4.6], look: [0, 0.25, 0], fov: 36}],
    [tTon, {pos: [2.7, 0.95, 3.3], look: [0, 0.2, 0], fov: 34}],
    [tCielo - 0.2, {pos: [2.9, 1.0, 3.5], look: [-6, 9, -14], fov: 42}],
    [tCavar - 0.3, {pos: [4.4, 1.7, 5.4], look: [0, 0.35, 0], fov: 36}],
    [tFue, {pos: [5.6, 1.9, 7.2], look: [0, 0.5, 0], fov: 38}],
    [tNadie + 0.6, {pos: [6.4, 2.6, 8.4], look: [0, 0.2, 0], fov: 38}],
  ], 2.2);
  // la mesa se levanta con las palancas y vuelve a caer con la voladura
  const lift = prog(t, tVuelta, 1.2, easeInOut) * (1 - prog(t, tBoom, 0.35, easeIn) * 0.6);
  const slabRot: V3 = [0.04 + lift * 0.22, 0.5, -0.03];
  const slabO = 1 - prog(t, tNadie + 1.2, 1.6, easeInOut);
  const lanternK = prog(t, c('un oficial español') - 0.3, 1.2) * (1 - prog(t, tFue + 0.2, 1.6));
  const lanternX = mix(-7, -1.8, prog(t, c('un oficial español') - 0.3, 3, easeOut)) + mix(0, 9, prog(t, tFue + 0.2, 2.4, easeIn));
  const showSlab = t < tHist + 1.0 || t > tPero - 0.8;
  const mood = t > tNadie ? 'night' : 'dusk';
  return (
    <AbsoluteFill style={{background: K.void}}>
      {t < -0.2 ? <NightSky t={t} milky={1} horizon={0} dy={(t + 2.6) * 40} o={prog(t, -2.6, 1.6)} /> : null}
      {t > -0.8 && showSlab ? (
        <AbsoluteFill style={{opacity: prog(t, -0.8, 0.9)}}>
          <SlabShot
            t={t} cam={cam} mood={mood} slabO={slabO} slabRot={slabRot} dig={prog(t, tCavar, 1.5)} blast={tBoom} shakeAt={tBoom}
            lantern={{pos: [lanternX, 0.9, 1.6], k: lanternK}} outline={t > tPero - 0.8 ? prog(t, tPero - 0.2, 0.6) : prog(t, tNadie + 1.6, 0.8) * (1 - prog(t, tHist + 0.6, 0.4))}
            dim={t > tPero - 0.8 ? 0.25 : 0}
          >
            <Streak t={t} t0={tCielo + 1.2} dur={1.6} x0={250} y0={120} x1={1500} y1={430} w={1.3} flash />
          </SlabShot>
        </AbsoluteFill>
      ) : null}
      {/* flash de la voladura */}
      <AbsoluteFill style={{background: '#FFE7C4', opacity: clamp(1 - Math.abs(t - tBoom - 0.05) / 0.2) * 0.7, pointerEvents: 'none'}} />
      {/* textos del gancho */}
      <YearRoll t={t} t0={-0.15} t1={c('un oficial español') + 0.6} text="1783" label="Actual provincia del Chaco" x={160} y={300} size={210} align="left" />
      <Kicker14 t={t} t0={c('en el medio del monte')} t1={c('un oficial español') + 0.6} text="El monte chaqueño" x={166} y={444} />
      {/* medidas sobre la mesa */}
      <Measure t={t} t0={tLargo - 0.1} t1={tTon + 0.15} cam={cam} />
      <Stat14 t={t} t0={tTon + 0.25} t1={tCielo - 0.1} x={1250} y={250} value={14} label="Pesaba unas" suffix="toneladas" size={150} sub="según el cálculo de 1783" />
      <Kicker14 t={t} t0={tFab} t1={tCielo - 0.1} text="Nadie la había fabricado" x={1250} y={560} color={K.glow} />
      <Title14 t={t} t0={tCielo + 0.1} t1={ins('s01', 0) + 0.7} text="Había caído del cielo" size={96} x={960} y={880} italic w0={250} w1={480} />
      <Kicker14 t={t} t0={tPolv} t1={tBoom - 0.1} text="Pólvora" x={1240} y={300} color={K.fire} size={28} />
      <SearchHUD t={t} t0={tNadie + 1.4} t1={tHist + 0.3} />
      {/* las cuatro cartas */}
      {t > tHist - 0.4 && t < tPero + 0.6 ? (
        <AbsoluteFill>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 50% 45%, #121A2C 0%, #04060C 100%)', opacity: prog(t, tHist - 0.3, 0.5) * (1 - prog(t, tPero - 0.1, 0.5))}} />
          <CardRow
            t={t}
            out={tPero - 0.35}
            cards={[
              {at: c('promesa de plata') - 0.2, year: '1774', label: 'Una promesa de plata', node: <PlataCard t={t} />},
              {at: c('unas pistolas') - 0.1, year: '1816', label: 'Pistolas para un presidente', node: <Img src={staticFile('ep14/img/pistolas_met.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '42% 50%', filter: 'saturate(0.75) contrast(1.05) brightness(0.85)', transform: `scale(${1.5 + 0.03 * t})`}} />},
              {at: c('una grúa') - 0.1, year: '1990', label: 'Una grúa en la noche', node: <CraneCard t={t} />},
              {at: c('dos de los meteoritos') - 0.1, year: '1980 · 2016', label: 'Dos gigantes', node: <Img src={staticFile('ep14/img/elchaco_n.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 40%', filter: 'saturate(0.85) contrast(1.06)', transform: `scale(${1.25 + 0.01 * t})`}} />},
            ]}
          />
        </AbsoluteFill>
      ) : null}
      <SearchHUD t={t} t0={tPero + 0.2} t1={TL.durations.s01 + 0.4} />
      <Title14 t={t} t0={tPero + 0.3} t1={tHace - 0.55} text="Pero la mesa, no." size={110} x={960} y={850} italic w0={260} w1={520} />
      {/* contador de los años de búsqueda */}
      {t > tHace - 0.2 ? (
        <div style={{position: 'absolute', left: 960, top: 800, transform: 'translate(-50%,-50%)', textAlign: 'center', opacity: prog(t, tHace - 0.05, 0.4) * (1 - prog(t, TL.durations.s01 + 0.2, 0.3))}}>
          <div style={{...ar(24, 650, K.ember, 82, 0.3)}}>LA BUSCAN DESDE HACE</div>
          <YearsCounter t={t} t0={tHace} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
/** años de búsqueda: de 0 a 243 con odómetro */
const YearsCounter: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const v = Math.round(243 * easeOut(clamp((t - t0) / 2.2)));
  return (
    <div style={{...fr(180, 380, K.bone, 144, 0, -0.03), lineHeight: 1, fontVariantNumeric: 'tabular-nums lining-nums'}}>
      {v}
      <span style={{...ar(54, 600, K.bone, 85, 0.08), marginLeft: 20}}>AÑOS</span>
    </div>
  );
};
/** cota sobre la mesa (largo ≈ 2,5 m) proyectada desde la cámara 3D */
const Measure: React.FC<{t: number; t0: number; t1: number; cam: Cam}> = ({t, t0, t1, cam}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  if (o <= 0) return null;
  const a = project(cam, [-1.3 * Math.cos(0.5), 0.36, 1.3 * Math.sin(0.5)]);
  const b = project(cam, [1.3 * Math.cos(0.5), 0.36, -1.3 * Math.sin(0.5)]);
  const p = prog(t, t0, 0.8);
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
      <line x1={mx - (mx - a[0]) * p} y1={my - (my - a[1]) * p} x2={mx + (b[0] - mx) * p} y2={my + (b[1] - my) * p} stroke={K.glow} strokeWidth={2.5} />
      {[a, b].map((q, i) => <circle key={i} cx={q[0]} cy={q[1]} r={5} fill={K.glow} opacity={p} />)}
      <text x={mx} y={my - 26} textAnchor="middle" opacity={p} style={{...fr(54, 480, K.bone, 72, 0), textShadow: '0 2px 12px rgba(0,0,0,0.9)'} as React.CSSProperties}>≈ 2,5 m</text>
    </svg>
  );
};
const PlataCard: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 40%, #EFE5CD 0%, #D8C7A2 70%, #B79E73 100%)'}}>
    <div style={{position: 'absolute', left: 200, top: 180, transform: 'translate(-50%,-50%)', ...fell(150, K.ink), lineHeight: 1}}>⅕</div>
    <div style={{position: 'absolute', left: 200, top: 290, transform: 'translate(-50%,-50%)', ...fell(46, K.ink, true)}}>de plata</div>
    <div style={{position: 'absolute', left: 290, top: 120, width: 70, height: 70, borderRadius: 35, background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(213,221,234,0.4) 30%, rgba(0,0,0,0) 70%)', opacity: 0.5 + 0.5 * Math.sin(t * 3)}} />
  </AbsoluteFill>
);
const CraneCard: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #050812 0%, #0C1428 70%, #18140F 100%)'}}>
    <svg width={400} height={520} style={{position: 'absolute', left: 0, top: 0}}>
      <rect x={0} y={330} width={400} height={190} fill="#0A0907" />
      <CraneTruck x={250} y={360} s={0.62} arm={0.5} lights={1} />
      <PoliceCar x={60} y={372} s={0.5} t={t} />
    </svg>
  </AbsoluteFill>
);

/* ================================================================== TÍTULO */
/** secuencia de título: el bólido cruza el cielo y deja escrito CAMPO DEL CIELO, que se enfría como hierro */
export const Titulo: React.FC<{t: number}> = ({t}) => {
  const h = HIT - TITLE; // ~0,55 s
  return (
    <AbsoluteFill style={{background: K.void}}>
      <NightSky t={t + 50} milky={1.2} horizon={0.4} dy={-t * 14} />
      <Streak t={t} t0={h - 0.75} dur={0.8} x0={-200} y0={180} x1={1060} y1={470} w={1.8} flash />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 40% 30% at 55% 46%, rgba(255,170,90,0.35) 0%, rgba(0,0,0,0) 70%)', opacity: prog(t, h, 0.2) * (1 - prog(t, h + 0.6, 2.5))}} />
      <Title14 t={t} t0={h} text="Campo del Cielo" size={210} y={500} w0={300} w1={560} stagger={0.035} hot={1.4} upper={false} />
      <div style={{position: 'absolute', left: 960, top: 668, transform: 'translate(-50%,-50%)', ...ar(30, 600, K.mute, 82, 0.42), whiteSpace: 'nowrap', opacity: prog(t, h + 1.1, 0.8)}}>LA MESA DE HIERRO QUE NADIE ENCUENTRA</div>
      <div style={{position: 'absolute', left: 960, top: 600, width: 560 * prog(t, h + 0.9, 1.2, easeInOut), height: 1.5, background: K.ember, transform: 'translateX(-50%)', opacity: 0.8}} />
      <Vignette k={0.6} />
    </AbsoluteFill>
  );
};

/* ================================================================== S02 · HACE 4.000 AÑOS */
export const S02: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s02', p, n);
  const tBloque = c('Un bloque'), tChoca = c('choca contra'), tPesa = c('Pesa cientos'), tAire = c('El aire lo'), tParte = c('lo parte');
  const tLluvia = c('Y una lluvia'), tFranja = c('Deja una franja'), tGrande = c('El más grande'), tMiles = c('Miles de años'), tPor = c('Por eso el lugar');
  // espacio: la roca se acerca a la Tierra, se calienta al entrar y se parte
  const space = t < tLluvia + 0.2;
  const k = clamp((t - tBloque + 1) / (tLluvia - tBloque + 1));
  const kk = easeInOut(k);
  const mPos: V3 = [mix(-4.2, 1.0, kk), mix(2.6, -1.0, kk), mix(3, 4, k)];
  const heat = prog(t, tChoca - 0.3, 1.6);
  const camS: Cam = {pos: [mix(0.5, -1.0, k), mix(0.6, 0.3, k), mix(15, 10, easeInOut(k))], look: [mix(-1.6, 0.6, kk), mix(1.0, -0.8, kk), 1.5], fov: 40};
  // suelo: lluvia de hierro de noche, impacto en T_IMP
  const drops: Drop[] = Array.from({length: 26}, (_, i) => ({x: -40 + rr(i * 3) * 80 + (i === 0 ? 40 : 0), z: -60 - rr(i * 7) * 60, at: T_IMP - 1.4 + (i === 0 ? 1.4 : rr(i * 11) * 2.2), s: i === 0 ? 2.4 : 0.6 + rr(i * 5) * 0.9}));
  const ground = t > tLluvia - 0.3 && t < tFranja + 0.3;
  const camG: Cam = {pos: [0, 2.2, 22], look: [4, 8 - prog(t, T_IMP - 0.6, 0.8) * 6, -40], fov: 50};
  // vista aérea del campo de cráteres
  const mapOn = t > tFranja - 0.4 && t < tMiles + 0.3;
  const v: View = viewPath(t, [
    [0, {lon: -61.62, lat: -27.55, scale: 90000}],
    [tFranja - 0.4, {lon: -61.62, lat: -27.55, scale: 230000}],
    [tGrande - 0.2, {lon: -61.66, lat: -27.575, scale: 3400000}],
  ], 1.6);
  const craters = Array.from({length: 26}, (_, i) => {
    const u = rr(i * 5 + 1) * 2 - 1, w = (rr(i * 9 + 2) * 2 - 1) * 0.7;
    const th = ((90 - 62) * Math.PI) / 180;
    const [dx, dy] = kmToDeg(1, -27.55);
    const x = u * 9, y = w * 1.4;
    return {at: [PT['Campo del Cielo'][0] + (x * Math.cos(th) - y * Math.sin(th)) * dx, PT['Campo del Cielo'][1] + (x * Math.sin(th) + y * Math.cos(th)) * dy] as [number, number], r: 0.4 + rr(i * 13) * 1.2, tt: tFranja + 0.8 + i * 0.09};
  });
  return (
    <AbsoluteFill style={{background: K.void}}>
      {/* rebobinado de los años */}
      {t < tBloque + 0.6 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tBloque, 0.6)}}>
          <NightSky t={t} milky={1} horizon={0.2} dx={-t * 60} />
          <YearRibbon t={t} t0={-0.4} year={-2000} from={2026} dur={3.2} y={760} />
          <div style={{position: 'absolute', left: 960, top: 470, transform: 'translate(-50%,-50%)', textAlign: 'center', opacity: prog(t, c('cuatro mil') - 0.1, 0.5)}}>
            <div style={{...ar(26, 650, K.ember, 82, 0.34)}}>HACE</div>
            <div style={{...fr(220, 360, K.bone, 144, 0, -0.03), lineHeight: 1}}>4.000 años</div>
          </div>
        </AbsoluteFill>
      ) : null}
      {space ? (
        <AbsoluteFill style={{opacity: prog(t, tBloque - 0.6, 0.8)}}>
          <Stage14 cam={camS} env={0}>
            <ambientLight intensity={0.06} />
            <Stars3D />
            <Earth r={6} pos={[3.2, -6.4, -4]} rot={globeRot(-58, -47)} sun={[-1, 0.6, 0.5]} />
            {t < tParte + 0.1 ? <Meteor pos={mPos} vel={[0.8, -0.55, 0.2]} s={mix(0.9, 0.65, heat)} heat={heat} trail={heat} t={t} /> : null}
            {t >= tParte ? <Fragments t={t} t0={tParte} base={mPos} vel={[0.8, -0.55, 0.2]} n={16} s={0.6} spread={1.3} /> : null}
          </Stage14>
          <Kicker14 t={t} t0={tBloque + 0.2} t1={tChoca} text="Hierro y níquel" x={120} y={190} />
          <Stat14 t={t} t0={c('tan viejo') + 0.1} t1={tChoca} x={120} y={300} value={4500} label="Edad: la del sistema solar" suffix="millones de años" size={120} dur={1.6} />
          <Stat14 t={t} t0={c('cuarenta mil') - 0.3} t1={tAire} x={120} y={260} value={40000} label="Velocidad de entrada" suffix="km/h" size={150} dur={1.4} color={K.fire} />
          <Kicker14 t={t} t0={tPesa} t1={tAire + 0.4} text="Cientos de toneladas" x={124} y={520} color={K.glow} size={30} />
          <SyncHint t={t} t0={tAire} t1={tLluvia} words={[['lo frena', c('lo frena')], ['lo calienta', c('lo calienta')], ['lo parte', tParte]]} />
        </AbsoluteFill>
      ) : null}
      {ground ? (
        <AbsoluteFill style={{opacity: prog(t, tLluvia - 0.3, 0.4)}}>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, #03050C 0%, #0D1428 60%, #1A1A24 100%)'}} />
          <NightSky t={t} milky={0.5} horizon={0} o={0.9} />
          <Stage14 cam={camG} env={0.2} fog={['#0E1322', 30, 200]}>
            <SkyLights mood="night" />
            <Ground r={160} tint="#3A3F52" />
            <IronRain t={t} drops={drops} len={70} />
          </Stage14>
          <AbsoluteFill style={{background: '#FFE3B8', opacity: clamp(1 - Math.abs(t - T_IMP - 0.06) / 0.25) * 0.75}} />
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 40% at 50% 70%, rgba(255,150,70,0.4) 0%, rgba(0,0,0,0) 70%)', opacity: prog(t, T_IMP, 0.2) * (1 - prog(t, T_IMP + 0.4, 2))}} />
          <Vignette k={0.6} />
        </AbsoluteFill>
      ) : null}
      {mapOn ? (
        <AbsoluteFill style={{opacity: prog(t, tFranja - 0.4, 0.5) * (1 - prog(t, tMiles - 0.2, 0.5))}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 50%, #101829 0%, #04060C 100%)'}} />
          <Map14
            t={t} view={v} style="modern" gridO={0.6} riverO={0.4}
            areas={[{ring: craterField(), o: prog(t, tFranja + 0.3, 0.6) * (1 - prog(t, tGrande - 0.4, 0.4)), stroke: K.ember, fill: 'rgba(255,106,26,0.08)', dash: '8 8'}]}
            marks={[{at: PT.Gancedo, label: 'Gancedo', o: prog(t, tFranja, 0.5) * (1 - prog(t, tGrande - 0.3, 0.4)), kind: 'dot'}]}
          >
            {(proj) => (
              <g>
                {craters.map((cr, i) => {
                  const p = proj(cr.at) as [number, number];
                  const o = prog(t, cr.tt, 0.3) * (1 - prog(t, tGrande - 0.4, 0.4));
                  const pxPerKm = (proj([PT['Campo del Cielo'][0] + kmToDeg(1, -27.55)[0], -27.55]) as [number, number])[0] - (proj([PT['Campo del Cielo'][0], -27.55]) as [number, number])[0];
                  const r = Math.max(4, cr.r * 0.05 * pxPerKm);
                  return o > 0 ? <circle key={i} cx={p[0]} cy={p[1]} r={r * (0.6 + 0.4 * o)} fill="rgba(255,154,60,0.25)" stroke={K.ember} strokeWidth={2} opacity={o} /> : null;
                })}
              </g>
            )}
          </Map14>
          <Stat14 t={t} t0={tFranja + 0.3} t1={tGrande - 0.3} x={120} y={170} value={20} label="Una franja de casi" suffix="km" size={140} />
          <Kicker14 t={t} t0={tFranja + 1.2} t1={tGrande - 0.3} text="Al menos 26 cráteres" x={124} y={430} color={K.glow} />
          <AbsoluteFill style={{background: 'rgba(4,6,12,0.7)', opacity: prog(t, tGrande - 0.3, 0.4) * (1 - prog(t, tMiles - 0.3, 0.3))}} />
          <BigCrater t={t} t0={tGrande} t1={tMiles - 0.1} />
          <Source14 t={t} t0={tFranja + 0.5} t1={tMiles - 0.2} text="Cassidy et al., Science (1965); Ministerio de Cultura (2022)" />
        </AbsoluteFill>
      ) : null}
      {t > tMiles - 0.6 ? (
        <AbsoluteFill style={{opacity: prog(t, tMiles - 0.6, 0.6)}}>
          <NightSky t={t} milky={1.3} horizon={0.6} dy={(t - tMiles) * -8} />
          <MonteSilhouette />
          <Constellation t={t} t0={tMiles + 0.8} />
          <div style={{position: 'absolute', left: 960, top: 420, transform: 'translate(-50%,-50%)', textAlign: 'center', opacity: prog(t, tPor + 0.9, 0.8)}}>
            <div style={{...fr(150, 420, K.bone, 144, 50, -0.02), fontStyle: 'italic', lineHeight: 1}}>Pigüen N'onaxa</div>
            <div style={{...ar(24, 650, K.ember, 82, 0.3), marginTop: 22}}>EN LENGUA QOM: «CAMPO DEL CIELO»</div>
          </div>
          <Source14 t={t} t0={tPor + 1.2} text="argentina.travel; Wikipedia, «Campo del Cielo»" />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
/** palabras sueltas que aparecen al ritmo de la locución (el aire lo frena, lo calienta y lo parte) */
const SyncHint: React.FC<{t: number; t0: number; t1: number; words: [string, number][]}> = ({t, t0, t1, words}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 120, top: 860, display: 'flex', gap: 34, opacity: o}}>
      {words.map(([w, at], i) => {
        const p = prog(t, at - 0.05, 0.4);
        return <span key={i} style={{...fr(64, 460, i === words.length - 1 ? K.fire : K.bone, 144, 0), fontStyle: 'italic', opacity: p, transform: `translateY(${(1 - p) * 20}px)`, display: 'inline-block'}}>{w}</span>;
      })}
    </div>
  );
};
/** el cráter mayor (115 × 91 m) junto a una cancha de fútbol (105 × 68 m) a la misma escala */
const BigCrater: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  const o = fadeIO(t, t0, t1, 0.35);
  if (o <= 0) return null;
  const s = 3.4; // px por metro en este recuadro
  const p = prog(t, t0 + 0.2, 0.8);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
      <g transform="translate(1180,560)">
        <ellipse rx={(115 / 2) * s * p} ry={(91 / 2) * s * p} fill="rgba(255,154,60,0.18)" stroke={K.ember} strokeWidth={3} />
        <text y={-(91 / 2) * s - 24} textAnchor="middle" opacity={p} style={{...fr(56, 460, K.bone, 72, 0)} as React.CSSProperties}>115 × 91 m</text>
      </g>
      <g transform="translate(560,560)" opacity={prog(t, t0 + 0.7, 0.6)}>
        <rect x={(-105 / 2) * s} y={(-68 / 2) * s} width={105 * s} height={68 * s} fill="rgba(110,180,120,0.12)" stroke="rgba(190,230,190,0.8)" strokeWidth={2} />
        <line x1={0} y1={(-68 / 2) * s} x2={0} y2={(68 / 2) * s} stroke="rgba(190,230,190,0.6)" strokeWidth={1.5} />
        <circle r={9.15 * s} fill="none" stroke="rgba(190,230,190,0.6)" strokeWidth={1.5} />
        <text y={(68 / 2) * s + 50} textAnchor="middle" style={{...ar(22, 650, 'rgba(190,230,190,0.9)', 85, 0.18)} as React.CSSProperties}>UNA CANCHA DE FÚTBOL</text>
      </g>
      <text x={1180} y={(91 / 2) * s + 610} textAnchor="middle" opacity={p} style={{...ar(22, 650, K.ember, 85, 0.18)} as React.CSSProperties}>EL CRÁTER MÁS GRANDE</text>
    </svg>
  );
};
/** líneas del monte de noche (abajo, para los planos de cielo) */
const MonteSilhouette: React.FC = () => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
    <path d={Array.from({length: 97}, (_, i) => `${i ? 'L' : 'M'}${i * 20} ${930 - Math.abs(Math.sin(i * 0.37) * Math.sin(i * 0.13)) * 90 - rnd(i) * 30}`).join(' ') + ' L1920 1080 L0 1080 Z'} fill="#04050A" style={{filter: 'url(#quill14)'}} />
  </svg>
);
/** estrellas que se unen en líneas (el cielo como relato), sin atribuir una constelación concreta */
const Constellation: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const pts = [[520, 260], [640, 210], [760, 280], [880, 230], [1010, 300], [1140, 250], [1270, 320], [1390, 270]];
  const p = clamp((t - t0) / 2.4);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      {pts.slice(1).map((q, i) => {
        const a = pts[i];
        const k = clamp(p * pts.length - i);
        return k > 0 ? <line key={i} x1={a[0]} y1={a[1]} x2={a[0] + (q[0] - a[0]) * k} y2={a[1] + (q[1] - a[1]) * k} stroke="rgba(255,214,160,0.5)" strokeWidth={1.5} /> : null;
      })}
      {pts.map((q, i) => <circle key={i} cx={q[0]} cy={q[1]} r={4 + (i % 3)} fill="#FFF3DC" opacity={0.4 + 0.6 * clamp(p * pts.length - i + 1)} style={{filter: 'drop-shadow(0 0 6px #FFD49A)'}} />)}
    </svg>
  );
};

/* ================================================================== S03 · 1576-1774 */
const R1576 = smoothRoute([PT['Santiago del Estero'], [-63.6, -27.55], [-62.9, -27.62], [-62.2, -27.5], PT['Campo del Cielo']], 0.12, 3);
const R1774 = smoothRoute([[-64.1, -27.4], [-63.3, -27.25], [-62.5, -27.38], [-61.9, -27.5], PT['Campo del Cielo']], 0.1, 7);
export const S03: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s03', p, n);
  const tGob = c('El gobernador'), tBuscar = c('a buscar el metal'), tLo = c('Lo encuentra'), tPero = c('Pero marca'), tNadie = c('Y nadie puede');
  const tDos = c('Doscientos años'), tY = c('Y ahí llega'), tQuinta = c('una quinta parte'), tPlata = c('¿Plata?'), tSi = c('Si esa mesa'), tVirrey = c('Y el virrey');
  const v: View = viewPath(t, [
    [0, {lon: -62.6, lat: -27.9, scale: 9000}],
    [tBuscar, {lon: -62.9, lat: -27.65, scale: 14500}],
    [tDos, {lon: -62.6, lat: -27.6, scale: 11000}],
  ], 2.0);
  const routeO = 1 - prog(t, tNadie + 0.2, 1.4) * 0.85;
  const mapO = 1 - prog(t, tY - 0.3, 0.6);
  return (
    <AbsoluteFill style={{background: K.parch}}>
      <Parchment>
        <AbsoluteFill style={{opacity: mapO}}>
          <Map14
            t={t} view={v} style="old" provO={0.16} riverO={prog(t, 0.4, 1.2)} gridO={0.8}
            prov={['Santiago del Estero', 'Chaco', 'Tucumán', 'Santa Fe', 'Salta', 'Córdoba', 'Catamarca', 'Formosa']}
            routes={[
              {pts: R1576, p: prog(t, tBuscar + 0.3, tLo - tBuscar + 0.2, easeInOut) * routeO, label: '1576', labelAt: 0.25},
              {pts: R1774, p: prog(t, tDos + 0.6, 2.4, easeInOut), color: K.sepia, label: '1774', labelAt: 0.3},
            ]}
            marks={[
              {at: PT['Santiago del Estero'], label: 'Santiago del Estero', o: prog(t, tGob, 0.6), kind: 'town'},
              {at: PT['San Miguel de Tucumán'], label: 'San Miguel de Tucumán', o: prog(t, tGob + 0.3, 0.6) * 0.8, kind: 'town'},
              {at: PT['Campo del Cielo'], label: 'el hierro', o: prog(t, tLo, 0.5) * (1 - prog(t, tNadie + 0.4, 0.8)) + prog(t, tDos + 2.6, 0.6), kind: 'iron', size: 1.6, italic: true},
              {at: [PT['Campo del Cielo'][0] + 0.15, PT['Campo del Cielo'][1] - 0.25], o: prog(t, tNadie + 0.3, 0.5) * (1 - prog(t, tDos + 2.4, 0.5)), kind: 'q', size: 1.2, color: K.inkRed},
            ]}
            regionLabels={[
              {at: [-65.1, -27.25], text: 'GOBERNACIÓN DEL TUCUMÁN', o: prog(t, tGob + 0.2, 0.8), size: 30, rot: -6},
              {at: [-60.3, -26.2], text: 'GRAN CHACO GUALAMBA', o: prog(t, tGob + 0.6, 0.8), size: 30, rot: 4},
            ]}
          >
            {(proj) => (
              <g>
                {/* árboles de referencia del monte a lo largo del camino, que después se borran */}
                {R1576.filter((_, i) => i % 9 === 4).map((q, i) => {
                  const p = proj(q) as [number, number];
                  const o = prog(t, tPero + 0.2 + i * 0.12, 0.4) * (1 - prog(t, tNadie + 0.1 + i * 0.05, 0.8));
                  return o > 0 ? <TreeGlyph key={i} x={p[0] + (i % 2 ? 26 : -26)} y={p[1] - 22} o={o} /> : null;
                })}
              </g>
            )}
          </Map14>
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            <Compass x={1730} y={880} r={80} o={0.75} />
          </svg>
        </AbsoluteFill>
        <YearRoll t={t} t0={0.6} t1={tGob + 0.4} text="1576" x={300} y={260} size={190} align="left" color={K.ink} labelColor={K.inkRed} label="Gobernación del Tucumán" />
        <YearRibbon t={t} t0={0.3} t1={tBuscar} year={1576} from={-2000} dur={1.4} dark />
        <NameCard14 t={t} t0={c('Hernán')} t1={tBuscar + 0.6} name="Hernán Mexía de Miraval" role="Capitán · expedición de 1576" x={140} y={790} color={K.ink} roleColor={K.sepia} noteColor={K.inkRed} />
        {/* la orden del gobernador */}
        <OldSheet t={t} t0={tBuscar - 0.1} t1={tLo + 0.2} x={1420} y={470} w={620} h={560} rot={2}>
          <div style={{position: 'absolute', left: 50, top: 46, right: 50}}>
            <div style={{...fell(26, K.sepia), letterSpacing: '0.2em'}}>ORDEN DEL GOBERNADOR · 3 DE JULIO DE 1576</div>
            <div style={{...fell(40, K.ink, true), marginTop: 28, lineHeight: 1.22}}>
              «… el metal de hierro de que se tiene noticia …»
            </div>
            <div style={{...fell(40, K.ink, true), marginTop: 24, lineHeight: 1.22, opacity: prog(t, c('y a traer'), 0.6)}}>«… todo el hierro que se pudiere traer»</div>
            <div style={{marginTop: 34}}><InkLines n={4} w={520} seed={3} reveal={prog(t, tBuscar + 0.4, 2.5)} /></div>
          </div>
        </OldSheet>
        <Quote14 t={t} t0={tLo + 0.4} t1={tPero + 0.3} text="un grandisimo pedaço de hierro limpio" by="Informe de 1584 · Archivo General de Indias" x={1290} y={300} w={980} size={58} color={K.ink} accent={K.inkRed} byColor={K.sepia} />
        <Title14 t={t} t0={tNadie} t1={tDos - 0.2} text="Y nadie puede volver." size={84} x={1290} y={300} color={K.ink} italic w0={300} w1={520} />
        <YearRibbon t={t} t0={tDos} t1={tY} year={1774} from={1576} dur={1.4} dark />
        <ShipToSpain t={t} t0={c('manda muestras')} t1={tY} />
        {/* el análisis: una quinta parte de plata */}
        {t > tY - 0.4 ? (
          <AbsoluteFill style={{opacity: prog(t, tY - 0.4, 0.5) * (1 - prog(t, tSi - 0.7, 0.45))}}>
            <OldSheet t={t} t0={tY - 0.3} x={700} y={540} w={760} h={820} rot={-1.5}>
              <div style={{position: 'absolute', left: 64, top: 60, right: 64}}>
                <div style={{...fell(28, K.sepia), letterSpacing: '0.22em'}}>ANÁLISIS DE LAS MUESTRAS · ESPAÑA</div>
                <div style={{marginTop: 30}}><InkLines n={5} w={620} seed={9} reveal={prog(t, tY, 1.8)} /></div>
                <div style={{...fell(56, K.ink, true), marginTop: 30, lineHeight: 1.18, opacity: prog(t, tQuinta - 0.1, 0.5)}}>
                  «una <span style={{color: K.inkRed}}>quinta parte de plata</span> y el resto fierro de extraordinaria pureza»
                </div>
              </div>
            </OldSheet>
            <SilverPie t={t} t0={tQuinta + 0.3} x={1450} y={520} q={prog(t, tPlata - 0.1, 0.3)} />
            <Source14 t={t} t0={tY + 0.4} text="Minniti Morgan, «El Mesón de Fierro. Apuntes para su historia»" dark={false} />
          </AbsoluteFill>
        ) : null}
        {/* la mina imaginada */}
        {t > tSi - 0.3 ? (
          <AbsoluteFill style={{opacity: prog(t, tSi - 0.25, 0.5)}}>
            <CrossSection t={t} y={520} s={0.95} vein={prog(t, c('abajo podía') - 0.3, 1.4)} labels />
            <Stamp14 t={t} t0={tVirrey + 0.35} text="POR ORDEN DEL VIRREY" x={1460} y={260} size={46} rot={-9} serif />
          </AbsoluteFill>
        ) : null}
      </Parchment>
    </AbsoluteFill>
  );
};
/** arbolito de mapa antiguo */
const TreeGlyph: React.FC<{x: number; y: number; o: number}> = ({x, y, o}) => (
  <g transform={`translate(${x},${y})`} opacity={o} stroke="rgba(42,32,22,0.85)" strokeWidth={1.6} fill="rgba(86,112,74,0.35)">
    <path d="M0 14 L0 0" />
    <path d="M-10 2 C-14 -8 -6 -16 0 -14 C6 -18 14 -8 10 2 Z" />
  </g>
);
/** las muestras viajan a España: flecha que sale del mapa hacia el este con un barquito */
const ShipToSpain: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const p = prog(t, t0, 1.6, easeInOut);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
      <path d={`M1180 470 C1400 380 1600 360 ${1180 + 680 * p} ${470 - 120 * p}`} fill="none" stroke={K.sepia} strokeWidth={4} strokeDasharray="14 9" />
      <g transform={`translate(${1180 + 640 * p},${450 - 120 * p})`}>
        <path d="M-30 0 L30 0 L20 14 L-20 14 Z" fill={K.ink} />
        <path d="M0 0 L0 -40 L24 -6 Z" fill="rgba(42,32,22,0.7)" />
      </g>
      <text x={1700} y={300} textAnchor="middle" opacity={prog(t, t0 + 0.8, 0.5)} style={{...fell(40, K.ink, true)} as React.CSSProperties}>a España</text>
    </svg>
  );
};
/** torta 1/5: la quinta parte en plata, con signo de pregunta en «¿Plata?» */
const SilverPie: React.FC<{t: number; t0: number; x: number; y: number; q: number}> = ({t, t0, x, y, q}) => {
  const p = prog(t, t0, 1.0, easeInOut);
  if (p <= 0) return null;
  const R = 200;
  const a = Math.PI * 2 * 0.2 * p;
  const arc = `M0 0 L0 ${-R} A${R} ${R} 0 0 1 ${Math.sin(a) * R} ${-Math.cos(a) * R} Z`;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <g transform={`translate(${x},${y}) scale(${1 + q * 0.08 * Math.sin(t * 9)})`}>
        <circle r={R} fill="rgba(90,84,80,0.6)" stroke={K.ink} strokeWidth={3} />
        <path d={arc} fill="#D5DDEA" stroke={K.ink} strokeWidth={3} />
        <circle cx={Math.sin(a * 0.5) * R * 0.6} cy={-Math.cos(a * 0.5) * R * 0.6} r={40 + 20 * Math.sin(t * 4)} fill="rgba(255,255,255,0.6)" style={{filter: 'blur(14px)'}} opacity={p} />
        <text y={R + 70} textAnchor="middle" style={{...fell(54, K.ink, true)} as React.CSSProperties}>1/5 plata</text>
        {q > 0 ? <text x={R * 0.6} y={-R * 0.5} style={{fontFamily: F.display, fontSize: 200, fontWeight: 600, fill: K.inkRed, opacity: q} as React.CSSProperties}>?</text> : null}
      </g>
    </svg>
  );
};

/* ================================================================== S04 · 1783: RUBÍN DE CELIS */
export const S04: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s04', p, n);
  const tTen = c('El teniente'), tMel = c('los meleros'), tVe = c('Y la ve'), tMeson = c('El Mesón de Fierro'), tPara = c('Para sacarle'), tConsigue = c('y consigue');
  const tSup = c('En la superficie'), tPero = c('Pero él busca'), tHace = c('Hace cavar'), tAnota = c('y anota'), tCons = c('construí dos');
  const tAbajo = c('Abajo no hay'), tSu = c('Su conclusión'), tSe = c('Se equivocaba'), tSus = c('Sus muestras'), tFis = c('y un físico'), tUsa = c('usa ese hierro');
  const tQue = c('que del cielo'), tEl = c('El Mesón de Fierro', 1), tEs = c('Es la última');
  // tramos
  const hero = t < tPara - 0.2 || (t > T_BLAST - 0.6 && t < tAbajo + 0.2) || t > tEl - 0.5;
  const cam: Cam = camPath(t, [
    [-1, {pos: [9, 3.2, 12], look: [-3, 1.2, -6], fov: 40}],
    [tVe - 1.2, {pos: [4.2, 1.6, 5.4], look: [0, 0.3, 0], fov: 36}],
    [tMeson - 0.4, {pos: [3.0, 0.85, 3.6], look: [0, 0.25, 0], fov: 33}],
    [T_BLAST - 1.0, {pos: [5.4, 1.9, 7.0], look: [0, 0.8, 0], fov: 40}],
    [tEl - 0.6, {pos: [4.6, 1.5, 5.8], look: [0, 0.3, 0], fov: 37}],
    [tEs, {pos: [6.8, 2.6, 9.0], look: [0, 0.2, 0], fov: 38}],
  ], 2.4);
  const mood = t > tEl - 0.6 ? (t > tEs ? 'night' : 'dusk') : 'golden';
  return (
    <AbsoluteFill style={{background: K.void}}>
      {hero ? (
        <SlabShot
          t={t} cam={cam} mood={mood} dig={t > T_BLAST - 1 ? 1 : 0} blast={T_BLAST} blastS={1.15} shakeAt={T_BLAST}
          slabRot={[0.04 + (t > T_BLAST - 1 && t < tAbajo ? 0.12 * (1 - prog(t, T_BLAST, 0.4)) : 0), 0.5, -0.03]}
          slabO={t > tEs ? 1 - prog(t, tEs + 0.6, 1.2) * 0.75 : 1} grass={mood === 'golden' ? 1 : 0.8} dim={t > tEs ? prog(t, tEs, 1.2) * 0.3 : 0}
        />
      ) : null}
      <AbsoluteFill style={{background: '#FFE7C4', opacity: clamp(1 - Math.abs(t - T_BLAST - 0.05) / 0.25) * 0.9, pointerEvents: 'none'}} />
      <YearRoll t={t} t0={-0.2} t1={tTen + 0.3} text="1783" label="Febrero" x={160} y={300} size={210} align="left" />
      <YearRibbon t={t} t0={-0.2} t1={tTen + 1} year={1783} from={1774} dur={1.2} />
      <NameCard14 t={t} t0={tTen + 0.2} t1={tVe - 0.2} name="Miguel Rubín de Celis" role="Teniente de fragata" note="Por orden del virrey Vértiz" x={130} y={760} />
      <Kicker14 t={t} t0={tMel} t1={tVe - 0.2} text="Meleros: juntaban miel silvestre en el monte" x={130} y={140} color={K.glow} />
      <Quote14 t={t} t0={tVe + 0.2} t1={tMeson - 0.1} text="una inmensa mesa de fierro que sobresalía de la llanura" by="Rubín de Celis, 1783" x={960} y={200} w={1500} size={60} />
      <Title14 t={t} t0={tMeson} t1={tPara - 0.5} text="El Mesón de Fierro" size={150} y={210} italic w0={260} w1={560} hot={0.8} />
      {/* setenta cinceles rotos y doce kilos */}
      {t > tPara - 0.4 && t < tPero ? (
        <AbsoluteFill style={{opacity: prog(t, tPara - 0.4, 0.4) * (1 - prog(t, tPero - 0.4, 0.4))}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 45%, #1B1712 0%, #070605 100%)'}} />
          <ChiselGrid t={t} t0={tPara + 0.4} />
          <Stat14 t={t} t0={tPara + 0.5} t1={tSup - 0.2} x={1240} y={300} value={70} label="Cinceles rotos" size={170} dur={1.6} />
          <Stat14 t={t} t0={tConsigue + 0.3} t1={tSup - 0.2} x={1240} y={600} value={12} label="Para sacar apenas" suffix="kilos" size={150} color={K.glow} sub="de una masa de catorce toneladas" />
          {/* marcas de la superficie: regmagliptos */}
          {t > tSup - 0.3 ? (
            <AbsoluteFill style={{opacity: prog(t, tSup - 0.3, 0.5)}}>
              <Photo14 src="ep14/img/cc_museo.jpg" t={t} t0={tSup - 0.3} from={{s: 1.15, x: 0, y: 0}} to={{s: 1.3, x: -40, y: -20}} dur={5} grade="warm" dim={0.2} />
              <MarksOverlay t={t} t0={c('pisadas de aves')} t1={c('manos humanas')} />
              <Kicker14 t={t} t0={tSup + 0.4} text="Las marcas que vio en la superficie" x={110} y={110} />
              <div style={{position: 'absolute', left: 110, top: 930, ...fr(32, 380, K.bone, 72, 50), fontStyle: 'italic', opacity: prog(t, c('manos humanas') + 0.3, 0.6), maxWidth: 1100, textShadow: '0 2px 12px rgba(0,0,0,0.9)'}}>
                Hoy se sabe que son regmagliptos: huecos que deja la fusión del hierro al atravesar el aire.
              </div>
              <Credit14 text="Fragmento de Campo del Cielo · Fredlyfish4 · CC BY-SA 3.0" />
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {/* el corte: excavación, palancas y los dos hornillos */}
      {t > tPero - 0.5 && t < T_BLAST - 0.5 ? (
        <AbsoluteFill style={{opacity: prog(t, tPero - 0.5, 0.5) * (1 - prog(t, T_BLAST - 0.9, 0.4))}}>
          <Parchment>
            <CrossSection t={t} y={560} s={0.95} dig={prog(t, tHace, 1.2)} lever={prog(t, c('la da vuelta'), 1.0) * (1 - prog(t, tAnota, 0.5) * 0.5)} charges={prog(t, tCons + 0.4, 1.2)} vein={prog(t, tPero - 0.4, 0.8) * 0.6} />
            <Handwrite text="construí dos hornillos, que volé" p={prog(t, tCons - 0.1, 2.3, easeInOut)} size={84} x={960} y={190} align="center" w={1600} />
            <Source14 t={t} t0={tAnota + 0.3} text="Carta de Rubín de Celis · Philosophical Transactions, 1788" dark={false} />
            <Kicker14 t={t} t0={tCons + 1.2} text="Hornillo: carga de pólvora en un pozo" x={1180} y={940} color={K.inkRed} dark shadow={false} />
          </Parchment>
        </AbsoluteFill>
      ) : null}
      <Title14 t={t} t0={c('Pólvora') - 0.05} t1={T_BLAST + 0.9} text="Pólvora." size={170} y={240} italic w0={400} w1={720} hot={0.6} />
      {/* abajo no hay veta; la conclusión equivocada */}
      {t > tAbajo - 0.3 && t < tSus ? (
        <AbsoluteFill style={{opacity: prog(t, tAbajo - 0.3, 0.4) * (1 - prog(t, tSus - 0.3, 0.3))}}>
          <Parchment>
            <CrossSection t={t} y={560} s={0.95} dig={1} vein={0.85} veinGone={prog(t, c('Solo tierra') - 0.3, 0.6)} boom={0} />
            <AbsoluteFill style={{opacity: prog(t, tSu - 0.2, 0.4)}}>
              <AbsoluteFill style={{background: K.parch, opacity: 0.88}} />
              <Quote14 t={t} t0={tSu + 0.2} text="habrá sido arrojada por algún volcán" by="Rubín de Celis, 1783" x={960} y={230} w={1500} size={70} color={K.ink} accent={K.inkRed} byColor={K.sepia} />
              <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
                <Volcano x={960} y={640} s={1.5} p={prog(t, c('algún volcán') - 0.3, 1.0)} />
                <line x1={700} y1={760} x2={700 + 520 * prog(t, tSe, 0.35)} y2={760 - 360 * prog(t, tSe, 0.35)} stroke={K.inkRed} strokeWidth={14} strokeLinecap="round" />
              </svg>
              <Title14 t={t} t0={tSe + 0.1} text="Se equivocaba." size={96} x={960} y={930} color={K.inkRed} italic w0={300} w1={560} />
            </AbsoluteFill>
          </Parchment>
        </AbsoluteFill>
      ) : null}
      {/* Londres y Chladni */}
      {t > tSus - 0.3 && t < tEl - 0.4 ? (
        <AbsoluteFill style={{opacity: prog(t, tSus - 0.3, 0.4) * (1 - prog(t, tEl - 0.7, 0.4))}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 60% 45%, #1A1712 0%, #060504 100%)'}} />
          <PhilTrans t={t} t0={tSus} />
          <Plate14 src="ep14/img/chladni.jpg" t={t} t0={tFis - 0.1} x={1420} y={400} w={420} h={540} caption="Ernst Chladni (1756-1827)" note="Físico alemán" credit="Grabado del siglo XIX · dominio público" grade="print" focus="50% 35%" />
          <Kicker14 t={t} t0={tUsa} t1={tQue - 0.2} text="Su libro de 1794" x={1180} y={880} />
          <Title14 t={t} t0={tQue - 0.05} text="Del cielo caen piedras" size={92} x={1180} y={950} align="left" italic w0={260} w1={520} />
          <FallingStones t={t} t0={tQue} />
        </AbsoluteFill>
      ) : null}
      <Stamp14 t={t} t0={tEs + 0.5} text="ÚLTIMA VEZ VISTA · 1783" x={960} y={830} size={58} rot={-6} dark color={K.ember} />
      <SearchHUD t={t} t0={tEs + 0.9} t1={TL.durations.s04 + 1} />
    </AbsoluteFill>
  );
};
/** setenta cinceles en grilla; se van partiendo uno por uno */
const ChiselGrid: React.FC<{t: number; t0: number}> = ({t, t0}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 70}, (_, i) => {
      const col = i % 10, row = Math.floor(i / 10);
      const x = 150 + col * 90, y = 230 + row * 100;
      const on = prog(t, t0 + i * 0.022, 0.25);
      const br = prog(t, t0 + 0.4 + i * 0.022, 0.2);
      return (
        <g key={i} transform={`translate(${x},${y})`} opacity={on}>
          <g transform={`rotate(${-8 * br})`}>
            <rect x={-6} y={-38} width={12} height={34} rx={2} fill="#9A9AA2" />
            <path d="M-6 -4 L6 -4 L0 6 Z" fill="#C9CDD4" />
          </g>
          <g transform={`translate(${br * 14},${br * 22}) rotate(${br * 40})`}>
            <rect x={-6} y={6} width={12} height={26} rx={2} fill="#7A7A82" opacity={br} />
          </g>
          <rect x={-6} y={-60} width={12} height={22} rx={3} fill="#5A3B22" />
        </g>
      );
    })}
  </svg>
);
/** pisadas de aves y huellas de manos marcadas sobre la foto (lo que creyó ver Rubín de Celis) */
const MarksOverlay: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  const bird = (x: number, y: number, r: number, k: number) => (
    <g transform={`translate(${x},${y}) rotate(${r})`} stroke={K.glow} strokeWidth={4} strokeLinecap="round" fill="none" opacity={k}>
      <path d="M0 0 L0 -40 M0 -6 L-20 -34 M0 -6 L20 -34" strokeDasharray={140} strokeDashoffset={140 * (1 - k)} />
    </g>
  );
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      {bird(760, 420, -20, prog(t, t0, 0.5))}
      {bird(900, 360, 10, prog(t, t0 + 0.2, 0.5))}
      {bird(1040, 430, -5, prog(t, t0 + 0.4, 0.5))}
      {[0, 1].map((i) => {
        const k = prog(t, t1 - 0.4 + i * 0.25, 0.5);
        return (
          <g key={i} transform={`translate(${1180 + i * 170},${620 - i * 40}) rotate(${i ? 12 : -8})`} fill="none" stroke={K.ember} strokeWidth={4} opacity={k}>
            <ellipse cx={0} cy={0} rx={40} ry={52} strokeDasharray={300} strokeDashoffset={300 * (1 - k)} />
            {[-30, -10, 10, 30].map((fx, j) => <ellipse key={j} cx={fx} cy={-72 - (j % 2) * 8} rx={9} ry={20} strokeDasharray={100} strokeDashoffset={100 * (1 - k)} />)}
          </g>
        );
      })}
    </svg>
  );
};
/** la carta publicada en Londres (recreación de la portadilla de Philosophical Transactions) */
const PhilTrans: React.FC<{t: number; t0: number}> = ({t, t0}) => (
  <OldSheet t={t} t0={t0} x={560} y={500} w={600} h={740} rot={-2} scale={0.95}>
    <div style={{position: 'absolute', left: 50, right: 50, top: 70, textAlign: 'center'}}>
      <div style={{...fell(30, K.ink), letterSpacing: '0.18em'}}>PHILOSOPHICAL</div>
      <div style={{...fell(30, K.ink), letterSpacing: '0.18em'}}>TRANSACTIONS</div>
      <div style={{...fell(22, K.sepia, true), marginTop: 10}}>of the Royal Society of London</div>
      <div style={{width: 300, height: 1.5, background: K.sepia, margin: '24px auto'}} />
      <div style={{...fell(30, K.ink, true), lineHeight: 1.25}}>An Account of a Mass of Native Iron found in South America</div>
      <div style={{...fell(22, K.ink), marginTop: 20}}>By Don Michael Rubin de Celis</div>
      <div style={{...fell(26, K.ink), marginTop: 30}}>VOL. LXXVIII · MDCCLXXXVIII</div>
      <div style={{marginTop: 40, display: 'flex', justifyContent: 'center'}}><InkLines n={6} w={460} seed={21} color="rgba(42,32,22,0.35)" /></div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 26, textAlign: 'center', ...ar(14, 650, K.sepia, 85, 0.2)}}>RECREACIÓN</div>
  </OldSheet>
);
/** piedras que caen del cielo (la idea de Chladni) */
const FallingStones: React.FC<{t: number; t0: number}> = ({t, t0}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 9}, (_, i) => {
      const a = t - t0 - i * 0.18;
      if (a < 0) return null;
      const x = 180 + i * 120 + a * 160, y = -60 + a * 520;
      if (y > 1150) return null;
      return (
        <g key={i} transform={`translate(${x},${y}) rotate(${a * 90 + i * 30})`}>
          <path d="M-14 -8 L-4 -16 L12 -12 L16 2 L4 14 L-12 10 Z" fill="#6A625A" stroke="#2A2420" strokeWidth={2} />
          <line x1={-30} y1={-60} x2={-8} y2={-14} stroke="rgba(255,154,60,0.5)" strokeWidth={4} strokeLinecap="round" transform={`rotate(${-(a * 90 + i * 30)})`} />
        </g>
      );
    })}
  </svg>
);
