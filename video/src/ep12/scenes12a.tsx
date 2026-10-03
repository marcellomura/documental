/* Escenas 1–5 del episodio 12: la apertura (el micrófono de la isla Ascensión), el título, el submarino,
   la noche del 14 de noviembre, la búsqueda y el canal SOFAR con las estaciones que escucharon el ruido. */
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {cue} from './lib';
import {
  K, F12, vf, mono, clamp, easeIn, easeInOut, easeOut, prog, pop, rnd, fmt, between, fadeIO,
  AbyssBg, MarineSnow, Letterbox, Vignette, Scanlines, KTitle, SyncWords, SerifLine, Odo, ramp, DataCard, MonoTag, Timecode, Chapter, NameCard,
  Stamp12, Photo, Clip, Credit12, PhotoCard12, Rings, Reticle,
} from './kit12';
import {Stage12, Submarine, Water, StormSea, Spray, Wreck, ROV, project, camPath, SUB_R, VALVE_POS, BOW_BATT_POS, STERN_BATT_POS} from './three12';
import type {Cam, V3} from './three12';
import {GeoMap, mxy, Pin12, GreatArc, Wavefront, SpainGhost, PL, STATIONS, SofarDiagram, FiberInset, LiveTrace, HourAxis, CallsRow, gcDist} from './viz12';
import type {MapV} from './viz12';

const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/* ================================================================== S01 · APERTURA */
export const S01: React.FC<{t: number; dur: number; titleEnd: number}> = ({t, dur, titleEnd}) => {
  const c = (p: string, n = 0) => cue('s01', p, n);
  const tMic = c('micrófono.'), tCol = c('Está'), tBomb = c('escuchar'), tDate = c('El quince'), tReg = c('registró'), tNo = c('No era'), tEra = c('Era un'), t44 = c('cuarenta');
  const tDur = c('Durante'), tHist = c('Esta es'), tQue = c('qué le'), tComo = c('cómo lo'), tDos = c('las dos horas'), tNadie = c('nadie puede');
  const TITLE = dur + 0.15;
  const lb = 1 - prog(t, titleEnd - 1.1, 0.9, easeInOut);
  return (
    <AbsoluteFill style={{background: K.abyss}}>
      {/* A · la isla */}
      {t < tMic + 0.2 ? (
        <>
          <Photo src="ep12/img/ha10_01.jpg" t={t} t0={-1.2} t1={tMic + 0.2} from={{s: 1.06, x: 0, y: 30}} to={{s: 1.22, x: -40, y: 10}} focus="50% 70%" credit="CTBTO · CC BY 2.0" />
          <MonoTag t={t} t0={-0.6} t1={tMic + 0.1} text="ISLA ASCENSIÓN · OCÉANO ATLÁNTICO" x={110} y={210} />
          <MonoTag t={t} t0={0.6} t1={tMic + 0.1} text="7°56′S  14°22′O" x={110} y={256} color={K.amber} />
        </>
      ) : null}
      {/* B · el hidrófono que baja */}
      {between(t, tMic - 0.25, tCol + 0.5) ? (
        <>
          <Photo src="ep12/img/hyd_01.jpg" t={t} t0={tMic - 0.25} t1={tCol + 0.5} from={{s: 1.1, x: 0, y: -20}} to={{s: 1.28, x: 0, y: 20}} focus="50% 40%" credit="CTBTO · CC BY 2.0" />
          <MonoTag t={t} t0={tMic} t1={tCol + 0.4} text="HIDRÓFONO" x={110} y={210} />
        </>
      ) : null}
      {/* C · colgado en las profundidades */}
      {between(t, tCol + 0.3, tBomb - 0.2) ? <HydroHang t={t} t0={tCol + 0.3} t1={tBomb - 0.2} /> : null}
      {/* D · bombas atómicas */}
      {between(t, tBomb - 0.35, tDate - 0.2) ? (
        <>
          <Clip src="ep11/vid/ivy_bola.mp4" t={t} t0={tBomb - 0.35} t1={tDate - 0.2} zoom={[1.0, 1.08]} grade="warm" tint={0.1} credit="Prueba nuclear Ivy Mike, 1952 · Departamento de Energía de EE. UU." />
          <KTitle t={t} t0={c('bombas')} t1={tDate - 0.4} text="BOMBAS ATÓMICAS" size={120} y={790} color={K.bone} />
        </>
      ) : null}
      {/* E · el ruido */}
      {between(t, tDate - 0.25, tEra) ? (
        <AbsoluteFill>
          <AbyssBg t={t} light={0.4} deep={0.6} />
          <Timecode t={t} t0={tDate - 0.1} t1={tEra - 0.1} text="15.11.2017" label="ESTACIÓN HA10 · ISLA ASCENSIÓN" y={300} size={130} />
          <LiveTrace t={t} t0={tDate + 0.4} spikeAt={tReg + 1.0} y={690} amp={150} label="REPRESENTACIÓN" />
          <KTitle t={t} t0={tNo} t1={tEra - 0.15} text="NO ERA UNA BOMBA" size={92} y={830} color={K.amber} />
        </AbsoluteFill>
      ) : null}
      {/* F · un submarino argentino */}
      {between(t, tEra - 0.15, tDur) ? (
        <>
          <Photo src="ep12/img/sj_06.jpg" t={t} t0={tEra - 0.15} t1={tDur} from={{s: 1.08, x: 30, y: 0}} to={{s: 1.2, x: -20, y: 10}} focus="50% 60%" credit="Juan Kulichevsky · CC BY-SA 2.0" />
          <MonoTag t={t} t0={tEra + 0.3} t1={tDur - 0.1} text="ARA SAN JUAN (S-42)" x={110} y={210} />
          <DataCard t={t} t0={t44 - 0.15} t1={tDur - 0.1} x={110} y={520} value={44} dur={0.9} label="PERSONAS A BORDO" size={220} color={K.amber} />
        </>
      ) : null}
      {/* G · un año sin saber */}
      {between(t, tDur - 0.2, tHist) ? <SonarSweep t={t} t0={tDur - 0.2} t1={tHist} /> : null}
      {/* H · el nombre */}
      {between(t, tHist - 0.15, tQue) ? (
        <AbsoluteFill>
          <AbyssBg t={t} light={0.5} deep={0.5} />
          <KTitle t={t} t0={tHist + 0.6} t1={tQue - 0.05} text="ARA SAN JUAN" size={200} y={540} w0={125} w1={88} g0={200} g1={900} />
        </AbsoluteFill>
      ) : null}
      {/* I · qué le pasó (cae en la oscuridad) */}
      {between(t, tQue - 0.05, tComo) ? <SinkShot t={t} t0={tQue - 0.05} /> : null}
      {/* J · cómo lo encontraron (luces del robot) */}
      {between(t, tComo - 0.05, tDos - 0.3) ? <WreckShot t={t} t0={tComo - 0.05} cam0={{pos: [5.5, 1.6, 6.5], look: [0, -0.3, 0], fov: 38}} cam1={{pos: [3.2, 0.9, 4.2], look: [-0.4, -0.3, 0], fov: 36}} span={2} /> : null}
      {/* K · las dos horas */}
      {between(t, tDos - 0.35, TITLE) ? (
        <AbsoluteFill>
          <AbyssBg t={t} light={0.2} deep={0.9} />
          <HourAxis t={t} t0={tDos - 0.3} from={8} to={11} y={640} marks={[{h: 8.75, label: 'ÚLTIMA SEÑAL', at: tDos}, {h: 10.85, label: 'EL RUIDO', color: K.red, at: tDos + 0.35}]} spans={[{a: 8.75, b: 10.85, label: '¿QUÉ PASÓ?', color: K.amber, at: tDos + 0.7, unknown: true}]} />
          <KTitle t={t} t0={tNadie - 0.2} t1={TITLE - 0.1} text="NADIE PUEDE EXPLICARLAS" size={70} y={250} color={K.bone} w1={96} g1={700} />
        </AbsoluteFill>
      ) : null}
      {t >= TITLE - 0.1 ? <TitleCard t={t - TITLE} /> : null}
      <Vignette k={0.55} />
      <Letterbox k={lb} />
    </AbsoluteFill>
  );
};

/** el hidrófono colgado en el canal (ilustración) */
const HydroHang: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  const y = 520 + Math.sin(t * 0.8) * 8;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbyssBg t={t} light={0.35} deep={0.55} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <line x1={960} y1={0} x2={960} y2={y - 40} stroke={K.mute} strokeWidth={2} />
        <circle cx={960} cy={y} r={34} fill="#F2862E" stroke="#2A1A0E" strokeWidth={4} />
        <rect x={944} y={y + 34} width={32} height={70} rx={8} fill="#2B333A" />
        <line x1={960} y1={y + 104} x2={960} y2={1080} stroke={K.mute} strokeWidth={2} strokeDasharray="6 8" />
        <rect x={0} y={y - 90} width={1920} height={180} fill={K.cyan} opacity={0.05} />
        <line x1={0} y1={y} x2={1920} y2={y} stroke={K.cyan} strokeWidth={1.5} strokeDasharray="10 10" opacity={0.5} />
      </svg>
      <Rings t={t} t0={t0 + 0.2} x={960} y={y} every={1.1} maxR={900} color={K.cyan} life={2.6} />
      <MonoTag t={t} t0={t0 + 0.3} t1={t1} text="CANAL SOFAR" x={1010} y={y - 120} />
      <MarineSnow t={t} o={0.7} />
    </AbsoluteFill>
  );
};

/** barrido de sonar sobre un mar vacío + días sin rastro */
const SonarSweep: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  const a = (t - t0) * 140;
  return (
    <AbsoluteFill style={{opacity: o, background: K.abyss}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="sw12" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={K.sonar} stopOpacity={0.0} />
            <stop offset="1" stopColor={K.sonar} stopOpacity={0.18} />
          </radialGradient>
        </defs>
        {[140, 280, 420].map((r) => (
          <circle key={r} cx={960} cy={540} r={r} fill="none" stroke={K.sonar} strokeWidth={1.5} opacity={0.25} />
        ))}
        <line x1={960 - 440} y1={540} x2={960 + 440} y2={540} stroke={K.sonar} opacity={0.15} />
        <line x1={960} y1={100} x2={960} y2={980} stroke={K.sonar} opacity={0.15} />
        <g transform={`rotate(${a} 960 540)`}>
          <path d={`M960 540 L${960 + 440} 540 A440 440 0 0 0 ${960 + 440 * Math.cos(-0.6)} ${540 + 440 * Math.sin(-0.6)} Z`} fill="url(#sw12)" />
          <line x1={960} y1={540} x2={1400} y2={540} stroke={K.sonar} strokeWidth={3} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 1480, top: 470, textAlign: 'left'}}>
        <Odo value={ramp(t, t0 + 0.3, 367, 2.4)} size={120} font="mono" color={K.bone} />
        <div style={{...mono(22, K.sonar, 600), letterSpacing: '0.18em', marginTop: 8}}>DÍAS SIN SABER</div>
        <div style={{...mono(22, K.sonar, 600), letterSpacing: '0.18em'}}>DÓNDE ESTABA</div>
      </div>
      <Scanlines o={0.12} />
    </AbsoluteFill>
  );
};

/** el submarino cayendo en la oscuridad */
const SinkShot: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const k = t - t0;
  const y = -k * 0.9;
  const cam: Cam = {pos: [4.2, 1.2 + y * 0.6, 6.5], look: [0, y - 0.4, 0], fov: 34};
  return (
    <AbsoluteFill style={{opacity: prog(t, t0, 0.2)}}>
      <Stage12 cam={cam} bg="#020A12" fog={['#020A12', 0.07]}>
        <Water s={{t, depth: 130 + k * 30, rays: 0.8}} center={[0, y, 0]} />
        <directionalLight position={[-6, y + 4, -5]} intensity={2.2} color="#8FE0FF" />
        <Submarine s={{t, prop: t * 2}} pos={[0, y, 0]} rot={[0.15, 0.3, -0.22]} />
      </Stage12>
    </AbsoluteFill>
  );
};

/** los restos iluminados por el robot */
export const WreckShot: React.FC<{t: number; t0: number; cam0: Cam; cam1: Cam; span: number; lights?: number}> = ({t, t0, cam0, cam1, span, lights = 1}) => {
  const k = easeInOut(clamp((t - t0) / span));
  const cam: Cam = {pos: [mix(cam0.pos[0], cam1.pos[0], k), mix(cam0.pos[1], cam1.pos[1], k), mix(cam0.pos[2], cam1.pos[2], k)], look: [mix(cam0.look[0], cam1.look[0], k), mix(cam0.look[1], cam1.look[1], k), mix(cam0.look[2], cam1.look[2], k)], fov: mix(cam0.fov ?? 35, cam1.fov ?? 35, k)};
  return (
    <AbsoluteFill style={{opacity: prog(t, t0, 0.25)}}>
      <Stage12 cam={cam} bg="#010407" fog={['#010407', 0.075]}>
        <ambientLight intensity={0.14} color="#9FC8E0" />
        <Wreck t={t} />
        <spotLight position={[cam.pos[0], cam.pos[1] + 0.3, cam.pos[2]]} intensity={5.5 * ((cam.pos[0] - cam.look[0]) ** 2 + (cam.pos[1] - cam.look[1]) ** 2 + (cam.pos[2] - cam.look[2]) ** 2) * lights} distance={40} angle={0.5} penumbra={0.7} color="#E6F5FF">
          <object3D attach="target" position={cam.look} />
        </spotLight>
        <Water s={{t, depth: 907, rays: 0, snow: 1.4}} center={cam.look} />
      </Stage12>
      <Scanlines o={0.1} />
    </AbsoluteFill>
  );
};

/* ================================================================== TÍTULO */
export const TitleCard: React.FC<{t: number}> = ({t}) => {
  const o = prog(t, 0, 0.3);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbyssBg t={t + 40} light={0.15} deep={0.95} snow={1.2} />
      <Rings t={t} t0={0.1} x={960} y={540} n={2} every={1.6} maxR={1100} color={K.cyan} o={0.4} life={3} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center'}}>
        <Odo value={ramp(t, 0.05, 907, 1.2)} size={300} wdth={mix(125, 74, prog(t, 0.3, 1.2))} wght={mix(300, 900, prog(t, 0.2, 1.2))} />
      </div>
      <KTitle t={t} t0={0.9} text="METROS" size={128} y={670} w0={125} w1={112} g0={200} g1={520} track0={0.6} track1={0.32} color={K.cyan} />
      <SerifLine t={t} t0={1.5} text="Qué le pasó al ARA San Juan" size={66} y={800} color={K.bone} />
    </AbsoluteFill>
  );
};

/* ================================================================== S02 · EL SUBMARINO */
const S02_KEYS = (c: (p: string) => number): [number, Cam][] => [
  [-1, {pos: [6.2, 1.5, 4.9], look: [0.2, 0.15, 0], fov: 32}],
  [c('No era') - 0.6, {pos: [-5.2, 1.2, 6.0], look: [0.2, 0.15, 0], fov: 32}],
  [c('Bajo') - 0.4, {pos: [0.5, 0.35, 8.4], look: [0.35, -0.05, 0], fov: 32}],
  [c('Para recargarlas') - 0.3, {pos: [2.4, -0.9, 7.6], look: [0.4, 0.9, 0], fov: 38}],
  [c('Es uno') - 0.4, {pos: [2.0, 1.75, 3.3], look: [0.62, 1.75, 0], fov: 36}],
];
export const S02: React.FC<{t: number}> = ({t}) => {
  const c = (p: string, n = 0) => cue('s02', p, n);
  const tMet = c('sesenta'), tAle = c('construido'), tNoN = c('No era'), tDie = c('era diésel-eléctrico.'), tBajo = c('Bajo'), tCasi = c('casi'), tCel = c('como un'), tGas = c('se gastan.');
  const tRec = c('Para recargarlas'), tAso = c('asomar'), tResp = c('respiran'), tDel = c('Es uno');
  const cam = camPath(t, S02_KEYS(c), 1.5);
  const xr = prog(t, tBajo - 0.3, 1.0, easeInOut) * (1 - prog(t, tRec + 2.6, 1.0, easeInOut) * 0.55);
  const snork = prog(t, tAso - 0.2, 1.4, easeInOut);
  const surf = prog(t, tRec - 0.4, 1.0);
  const charge = 1 - 0.8 * prog(t, tGas - 0.6, 1.4, easeInOut) + 0.8 * prog(t, tResp, 2.5);
  const s = {t, xray: xr, snorkel: snork, prop: t * 3, batt: prog(t, tBajo + 0.9, 1.4), charge, air: prog(t, tResp - 0.3, 0.5) * (1 - prog(t, tDel + 1.5, 0.5)), engines: prog(t, tResp, 0.6)};
  const bow = project(cam, [3.3, 0, 0]), stern = project(cam, [-3.36, 0, 0]);
  const mast = project(cam, [0.62, SUB_R + 0.98 + 0.75 * snork, 0]);
  const eng = project(cam, [-1.25, -0.12, 0]);
  const dimO = fadeIO(t, tMet - 0.1, tNoN - 0.1, 0.3);
  const delic = prog(t, tDel, 0.5);
  return (
    <AbsoluteFill style={{background: '#04121F'}}>
      <Stage12 cam={cam} bg="#04121F" fog={['#04121F', 0.035]}>
        <Water s={{t, depth: 35, rays: 1, surface: surf > 0 ? SUB_R + 1.35 : 0}} center={[0, 0, 0]} />
        <directionalLight position={[-7, 4, -6]} intensity={2.4} color="#7FD8FF" />
        <directionalLight position={[6, 5, 7]} intensity={1.2 * (1 - xr)} color="#DDF3FF" />
        <Submarine s={s} />
      </Stage12>
      <Chapter t={t} t0={0.2} n={1} title="EL SUBMARINO" />
      {/* cota de 66 m */}
      {dimO > 0 ? (
        <svg width={1920} height={1080} style={{position: 'absolute', opacity: dimO}}>
          <line x1={stern[0]} y1={stern[1] - 170} x2={stern[0] + (bow[0] - stern[0]) * prog(t, tMet - 0.1, 0.8)} y2={stern[1] - 170 + (bow[1] - stern[1]) * prog(t, tMet - 0.1, 0.8)} stroke={K.cyan} strokeWidth={3} />
          <line x1={stern[0]} y1={stern[1] - 195} x2={stern[0]} y2={stern[1] - 145} stroke={K.cyan} strokeWidth={3} />
          <line x1={bow[0]} y1={bow[1] - 195} x2={bow[0]} y2={bow[1] - 145} stroke={K.cyan} strokeWidth={3} opacity={prog(t, tMet + 0.6, 0.3)} />
          <text x={(bow[0] + stern[0]) / 2} y={(bow[1] + stern[1]) / 2 - 195} textAnchor="middle" fontFamily={F12.mono} fontWeight={600} fontSize={54} fill={K.bone}>66 m</text>
        </svg>
      ) : null}
      <MonoTag t={t} t0={tAle} t1={tNoN - 0.2} text="TR-1700 · THYSSEN NORDSEEWERKE · EMDEN, ALEMANIA" x={110} y={900} />
      <MonoTag t={t} t0={tAle + 0.5} t1={tNoN - 0.2} text="BOTADO EN 1983 · EN SERVICIO DESDE 1985" x={110} y={946} color={K.amber} />
      <PhotoCard12 src="ep12/img/sj_04.jpg" t={t} t0={tAle + 0.2} t1={tBajo - 0.2} x={1490} y={330} w={600} h={450} rot={2} caption="ARA SAN JUAN · BUENOS AIRES" credit="Martín Otero · CC BY 2.5" />
      {/* no era nuclear */}
      <Choice t={t} t0={tNoN} t1={tBajo - 0.2} a="NUCLEAR" b="DIÉSEL-ELÉCTRICO" tb={tDie} />
      {/* baterías */}
      <DataCard t={t} t0={tCasi - 0.2} t1={tRec - 0.3} x={110} y={150} value={960} dur={1.0} label="CELDAS DE BATERÍA" size={150} color={K.cyan} />
      <PhoneBattery t={t} t0={tCel - 0.2} t1={tRec - 0.3} level={charge} />
      <PhotoCard12 src="ep12/img/bat_01.jpg" t={t} t0={tCasi + 0.6} t1={tCel - 0.1} x={1560} y={560} w={430} h={322} rot={-2} caption="UNA CELDA (TR-1700)" credit="Diego Alexis 93 · CC BY-SA 4.0" />
      {/* snorkel */}
      {snork > 0.4 ? <Leader x={mast[0]} y={mast[1]} dx={120} dy={-80} label="SNORKEL" o={prog(t, tAso + 0.5, 0.4) * (1 - prog(t, tDel - 0.3, 0.3))} /> : null}
      {s.air > 0.2 ? <Leader x={eng[0]} y={eng[1]} dx={-160} dy={140} label="MOTORES DIÉSEL" color={K.amber} o={prog(t, tResp, 0.4) * (1 - prog(t, tDel - 0.3, 0.3))} /> : null}
      <PhotoCard12 src="ep12/vid/tupi.mp4" video from={2} t={t} t0={tResp - 0.4} t1={tDel + 0.2} x={1470} y={300} w={640} h={360} rot={0} caption="SUBMARINO DIÉSEL-ELÉCTRICO TUPI (BRASIL)" credit="Marinha do Brasil · CC BY-SA 2.0" />
      {delic > 0 ? (
        <>
          <Rings t={t} t0={tDel} x={mast[0]} y={mast[1]} every={0.8} maxR={260} color={K.amber} o={0.8} />
          <KTitle t={t} t0={tDel + 0.3} text="EL MOMENTO MÁS DELICADO" size={74} y={930} color={K.amber} w1={92} g1={760} />
        </>
      ) : null}
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

/** dos opciones: la primera se tacha y la segunda se marca */
const Choice: React.FC<{t: number; t0: number; t1: number; a: string; b: string; tb: number}> = ({t, t0, t1, a, b, tb}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  if (o <= 0) return null;
  const pa = prog(t, t0, 0.5), strike = prog(t, t0 + 0.45, 0.4), pb = prog(t, tb - 0.1, 0.5);
  return (
    <div style={{position: 'absolute', left: 110, top: 720, opacity: o}}>
      <div style={{position: 'relative', display: 'inline-block', fontSize: 92, color: K.mute, ...vf(90, 700), opacity: pa, transform: `translateX(${(1 - pa) * -40}px)`}}>
        {a}
        <div style={{position: 'absolute', left: -8, top: '52%', height: 8, width: `${strike * 104}%`, background: K.red}} />
      </div>
      <div style={{fontSize: 108, color: K.cyan, ...vf(mix(118, 80, pb), mix(300, 880, pb)), opacity: pb, marginTop: 4, transform: `translateY(${(1 - pb) * 30}px)`}}>{b}</div>
    </div>
  );
};

/** batería de celular que se descarga (analogía) */
const PhoneBattery: React.FC<{t: number; t0: number; t1: number; level: number}> = ({t, t0, t1, level}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  if (o <= 0) return null;
  const lv = clamp(level);
  const colr = lv < 0.3 ? K.red : lv < 0.6 ? K.amber : K.sonar;
  return (
    <div style={{position: 'absolute', left: 110, top: 520, opacity: o, display: 'flex', alignItems: 'center', gap: 26}}>
      <svg width={120} height={210}>
        <rect x={40} y={4} width={40} height={14} rx={4} fill={K.bone} />
        <rect x={6} y={18} width={108} height={186} rx={18} fill="none" stroke={K.bone} strokeWidth={6} />
        <rect x={18} y={30 + 162 * (1 - lv)} width={84} height={162 * lv} rx={8} fill={colr} />
      </svg>
      <div>
        <div style={{...mono(46, K.bone, 600)}}>{Math.round(lv * 100)}%</div>
        <div style={{...mono(22, K.mute, 500), letterSpacing: '0.14em'}}>COMO UN CELULAR GIGANTE</div>
      </div>
    </div>
  );
};

/** etiqueta con línea guía hacia un punto proyectado */
export const Leader: React.FC<{x: number; y: number; dx: number; dy: number; label: string; sub?: string; color?: string; o?: number}> = ({x, y, dx, dy, label, sub, color = K.cyan, o = 1}) => {
  if (o <= 0) return null;
  const ex = x + dx, ey = y + dy;
  const right = dx >= 0;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
      <circle cx={x} cy={y} r={7} fill={color} />
      <circle cx={x} cy={y} r={16} fill="none" stroke={color} strokeWidth={2} />
      <polyline points={`${x},${y} ${ex},${ey} ${ex + (right ? 40 : -40)},${ey}`} fill="none" stroke={color} strokeWidth={2.5} />
      <text x={ex + (right ? 52 : -52)} y={ey + 10} textAnchor={right ? 'start' : 'end'} fontFamily={F12.mono} fontWeight={600} fontSize={30} fill={K.bone} letterSpacing="0.12em" stroke={K.abyss} strokeWidth={6} paintOrder="stroke">{label}</text>
      {sub ? <text x={ex + (right ? 52 : -52)} y={ey + 44} textAnchor={right ? 'start' : 'end'} fontFamily={F12.mono} fontWeight={500} fontSize={22} fill={color} letterSpacing="0.1em" stroke={K.abyss} strokeWidth={5} paintOrder="stroke">{sub}</text> : null}
    </svg>
  );
};

/* ================================================================== S03 · LA NOCHE */
const ROUTE: [number, number][] = [
  [PL.ushuaia.lon, PL.ushuaia.lat], [-65.6, -55.2], [-63.2, -52.4], [-61.4, -49.0], [PL.pos0030.lon, PL.pos0030.lat], [PL.ultima.lon, PL.ultima.lat], [-58.6, -42.5], [-57.0, -39.6], [PL.mdp.lon, PL.mdp.lat],
];
export const S03: React.FC<{t: number}> = ({t}) => {
  const c = (p: string, n = 0) => cue('s03', p, n);
  const tBordo = c('A bordo'), t44 = c('cuarenta'), tEntre = c('Entre'), tEli = c('Eliana'), tMar = c('El mar'), tNav = c('Navegando'), tEntro = c('entró');
  const tValv = c('válvula'), tLleg = c('llegó'), tCorto = c('Cortocircuito,'), tHumo = c('humo,'), tInc = c('incendio.'), tTrip = c('La tripulación'), tPopa = c('popa.');
  const tSiete = c('A las siete'), tUlt = c('última'), tDesp = c('Después,'), tSil = c('silencio.');
  return (
    <AbsoluteFill style={{background: K.abyss}}>
      {t < tBordo ? <RouteMap t={t} t1={tBordo} /> : null}
      {between(t, tBordo - 0.2, tEntre) ? <CrewDots t={t} t0={tBordo - 0.2} t1={tEntre} t44={t44} /> : null}
      {between(t, tEntre - 0.2, tMar) ? (
        <>
          <Photo src="ep12/img/ek_02.jpg" t={t} t0={tEntre - 0.2} t1={tMar} from={{s: 1.05, x: 60, y: 0}} to={{s: 1.16, x: 20, y: -10}} focus="55% 30%" grade="cold" tint={0.2} credit="Angel Torrez · CC BY-SA 4.0" />
          <NameCard t={t} t0={tEli - 0.1} t1={tMar - 0.1} name="Eliana Krawczyk" role="TENIENTE DE NAVÍO · JEFA DE ARMAS" role2="PRIMERA MUJER OFICIAL SUBMARINISTA DE SUDAMÉRICA" x={110} y={760} />
        </>
      ) : null}
      {between(t, tMar - 0.1, tNav + 0.1) ? <StormShot t={t} t0={tMar - 0.1} /> : null}
      {between(t, tNav, tSiete - 0.1) ? <Cutaway t={t} t0={tNav} tEntro={tEntro} tValv={tValv} tLleg={tLleg} tCorto={tCorto} tHumo={tHumo} tInc={tInc} tTrip={tTrip} tPopa={tPopa} t1={tSiete - 0.1} /> : null}
      {t >= tSiete - 0.2 ? <LastMessage t={t} t0={tSiete - 0.2} tUlt={tUlt} tDesp={tDesp} tSil={tSil} /> : null}
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

const RouteMap: React.FC<{t: number; t1: number}> = ({t, t1}) => {
  const z = prog(t, -0.3, 5.5, easeInOut);
  const v: MapV = {lon: mix(-62.5, -61.5, z), lat: mix(-46.5, -46.4, z), scale: mix(40, 46, z)};
  const p = prog(t, 0.6, 3.2, easeInOut) * 0.62;
  const pts = ROUTE.map(([lo, la]) => mxy(v, lo, la));
  const n = Math.max(2, Math.round(pts.length * 40 * p));
  // muestreo lineal de la ruta
  const samp: [number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 40; k++) samp.push([mix(pts[i][0], pts[i + 1][0], k / 40), mix(pts[i][1], pts[i + 1][1], k / 40)]);
  const sub = samp.slice(0, n);
  const head = sub[sub.length - 1];
  const all = samp.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('');
  const d = sub.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('');
  return (
    <AbsoluteFill style={{opacity: fadeIO(t, -0.4, t1, 0.3)}}>
      <GeoMap v={v} hl={{ARG: '#173650'}}>
        <path d={all} fill="none" stroke={K.bone} strokeWidth={2} strokeDasharray="4 10" opacity={0.35} />
        <path d={d} fill="none" stroke={K.cyan} strokeWidth={5} strokeLinecap="round" />
        <circle cx={head[0]} cy={head[1]} r={10} fill={K.bone} />
        <circle cx={head[0]} cy={head[1]} r={10 + ((t * 30) % 30)} fill="none" stroke={K.cyan} strokeWidth={2} opacity={1 - ((t * 30) % 30) / 30} />
        <Pin12 v={v} lat={PL.ushuaia.lat} lon={PL.ushuaia.lon} label="USHUAIA" side="r" t={t} />
        <Pin12 v={v} lat={PL.mdp.lat} lon={PL.mdp.lon} label="MAR DEL PLATA" sub="BASE DE SUBMARINOS" side="l" t={t} />
        <Pin12 v={v} lat={-45.86} lon={-67.48} label="COMODORO RIVADAVIA" side="r" color={K.mute} size={22} />
      </GeoMap>
      <Timecode t={t} t0={0.1} t1={t1} text="14.11.2017" label="NOCHE" x={110} y={170} size={78} align="left" />
    </AbsoluteFill>
  );
};

/** 44 tripulantes dentro de la silueta */
const CrewDots: React.FC<{t: number; t0: number; t1: number; t44: number}> = ({t, t0, t1, t44}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  const hull = 'M240 560 C 260 470, 420 450, 600 450 L 1500 450 C 1600 450, 1700 490, 1720 540 C 1700 600, 1600 640, 1500 640 L 600 640 C 420 640, 260 640, 240 560 Z';
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbyssBg t={t} light={0.45} deep={0.5} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d={hull} fill="rgba(86,216,255,0.05)" stroke={K.cyan} strokeWidth={3} />
        <path d="M1080 450 L1110 370 L1330 370 L1350 450" fill="rgba(86,216,255,0.05)" stroke={K.cyan} strokeWidth={3} />
        {Array.from({length: 44}, (_, i) => {
          const col = i % 22, row = Math.floor(i / 22);
          const x = 470 + col * 50, y = 520 + row * 56;
          const p = prog(t, t44 - 0.4 + i * 0.03, 0.3);
          return (
            <g key={i} opacity={p} transform={`translate(${x} ${y + (1 - p) * 20})`}>
              <circle cx={0} cy={-10} r={8} fill={i === 5 ? K.amber : K.bone} />
              <rect x={-8} y={0} width={16} height={22} rx={6} fill={i === 5 ? K.amber : K.bone} />
            </g>
          );
        })}
      </svg>
      <DataCard t={t} t0={t44 - 0.3} t1={t1} x={960} y={160} value={44} dur={1.0} label="A BORDO" size={150} color={K.amber} align="center" w={900} />
      <MarineSnow t={t} o={0.5} />
    </AbsoluteFill>
  );
};

/** mar bravo de noche: el cabezal del snorkel entre las olas */
const StormShot: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const k = t - t0;
  const flash = Math.max(0, 1 - Math.abs(k - 0.55) * 9) + Math.max(0, 1 - Math.abs(k - 0.85) * 12) * 0.6;
  const cam: Cam = {pos: [3.2 - k * 0.3, 1.4, 5.0], look: [0.4, 0.5, 0], fov: 42};
  return (
    <AbsoluteFill style={{opacity: prog(t, t0, 0.15), background: '#03080D'}}>
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(40,58,80,${0.6 + flash}) 0%, #03080D 55%)`}} />
      <Stage12 cam={cam} fog={['#05101A', 0.06]}>
        <StormSea t={t * 1.6} flash={flash} size={50} detail={1} />
        <group position={[0, -1.25, 0]}>
          <Submarine s={{t, snorkel: 1}} />
        </group>
        <Spray t={t} pos={[0.62, 0.35, 0]} />
      </Stage12>
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: 0.55}}>
        {Array.from({length: 140}, (_, i) => {
          const x = rnd(i) * 2100 - 90, ph = (t * (1.6 + rnd(i + 2)) + rnd(i + 1)) % 1;
          return <line key={i} x1={x + ph * 80} y1={ph * 1180 - 60} x2={x + ph * 80 + 14} y2={ph * 1180 - 6} stroke="#B7C9DA" strokeWidth={1.4} />;
        })}
      </svg>
      <KTitle t={t} t0={t0 + 0.2} text="EL MAR ESTABA BRAVO" size={80} y={900} w1={90} g1={760} />
    </AbsoluteFill>
  );
};

/** corte en rayos X: el agua entra por la ventilación y llega a las baterías de proa */
const Cutaway: React.FC<{t: number; t0: number; tEntro: number; tValv: number; tLleg: number; tCorto: number; tHumo: number; tInc: number; tTrip: number; tPopa: number; t1: number}> = ({
  t, t0, tEntro, tValv, tLleg, tCorto, tHumo, tInc, tTrip, tPopa, t1,
}) => {
  const fault = t >= tCorto - 0.1 && t < tTrip + 0.4;
  const base = camPath(t, [
    [t0 - 1, {pos: [2.2, 2.6, 6.2], look: [0.8, 0.6, 0], fov: 34}],
    [tLleg - 0.6, {pos: [3.0, 1.5, 4.6], look: [1.5, 0.6, 0], fov: 34}],
    [tTrip - 0.2, {pos: [0.6, 1.1, 7.6], look: [0.8, -0.1, 0], fov: 34}],
  ], 1.6);
  // deriva continua (órbita lenta y acercamiento) para que la cámara nunca quede quieta entre llaves
  const ang = (t - t0 - 8) * 0.014, sc = 1 - (t - t0) * 0.004;
  const [lx, ly, lz] = base.look, dx = base.pos[0] - lx, dz = base.pos[2] - lz;
  const cam: Cam = {...base, pos: [lx + (dx * Math.cos(ang) - dz * Math.sin(ang)) * sc, ly + (base.pos[1] - ly) * sc, lz + (dx * Math.sin(ang) + dz * Math.cos(ang)) * sc]};
  const shk = fault ? (rnd(Math.floor(t * 24)) - 0.5) * 8 * (1 - prog(t, tTrip - 0.3, 0.5)) : 0;
  const valve = project(cam, VALVE_POS), bowB = project(cam, BOW_BATT_POS), sternB = project(cam, STERN_BATT_POS);
  const sparks = fault ? 1 - prog(t, tTrip, 0.6) : 0;
  return (
    <AbsoluteFill style={{opacity: fadeIO(t, t0, t1, 0.25), background: '#04121F', transform: `translate(${shk}px, ${shk * 0.6}px)`}}>
      <Stage12 cam={cam} bg="#04121F" fog={['#04121F', 0.03]}>
        <Water s={{t, depth: 60, rays: 0.6}} />
        <Submarine s={{t, xray: 1, snorkel: 1, batt: 1, water: prog(t, tEntro - 0.2, 2.2), bow: t > tTrip + 0.8 ? 'off' : fault ? 'fault' : 'ok', stern: t > tTrip + 0.8 ? 'use' : 'ok', sparks, prop: t * 2}} />
      </Stage12>
      {/* humo */}
      {fault ? (
        <svg width={1920} height={1080} style={{position: 'absolute', opacity: prog(t, tHumo - 0.2, 0.6) * (1 - prog(t, tTrip + 0.5, 1.0))}}>
          {Array.from({length: 14}, (_, i) => {
            const ph = ((t - tHumo) * 0.35 + rnd(i)) % 1;
            return <circle key={i} cx={bowB[0] + (rnd(i + 3) - 0.5) * 160 + ph * 60} cy={bowB[1] - ph * 220} r={40 + ph * 90} fill="#9AA3AA" opacity={(1 - ph) * 0.18} style={{filter: 'blur(14px)'}} />;
          })}
        </svg>
      ) : null}
      <Leader x={valve[0]} y={valve[1]} dx={-180} dy={-120} label="VÁLVULA E-19" sub="YA VENÍA FALLANDO" color={K.amber} o={prog(t, tValv - 0.1, 0.4) * (1 - prog(t, tCorto - 0.4, 0.3))} />
      <Leader x={bowB[0]} y={bowB[1]} dx={150} dy={170} label="BATERÍAS DE PROA" sub="TANQUE N.º 3" color={fault ? K.red : K.cyan} o={prog(t, tLleg + 0.2, 0.4) * (1 - prog(t, tTrip - 0.3, 0.3))} />
      <Leader x={bowB[0]} y={bowB[1]} dx={120} dy={160} label="PROA" sub="FUERA DE SERVICIO" color={K.mute} o={prog(t, tTrip + 0.8, 0.4)} />
      <Leader x={sternB[0]} y={sternB[1]} dx={-140} dy={160} label="POPA" sub="EN USO" color={K.sonar} o={prog(t, tPopa - 0.6, 0.4)} />
      <div style={{position: 'absolute', left: 110, top: 160}}>
        {[['CORTOCIRCUITO', tCorto, K.red], ['HUMO', tHumo, K.amber], ['PRINCIPIO DE INCENDIO', tInc - 0.6, K.red]].map(([w, at, colr], i) => {
          const p = prog(t, (at as number) - 0.05, 0.35);
          const out = prog(t, tTrip - 0.2, 0.4);
          return (
            <div key={i} style={{overflow: 'hidden', height: 100}}>
              <div style={{fontSize: 92, color: colr as string, ...vf(mix(118, 78, p), mix(300, 880, p)), transform: `translateY(${(1 - p) * 100 + out * -100}%)`, opacity: 1 - out}}>{w as string}</div>
            </div>
          );
        })}
      </div>
      <Credit12 text="RECREACIÓN 3D" align="left" x={110} />
      <Vignette k={0.45} />
    </AbsoluteFill>
  );
};

const LAST_MSG =
  'INGRESO DE AGUA DE MAR POR SISTEMA DE VENTILACIÓN AL TANQUE DE BATERÍAS N° 3 OCASIONÓ CORTOCIRCUITO Y PRINCIPIO DE INCENDIO EN EL BALCÓN DE BARRA DE BATERÍAS. BATERÍAS DE PROA FUERA DE SERVICIO. AL MOMENTO EN INMERSIÓN PROPULSANDO CON CIRCUITO DIVIDIDO. SIN NOVEDADES DE PERSONAL.';
const LastMessage: React.FC<{t: number; t0: number; tUlt: number; tDesp: number; tSil: number}> = ({t, t0, tUlt, tDesp, tSil}) => {
  const o = prog(t, t0, 0.3);
  const n = Math.floor(clamp((t - t0 - 0.4) * 62, 0, LAST_MSG.length));
  const fade = prog(t, tDesp - 0.1, 1.2, easeIn);
  const clockMin = 30 + Math.floor(clamp((t - tDesp) * 1.6, 0, 9));
  return (
    <AbsoluteFill style={{opacity: o, background: K.abyss}}>
      <div style={{position: 'absolute', left: 260, top: 170, width: 1400, padding: '46px 56px', background: 'rgba(230,225,213,0.95)', color: K.ink, boxShadow: '0 40px 90px rgba(0,0,0,0.6)', opacity: 1 - fade, transform: `rotate(-0.6deg) translateY(${fade * 30}px)`}}>
        <div style={{display: 'flex', justifyContent: 'space-between', ...mono(24, K.ink, 600), letterSpacing: '0.14em', borderBottom: `2px solid ${K.ink}`, paddingBottom: 14}}>
          <span>ARA SAN JUAN → COMANDO</span>
          <span>15.11.2017 · 07:30</span>
        </div>
        <div style={{fontFamily: F12.mono, fontWeight: 500, fontSize: 36, lineHeight: 1.45, marginTop: 24, minHeight: 420}}>
          {LAST_MSG.slice(0, n)}
          {n < LAST_MSG.length ? <span style={{background: K.ink, color: K.paper}}>&nbsp;</span> : null}
        </div>
        <div style={{...mono(18, '#555', 500), letterSpacing: '0.1em', marginTop: 10}}>TEXTO DEL MENSAJE SEGÚN LA ARMADA ARGENTINA</div>
      </div>
      <MonoTag t={t} t0={tUlt} t1={tDesp + 0.2} text="ÚLTIMA COMUNICACIÓN" x={260} y={110} color={K.amber} />
      {t > tDesp - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(t, tDesp + 0.2, 0.6)}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: F12.mono, fontWeight: 500, fontSize: 120, color: K.bone}}>
            07:{String(clockMin).padStart(2, '0')}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', ...mono(28, K.red, 600), letterSpacing: '0.4em', opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 3))}}>SIN COMUNICACIÓN</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ================================================================== S04 · LA BÚSQUEDA */
export const S04: React.FC<{t: number}> = ({t}) => {
  const c = (p: string, n = 0) => cue('s04', p, n);
  const tEmp = c('Empezó'), tPai = c('más de'), tCua = c('cuatro mil'), tBar = c('barcos'), tEsp = c('España.'), tFam = c('Las familias'), tAfe = c('aferradas');
  const tHubo = c('Y hubo'), tSiete = c('Siete'), tLlen = c('que llenaron'), tDos = c('Dos días', 1), tNo = c('no eran'), tHasta = c('Hasta que'), tOcho = c('ocho días'), tHablo = c('habló');
  return (
    <AbsoluteFill style={{background: K.abyss}}>
      {t < tEmp ? <SubmissDoc t={t} t1={tEmp} /> : null}
      {between(t, tEmp - 0.2, tBar - 0.1) ? (
        <>
          <Clip src="ep12/vid/urc_llega.mp4" t={t} t0={tEmp - 0.2} t1={tPai + 1.4} zoom={[1.02, 1.1]} credit="U.S. Navy · Comodoro Rivadavia, nov. 2017 · dominio público" />
          <Photo src="ep12/img/p8_01.jpg" t={t} t0={tPai + 1.2} t1={tCua + 0.9} from={{s: 1.05, x: 40, y: 0}} to={{s: 1.15, x: -40, y: 0}} credit="Embajada de EE. UU. · CC BY 2.0" />
          <Photo src="ep12/img/rus_01.jpg" t={t} t0={tCua + 0.7} t1={tBar} from={{s: 1.05, x: 0, y: 0}} to={{s: 1.12, x: 0, y: -20}} focus="50% 40%" credit="Ministerio de Defensa de Rusia · CC BY 4.0" />
          <DataCard t={t} t0={tPai - 0.1} t1={tBar - 0.2} x={110} y={160} value={12} prefix="+" dur={0.8} label="PAÍSES" size={150} color={K.cyan} />
          <DataCard t={t} t0={tCua - 0.1} t1={tBar - 0.2} x={110} y={480} value={4000} dur={1.0} label="PERSONAS" size={150} color={K.amber} />
        </>
      ) : null}
      {between(t, tBar - 0.2, tFam) ? <SearchMap t={t} t0={tBar - 0.2} tEsp={tEsp} t1={tFam} /> : null}
      {between(t, tFam - 0.2, tHubo) ? (
        <>
          <Photo src="ep12/img/tr_03.jpg" t={t} t0={tFam - 0.2} t1={tAfe} from={{s: 1.05, x: 0, y: 0}} to={{s: 1.14, x: -30, y: 0}} credit="Darío Alpern · GFDL" />
          <Photo src="ep12/img/mdp_01.jpg" t={t} t0={tAfe - 0.2} t1={tHubo} from={{s: 1.04, x: 0, y: 0}} to={{s: 1.14, x: 20, y: -10}} credit="Argentina.gob.ar · CC BY-SA 2.5" />
          <MonoTag t={t} t0={tFam + 0.2} t1={tHubo - 0.1} text="BASE NAVAL MAR DEL PLATA" x={110} y={210} />
        </>
      ) : null}
      {between(t, tHubo - 0.2, tHasta) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tHubo - 0.2, tHasta, 0.3)}}>
          <AbyssBg t={t} light={0.25} deep={0.8} />
          <KTitle t={t} t0={tHubo} t1={tSiete - 0.1} text="Y HUBO SEÑALES" size={110} y={540} />
          <CallsRow t={t} t0={tSiete - 0.1} strike={tNo - 0.1} y={470} />
          <MonoTag t={t} t0={tSiete + 0.9} t1={tHasta} text="18.11.2017 · ENTRE LAS 10:52 Y LAS 14:42 · DE 4 A 36 SEGUNDOS" x={960 - 640} y={700} color={K.sonar} />
          <Timecode t={t} t0={tDos - 0.1} t1={tHasta} text="20.11.2017" x={960} y={210} size={70} label="LA CONFIRMACIÓN" />
          <Stamp12 t={t} t0={tNo + 0.4} t1={tHasta} text="NO ERAN DEL SUBMARINO" x={960} y={850} size={74} rot={-4} />
        </AbsoluteFill>
      ) : null}
      {t >= tHasta - 0.2 ? (
        <>
          <Photo src="ep12/img/hyd_03.jpg" t={t} t0={tHasta - 0.2} from={{s: 1.06, x: 0, y: 0}} to={{s: 1.2, x: 0, y: 20}} dur={6} credit="CTBTO · CC BY 2.0" />
          <Timecode t={t} t0={tOcho} text="23.11.2017" x={960} y={220} size={92} label="OCHO DÍAS DESPUÉS" />
          <Rings t={t} t0={tHablo} x={960} y={600} every={0.7} maxR={900} color={K.cyan} />
          <KTitle t={t} t0={tHablo} text="HABLÓ EL MICRÓFONO" size={96} y={890} color={K.cyan} />
        </>
      ) : null}
      <Chapter t={t} t0={0.2} n={2} title="LA BÚSQUEDA" />
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

/** el mensaje real de la Armada que declara la emergencia (SUBMISS) */
const SubmissDoc: React.FC<{t: number; t1: number}> = ({t, t1}) => {
  const c = (p: string) => cue('s04', p);
  const o = fadeIO(t, -0.4, t1, 0.3);
  const W = 1100, H = (1110 / 1920) * W;
  const sc = 1.0 + 0.04 * clamp((t + 0.4) / 5);
  const hl = (y0: number, y1: number, at: number, colr: string) => {
    const p = prog(t, at, 0.5);
    return <div style={{position: 'absolute', left: 8, top: (y0 / 1110) * H, width: (W - 16) * p, height: ((y1 - y0) / 1110) * H, background: colr, mixBlendMode: 'multiply', opacity: 0.55}} />;
  };
  return (
    <AbsoluteFill style={{opacity: o, background: K.abyss}}>
      <AbyssBg t={t} light={0.25} deep={0.7} snow={0.4} />
      <div style={{position: 'absolute', left: 1060, top: 545, width: W, height: H, transform: `translate(-50%,-50%) scale(${sc}) rotate(-0.8deg)`, boxShadow: '0 40px 90px rgba(0,0,0,0.7)'}}>
        <Img src={staticFile('ep12/img/cab_01.jpg')} style={{width: W, height: H}} />
        {hl(248, 322, c('la Armada'), '#FFB547')}
        {hl(548, 690, c('perdido'), '#56D8FF')}
      </div>
      <Timecode t={t} t0={-0.2} t1={t1} text="17.11.2017" label="MENSAJE DE LA ARMADA" x={960} y={110} size={64} />
      <Credit12 text="Armada Argentina · mensaje SUBMISS · dominio público" />
    </AbsoluteFill>
  );
};

/** área de búsqueda contra la silueta de España */
const SearchMap: React.FC<{t: number; t0: number; tEsp: number; t1: number}> = ({t, t0, tEsp, t1}) => {
  const v: MapV = {lon: -57.0, lat: -46.0, scale: mix(62, 56, prog(t, t0, 4))};
  const R = Math.sqrt(482507 / Math.PI);
  const ps = prog(t, t0 + 0.3, 1.2, easeInOut);
  const sp = prog(t, tEsp - 0.6, 0.9, easeOut);
  return (
    <AbsoluteFill style={{opacity: fadeIO(t, t0, t1, 0.3)}}>
      <GeoMap v={v} hl={{ARG: '#12293B'}} under={<Wavefront v={v} lat={-46.0} lon={-60.0} km={R * ps} color={K.cyan} width={3} />}>
        <SpainGhost v={v} lat={-46.2} lon={-47.8} o={sp} p={sp} />
        <Pin12 v={v} lat={PL.ultima.lat} lon={PL.ultima.lon} label="ÚLTIMA POSICIÓN" side="r" color={K.amber} t={t} size={24} />
      </GeoMap>
      <div style={{position: 'absolute', left: 110, top: 150}}>
        <div style={{...mono(24, K.cyan, 600), letterSpacing: '0.18em'}}>ÁREA DE BÚSQUEDA</div>
        <Odo value={ramp(t, t0 + 0.3, 482507, 1.6)} size={92} suffix=" km²" font="mono" />
        <div style={{...mono(24, K.amber, 600), letterSpacing: '0.18em', marginTop: 24, opacity: sp}}>ESPAÑA</div>
        <div style={{fontFamily: F12.mono, fontWeight: 600, fontSize: 92, color: K.bone, opacity: sp}}>505.990 km²</div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== S05 · EL MICRÓFONO */
const V_ATL: MapV = {lon: -4, lat: -26, scale: 15.5};
export const S05: React.FC<{t: number}> = ({t}) => {
  const c = (p: string, n = 0) => cue('s05', p, n);
  const tCier = c('A cierta'), tSon = c('el sonido'), tReb = c('rebota'), tComo = c('como la'), tViaja = c('y viaja'), tSe = c('Se llama'), tDesp = c('Después de');
  const tMund = c('el mundo'), tPara = c('para descubrir'), tUno = c('Uno está'), tSeis = c('a seis'), tOtro = c('Otro,'), tOcho = c('a casi'), tAl = c('Al primero,'), tLleg = c('llegar.'), tCruz = c('Cruzando'), tPunto = c('un punto');
  const showDiag = t < tSe + 2.1;
  return (
    <AbsoluteFill style={{background: K.abyss}}>
      {showDiag ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tSe + 1.6, 0.5)}}>
          <AbyssBg t={t} light={0.15} deep={0.9} snow={0.4} />
          <SofarDiagram t={t} t0={tSon} p={prog(t, tSon, tViaja + 2.0 - tSon, easeInOut)} showProfile={prog(t, tReb, 0.6)} label={prog(t, tCier + 0.3, 0.6)} o={(1 - prog(t, tSe - 0.2, 0.4) * 0.6) * prog(t, -0.3, 0.5)} />
          <FiberInset t={t} t0={tComo - 0.1} t1={tSe - 0.2} x={1260} y={60} w={520} />
          <KTitle t={t} t0={tSe + 0.1} text={'CANAL\nSOFAR'} size={190} y={500} color={K.bone} w0={125} w1={80} g0={200} g1={880} />
          <MonoTag t={t} t0={tSe + 0.6} text="SOUND FIXING AND RANGING" x={960 - 260} y={760} color={K.cyan} />
        </AbsoluteFill>
      ) : null}
      {between(t, tDesp - 0.2, tUno - 0.1) ? (
        <>
          <Photo src="ep12/img/hyd_02.jpg" t={t} t0={tDesp - 0.2} t1={tPara} from={{s: 1.05, x: 0, y: 0}} to={{s: 1.16, x: 0, y: 0}} credit="CTBTO · CC BY 2.0" />
          <Photo src="ep12/img/hyd_05.jpg" t={t} t0={tPara - 0.2} t1={tUno - 0.1} from={{s: 1.05, x: 0, y: 0}} to={{s: 1.14, x: -30, y: 0}} credit="CTBTO · CC BY 2.0" />
          <MonoTag t={t} t0={tMund} t1={tUno - 0.2} text="RED DEL TRATADO DE PROHIBICIÓN COMPLETA DE LOS ENSAYOS NUCLEARES" x={110} y={170} size={22} />
          <MonoTag t={t} t0={tMund + 0.8} t1={tUno - 0.2} text="11 ESTACIONES HIDROACÚSTICAS EN LOS OCÉANOS" x={110} y={212} size={22} color={K.amber} />
        </>
      ) : null}
      {t >= tUno - 0.2 ? <StationsMap t={t} t0={tUno - 0.2} tSeis={tSeis} tOtro={tOtro} tOcho={tOcho} tAl={tAl} tLleg={tLleg} tCruz={tCruz} tPunto={tPunto} /> : null}
      <Chapter t={t} t0={0.2} n={3} title="EL MICRÓFONO" />
      <Vignette k={0.45} />
    </AbsoluteFill>
  );
};

const StationsMap: React.FC<{t: number; t0: number; tSeis: number; tOtro: number; tOcho: number; tAl: number; tLleg: number; tCruz: number; tPunto: number}> = ({t, t0, tSeis, tOtro, tOcho, tAl, tLleg, tCruz, tPunto}) => {
  const z = prog(t, tPunto - 0.6, 2.4, easeInOut);
  const v: MapV = {lon: mix(V_ATL.lon, PL.evento.lon, z), lat: mix(V_ATL.lat, PL.evento.lat, z), scale: mix(V_ATL.scale, 120, z * z)};
  const E = PL.evento, A = PL.ascension, C = PL.crozet;
  const dA = 6035, dC = 7760; // distancias publicadas por la CTBTO
  // el frente de onda: 0 → Ascensión en (tAl → tLleg), sigue hasta Crozet
  const wf = t < tAl ? 0 : t < tLleg ? dA * easeInOut(clamp((t - tAl) / (tLleg - tAl))) : dA + (dC - dA) * easeOut(clamp((t - tLleg) / 0.9));
  const mins = Math.round((wf / 1.48) / 60);
  const bear = prog(t, tCruz, 1.4, easeInOut);
  const [ax, ay] = mxy(v, A.lon, A.lat), [cx, cy] = mxy(v, C.lon, C.lat);
  return (
    <AbsoluteFill style={{opacity: prog(t, t0, 0.4)}}>
      <GeoMap v={v} under={<Wavefront v={v} lat={E.lat} lon={E.lon} km={wf} color={K.cyan} o={1 - prog(t, tCruz + 0.4, 0.6)} />}>
        {STATIONS.map((s, i) => {
          const [x, y] = mxy(v, s.lon, s.lat);
          return <circle key={i} cx={x} cy={y} r={7} fill={s.kind === 'H' ? K.cyan : K.mute} opacity={0.65 * prog(t, t0 + 0.1 + i * 0.05, 0.3) * (1 - z)} />;
        })}
        <GreatArc v={v} a={[E.lat, E.lon]} b={[A.lat, A.lon]} p={prog(t, tSeis - 0.2, 1.0) * (1 - prog(t, tAl - 0.4, 0.3))} color={K.amber} dash />
        <GreatArc v={v} a={[E.lat, E.lon]} b={[C.lat, C.lon]} p={prog(t, tOcho - 0.2, 1.0) * (1 - prog(t, tAl - 0.4, 0.3))} color={K.amber} dash />
        {/* rumbos desde cada estación */}
        <GreatArc v={v} a={[A.lat, A.lon]} b={[E.lat, E.lon]} p={bear} color={K.sonar} width={3.5} />
        <GreatArc v={v} a={[C.lat, C.lon]} b={[E.lat, E.lon]} p={bear} color={K.sonar} width={3.5} />
        <Pin12 v={v} lat={A.lat} lon={A.lon} label="HA10 · ASCENSIÓN" sub={t > tSeis + 0.4 ? '6.035 km' : undefined} side="r" t={t} o={prog(t, t0 + 0.3, 0.4) * (1 - z)} />
        <Pin12 v={v} lat={C.lat} lon={C.lon} label="HA04 · CROZET" sub={t > tOcho + 0.4 ? '7.760 km' : undefined} side="l" t={t} o={prog(t, tOtro, 0.4) * (1 - z)} />
        <Pin12 v={v} lat={E.lat} lon={E.lon} label={z > 0.5 ? '46°07′S · 59°41′O' : 'ARA SAN JUAN'} side="r" color={K.red} t={t} o={prog(t, t0 + 0.6, 0.4)} size={z > 0.5 ? 34 : 26} />
      </GeoMap>
      {/* fotos de las estaciones */}
      <PhotoCard12 src="ep12/img/ha10_01.jpg" t={t} t0={tSeis - 0.6} t1={tOtro} x={Math.min(1650, ax + 330)} y={Math.max(260, ay - 40)} w={440} h={330} rot={2} caption="HA10 · ISLA ASCENSIÓN" credit="CTBTO · CC BY 2.0" />
      <PhotoCard12 src="ep12/img/ha04_02.jpg" t={t} t0={tOtro + 0.3} t1={tAl - 0.2} x={Math.max(300, cx - 330)} y={Math.max(260, cy - 330)} w={440} h={293} rot={-2} caption="HA04 · ISLAS CROZET" credit="CTBTO · CC BY 2.0" />
      {t > tAl - 0.2 && t < tCruz + 1.0 ? (
        <div style={{position: 'absolute', left: 110, top: 150, opacity: fadeIO(t, tAl - 0.2, tCruz + 1.0, 0.3)}}>
          <div style={{...mono(24, K.cyan, 600), letterSpacing: '0.18em'}}>TIEMPO DESDE EL RUIDO</div>
          <div style={{fontFamily: F12.mono, fontWeight: 600, fontSize: 110, color: K.bone}}>+{mins} min</div>
          <div style={{...mono(22, K.mute, 500), letterSpacing: '0.12em'}}>EL SONIDO VIAJA A ≈ 1,5 km POR SEGUNDO</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
export {Credit12};
