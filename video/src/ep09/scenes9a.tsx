/* Escenas 1–5 del episodio 9 (Vaca Muerta). t = segundos desde el inicio del segmento. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {F} from '../theme';
import {cue} from './lib';
import {
  Big, BarrelIcon, Chip, Count, Credit, DepthGauge, Dust, Framed, FullPhoto, FullVideo, K, OilBg, PersonIcon, Pin, PumpDisplay, Ranking, SplitVs, SrcLine, Stat, Tag, Vig, YearsBack,
  between, clamp, easeIn, easeInOut, easeOut, fadeIO, fmt, pop, prog,
} from './kit9';
import {
  BARREL_STEP, Barrels, Cam, GeoBlock, GeoState, LAT_END, MapState, PLACES, ProvMap, Stage, VM_BOT, VM_MID, VM_TOP, WX, camPath, geo3, lerpCam, project, towerItems,
} from './three9';

type P = {t: number};

/* ---------- cámaras del bloque ---------- */
export const BLOCK_WIDE: Cam = {pos: [10.5, 1.5, 17.5], look: [0, -3.4, 0], fov: 34};
const BLOCK_TOP: Cam = {pos: [WX + 6.2, 4.6, 12.5], look: [WX + 1.2, 0.2, 1.2], fov: 34};
const BLOCK_DEEP: Cam = {pos: [WX + 3.4, VM_MID + 0.9, 9.6], look: [WX + 2.6, VM_MID - 0.1, 3], fov: 34};
const BLOCK_SEA: Cam = {pos: [9.5, -1.6, 15.5], look: [0, -4.3, 0], fov: 34};

export const BlockShot: React.FC<{cam: Cam; s: GeoState; o?: number; night?: boolean}> = ({cam, s, o = 1, night}) => (
  <AbsoluteFill style={{opacity: o}}>
    <Stage cam={cam} shadow={14} key0={[6, 12, 10]} keyI={night ? 1.5 : 2.2} fill={night ? 0.45 : 0.6} rimColor="#FF9A4C" exposure={1.05}>
      <GeoBlock s={s} />
    </Stage>
  </AbsoluteFill>
);

/* ---------- cámara del mapa ---------- */
export const mapCam = (lon: number, lat: number, dist: number, tilt = 0.9, yaw = 0, fov = 34): Cam => {
  const [x, , z] = geo3(lon, lat);
  return {pos: [x + Math.sin(yaw) * dist * Math.cos(tilt), dist * Math.sin(tilt), z + Math.cos(yaw) * dist * Math.cos(tilt)], look: [x, 0, z], fov};
};
export const MapShot: React.FC<{cam: Cam; s: MapState; o?: number}> = ({cam, s, o = 1}) => (
  <AbsoluteFill style={{opacity: o}}>
    <Stage cam={cam} shadow={40} key0={[-14, 30, 18]} keyI={1.9} fill={0.75} rimColor="#7FB8FF" exposure={1.05} target={cam.look}>
      <ProvMap s={s} />
    </Stage>
  </AbsoluteFill>
);

/** sello "RÉCORD ABSOLUTO" */
const Stamp: React.FC<{t: number; t0: number; text: string; x: number; y: number; color?: string; rot?: number; size?: number}> = ({t, t0, text, x, y, color = K.red, rot = -8, size = 64}) => {
  if (t < t0) return null;
  const s = pop(t, t0, 1.4);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${2.2 - 1.2 * Math.min(1, s)})`, opacity: prog(t, t0, 0.15)}}>
      <div style={{border: `7px solid ${color}`, color, fontFamily: F.head, fontSize: size, padding: '8px 28px 2px', letterSpacing: 4, borderRadius: 8, background: 'rgba(6,8,11,0.55)', whiteSpace: 'nowrap'}}>{text}</div>
    </div>
  );
};

/* =====================================================================================
   S01 · gancho: Ormuz, el récord, la nafta, ¿Arabia Saudita o Venezuela?, bajar 3 km y 150 millones de años
   ===================================================================================== */
export const S01: React.FC<P & {dur: number}> = ({t, dur}) => {
  const c = (p: string, n = 0) => cue('s01', p, n);
  const tNqn = c('en el desierto'), tAgo = c('En agosto,'), tRec = c('Récord'), tExp = c('El petróleo ya'), tGano = c('le ganó'), tNafta = c('Y sin embargo,');
  const tComo = c('¿Cómo'), tArabia = c('¿Nos'), tVen = c('o en Venezuela?'), tBajar = c('Para entenderlo,'), tViajar = c('Y viajar'), tTitle = dur + 0.1;
  // bloque: baja desde la superficie hasta Vaca Muerta y vuelve en el tiempo
  const cam = camPath(t, [
    [tBajar - 0.5, {pos: [WX + 4.6, 5.2, 10.5], look: [WX + 0.4, 0.6, 1.2], fov: 34}],
    [tBajar + 0.4, BLOCK_TOP],
    [c('bajar') + 0.3, BLOCK_DEEP],
    [tViajar + 0.4, BLOCK_SEA],
  ], 2.2);
  const km = 3 * easeInOut(clamp((t - c('bajar')) / 2.4));
  const back = easeInOut(clamp((t - tViajar - 0.3) / 3.4));
  const geo: GeoState = {
    t, build: 1 - back, sea: clamp((back - 0.55) / 0.45), plank: clamp((back - 0.7) / 0.3), glow: prog(t, c('tierra.'), 0.8) * (1 - back * 0.6), night: 0.5, surface: 1,
    vm: 1, rock: 1 - back * 0.85,
  };
  const pctNafta = clamp((t - c('subió') - 0.1) / 1.6);
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {/* A · Ormuz: la flota y la guerra */}
      {t < tNqn + 0.4 ? (
        <AbsoluteFill>
          <FullVideo src="ep09/vid/bloqueo.mp4" t={t} t0={-0.3} t1={tNqn + 0.4} from={0.2} zoom={[1.12, 1.03]} dim={0.35} bw credit="CENTCOM, dominio público" />
          <Chip t={t} t0={c('estrecho')} t1={tNqn + 0.4} text="ESTRECHO DE ORMUZ · 2026" x={430} y={140} color={K.red} />
        </AbsoluteFill>
      ) : null}
      {/* B · el desierto de Neuquén de noche */}
      {between(t, tNqn - 0.2, tAgo + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tNqn - 0.2, tAgo + 0.4, 0.25)}}>
          <FullPhoto src="ep09/rig_noche.jpg" t={t} t0={tNqn - 0.2} t1={tAgo + 0.4} zoom={[1.14, 1.04]} focus="30% 60%" dim={0.3} credit="Juan Mariano, CC BY-SA 4.0" />
          <Dust t={t} n={36} o={0.6} />
          <Chip t={t} t0={c('Neuquén') - 0.1} t1={tAgo + 0.4} text="VACA MUERTA · NEUQUÉN" x={420} y={140} color={K.oil} />
          <Big t={t} t0={c('algo')} t1={tAgo + 0.4} text="ALGO HISTÓRICO" size={150} y={800} hl={{HISTÓRICO: K.oil}} />
        </AbsoluteFill>
      ) : null}
      {/* C · el récord */}
      {between(t, tAgo, tExp + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tAgo, tExp + 0.4, 0.3)}}>
          <FullVideo src="ep09/vid/bombeo.mp4" t={t} t0={tAgo} t1={tExp + 0.4} zoom={[1.06, 1.14]} dim={1.0} fade={0.01} credit="H-2-O, CC BY-SA 4.0" />
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(6,8,11,0.35) 0%, rgba(6,8,11,0.85) 75%)'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: prog(t, tAgo, 0.4)}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 8, color: K.mute}}>ARGENTINA · AGOSTO 2026</div>
            <div style={{fontFamily: F.head, fontSize: 290, lineHeight: 1, color: K.cream, marginTop: 10, textShadow: '0 20px 60px rgba(0,0,0,0.7)'}}>
              <Count t={t} t0={c('novecientos')} dur={2.6} from={600000} to={936800} />
            </div>
            <div style={{fontFamily: F.head, fontSize: 70, color: K.oil, opacity: prog(t, c('barriles'), 0.4)}}>BARRILES DE PETRÓLEO POR DÍA</div>
          </div>
          <Stamp t={t} t0={tRec} text="RÉCORD ABSOLUTO" x={1530} y={180} rot={-9} />
          <SrcLine t={t} t0={tAgo + 0.6} text="Fuente: Secretaría de Energía, producción de agosto de 2026" />
        </AbsoluteFill>
      ) : null}
      {/* D · le ganó a la soja */}
      {between(t, tExp, tNafta + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tExp, tNafta + 0.4, 0.3)}}>
          <FullVideo src="ep09/vid/bombeo2.mp4" t={t} t0={tExp} t1={tNafta + 0.4} zoom={[1.1, 1.02]} dim={1.4} fade={0.01} bw />
          <AbsoluteFill style={{background: 'rgba(6,8,11,0.72)'}} />
          <ExportRace t={t} t0={tExp + 0.2} tSwap={tGano} />
          <SrcLine t={t} t0={tExp + 0.6} text="Fuente: INDEC, exportaciones por producto (2026)" />
        </AbsoluteFill>
      ) : null}
      {/* E · la nafta */}
      {between(t, tNafta, tComo + 0.25) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tNafta, tComo + 0.25, 0.3)}}>
          <FullPhoto src="ep09/ypf_caseros.jpg" t={t} t0={tNafta} t1={tComo + 0.25} zoom={[1.04, 1.12]} dim={0.9} focus="60% 50%" credit="Just a Man, CC BY 4.0" />
          <PumpDisplay value={1700 + 340 * easeOut(pctNafta)} x={960} y={500} flash={pctNafta >= 1 ? 0.5 + 0.5 * Math.sin(t * 8) : 0} />
          <Chip t={t} t0={c('veinte')} text={'+20%'} x={1380} y={250} color={K.red} size={64} />
          <Chip t={t} t0={c('desde que')} text="DESDE QUE EMPEZÓ LA GUERRA" x={960} y={820} color={K.red} size={38} />
          <SrcLine t={t} t0={tNafta + 0.5} text="Precios de referencia en surtidor, CABA (febrero → octubre de 2026)" />
        </AbsoluteFill>
      ) : null}
      {/* F · ¿cómo puede ser? */}
      {between(t, tComo - 0.05, tArabia + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tComo - 0.05, tArabia + 0.3, 0.15)}}>
          <OilBg t={t} glow="rgba(229,56,59,0.18)" />
          <Big t={t} t0={tComo} text="¿CÓMO PUEDE SER?" size={190} y={540} stagger={0.05} />
        </AbsoluteFill>
      ) : null}
      {/* G · ¿Arabia Saudita o Venezuela? */}
      {between(t, tArabia, tBajar + 0.4) ? (
        <SplitVs
          t={t} t0={tArabia} tR={tVen} o={fadeIO(t, tArabia, tBajar + 0.4, 0.25)}
          left={{src: 'ep09/ras_tanura.jpg', name: 'ARABIA SAUDITA', color: K.sau, credit: 'Aramco, dominio público'}}
          right={{src: 'ep09/maracaibo.jpg', name: 'VENEZUELA', color: K.ven, credit: 'Dennysalberto7, CC BY-SA 3.0'}}
        />
      ) : null}
      {/* H/I · bajar 3 km y volver 150 millones de años */}
      {t > tBajar - 0.5 ? (
        <AbsoluteFill style={{opacity: prog(t, tBajar - 0.5, 0.5)}}>
          <OilBg t={t} glow={back > 0.5 ? 'rgba(95,198,232,0.16)' : 'rgba(242,169,59,0.14)'} />
          <BlockShot cam={cam} s={geo} night />
          <DepthGauge x={130} y0={250} y1={850} km={km / 3} o={prog(t, c('bajar'), 0.4) * (1 - prog(t, tViajar, 0.5))} />
          {t > tViajar ? <YearsBack t={t} t0={tViajar + 0.3} to={145000000} dur={3.2} x={560} y={300} o={1 - prog(t, tTitle - 0.3, 0.3)} /> : null}
          <Chip t={t} t0={c('tierra.') + 0.1} t1={tViajar + 0.6} text="VACA MUERTA" x={project(cam, [1.5, VM_TOP + 0.2, 3])[0]} y={project(cam, [1.5, VM_TOP + 0.2, 3])[1] - 50} color={K.oil} size={40} />
        </AbsoluteFill>
      ) : null}
      {/* título */}
      {t > tTitle - 0.1 ? <TitleCard t={t} t0={tTitle} /> : null}
      <Vig k={0.5} />
    </AbsoluteFill>
  );
};

const ExportRace: React.FC<{t: number; t0: number; tSwap: number}> = ({t, t0, tSwap}) => {
  const k = easeInOut(clamp((t - tSwap) / 0.9));
  const row = (name: string, color: string, rank0: number, rank1: number, w0: number, w1: number, hl: boolean, i: number) => {
    const r = rank0 + (rank1 - rank0) * k;
    const w = w0 + (w1 - w0) * k;
    const a = prog(t, t0 + i * 0.15, 0.5);
    return (
      <div key={name} style={{position: 'absolute', left: 260, top: 400 + r * 170, opacity: a, transform: `translateX(${(1 - a) * -60}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
          <div style={{fontFamily: F.head, fontSize: 110, color: hl ? K.oil : K.mute, width: 120, textAlign: 'right'}}>{Math.round(r) + 1}</div>
          <div>
            <div style={{fontFamily: F.head, fontSize: 64, color: K.cream, letterSpacing: 1}}>{name}</div>
            <div style={{height: 34, width: w, background: color, borderRadius: 6, marginTop: 6, boxShadow: hl ? `0 0 40px ${color}66` : undefined}} />
          </div>
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 260, top: 230, fontFamily: F.body, fontWeight: 800, fontSize: 32, letterSpacing: 8, color: K.mute, opacity: prog(t, t0, 0.4)}}>LO QUE MÁS EXPORTA LA ARGENTINA</div>
      {row('HARINA DE SOJA', '#9DB36A', 0, 1, 1100, 980, false, 0)}
      {row('PETRÓLEO CRUDO', K.oil, 1, 0, 900, 1180, true, 1)}
      {t > tSwap + 0.6 ? <Chip t={t} t0={tSwap + 0.6} text="NUEVO Nº 1" x={1560} y={460} color={K.oil} size={44} /> : null}
    </AbsoluteFill>
  );
};

const TitleCard: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const a = prog(t, t0, 0.5);
  return (
    <AbsoluteFill style={{background: `rgba(6,8,11,${0.55 * a})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center'}}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 12, color: K.oil, opacity: prog(t, t0 + 0.3, 0.5)}}>UN DOCUMENTAL DE CONTEXTO</div>
        <div style={{fontFamily: F.head, fontSize: 250, lineHeight: 1, color: K.cream, letterSpacing: 6, marginTop: 14, textShadow: '0 20px 60px rgba(0,0,0,0.8)', clipPath: `inset(0 ${100 - 100 * prog(t, t0, 0.9)}% 0 0)`}}>VACA MUERTA</div>
        <div style={{height: 8, width: 900 * prog(t, t0 + 0.4, 0.8), background: K.oil, margin: '18px auto 0', boxShadow: `0 0 30px ${K.oil}`}} />
        <div style={{fontFamily: F.head, fontSize: 84, color: K.cream, marginTop: 26, letterSpacing: 4, opacity: prog(t, t0 + 0.7, 0.5)}}>
          EL TESORO <span style={{color: K.red}}>Y LA TRAMPA</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* =====================================================================================
   S02 · el mar jurásico, capa sobre capa, roca, calor y presión → petróleo; 30.000 km² > Tucumán
   ===================================================================================== */
export const S02: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s02', p, n);
  const tCaian = c('caían'), tBarro = c('enterrados'), tCapa = c('Capa'), tRoca = c('El barro se'), tCalor = c('calor'), tVida = c('esa vida'), tOcupa = c('Esa roca'), tTuc = c('más que toda'), tLlama = c('Y se llama');
  const geo: GeoState = {
    t,
    build: easeInOut(clamp((t - tRoca) / 4.5)),
    vm: 0.06 + 0.24 * easeOut(clamp((t - tBarro) / 2)) + 0.7 * easeInOut(clamp((t - tCapa) / 2.8)),
    sea: 1 - easeInOut(clamp((t - tRoca) / 3.5)),
    plank: 0.4 + 0.6 * prog(t, c('plancton'), 1.2),
    fall: clamp((t - tCaian) / 3.2) + 0,
    rock: easeInOut(clamp((t - tRoca - 0.6) / 2)),
    heat: prog(t, tCalor, 1.4) * (1 - prog(t, tOcupa - 0.6, 0.6)),
    press: prog(t, c('presión'), 1),
    oil: easeOut(clamp((t - tVida - 0.4) / 2.2)),
    glow: prog(t, tVida, 1),
    surface: 0,
  };
  const cam = camPath(t, [
    [0, BLOCK_SEA],
    [tCapa - 0.5, {pos: [8.5, -3.2, 13.5], look: [0, -4.6, 0.5], fov: 34}],
    [tRoca + 0.4, BLOCK_WIDE],
    [tCalor, {pos: [7.5, -2.8, 14], look: [0, -4.7, 1], fov: 32}],
  ], 2.8);
  // flechas de presión / calor
  const pr = prog(t, c('presión'), 0.5) * (1 - prog(t, tOcupa - 0.5, 0.4));
  const ht = prog(t, tCalor, 0.5) * (1 - prog(t, tOcupa - 0.5, 0.4));
  // mapa
  const mapK = easeInOut(clamp((t - tOcupa + 0.2) / 2.2));
  const mcam = lerpCam(mapCam(-67.4, -38.6, 110, 1.0, 0.2), mapCam(-67.9, -37.9, 52, 0.82, 0.32), mapK);
  const tucK = clamp((t - tTuc + 0.3) / 1.8);
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tOcupa + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tOcupa - 0.1, 0.4)}}>
          <OilBg t={t} glow={geo.sea! > 0.4 ? 'rgba(95,198,232,0.18)' : 'rgba(242,169,59,0.14)'} />
          <BlockShot cam={cam} s={geo} />
          <Tag t={t} t0={0.1} t1={tRoca + 0.2} a="JURÁSICO" b="HACE 145 MILLONES DE AÑOS" color={K.water} />
          <Chip t={t} t0={c('Neuquén')} t1={tCaian} text="DONDE HOY ESTÁ NEUQUÉN: UN MAR" x={1380} y={240} color={K.water} size={36} />
          <Chip t={t} t0={c('plancton')} t1={tCaian + 0.4} text="PLANCTON Y ALGAS" x={1250} y={560} color="#9CFFC4" size={38} />
          <Chip t={t} t0={c('sin oxígeno')} t1={tCapa + 0.2} text="SIN OXÍGENO" x={1320} y={800} color={K.red} size={40} />
          <Framed t={t} t0={tCapa + 0.1} t1={tRoca + 0.3} x={1440} y={440} w={560} h={420} caption="FÓSIL DE VACA MUERTA" credit="Amonite del Jurásico · Dhzanette, dominio público" rot={2}>
            <Img src={staticFile('ep09/amonite.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.05 + 0.05 * clamp((t - tCapa) / 3)})`}} />
          </Framed>
          {t > tCapa ? <Big t={t} t0={tCapa} t1={tRoca + 0.1} text="CAPA SOBRE CAPA" size={120} x={620} y={900} w={1100} /> : null}
          {pr > 0.01 ? <PressArrows t={t} o={pr} /> : null}
          {ht > 0.01 ? <HeatGlow t={t} o={ht} /> : null}
          <Chip t={t} t0={c('roca,')} t1={tCalor} text="EL BARRO SE VUELVE ROCA" x={1320} y={200} color={K.cream} size={36} />
          <Chip t={t} t0={c('petróleo')} t1={tOcupa} text="PETRÓLEO Y GAS" x={project(cam, [1.2, VM_TOP, 3])[0]} y={project(cam, [1.2, VM_TOP, 3])[1] - 60} color={K.oil} size={48} />
        </AbsoluteFill>
      ) : null}
      {between(t, tOcupa - 0.3, tLlama + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tOcupa - 0.3, tLlama + 0.4, 0.35)}}>
          <OilBg t={t} glow="rgba(116,172,223,0.12)" />
          <MapShot cam={mcam} s={{t, focus: {Neuquén: {c: '#3E5366', lift: 0.18}}, dim: 0.4, vm: prog(t, c('ocupa'), 0.9), tuc: tucK}} />
          <MapLabels t={t} cam={mcam} tVm={c('treinta')} tTuc={tTuc} />
          <SrcLine t={t} t0={tOcupa + 0.5} text="Área aproximada de la formación · límites: Natural Earth" />
        </AbsoluteFill>
      ) : null}
      {t > tLlama - 0.3 ? (
        <AbsoluteFill style={{opacity: prog(t, tLlama - 0.3, 0.4)}}>
          <FullPhoto src="ep09/afloramiento.jpg" t={t} t0={tLlama - 0.3} zoom={[1.03, 1.13]} dim={0.4} credit="Damián H. Zanette, CC BY-SA 4.0" />
          <Big t={t} t0={c('Vaca')} text="VACA MUERTA" size={200} y={760} hl={{MUERTA: K.oil}} />
          <Chip t={t} t0={c('sierra') - 0.2} text="LA ROCA, A CIELO ABIERTO · NEUQUÉN" x={960} y={930} color={K.oil} size={34} />
        </AbsoluteFill>
      ) : null}
      <Vig k={0.5} />
    </AbsoluteFill>
  );
};

const PressArrows: React.FC<{t: number; o: number}> = ({t, o}) => (
  <AbsoluteFill style={{opacity: o, pointerEvents: 'none'}}>
    {[0, 1, 2, 3].map((i) => {
      const y = 90 + ((t * 0.6 + i * 0.25) % 1) * 40;
      return (
        <svg key={i} width={90} height={150} style={{position: 'absolute', left: 520 + i * 260, top: y}}>
          <path d="M45 0 L45 100 M15 70 L45 110 L75 70" stroke={K.cream} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
        </svg>
      );
    })}
    <div style={{position: 'absolute', left: 120, top: 230, fontFamily: F.head, fontSize: 64, color: K.cream}}>PRESIÓN</div>
  </AbsoluteFill>
);
const HeatGlow: React.FC<{t: number; o: number}> = ({t, o}) => (
  <AbsoluteFill style={{opacity: o, pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 40% at 50% 112%, rgba(255,90,30,${0.55 + 0.1 * Math.sin(t * 4)}) 0%, rgba(255,90,30,0) 70%)`, mixBlendMode: 'screen'}} />
    <div style={{position: 'absolute', left: 120, bottom: 110, fontFamily: F.head, fontSize: 64, color: '#FF8A4C'}}>CALOR</div>
  </AbsoluteFill>
);

const MapLabels: React.FC<{t: number; cam: Cam; tVm: number; tTuc: number}> = ({t, cam, tVm, tTuc}) => {
  const [vx, vy] = project(cam, geo3(-69.0, -37.6, 0.4));
  const [tx, ty] = project(cam, geo3(-66.3, -37.0, 0.6));
  const [nx, ny] = project(cam, geo3(-70.2, -39.6, 0.3));
  return (
    <>
      <Pin x={nx} y={ny} text="NEUQUÉN" color="#9FB3C4" o={prog(t, 0, 0.6) * (1 - prog(t, tTuc, 0.4))} size={28} />
      <Pin x={vx} y={vy - 20} text="VACA MUERTA" sub="+30.000 KM²" color={K.oil} o={prog(t, tVm, 0.5)} size={40} />
      <Pin x={tx} y={ty - 30} text="TUCUMÁN" sub="22.524 KM²" color={K.celeste} o={prog(t, tTuc + 1.2, 0.5)} size={36} />
    </>
  );
};

/* =====================================================================================
   S03 · atrapado en la roca, el fracking: perforar, doblar, fracturar; 2010 y 4.700 pozos
   ===================================================================================== */
const LAKE_P: [number, number, number] = [1.6, -3.9, 3];
export const S03: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s03', p, n);
  const tProb = c('El problema'), tLago = c('lago'), tAtr = c('Está atrapado'), tPoros = c('poros'), tSol = c('La solución'), tFrack = c('el fracking.');
  const tPerf = c('Se perfora'), tDobla = c('dobla'), tCapa = c('capa.'), tIny = c('inyecta'), tFis = c('se fisura,'), tGri = c('grietas,'), tSale = c('petróleo empieza');
  const tPrimer = c('El primer'), tHoy = c('Hoy hay');
  // --- bloque 1: el lago que no existe y los poros
  const cam1 = camPath(t, [
    [tProb - 0.3, {pos: [9.5, 0.4, 16.5], look: [0, -3.6, 0], fov: 34}],
    [tAtr - 0.2, {pos: [3.4, VM_MID + 0.5, 8.4], look: [1.0, VM_MID - 0.05, 3], fov: 30}],
  ], 2.4);
  const lake = prog(t, tLago - 0.5, 0.8) * (1 - prog(t, tAtr, 0.8));
  const geo1: GeoState = {t, lake, oil: prog(t, tAtr + 0.3, 1.4), glow: 0.5 + 0.5 * prog(t, tAtr, 0.8), surface: 1, night: 0.2};
  // --- bloque 2: perforación y fractura
  const cam2 = camPath(t, [
    [tPerf - 0.4, {pos: [WX + 6.5, -1.2, 15.5], look: [WX + 3.2, -2.8, 2], fov: 34}],
    [tDobla - 0.3, {pos: [WX + 6.8, -2.9, 13.5], look: [WX + 3.4, -4.0, 2], fov: 34}],
    [tIny - 0.4, {pos: [(WX + LAT_END) / 2 + 1.2, VM_MID + 1.0, 9.6], look: [(WX + LAT_END) / 2 + 0.6, VM_MID - 0.1, 3], fov: 32}],
    [tSale + 0.4, {pos: [WX + 5.6, -2.4, 13.5], look: [WX + 2.8, -3.2, 2], fov: 34}],
  ], 2.2);
  const geo2: GeoState = {
    t, oil: 1, glow: 0.7, surface: 1, night: 0.2,
    well: easeInOut(clamp((t - tPerf - 0.1) / (tDobla - tPerf - 0.3))),
    lat: easeInOut(clamp((t - tDobla + 0.1) / (tCapa - tDobla + 0.2))),
    frac: clamp((t - tIny) / (tGri + 0.6 - tIny)),
    flow: clamp((t - tSale + 0.2) / 2.2),
  };
  // rótulos 3D → 2D
  const [vx, vy] = project(cam2, [WX - 0.25, -2.4, 3]);
  const [hx, hy] = project(cam2, [WX + 2.9, VM_BOT - 0.35, 3]);
  // mapa de pozos
  const mcam = lerpCam(mapCam(-68.9, -37.7, 34, 1.25, 0.1), mapCam(-68.9, -37.7, 27, 1.15, 0.25), clamp((t - tHoy) / 3));
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tProb + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tProb, 0.4)}}>
          <FullPhoto src="ep09/huincul.jpg" t={t} t0={-0.4} t1={tProb + 0.4} zoom={[1.04, 1.12]} dim={0.35} bw credit="Destilería de YPF en Plaza Huincul · dominio público" />
          <Chip t={t} t0={0.3} t1={tProb + 0.4} text="1931 · LA FORMACIÓN YA TIENE NOMBRE" x={960} y={860} color={K.oil} size={40} />
        </AbsoluteFill>
      ) : null}
      {between(t, tProb - 0.1, tSol + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tProb - 0.1, tSol + 0.3, 0.35)}}>
          <OilBg t={t} />
          <BlockShot cam={cam1} s={geo1} />
          <LakeX t={t} t0={c('subterráneo.')} cam={cam1} o={lake} />
          {t > tPoros - 0.3 ? <PoreLens t={t} t0={tPoros - 0.2} t1={tSol + 0.3} /> : null}
          <Chip t={t} t0={tAtr + 0.2} t1={tPoros} text="ATRAPADO ADENTRO DE LA ROCA" x={960} y={180} color={K.oil} size={40} />
        </AbsoluteFill>
      ) : null}
      {between(t, tSol, tPerf + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tSol, tPerf + 0.3, 0.3)}}>
          <OilBg t={t} glow="rgba(116,172,223,0.14)" />
          <Framed t={t} t0={tSol} x={600} y={500} w={820} h={615} caption="FUNCIONARIOS DE EE.UU. EN VACA MUERTA" credit="Embajada de EE.UU. en la Argentina, CC BY 2.0" rot={-2}>
            <Img src={staticFile('ep09/poneman.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.04 + 0.04 * clamp((t - tSol) / 4)})`}} />
          </Framed>
          <div style={{position: 'absolute', left: 1080, top: 300, opacity: prog(t, tSol + 0.3, 0.4), fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: K.mute}}>LA SOLUCIÓN LLEGÓ DE EE.UU.</div>
          <Big t={t} t0={tFrack} text="FRACKING" size={220} x={1440} y={520} w={760} hl={{FRACKING: K.oil}} />
          <div style={{position: 'absolute', left: 1080, top: 680, width: 720, opacity: prog(t, tFrack + 0.4, 0.4), fontFamily: F.body, fontWeight: 700, fontSize: 30, color: K.cream, lineHeight: 1.35}}>
            Fractura hidráulica: romper la roca con agua y arena a presión para que el petróleo pueda salir.
          </div>
        </AbsoluteFill>
      ) : null}
      {between(t, tPerf, tPrimer + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tPerf, tPrimer + 0.3, 0.3)}}>
          <OilBg t={t} />
          <BlockShot cam={cam2} s={geo2} />
          <Pin x={vx - 40} y={vy} text="3 KM HACIA ABAJO" color={K.cream} o={prog(t, c('tres') + 0.2, 0.4) * (1 - prog(t, tIny - 0.6, 0.4))} size={32} />
          <Pin x={hx} y={hy} text="3 KM DE COSTADO" color={K.oil} side="down" o={prog(t, c('otros tres'), 0.4) * (1 - prog(t, tIny - 0.6, 0.4))} size={32} />
          <Chip t={t} t0={tIny + 0.1} t1={tFis + 0.2} text="AGUA + ARENA A PRESIÓN" x={960} y={170} color={K.water} size={42} />
          <Chip t={t} t0={tFis} t1={tGri + 0.4} text="LA ROCA SE FISURA" x={960} y={170} color={K.water} size={42} />
          <Chip t={t} t0={tGri} t1={tSale + 0.2} text="LA ARENA MANTIENE ABIERTAS LAS GRIETAS" x={960} y={170} color="#F3D58A" size={42} />
          <Chip t={t} t0={tSale + 0.1} text="Y EL PETRÓLEO SALE" x={960} y={170} color={K.oil} size={46} />
        </AbsoluteFill>
      ) : null}
      {between(t, tPrimer, tHoy + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tPrimer, tHoy + 0.3, 0.3)}}>
          <FullPhoto src="ep09/rig_estrellas.jpg" t={t} t0={tPrimer} t1={tHoy + 0.3} zoom={[1.15, 1.04]} dim={0.3} credit="Juan Mariano, CC BY-SA 4.0" />
          <Tag t={t} t0={tPrimer + 0.2} a="2010" b="PRIMER POZO DE ESTE TIPO EN VACA MUERTA" x={110} y={860} />
        </AbsoluteFill>
      ) : null}
      {t > tHoy - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(t, tHoy - 0.2, 0.4)}}>
          <OilBg t={t} glow="rgba(242,169,59,0.1)" />
          <MapShot cam={mcam} s={{t, focus: {Neuquén: {c: '#3E5366', lift: 0.18}}, dim: 0.5, vm: 0.35, wells: easeOut(clamp((t - tHoy - 0.1) / 2.2))}} />
          <Stat t={t} t0={c('cuatro')} value={<><Count t={t} t0={c('cuatro')} dur={1.6} to={4700} />+</>} label="POZOS ACTIVOS" x={110} y={300} size={200} />
          <SrcLine t={t} t0={tHoy + 0.5} text="Fuente: Secretaría de Energía (RICSA), agosto de 2026 · ubicación de los puntos: ilustrativa" />
        </AbsoluteFill>
      ) : null}
      <Vig k={0.5} />
    </AbsoluteFill>
  );
};

const LakeX: React.FC<{t: number; t0: number; cam: Cam; o: number}> = ({t, t0, cam, o}) => {
  if (t < t0 || o < 0.02) return null;
  const [x, y] = project(cam, LAKE_P);
  const k = prog(t, t0, 0.4);
  return (
    <div style={{position: 'absolute', left: x, top: y - 20, transform: 'translate(-50%,-50%)', opacity: o}}>
      <svg width={420} height={260} style={{overflow: 'visible'}}>
        <path d={`M 30 30 L ${30 + 360 * k} ${30 + 200 * k}`} stroke={K.red} strokeWidth={16} strokeLinecap="round" />
        <path d={`M 390 30 L ${390 - 360 * clamp(k * 1.4 - 0.4)} ${30 + 200 * clamp(k * 1.4 - 0.4)}`} stroke={K.red} strokeWidth={16} strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 280, textAlign: 'center', fontFamily: F.head, fontSize: 44, color: K.cream, whiteSpace: 'nowrap', opacity: k}}>NO ES UN LAGO SUBTERRÁNEO</div>
    </div>
  );
};

/** lupa: un pelo contra un poro mil veces más fino */
const PoreLens: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  const a = pop(t, t0, 0.9);
  const o = Math.min(prog(t, t0, 0.3), 1 - prog(t, t1 - 0.3, 0.3));
  const hair = prog(t, t0 + 0.4, 0.6);
  const pore = prog(t, t0 + 1.4, 0.5);
  return (
    <div style={{position: 'absolute', left: 1400, top: 560, transform: `translate(-50%,-50%) scale(${0.8 + 0.2 * a})`, opacity: o}}>
      <div style={{width: 640, height: 640, borderRadius: 320, overflow: 'hidden', border: '10px solid #F2EEE6', boxShadow: '0 40px 90px rgba(0,0,0,0.7)', background: 'radial-gradient(circle at 40% 35%, #3A2F25 0%, #1B1612 70%)', position: 'relative'}}>
        <svg width={640} height={640} style={{position: 'absolute', left: 0, top: 0}}>
          {Array.from({length: 70}, (_, i) => (
            <circle key={i} cx={(Math.sin(i * 12.9898) * 0.5 + 0.5) * 640} cy={(Math.sin(i * 78.233) * 0.5 + 0.5) * 640} r={6 + (i % 5) * 4} fill="#2A231C" opacity={0.7} />
          ))}
          <rect x={-40} y={170} width={720 * hair} height={300} fill="#C9A26B" opacity={0.95} transform="rotate(-8 320 320)" rx={140} />
          <circle cx={322} cy={320} r={5} fill={K.oil} opacity={pore} />
          <circle cx={322} cy={320} r={20 + 30 * (1 - pore)} fill="none" stroke={K.oil} strokeWidth={4} opacity={pore} />
        </svg>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center'}}>
        <div style={{fontFamily: F.head, fontSize: 44, color: K.cream, opacity: hair}}>EL ANCHO DE UN PELO</div>
        <div style={{fontFamily: F.head, fontSize: 44, color: K.oil, opacity: pore}}>EL PORO: MIL VECES MÁS FINO</div>
      </div>
    </div>
  );
};

/* =====================================================================================
   S04 · ¿cuánto hay? EIA: 2ª en gas y 4ª en petróleo no convencional; 16.000 → 30.000 millones; +100 años
   ===================================================================================== */
const BAR_CAM = (t: number, k: number): Cam => {
  const ang = 0.55 + Math.sin(t * 0.1) * 0.06 - 0.2 * k;
  const R = 22 + 6 * k;
  return {pos: [Math.sin(ang) * R - 4 + 2.5 * k, 10.5 + 2.5 * k, Math.cos(ang) * R], look: [-4 + 2.6 * k, 1.6, 0], fov: 34};
};
export const S04: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s04', p, n);
  const tSeg = c('Según'), tVm = c('Vaca Muerta es'), tCuarta = c('cuarta'), t16 = c('dieciséis'), tEst = c('Un estudio'), tDoble = c('casi el doble:'), tRitmo = c('Al ritmo');
  const kB = easeInOut(clamp((t - tDoble) / 1.6));
  const A = towerItems(162, [-2.9, 0, 0], clamp((t - t16 + 0.1) / 1.8), K.oil, 9, 5, 0);
  const B = towerItems(140, [6.1, 0, 0], clamp((t - tDoble - 0.1) / 1.8), '#FFD07A', 9, 5, 7);
  const bcam = BAR_CAM(t, kB);
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < t16 + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, t16, 0.3)}}>
          <OilBg t={t} />
          <Big t={t} t0={0.05} t1={tVm - 0.05} text="¿Y CUÁNTO HAY?" size={200} y={540} />
          <Tag t={t} t0={tSeg} a="SEGÚN LA EIA" b="AGENCIA DE ENERGÍA DE EE.UU." x={110} y={110} color={K.celeste} />
          <Ranking t={t} t0={tVm} hlAt={c('segunda')} title="GAS NO CONVENCIONAL" sub="Recursos recuperables, por país" x={150} y={260} w={760}
            rows={[{name: 'CHINA'}, {name: 'ARGENTINA', hl: true, color: K.celeste}, {name: 'ARGELIA'}, {name: 'ESTADOS UNIDOS'}, {name: 'CANADÁ'}]} />
          <Ranking t={t} t0={tCuarta - 0.4} hlAt={tCuarta} title="PETRÓLEO NO CONVENCIONAL" sub="Recursos recuperables, por país" x={1010} y={260} w={760}
            rows={[{name: 'RUSIA'}, {name: 'ESTADOS UNIDOS'}, {name: 'CHINA'}, {name: 'ARGENTINA', hl: true, color: K.celeste}, {name: 'LIBIA'}]} />
          <SrcLine t={t} t0={tVm + 0.4} text="Fuente: EIA, Technically Recoverable Shale Oil and Shale Gas Resources (2013). Vaca Muerta es el grueso del recurso argentino." />
        </AbsoluteFill>
      ) : null}
      {between(t, t16 - 0.2, tRitmo + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, t16 - 0.2, tRitmo + 0.3, 0.3)}}>
          <OilBg t={t} glow="rgba(242,169,59,0.16)" y={70} />
          <Stage cam={bcam} shadow={16} key0={[8, 18, 12]} keyI={2.1}>
            <Barrels items={[...A, ...B]} max={320} />
            <ShadowFloorLite />
          </Stage>
          <Stat t={t} t0={t16} t1={tDoble + 0.2} value={<>16.000</>} label="MILLONES DE BARRILES" sub="QUE SE PUEDEN SACAR CON LA TECNOLOGÍA ACTUAL (EIA)" x={110} y={700} size={150} />
          <Stat t={t} t0={tDoble} value={<>30.000</>} label="MILLONES DE BARRILES" sub="ESTIMACIÓN DEL IAPG (INSTITUTO ARGENTINO DEL PETRÓLEO Y DEL GAS)" x={110} y={700} size={150} color="#FFD07A" />
          <div style={{position: 'absolute', right: 90, bottom: 70, display: 'flex', alignItems: 'center', gap: 12, opacity: prog(t, t16 + 0.5, 0.5), fontFamily: F.body, fontWeight: 700, fontSize: 24, color: K.mute}}>
            <BarrelIcon size={44} /> = 100 MILLONES DE BARRILES
          </div>
        </AbsoluteFill>
      ) : null}
      {t > tRitmo - 0.3 ? (
        <AbsoluteFill style={{opacity: prog(t, tRitmo - 0.3, 0.3)}}>
          <OilBg t={t} />
          <CenturyBar t={t} t0={tRitmo} tCien={c('cien')} />
        </AbsoluteFill>
      ) : null}
      <Vig k={0.5} />
    </AbsoluteFill>
  );
};
const ShadowFloorLite: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
    <planeGeometry args={[120, 120]} />
    <shadowMaterial transparent opacity={0.45} />
  </mesh>
);
const CenturyBar: React.FC<{t: number; t0: number; tCien: number}> = ({t, t0, tCien}) => {
  const k = easeInOut(clamp((t - t0 - 0.2) / 2.2));
  const yr = Math.round(2026 + 100 * k);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 160, top: 300, fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: K.mute, opacity: prog(t, t0, 0.4)}}>AL RITMO DE PRODUCCIÓN DE HOY, ALCANZARÍA HASTA…</div>
      <div style={{position: 'absolute', left: 160, top: 420, width: 1600, height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.08)'}} />
      <div style={{position: 'absolute', left: 160, top: 420, width: 1600 * k, height: 40, borderRadius: 20, background: `linear-gradient(90deg, ${K.oil}, #FFD07A)`, boxShadow: `0 0 40px ${K.oil}88`}} />
      {[0, 25, 50, 75, 100].map((y) => (
        <div key={y} style={{position: 'absolute', left: 160 + 16 * y, top: 480, transform: 'translateX(-50%)', fontFamily: F.head, fontSize: 40, color: k * 100 >= y - 0.5 ? K.cream : 'rgba(242,238,230,0.3)'}}>{2026 + y}</div>
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', fontFamily: F.head, fontSize: 200, color: K.cream, opacity: prog(t, tCien - 0.2, 0.4), transform: `scale(${0.9 + 0.1 * pop(t, tCien - 0.2)})`}}>
        +100 AÑOS
      </div>
      <div style={{position: 'absolute', left: 160 + 1600 * k, top: 380, transform: 'translate(-50%,-100%)', fontFamily: F.head, fontSize: 56, color: K.oil}}>{yr}</div>
    </AbsoluteFill>
  );
};

/* =====================================================================================
   S05 · YPF + Chevron (2013), la producción sube, 7 de cada 10 barriles, exportaciones +55 %, Añelo
   ===================================================================================== */
export const S05: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s05', p, n);
  const tDesde = c('y desde'), tHoy = c('Hoy,'), tSiete = c('siete'), tEntre = c('Entre enero'), tSeis = c('seis mil'), tCin = c('un cincuenta'), tAnelo = c('Y Añelo,'), tPaso = c('pasó de'), tDoce = c('doce mil');
  const yk = clamp((t - tDesde) / (tHoy - tDesde));
  const mcam = mapCam(-68.9, -37.7, 32 - 4 * yk, 1.2, 0.15 + 0.15 * yk);
  // barriles 7/10
  const row = Array.from({length: 10}, (_, i) => ({
    pos: [(i - 4.5) * 1.15, 0, 0] as [number, number, number],
    color: i < 7 && t > tSiete + 0.5 + i * 0.12 ? K.oil : '#9AA6B2',
    s: 1, rot: [0, i * 0.7, 0] as [number, number, number],
  }));
  const rcam: Cam = {pos: [0, 4.2 - 0.6 * clamp((t - tHoy) / 5), 11.5], look: [0, 0.6, 0], fov: 38};
  const pctBar = clamp((t - tSeis) / 1.4);
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tDesde + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tDesde, 0.3)}}>
          <FullPhoto src="ep09/chevron2013.jpg" t={t} t0={-0.4} t1={tDesde + 0.3} zoom={[1.05, 1.14]} focus="40% 40%" dim={0.35} credit="Casa Rosada, CC BY 2.5 AR" />
          <Tag t={t} t0={0.2} a="2013" b="YPF + CHEVRON" x={110} y={110} />
          <Chip t={t} t0={c('primer')} text="LOMA CAMPANA: EL PRIMER GRAN PROYECTO" x={960} y={900} color={K.oil} size={40} />
        </AbsoluteFill>
      ) : null}
      {between(t, tDesde - 0.2, tHoy + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tDesde - 0.2, tHoy + 0.3, 0.3)}}>
          <OilBg t={t} glow="rgba(242,169,59,0.1)" />
          <MapShot cam={mcam} s={{t, focus: {Neuquén: {c: '#3E5366', lift: 0.18}}, dim: 0.5, vm: 0.3, wells: 0.04 + 0.96 * easeIn(yk)}} />
          <div style={{position: 'absolute', left: 110, top: 120, fontFamily: F.head, fontSize: 220, color: K.cream, fontVariantNumeric: 'tabular-nums', lineHeight: 1, textShadow: '0 10px 40px rgba(0,0,0,0.7)'}}>{Math.round(2013 + 13 * yk)}</div>
          <div style={{position: 'absolute', left: 116, top: 350, fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: K.oil}}>LA PRODUCCIÓN NO PARÓ DE SUBIR</div>
        </AbsoluteFill>
      ) : null}
      {between(t, tHoy - 0.2, tEntre + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tHoy - 0.2, tEntre + 0.3, 0.3)}}>
          <OilBg t={t} glow="rgba(242,169,59,0.14)" y={70} />
          <Stage cam={rcam} shadow={10} key0={[4, 12, 8]} keyI={2.2}>
            <Barrels items={row} max={10} />
            <ShadowFloorLite />
          </Stage>
          <Big t={t} t0={tSiete} text="7 DE CADA 10 BARRILES" size={120} y={190} hl={{'7': K.oil}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', fontFamily: F.head, fontSize: 60, color: K.oil, opacity: prog(t, c('salen'), 0.4)}}>SALEN DE VACA MUERTA</div>
        </AbsoluteFill>
      ) : null}
      {between(t, tEntre - 0.2, tAnelo + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tEntre - 0.2, tAnelo + 0.3, 0.3)}}>
          <FullVideo src="ep09/vid/tanqueros.mp4" t={t} t0={tEntre - 0.2} t1={tAnelo + 0.3} from={2} zoom={[1.04, 1.12]} dim={1.3} fade={0.01} credit="Guardia Costera de EE.UU., dominio público" />
          <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(6,8,11,0.85) 0%, rgba(6,8,11,0.5) 60%, rgba(6,8,11,0.2) 100%)'}} />
          <div style={{position: 'absolute', left: 110, top: 150, fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: K.mute, opacity: prog(t, tEntre, 0.4)}}>EXPORTACIONES DE PETRÓLEO · ENERO A AGOSTO</div>
          <div style={{position: 'absolute', left: 100, top: 200, fontFamily: F.head, fontSize: 230, color: K.cream, opacity: prog(t, tSeis - 0.2, 0.3)}}>
            US$ <Count t={t} t0={tSeis - 0.1} dur={1.4} to={6625} />
            <span style={{fontSize: 90, color: K.mute}}> MILLONES</span>
          </div>
          {[{y: '2025', v: 4283, c: '#5E6872'}, {y: '2026', v: 6625, c: K.oil}].map((b, i) => (
            <div key={b.y} style={{position: 'absolute', left: 110, top: 560 + i * 120, display: 'flex', alignItems: 'center', gap: 26, opacity: prog(t, tSeis + i * 0.3, 0.4)}}>
              <div style={{fontFamily: F.head, fontSize: 54, color: K.cream, width: 130}}>{b.y}</div>
              <div style={{height: 70, width: (b.v / 6625) * 1000 * (i ? pctBar : 1), background: b.c, borderRadius: 8}} />
            </div>
          ))}
          <Chip t={t} t0={tCin} text="+55%" x={1500} y={710} color={K.oil} size={90} />
          <SrcLine t={t} t0={tEntre + 0.5} text="Fuente: INDEC, intercambio comercial (enero–agosto de 2026). 2025 estimado a partir de la variación informada." />
        </AbsoluteFill>
      ) : null}
      {t > tAnelo - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(t, tAnelo - 0.2, 0.3)}}>
          <FullPhoto src="ep09/anelo.jpg" t={t} t0={tAnelo - 0.2} zoom={[1.04, 1.14]} dim={0.55} credit="Gervacio Rosales, CC BY 3.0" />
          <Tag t={t} t0={tAnelo + 0.1} a="AÑELO" b="EL PUEBLO EN EL MEDIO DE TODO" x={110} y={110} />
          <People t={t} t0={tPaso} tDoce={tDoce} />
        </AbsoluteFill>
      ) : null}
      <Vig k={0.5} />
    </AbsoluteFill>
  );
};

const People: React.FC<{t: number; t0: number; tDoce: number}> = ({t, t0, tDoce}) => {
  const n = t < tDoce ? 5 : 5 + Math.min(7, Math.floor((t - tDoce) / 0.12) + 1);
  return (
    <div style={{position: 'absolute', left: 110, top: 640, opacity: prog(t, t0, 0.4)}}>
      <div style={{display: 'flex', gap: 14, alignItems: 'flex-end'}}>
        {Array.from({length: 12}, (_, i) => (
          <div key={i} style={{opacity: i < n ? 1 : 0.12, transform: `scale(${i < n ? (i >= 5 ? Math.min(1, pop(t, tDoce + (i - 5) * 0.12)) : 1) : 1})`}}>
            <PersonIcon size={130} color={i < 5 ? K.cream : K.oil} />
          </div>
        ))}
      </div>
      <div style={{display: 'flex', gap: 40, marginTop: 20, alignItems: 'baseline'}}>
        <div style={{fontFamily: F.head, fontSize: 90, color: K.cream}}>5.000</div>
        <div style={{fontFamily: F.head, fontSize: 60, color: K.mute, opacity: prog(t, tDoce - 0.2, 0.3)}}>→</div>
        <div style={{fontFamily: F.head, fontSize: 90, color: K.oil, opacity: prog(t, tDoce - 0.2, 0.3)}}>+12.000</div>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: K.mute, opacity: prog(t, tDoce + 0.6, 0.3)}}>HABITANTES · EN 2 AÑOS Y MEDIO</div>
      </div>
      <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 20, color: K.mute, marginTop: 8, opacity: prog(t, t0 + 0.4, 0.4)}}>Cada figura = 1.000 personas</div>
    </div>
  );
};
