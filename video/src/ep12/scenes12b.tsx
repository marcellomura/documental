/* Escenas 6–10 del episodio 12: el anuncio, la implosión y la presión, el Titan (con su sonido real),
   el año de búsqueda, Ocean Infinity y el hallazgo, el juicio de 2026, el cierre y los 44 nombres. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {F} from '../theme';
import {LogoMark} from '../ep04/kit';
import {cue, TL} from './lib';
import {
  K, F12, vf, mono, clamp, easeIn, easeInOut, easeOut, prog, pop, rnd, fmt, between, fadeIO,
  AbyssBg, MarineSnow, Vignette, Scanlines, KTitle, SyncWords, SerifLine, Odo, ramp, DataCard, MonoTag, Timecode, Chapter, NameCard,
  Stamp12, Photo, Clip, Credit12, PhotoCard12, Rings, Reticle, DepthGauge, Poll12,
} from './kit12';
import type {WordCue} from './kit12';
import {Stage12, Water, HullRing, Seafloor, Beacon, AUV, ROV, StormSea, geoPos, geoXZ, camPath} from './three12';
import type {Cam, V3} from './three12';
import {HourAxis, Calendar, Spectro, PL, CREW} from './viz12';
import {WreckShot, Leader} from './scenes12a';

const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/* ================================================================== S06 · LA IMPLOSIÓN */
export const S06: React.FC<{t: number}> = ({t}) => {
  const c = (p: string, n = 0) => cue('s06', p, n);
  const ins = TL.inserts.s06;
  const tArm = c('la Armada');
  const tFrase = c('una frase'), tUn = c('un evento'), tZona = c('En la'), tTres = c('tres horas'), tPero = c('Pero lo'), tExp = c('explosión.', 1), tFue = c('Fue una');
  const tImp = ins[0][0], tCada = c('Cada diez'), tAtm = c('una atmósfera'), tCasco = c('El casco'), tTresc = c('trescientos'), tSeg = c('Según'), tCuat = c('cuatrocientos,'), tCed = c('cedió.');
  const tColap = c('El colapso'), tParp = c('un parpadeo.'), tEn23 = c('En dos'), tTitan = c('Titan,'), tTitanic = c('Titanic.'), tAudio = ins[1][0], tArg = c('La Argentina');
  const quote: WordCue[] = [
    {w: '“un', t: tUn, serif: true}, {w: 'evento', t: c('evento'), serif: true},
    {w: 'ANÓMALO,', t: c('anómalo,'), color: K.amber, big: true}, {w: 'SINGULAR,', t: c('singular,'), color: K.amber, big: true},
    {w: 'CORTO,', t: c('corto,'), color: K.amber, big: true}, {w: 'VIOLENTO', t: c('violento'), color: K.amber, big: true},
    {w: 'y', t: c('y no'), serif: true}, {w: 'NO NUCLEAR,', t: c('no nuclear,'), color: K.cyan, big: true},
    {w: 'consistente', t: c('consistente'), serif: true}, {w: 'con', t: c('con una', 1), serif: true}, {w: 'una', t: c('una explosión.') , serif: true},
    {w: 'EXPLOSIÓN”', t: c('explosión.'), color: K.red, big: true},
  ];
  // profundidad del descenso
  const depth = t < tCada ? 0 : t < tTresc + 0.6 ? 300 * easeInOut(clamp((t - tCada + 0.2) / (tTresc + 0.6 - tCada + 0.2))) : 300 + 88 * easeInOut(clamp((t - tSeg) / (tCed - tSeg)));
  return (
    <AbsoluteFill style={{background: K.abyss}}>
      {t < tZona ? (
        <AbsoluteFill style={{opacity: fadeIO(t, -0.4, tZona, 0.3)}}>
          <AbyssBg t={t} light={0.2} deep={0.85} snow={0.5} />
          {/* comilla gigante de fondo: entra con "la Armada lo anunció" y queda tenue detrás de la cita */}
          <div style={{position: 'absolute', left: 960, top: 870, transform: `translate(-50%, -50%) scale(${mix(1.3, 1, prog(t, tArm - 0.1, 1.4, easeOut)) + (t - tArm) * 0.01})`, fontFamily: F12.serif, fontSize: 900, lineHeight: 1, color: K.cyan, opacity: prog(t, tArm - 0.1, 0.8) * mix(0.16, 0.06, prog(t, tUn, 0.8)), filter: `blur(${(1 - prog(t, tArm - 0.1, 1.0)) * 18}px)`}}>“</div>
          <Timecode t={t} t0={-0.2} t1={tZona} text="23.11.2017" label="COMUNICADO DE LA ARMADA" y={mix(470, 220, prog(t, tFrase - 0.4, 0.9, easeInOut))} size={mix(130, 86, prog(t, tFrase - 0.4, 0.9, easeInOut))} />
          <SyncWords t={t} words={quote} size={70} y={600} w={1640} lh={1.25} t1={tZona - 0.15} />
          <SerifLine t={t} t0={tFrase} t1={tUn - 0.1} text="una frase que nadie olvidó" size={64} x={960} y={620} color={K.mute} />
        </AbsoluteFill>
      ) : null}
      {between(t, tZona - 0.2, tPero) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tZona - 0.2, tPero, 0.3)}}>
          <AbyssBg t={t} light={0.15} deep={0.9} snow={0.3} />
          <HourAxis t={t} t0={tZona - 0.1} from={6} to={11} y={640} marks={[{h: 7.5, label: 'ÚLTIMO CONTACTO', at: tZona + 0.1}, {h: 10.85, label: 'EVENTO HIDROACÚSTICO', color: K.red, at: tTres - 0.2}]} spans={[{a: 7.5, b: 10.85, label: '3 H 21 MIN', color: K.amber, at: tTres + 0.3}]} />
        </AbsoluteFill>
      ) : null}
      {between(t, tPero - 0.2, tCada) ? <ExIm t={t} t0={tPero - 0.2} tExp={tExp} tFue={tFue} tImp={tImp} t1={tCada} /> : null}
      {between(t, tCada - 0.25, tSeg + 0.2) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCada - 0.25, tSeg + 0.2, 0.3)}}>
          <AbyssBg t={t} light={1 - depth / 300} deep={clamp(depth / 360)} snow={0} />
          <MarineSnow t={t} speed={1 + 4 * prog(t, tCada, 0.6) * (1 - prog(t, tTresc + 0.4, 1))} o={0.9} />
          <KTitle t={t} t0={tCada} text="CADA 10 METROS" size={96} x={110} y={330} align="left" maxW={1200} />
          <KTitle t={t} t0={tAtm - 0.1} text="+1 ATMÓSFERA" size={140} x={110} y={470} align="left" maxW={1200} color={K.cyan} />
          <SerifLine t={t} t0={tAtm + 0.4} t1={tCasco} text="el peso de toda la columna de agua de arriba" size={44} x={114} y={590} align="left" color={K.mute} />
          <KTitle t={t} t0={tTresc - 0.2} text="DISEÑADO PARA ≈ 300 m" upper={false} size={70} x={110} y={760} align="left" maxW={1200} color={K.amber} w1={92} g1={760} />
          <DepthGauge depth={depth} design={300} collapse={388} o={prog(t, tCada, 0.5)} />
        </AbsoluteFill>
      ) : null}
      {between(t, tSeg, tColap) ? <RingShot t={t} t0={tSeg} tCed={tCed} t1={tColap} depth={depth} /> : null}
      {between(t, tColap - 0.15, tEn23) ? <BlinkBars t={t} t0={tColap - 0.15} tParp={tParp} t1={tEn23} /> : null}
      {between(t, tEn23 - 0.2, tAudio + 0.1) ? (
        <>
          <Clip src="ep12/vid/titan_fondo.mp4" t={t} t0={tEn23 - 0.2} t1={tAudio + 0.1} zoom={[1.38, 1.44]} focus="60% 55%" grade="none" tint={0.1} dim={0.3} credit="U.S. Coast Guard / Pelagic Research Services · dominio público" />
          <MonoTag t={t} t0={tTitan - 0.2} t1={tAudio} text="TITAN · OCEANGATE · 18.06.2023" x={1810} y={210} align="right" color={K.amber} />
          <MonoTag t={t} t0={tTitan + 0.6} t1={tAudio} text="RESTOS A ≈ 3.800 m · 5 PERSONAS A BORDO" x={1810} y={256} align="right" />
        </>
      ) : null}
      {between(t, tAudio - 0.05, tArg + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tAudio - 0.05, tArg + 0.3, 0.25), background: '#01040A'}}>
          <Spectro t={t} t0={tAudio - 2.5} dur={14.4} y={360} title="SONIDO REAL · IMPLOSIÓN DEL TITAN · HIDRÓFONO DE LA NOAA" />
          <Credit12 text="NOAA / U.S. Coast Guard (Marine Board of Investigation) · dominio público" />
        </AbsoluteFill>
      ) : null}
      {t >= tArg ? (
        <>
          <Photo src="ep12/img/sj_02.jpg" t={t} t0={tArg} from={{s: 1.05, x: 0, y: 0}} to={{s: 1.12, x: -20, y: 0}} dur={4} grade="night" credit="Juan Kulichevsky · CC BY-SA 2.0" />
          <KTitle t={t} t0={tArg + 0.4} text="2017" size={260} y={540} color={K.amber} w0={125} w1={72} />
          <MonoTag t={t} t0={c('seis años') - 0.1} text="SEIS AÑOS ANTES QUE EL TITAN" x={960 - 250} y={720} color={K.bone} />
        </>
      ) : null}
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

/** EXPLOSIÓN (flechas hacia afuera) → IMPLOSIÓN (flechas hacia adentro) */
const ExIm: React.FC<{t: number; t0: number; tExp: number; tFue: number; tImp: number; t1: number}> = ({t, t0, tExp, tFue, tImp, t1}) => {
  const o = fadeIO(t, t0, t1, 0.25);
  const sw = prog(t, tFue + 0.2, 0.5, easeInOut);
  const hit = t >= tImp ? Math.max(0, 1 - (t - tImp) * 2.2) : 0;
  const shk = hit * 18 * Math.sin(t * 90);
  const arrows = Array.from({length: 12}, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const r0 = mix(380, 600, sw), r1 = mix(520, 430, sw);
    const pulse = Math.sin(t * 6 + i) * 8;
    const x0 = 960 + Math.cos(a) * (r0 + pulse) * 1.35, y0 = 540 + Math.sin(a) * (r0 + pulse) * 0.62;
    const x1 = 960 + Math.cos(a) * (r1 + pulse) * 1.35, y1 = 540 + Math.sin(a) * (r1 + pulse) * 0.62;
    return {x0, y0, x1, y1};
  });
  const colr = sw > 0.5 ? K.cyan : K.red;
  return (
    <AbsoluteFill style={{opacity: o, transform: `translate(${shk}px, ${shk * 0.5}px)`}}>
      <AbyssBg t={t} light={0.2} deep={0.85} snow={0.4} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <marker id="ah12" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={colr} />
          </marker>
        </defs>
        {arrows.map((a, i) => (
          <line key={i} x1={a.x0} y1={a.y0} x2={a.x1} y2={a.y1} stroke={colr} strokeWidth={6} markerEnd="url(#ah12)" opacity={prog(t, t0 + 0.2 + i * 0.03, 0.3)} />
        ))}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 540, transform: 'translateY(-50%)', textAlign: 'center', fontSize: 200, color: K.bone, ...vf(mix(90, 76, sw), 880), letterSpacing: '0.01em'}}>
        <span style={{display: 'inline-block', position: 'relative'}}>
          <span style={{opacity: 1 - sw, color: K.red}}>EX</span>
          <span style={{position: 'absolute', left: 0, opacity: sw, color: K.cyan}}>IM</span>
        </span>
        PLOSIÓN
      </div>
      <AbsoluteFill style={{background: '#FFFFFF', opacity: hit * 0.85, mixBlendMode: 'screen'}} />
      <MonoTag t={t} t0={tExp - 0.4} t1={tFue + 0.1} text="LO QUE DIJO LA ARMADA" x={960 - 200} y={190} color={K.red} />
      <MonoTag t={t} t0={tFue + 0.4} text="LO QUE CREEN LOS EXPERTOS" x={960 - 230} y={190} color={K.cyan} />
    </AbsoluteFill>
  );
};

/** sección del casco bajo presión que pandea a casi 400 m */
const RingShot: React.FC<{t: number; t0: number; tCed: number; t1: number; depth: number}> = ({t, t0, tCed, t1, depth}) => {
  const b = easeIn(clamp((t - tCed) / 0.45));
  const press = clamp((depth - 280) / 108);
  const flash = t >= tCed + 0.4 ? Math.max(0, 1 - (t - tCed - 0.4) * 2.5) : 0;
  const k = t - t0;
  const cam: Cam = {pos: [Math.sin(k * 0.25) * 3.2 + 1.2, 1.6, 5.2], look: [0, 0, 0], fov: 38};
  const shk = (press > 0.8 ? (rnd(Math.floor(t * 30)) - 0.5) * 6 * press : 0) + flash * 20 * Math.sin(t * 80);
  return (
    <AbsoluteFill style={{opacity: fadeIO(t, t0, t1, 0.25), background: '#02070D', transform: `translate(${shk}px,${shk * 0.4}px)`}}>
      <Stage12 cam={cam} bg="#02070D" fog={['#02070D', 0.06]}>
        <HullRing b={b} press={press} t={t} flash={flash} />
        <Water s={{t, depth: 380, rays: 0, snow: 0.8}} />
      </Stage12>
      <DepthGauge depth={depth} design={300} collapse={388} o={1 - prog(t, tCed + 0.3, 0.4)} />
      <KTitle t={t} t0={tCed - 1.6} t1={tCed + 0.25} text="≈ 400 m" upper={false} size={150} x={110} y={300} align="left" maxW={900} color={K.red} />
      <MonoTag t={t} t0={tCed - 1.2} t1={tCed + 0.25} text="SEGÚN EL ANÁLISIS ACÚSTICO" x={110} y={420} color={K.mute} />
      <AbsoluteFill style={{background: '#FFFFFF', opacity: flash * flash * 0.7}} />
      <Credit12 text="RECREACIÓN 3D · SECCIÓN DE CASCO" align="left" x={110} />
    </AbsoluteFill>
  );
};

/** un parpadeo contra el colapso */
const BlinkBars: React.FC<{t: number; t0: number; tParp: number; t1: number}> = ({t, t0, tParp, t1}) => {
  const o = fadeIO(t, t0, t1, 0.25);
  const W = 1300;
  const pa = prog(t, tParp - 0.2, 0.8, easeOut), pb = prog(t, t0 + 0.3, 0.5, easeOut);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbyssBg t={t} light={0.1} deep={0.95} snow={0.3} />
      <div style={{position: 'absolute', left: 300, top: 360}}>
        <div style={{...mono(26, K.red, 600), letterSpacing: '0.18em'}}>EL COLAPSO</div>
        <div style={{width: 10 * pb, height: 54, background: K.red, marginTop: 10, boxShadow: `0 0 20px ${K.red}`}} />
        <div style={{...mono(22, K.mute, 500), marginTop: 8}}>MILÉSIMAS DE SEGUNDO</div>
        <div style={{...mono(26, K.cyan, 600), letterSpacing: '0.18em', marginTop: 70}}>UN PARPADEO</div>
        <div style={{width: W * 0.75 * pa, height: 54, background: K.cyan, marginTop: 10}} />
        <div style={{...mono(22, K.mute, 500), marginTop: 8}}>≈ 0,1 A 0,4 SEGUNDOS</div>
      </div>
      <KTitle t={t} t0={tParp - 0.1} text="MENOS QUE UN PARPADEO" size={84} y={870} w1={92} g1={760} />
    </AbsoluteFill>
  );
};

/* ================================================================== S07 · UN AÑO DE NADA */
const evX = geoXZ(PL.evento.lon, PL.evento.lat);
export const S07: React.FC<{t: number}> = ({t}) => {
  const c = (p: string, n = 0) => cue('s07', p, n);
  const tTreinta = c('El treinta'), tMeses = c('meses sin'), tFam = c('Las familias'), tAl = c('Al final,'), tCond = c('con una'), tSiNo = c('si no'), tSiLo = c('Si lo'), tSiete = c('siete millones');
  const tSept = c('En septiembre'), tCinco = c('cinco robots'), tPas = c('Pasaron'), tNada = c('Nada.', 2);
  return (
    <AbsoluteFill style={{background: K.abyss}}>
      {t < tTreinta ? <SeaFly t={t} t1={tTreinta} /> : null}
      {between(t, tTreinta - 0.2, tFam) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tTreinta - 0.2, tFam, 0.3)}}>
          <AbyssBg t={t} light={0.2} deep={0.85} snow={0.5} />
          <Timecode t={t} t0={tTreinta - 0.1} text="30.11.2017" label="15 DÍAS DESPUÉS" x={110} y={200} size={80} align="left" />
          <KTitle t={t} t0={c('terminó') - 0.1} t1={tMeses - 0.55} text={'TERMINÓ LA BÚSQUEDA\nDE SOBREVIVIENTES'} size={118} y={580} hl={{SOBREVIVIENTES: K.red}} />
          <Months t={t} t0={tMeses - 0.2} />
          <PhotoCard12 src="ep12/img/blq_01.jpg" t={t} t0={tMeses + 0.4} t1={tFam} x={1380} y={560} w={760} h={507} rot={2} caption="FALSO CONTACTO: UN BLOQUE DE HORMIGÓN" credit="Robot ruso Panther Plus · Min. de Defensa de Rusia · CC BY 4.0" grade="none" />
        </AbsoluteFill>
      ) : null}
      {between(t, tFam - 0.2, tAl) ? (
        <>
          <Photo src="ep12/img/fam_01.jpg" t={t} t0={tFam - 0.2} t1={tAl} from={{s: 1.04, x: 0, y: 0}} to={{s: 1.14, x: 20, y: 0}} grade="cold" tint={0.2} credit="Cámara de Diputados de la Nación · dominio público" />
          <DataCard t={t} t0={c('cincuenta') - 0.2} t1={tAl - 0.1} x={110} y={600} value={50} prefix="+" dur={0.9} label="DÍAS DE ACAMPE EN PLAZA DE MAYO" size={190} color={K.amber} w={1000} />
          <MonoTag t={t} t0={tFam + 0.2} t1={tAl - 0.1} text="FAMILIARES DE LOS TRIPULANTES" x={110} y={210} />
        </>
      ) : null}
      {between(t, tAl - 0.2, tSept) ? (
        <>
          <Photo src="ep12/img/sbc_01.jpg" t={t} t0={tAl - 0.2} t1={tSept} from={{s: 1.3, x: 0, y: -24}} to={{s: 1.36, x: -40, y: -24}} focus="50% 50%" credit="Argentina.gob.ar · CC BY-SA 2.5" />
          <MonoTag t={t} t0={tAl + 0.6} t1={tSept - 0.1} text="SEABED CONSTRUCTOR · OCEAN INFINITY" x={110} y={210} />
          <Contract t={t} t0={tCond - 0.1} tNo={tSiNo} tSi={tSiLo} tSiete={tSiete} t1={tSept - 0.1} />
        </>
      ) : null}
      {between(t, tSept - 0.2, tPas) ? <AuvShot t={t} t0={tSept - 0.2} t1={tPas} tCinco={tCinco} /> : null}
      {t >= tPas - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(t, tPas - 0.2, 0.3)}}>
          <AbyssBg t={t} light={0.1} deep={0.95} snow={0.4} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center'}}>
            <Odo value={ramp(t, tPas - 0.1, 60, 1.4)} size={220} font="mono" />
            <div style={{...mono(26, K.cyan, 600), letterSpacing: '0.24em', marginTop: 6}}>DÍAS DE BÚSQUEDA</div>
          </div>
          <KTitle t={t} t0={tNada - 0.05} text="NADA." size={150} y={790} color={K.red} />
        </AbsoluteFill>
      ) : null}
      <Chapter t={t} t0={0.2} n={4} title="EL HALLAZGO" />
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

/** vuelo sobre el Mar Argentino "vaciado" (batimetría real) */
const SeaFly: React.FC<{t: number; t1: number}> = ({t, t1}) => {
  const k = easeInOut(clamp((t + 0.3) / 4.2));
  const cam: Cam = {pos: [mix(evX[0] + 20, evX[0] + 12, k), mix(3.2, 1.6, k), mix(evX[1] + 16, evX[1] + 9, k)], look: [mix(evX[0] - 6, evX[0] - 2, k), mix(-2.0, -1.6, k), evX[1]], fov: 42};
  return (
    <AbsoluteFill style={{opacity: fadeIO(t, -0.4, t1, 0.3)}}>
      <Stage12 cam={cam} bg="#020A12" fog={['#020A12', 0.028]}>
        <Seafloor light={0.9} sea={0.4} />
        <Beacon lon={PL.evento.lon} lat={PL.evento.lat} h={3.2} color={K.red} pulse={(t * 0.8) % 2} />
      </Stage12>
      <MonoTag t={t} t0={0} t1={t1} text="MAR ARGENTINO · BATIMETRÍA REAL" x={110} y={170} />
      <MonoTag t={t} t0={0.6} t1={t1} text="PLATAFORMA ≈ 100 m → TALUD → 5.000 m" x={110} y={214} color={K.amber} />
      <Credit12 text="Datos: SRTM15+ (Scripps/NOAA) · profundidad exagerada ×14" />
    </AbsoluteFill>
  );
};

const MONTHS = ['DIC', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO'];
const Months: React.FC<{t: number; t0: number}> = ({t, t0}) => (
  <div style={{position: 'absolute', left: 110, top: 420, display: 'flex', flexWrap: 'wrap', gap: 14, width: 760}}>
    {MONTHS.map((m, i) => {
      const p = prog(t, t0 + i * 0.32, 0.3);
      return (
        <div key={m} style={{width: 150, padding: '18px 0', textAlign: 'center', border: `2px solid ${K.line}`, opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
          <div style={{...mono(34, K.bone, 600)}}>{m}</div>
          <div style={{...mono(18, K.red, 600), letterSpacing: '0.12em', marginTop: 4}}>SIN RASTRO</div>
        </div>
      );
    })}
  </div>
);

const Contract: React.FC<{t: number; t0: number; tNo: number; tSi: number; tSiete: number; t1: number}> = ({t, t0, tNo, tSi, tSiete, t1}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  if (o <= 0) return null;
  const row = (label: string, at: number, children: React.ReactNode, colr: string) => {
    const p = prog(t, at - 0.1, 0.4);
    return (
      <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderTop: `1px solid ${K.line}`, padding: '22px 0', opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}>
        <span style={{fontSize: 46, color: K.bone, ...vf(88, 600)}}>{label}</span>
        <span style={{color: colr}}>{children}</span>
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', left: 110, top: 560, width: 1060, padding: '30px 44px', background: 'rgba(1,6,12,0.82)', border: `1px solid ${K.line}`, opacity: o}}>
      <div style={{...mono(22, K.cyan, 600), letterSpacing: '0.24em', marginBottom: 6}}>EL CONTRATO</div>
      {row('Si no lo encuentra', tNo, <span style={{fontFamily: F12.mono, fontWeight: 600, fontSize: 64}}>US$ 0</span>, K.red)}
      {row('Si lo encuentra', tSi, <Odo value={ramp(t, tSiete - 0.2, 7500000, 1.2)} size={64} prefix="US$ " font="mono" color={K.sonar} />, K.sonar)}
    </div>
  );
};

/** cinco vehículos autónomos barriendo el talud */
const AuvShot: React.FC<{t: number; t0: number; t1: number; tCinco: number}> = ({t, t0, t1, tCinco}) => {
  const k = t - t0;
  const base = geoPos(PL.restos.lon - 0.25, PL.restos.lat - 0.15, 1.2);
  const cam: Cam = {pos: [base[0] - 3.5 + k * 0.35, base[1] + 2.2, base[2] + 4.8], look: [base[0] + 1.0, base[1] - 0.9, base[2]], fov: 40};
  return (
    <AbsoluteFill style={{opacity: fadeIO(t, t0, t1, 0.3)}}>
      <Stage12 cam={cam} bg="#020A12" fog={['#020A12', 0.05]}>
        <Seafloor light={0.8} />
        {Array.from({length: 5}, (_, i) => {
          const p: V3 = [base[0] - 2 + k * 0.45 + (i % 2) * 0.3, base[1] - 0.2 + Math.sin(k + i) * 0.03, base[2] - 2.2 + i * 1.1];
          return <AUV key={i} pos={p} heading={0} swath={prog(t, tCinco, 0.6)} scale={0.5} />;
        })}
        <Water s={{t, depth: 700, rays: 0, snow: 0.8}} center={base} />
      </Stage12>
      <Timecode t={t} t0={t0 + 0.2} t1={t1} text="09.2018" label="LLEGA EL SEABED CONSTRUCTOR" x={110} y={190} size={72} align="left" />
      <DataCard t={t} t0={tCinco - 0.1} t1={t1} x={110} y={760} value={5} dur={0.6} label="ROBOTS AUTÓNOMOS CON SONAR" size={130} color={K.sonar} w={900} />
      <Credit12 text="RECREACIÓN 3D SOBRE BATIMETRÍA REAL" />
    </AbsoluteFill>
  );
};

/* ================================================================== S08 · EL HALLAZGO */
export const S08: React.FC<{t: number}> = ({t}) => {
  const c = (p: string, n = 0) => cue('s08', p, n);
  const tDom = c('el domingo'), tSud = c('Sudáfrica.'), tEnt = c('Entonces,'), tApa = c('apareció'), tObj = c('Un objeto'), tSes = c('sesenta'), tPunto = c('punto de'), tVie = c('El viernes'), tRob = c('un robot');
  const tBordo = c('A bordo,'), tCuatro = c('cuatro familiares'), tDoce = c('A las doce'), tAno = c('un año'), tVieron = c('lo vieron.'), tARA = c('El ARA'), t907 = c('novecientos'), tCasco = c('Con el');
  const rovDepth = ramp(t, tVie, 907, tVieron - tVie, 0);
  return (
    <AbsoluteFill style={{background: K.abyss}}>
      {t < tEnt ? (
        <AbsoluteFill style={{opacity: fadeIO(t, -0.4, tEnt, 0.3)}}>
          <AbyssBg t={t} light={0.2} deep={0.85} snow={0.4} />
          <Calendar t={t} t0={-0.2} x={700} y={560} marks={[{d: 18, color: K.red, label: 'DOMINGO: EL BARCO PARTE HACIA SUDÁFRICA', at: tDom}]} />
          <KTitle t={t} t0={tSud - 0.2} text={'SE\nIBAN'} size={170} x={1480} y={520} color={K.red} />
        </AbsoluteFill>
      ) : null}
      {between(t, tEnt - 0.2, tVie) ? <SonarScan t={t} t0={tEnt - 0.2} tApa={tApa} tObj={tObj} tSes={tSes} tPunto={tPunto} t1={tVie} /> : null}
      {between(t, tVie - 0.2, tBordo) ? <RovDown t={t} t0={tVie - 0.2} t1={tBordo} tRob={tRob} /> : null}
      {between(t, tBordo - 0.2, tDoce) ? <Monitor t={t} t0={tBordo - 0.2} t1={tDoce} tCuatro={tCuatro} /> : null}
      {between(t, tDoce - 0.2, tARA) ? (
        <>
          <WreckShot t={t} t0={tDoce - 0.2} cam0={{pos: [9, 2.6, 12], look: [0, -0.3, 0], fov: 32}} cam1={{pos: [6.5, 1.8, 8.5], look: [0, -0.3, 0], fov: 34}} span={tARA - tDoce + 0.2} lights={0.5} />
          <Timecode t={t} t0={tDoce} t1={tARA} text="17.11.2018 · 00:30" label="MADRUGADA" y={260} size={96} />
          <KTitle t={t} t0={tAno - 0.1} t1={tARA} text="UN AÑO Y DOS DÍAS DESPUÉS" size={70} y={820} color={K.amber} w1={92} g1={760} />
        </>
      ) : null}
      {t >= tARA - 0.2 ? (
        <>
          <WreckShot t={t} t0={tARA - 0.2} cam0={{pos: [6.0, 1.7, 7.6], look: [0, -0.3, 0], fov: 34}} cam1={{pos: [1.6, 0.6, 3.6], look: [-0.6, -0.4, 0], fov: 36}} span={9} />
          <KTitle t={t} t0={t907 - 0.1} text="907 METROS" size={150} y={190} color={K.bone} w0={125} w1={80} />
          <MonoTag t={t} t0={t907 + 0.4} text="460 km AL ESTE DE COMODORO RIVADAVIA" x={960 - 330} y={290} color={K.cyan} />
          <MonoTag t={t} t0={tCasco} text="CASCO APLASTADO · RESTOS EN UN ÁREA DE ≈ 100 m" x={110} y={950} color={K.amber} />
          <Credit12 text="RECREACIÓN 3D" />
        </>
      ) : null}
      {t > tVie - 0.2 && t < tARA + 0.4 && !between(t, tBordo - 0.3, tDoce + 0.1) ? (
        <div style={{position: 'absolute', right: 110, top: 150, textAlign: 'right', opacity: fadeIO(t, tVie, tARA + 0.4, 0.3) * (1 - prog(t, tBordo - 0.5, 0.2)) + prog(t, tDoce, 0.3) * 0}}>
          <div style={{...mono(22, K.cyan, 600), letterSpacing: '0.2em'}}>PROFUNDIDAD DEL ROBOT</div>
          <div style={{fontFamily: F12.mono, fontWeight: 600, fontSize: 84, color: K.bone}}>{fmt(Math.round(rovDepth))} m</div>
        </div>
      ) : null}
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

/** mosaico de sonar de barrido lateral: aparece un objeto de unos 60 m */
const SonarScan: React.FC<{t: number; t0: number; tApa: number; tObj: number; tSes: number; tPunto: number; t1: number}> = ({t, t0, tApa, tObj, tSes, tPunto, t1}) => {
  const p = prog(t, t0 + 0.2, tApa - t0 + 0.6, easeInOut);
  const zoom = 1 + 0.35 * prog(t, tObj, 3.5, easeInOut);
  return (
    <AbsoluteFill style={{opacity: fadeIO(t, t0, t1, 0.3), background: '#060403'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '67% 52%'}}>
        <Img src={staticFile('ep12/img/sonar_mosaico.jpg')} style={{width: 1920, height: 1080, clipPath: `inset(0 0 ${(1 - p) * 100}% 0)`}} />
        <div style={{position: 'absolute', left: 0, top: p * 1080 - 2, width: 1920, height: 4, background: '#FFE3A6', boxShadow: '0 0 24px #FFB547', opacity: p < 1 ? 1 : 0}} />
      </AbsoluteFill>
      <Scanlines o={0.14} />
      <Reticle t={t} t0={tApa} t1={t1} x={1286.4 + (1290 - 1286.4) * zoom} y={561.6 + (560 - 561.6) * zoom} w={250 * zoom} h={120 * zoom} label={t > tPunto - 0.1 ? 'PUNTO DE INTERÉS 24' : 'CONTACTO'} sub={t > tSes ? 'OBJETO DE ≈ 60 m' : undefined} />
      <MonoTag t={t} t0={t0 + 0.3} t1={t1} text="SONAR DE BARRIDO LATERAL · REPRESENTACIÓN" x={110} y={120} color="#FFB547" />
    </AbsoluteFill>
  );
};

/** el robot baja en la oscuridad */
const RovDown: React.FC<{t: number; t0: number; t1: number; tRob: number}> = ({t, t0, t1, tRob}) => {
  const k = t - t0;
  const y = -k * 0.8;
  const cam: Cam = {pos: [2.6, y + 0.9, 3.6], look: [0, y - 0.1, 0], fov: 40};
  return (
    <AbsoluteFill style={{opacity: fadeIO(t, t0, t1, 0.3)}}>
      <Stage12 cam={cam} bg="#010509" fog={['#010509', 0.09]}>
        <ambientLight intensity={0.15} />
        <directionalLight position={[3, 5, 4]} intensity={0.6} color="#9FD8FF" />
        <ROV pos={[0, y, 0]} rot={[0, -0.6, 0]} t={t} />
        <Water s={{t, depth: 300 + k * 120, rays: 0, snow: 1.3}} center={[0, y, 0]} />
      </Stage12>
      <KTitle t={t} t0={tRob - 0.1} t1={t1} text="UN ROBOT CON CÁMARA" size={80} y={900} w1={92} g1={760} />
      <Credit12 text="RECREACIÓN 3D" />
    </AbsoluteFill>
  );
};

/** la pantalla que miraban a bordo (recreación) */
const Monitor: React.FC<{t: number; t0: number; t1: number; tCuatro: number}> = ({t, t0, t1, tCuatro}) => {
  const n = Math.floor(t * 20);
  return (
    <AbsoluteFill style={{opacity: fadeIO(t, t0, t1, 0.3), background: '#020406'}}>
      <div style={{position: 'absolute', left: 360, top: 90, width: 1200, height: 675, background: '#05080A', border: '18px solid #15191C', borderRadius: 14, overflow: 'hidden', boxShadow: '0 0 120px rgba(86,216,255,0.12)'}}>
        <svg width={1164} height={639}>
          {Array.from({length: 220}, (_, i) => (
            <circle key={i} cx={rnd(i + n * 7) * 1164} cy={rnd(i * 3 + n) * 639} r={0.8 + rnd(i) * 1.6} fill="#9FB8C8" opacity={0.25 + rnd(i + n) * 0.3} />
          ))}
          <ellipse cx={582} cy={450} rx={380} ry={130} fill="rgba(160,190,210,0.06)" />
        </svg>
        <div style={{position: 'absolute', left: 30, top: 24, ...mono(24, '#E8F0F4', 500), letterSpacing: '0.1em'}}>ROV · CAM 1</div>
        <div style={{position: 'absolute', right: 30, top: 24, ...mono(24, '#E8F0F4', 500)}}>16.11.2018</div>
        <div style={{position: 'absolute', left: 30, bottom: 24, ...mono(24, K.sonar, 500)}}>PROF {fmt(Math.round(600 + (t - t0) * 40))} m</div>
        <div style={{position: 'absolute', right: 30, bottom: 24, ...mono(24, '#FF4B3A', 600), opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 3))}}>● REC</div>
        <Scanlines o={0.25} />
      </div>
      <DataCard t={t} t0={tCuatro - 0.2} t1={t1} x={960} y={830} value={4} dur={0.5} label="FAMILIARES MIRABAN DESDE EL BARCO" size={110} color={K.amber} align="center" w={1100} />
      <Credit12 text="RECREACIÓN" />
    </AbsoluteFill>
  );
};

/* ================================================================== S09 · LA VERDAD */
export const S09: React.FC<{t: number}> = ({t}) => {
  const c = (p: string, n = 0) => cue('s09', p, n);
  const tEn = c('En dos'), tTrib = c('un tribunal'), tVal = c('La válvula'), tJul = c('julio'), tCuat = c('cuatro meses'), tSub = c('El submarino'), tVein = c('veintiséis'), tTreinta = c('treinta y tres');
  const tAun = c('Aun así,'), tCond = c('El tribunal condenó'), tVilla = c('Claudio'), tTresA = c('tres años'), tPor = c('por autorizar'), tLos = c('Los otros'), tAbs = c('absueltos.');
  const tPero = c('Pero hay'), tEntre = c('Entre las'), tDiez = c('las diez'), tNadie = c('nadie sabe');
  return (
    <AbsoluteFill style={{background: K.abyss}}>
      {t < tVal ? (
        <AbsoluteFill style={{opacity: fadeIO(t, -0.4, tVal, 0.3)}}>
          <AbyssBg t={t} light={0.15} deep={0.9} snow={0.3} />
          <KTitle t={t} t0={-0.2} t1={tEn - 0.1} text="¿POR QUÉ?" size={240} y={540} color={K.bone} />
          <Court t={t} t0={tEn - 0.1} tTrib={tTrib} />
        </AbsoluteFill>
      ) : null}
      {between(t, tVal - 0.2, tSub) ? <Valve t={t} t0={tVal - 0.2} tJul={tJul} tCuat={tCuat} t1={tSub} /> : null}
      {between(t, tSub - 0.2, tAun) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tSub - 0.2, tAun, 0.3)}}>
          <AbyssBg t={t} light={0.15} deep={0.9} snow={0.3} />
          <DataCard t={t} t0={tVein - 0.2} x={180} y={300} value={26} dur={1.0} label="MESES SIN IR A DIQUE SECO" sub="mantenimiento obligatorio vencido" size={230} color={K.amber} w={760} />
          <DataCard t={t} t0={tTreinta - 0.2} x={1040} y={300} value={33} dur={1.0} label="TAREAS PENDIENTES" sub="de mantenimiento, sin hacer" size={230} color={K.red} w={760} />
          <Credit12 text="Fuente: fundamentos de la sentencia (agosto de 2026)" />
        </AbsoluteFill>
      ) : null}
      {between(t, tAun - 0.2, tCond) ? (
        <>
          <Photo src="ep12/img/sj_08.jpg" t={t} t0={tAun - 0.2} t1={tCond} from={{s: 1.05, x: 0, y: 0}} to={{s: 1.12, x: -30, y: 0}} grade="night" credit="JeanValjean1988 · CC BY-SA 4.0" />
          <KTitle t={t} t0={tAun} text="AUN ASÍ, SALIÓ A PATRULLAR" size={92} y={540} color={K.bone} w1={86} />
        </>
      ) : null}
      {between(t, tCond - 0.2, tPero) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCond - 0.2, tPero, 0.3)}}>
          <AbyssBg t={t} light={0.12} deep={0.92} snow={0.3} />
          <NameCard t={t} t0={tVilla - 0.1} t1={tLos - 0.1} name="Claudio Villamide" role="EX JEFE DE LA FUERZA DE SUBMARINOS" x={160} y={230} color={K.amber} />
          <Verdict t={t} t0={tTresA - 0.2} tPor={tPor} t1={tLos - 0.1} />
          {[0, 1, 2].map((i) => (
            <React.Fragment key={i}>
              <div style={{position: 'absolute', left: 260 + i * 500, top: 380, width: 400, height: 300, border: `2px solid ${K.line}`, opacity: prog(t, tLos + i * 0.2, 0.4) * (1 - prog(t, tPero - 0.3, 0.3)), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg width={120} height={140} viewBox="0 0 24 28">
                  <circle cx={12} cy={8} r={6} fill={K.dim} />
                  <path d="M1 28 C1 18, 23 18, 23 28 Z" fill={K.dim} />
                </svg>
              </div>
              <Stamp12 t={t} t0={tAbs - 0.3 + i * 0.12} t1={tPero - 0.1} text="ABSUELTO" x={460 + i * 500} y={530} size={58} rot={-8 + i * 3} color={K.sonar} />
            </React.Fragment>
          ))}
          <MonoTag t={t} t0={tLos} t1={tPero - 0.1} text="LOS OTROS TRES JEFES ACUSADOS" x={260} y={760} color={K.mute} />
        </AbsoluteFill>
      ) : null}
      {t >= tPero - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(t, tPero - 0.2, 0.5)}}>
          <AbyssBg t={t} light={0.05} deep={1} snow={0.6} />
          <SerifLine t={t} t0={tPero + 0.2} t1={tEntre - 0.2} text="algo que ni el juicio pudo reconstruir" size={74} y={540} />
          <HourAxis t={t} t0={tEntre - 0.2} from={7} to={11} y={640} marks={[{h: 8.75, label: 'ÚLTIMA SEÑAL AUTOMÁTICA', at: tEntre + 0.3}, {h: 10.85, label: 'EL RUIDO', color: K.red, at: tDiez}]} spans={[{a: 8.75, b: 10.85, label: '2 H 06 MIN SIN DATOS', color: K.amber, at: tNadie - 0.4, unknown: true}]} />
        </AbsoluteFill>
      ) : null}
      <Chapter t={t} t0={0.2} n={5} title="LA VERDAD" />
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

const Court: React.FC<{t: number; t0: number; tTrib: number}> = ({t, t0, tTrib}) => {
  const o = prog(t, t0, 0.4);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o, background: K.abyss}}>
      <AbyssBg t={t} light={0.15} deep={0.9} snow={0.3} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center'}}>
        <div style={{...mono(28, K.cyan, 600), letterSpacing: '0.3em'}}>JUICIO ORAL · RÍO GALLEGOS</div>
        <div style={{fontSize: 150, color: K.bone, ...vf(mix(120, 80, prog(t, tTrib, 1)), mix(300, 860, prog(t, tTrib, 1))), marginTop: 10}}>2026</div>
        <div style={{...mono(26, K.mute, 500), letterSpacing: '0.16em', marginTop: 10, opacity: prog(t, tTrib + 0.4, 0.5)}}>DEL 3 DE MARZO AL 8 DE JULIO · MÁS DE 30 AUDIENCIAS</div>
      </div>
    </AbsoluteFill>
  );
};

/** la válvula que fallaba: dibujo técnico + línea de tiempo de 4 meses */
const Valve: React.FC<{t: number; t0: number; tJul: number; tCuat: number; t1: number}> = ({t, t0, tJul, tCuat, t1}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  const p = prog(t, t0 + 0.2, 1.2, easeInOut);
  const leak = (t * 1.3) % 1;
  const tl = prog(t, tJul - 0.2, 1.4, easeInOut);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbyssBg t={t} light={0.15} deep={0.9} snow={0.3} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g transform="translate(560 430)" opacity={p}>
          <rect x={-360} y={-46} width={720} height={92} fill="none" stroke={K.cyan} strokeWidth={4} />
          <circle cx={0} cy={0} r={110} fill="rgba(86,216,255,0.06)" stroke={K.cyan} strokeWidth={4} />
          <rect x={-18} y={-210} width={36} height={110} fill="none" stroke={K.cyan} strokeWidth={4} />
          <rect x={-90} y={-230} width={180} height={26} fill="none" stroke={K.cyan} strokeWidth={4} />
          <line x1={-80} y1={70} x2={80} y2={-70} stroke={K.amber} strokeWidth={8} />
          {Array.from({length: 6}, (_, i) => {
            const q = (leak + i / 6) % 1;
            return <circle key={i} cx={90 + q * 250} cy={20 + Math.sin(q * 6 + i) * 10} r={7} fill="#2EA8FF" opacity={1 - q} />;
          })}
          <text x={0} y={190} textAnchor="middle" fontFamily={F12.mono} fontWeight={600} fontSize={34} fill={K.amber} letterSpacing="0.14em">VÁLVULA E-19</text>
          <text x={0} y={230} textAnchor="middle" fontFamily={F12.mono} fontWeight={500} fontSize={22} fill={K.mute} letterSpacing="0.1em">FALLA DE ESTANQUEIDAD</text>
        </g>
        <g opacity={tl}>
          <line x1={1100} y1={760} x2={1100 + 640 * tl} y2={760} stroke={K.bone} strokeWidth={3} />
          <circle cx={1100} cy={760} r={12} fill={K.amber} />
          <text x={1100} y={720} textAnchor="middle" fontFamily={F12.mono} fontWeight={600} fontSize={30} fill={K.amber}>JUL 2017</text>
          <text x={1100} y={810} textAnchor="middle" fontFamily={F12.mono} fontSize={22} fill={K.mute}>FALLA DETECTADA</text>
          <circle cx={1740} cy={760} r={12} fill={K.red} opacity={prog(t, tCuat - 0.3, 0.3)} />
          <text x={1740} y={720} textAnchor="middle" fontFamily={F12.mono} fontWeight={600} fontSize={30} fill={K.red} opacity={prog(t, tCuat - 0.3, 0.3)}>NOV 2017</text>
          <text x={1740} y={810} textAnchor="middle" fontFamily={F12.mono} fontSize={22} fill={K.mute} opacity={prog(t, tCuat - 0.3, 0.3)}>HUNDIMIENTO</text>
          <text x={1420} y={680} textAnchor="middle" fontFamily={F12.mono} fontWeight={600} fontSize={44} fill={K.bone} opacity={prog(t, tCuat, 0.4)}>4 MESES</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const Verdict: React.FC<{t: number; t0: number; tPor: number; t1: number}> = ({t, t0, tPor, t1}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  if (o <= 0) return null;
  const p = prog(t, t0, 0.6);
  return (
    <div style={{position: 'absolute', left: 160, top: 470, opacity: o}}>
      <div style={{...mono(26, K.red, 600), letterSpacing: '0.24em'}}>CONDENADO</div>
      <div style={{fontSize: 150, color: K.bone, ...vf(mix(118, 80, p), mix(300, 880, p)), lineHeight: 1}}>3 AÑOS</div>
      <div style={{fontSize: 52, color: K.bone, ...vf(92, 600)}}>de prisión en suspenso</div>
      <div style={{...mono(22, K.mute, 500), letterSpacing: '0.12em', marginTop: 8}}>+ 6 AÑOS DE INHABILITACIÓN · ESTRAGO CULPOSO AGRAVADO</div>
      <div style={{fontFamily: F12.serif, fontStyle: 'italic', fontSize: 50, color: K.amber, marginTop: 26, opacity: prog(t, tPor - 0.1, 0.5)}}>por autorizar la navegación conociendo las fallas</div>
    </div>
  );
};

/* ================================================================== S10 · EL MAR */
export const S10: React.FC<{t: number}> = ({t}) => {
  const c = (p: string, n = 0) => cue('s10', p, n);
  const tFam = c('Las familias'), tGob = c('El gobierno'), tDos = c('dos mil'), tKm = c('a casi'), tY = c('Y queda'), tRed = c('La red'), tTerm = c('terminó'), t44 = c('cuarenta');
  const tLo = c('Lo que'), tSabe = c('lo sabe'), tVos = c('¿Vos'), tAntes = c('Y antes'), tEstos = c('Estos son');
  return (
    <AbsoluteFill style={{background: K.abyss}}>
      {t < tFam ? <WreckShot t={t} t0={-0.4} cam0={{pos: [7.5, 2.6, 9.5], look: [0, -0.4, 0], fov: 32}} cam1={{pos: [6.4, 2.2, 8.2], look: [0, -0.4, 0], fov: 32}} span={3} lights={0.85} /> : null}
      {t < tFam ? <MonoTag t={t} t0={0} t1={tFam} text="907 m · ARA SAN JUAN" x={110} y={170} /> : null}
      {between(t, tFam - 0.2, tGob) ? <Photo src="ep12/img/mdp_01.jpg" t={t} t0={tFam - 0.2} t1={tGob} from={{s: 1.1, x: -30, y: 0}} to={{s: 1.2, x: 20, y: -10}} credit="Argentina.gob.ar · CC BY-SA 2.5" /> : null}
      {between(t, tGob - 0.2, tY) ? <Obeliscos t={t} t0={tGob - 0.2} tDos={tDos} tKm={tKm} t1={tY} /> : null}
      {between(t, tY - 0.2, tLo) ? (
        <>
          <Photo src="ep12/img/ha10_01.jpg" t={t} t0={tY - 0.2} t1={tLo} from={{s: 1.25, x: -40, y: 10}} to={{s: 1.06, x: 0, y: 30}} focus="50% 70%" credit="CTBTO · CC BY 2.0" />
          <MonoTag t={t} t0={tRed} t1={tLo - 0.1} text="HA10 · ISLA ASCENSIÓN" x={110} y={210} />
          <KTitle t={t} t0={t44 - 0.2} t1={tLo - 0.1} text="44 ARGENTINOS" size={120} y={880} color={K.celeste} />
        </>
      ) : null}
      {between(t, tLo - 0.2, tVos) ? <Dawn t={t} t0={tLo - 0.2} tSabe={tSabe} t1={tVos} /> : null}
      {between(t, tVos - 0.3, tAntes) ? (
        <AbsoluteFill>
          <AbyssBg t={t} light={0.2} deep={0.85} snow={0.5} />
          <Poll12 t={t} t0={tVos - 0.2} t1={tAntes} q="¿HAY QUE SACAR EL SUBMARINO DEL FONDO?" a="Sí, para saber la verdad" b="No, ese es su lugar de descanso" />
        </AbsoluteFill>
      ) : null}
      {t >= tAntes - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(t, tAntes - 0.2, 0.6)}}>
          <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #0A2238 0%, ${K.abyss} 70%)`}} />
          <MarineSnow t={t} o={0.4} />
          <KTitle t={t} t0={tEstos - 0.1} text="LOS 44" size={200} y={540} color={K.bone} w0={125} w1={86} g0={200} g1={760} />
        </AbsoluteFill>
      ) : null}
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

/** 907 m = 13 obeliscos apilados */
const Obeliscos: React.FC<{t: number; t0: number; tDos: number; tKm: number; t1: number}> = ({t, t0, tDos, tKm, t1}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  const n = Math.round(13 * prog(t, tKm - 0.2, 1.6, easeOut));
  const H = 820, top = 140, per = (67.5 / 907) * H;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbyssBg t={t} light={0.4} deep={0.6} snow={0.4} />
      <DataCard t={t} t0={tDos - 0.2} x={110} y={240} value={2300} dur={1.0} suffix=" t" label="PESO DEL SUBMARINO" size={150} color={K.amber} />
      <DataCard t={t} t0={tKm - 0.1} x={110} y={560} value={907} dur={1.2} suffix=" m" label="PROFUNDIDAD" size={150} color={K.cyan} />
      <MonoTag t={t} t0={tKm + 1.4} text="= 13 OBELISCOS APILADOS" x={110} y={880} color={K.bone} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <line x1={1300} y1={top} x2={1700} y2={top} stroke={K.cyan} strokeWidth={3} />
        <text x={1720} y={top + 8} fontFamily={F12.mono} fontSize={22} fill={K.cyan}>0 m</text>
        <line x1={1300} y1={top + H} x2={1700} y2={top + H} stroke={K.red} strokeWidth={3} strokeDasharray="10 6" opacity={prog(t, tKm, 0.4)} />
        <text x={1720} y={top + H + 8} fontFamily={F12.mono} fontSize={22} fill={K.red} opacity={prog(t, tKm, 0.4)}>907 m</text>
        {Array.from({length: n}, (_, i) => {
          const y = top + i * per;
          return <path key={i} d={`M1500 ${y} L1508 ${y + per * 0.12} L1514 ${y + per} L1486 ${y + per} L1492 ${y + per * 0.12} Z`} fill={K.bone} opacity={0.85} />;
        })}
      </svg>
      <Credit12 text="El Obelisco de Buenos Aires mide 67,5 m" />
    </AbsoluteFill>
  );
};

/** amanecer en el mar calmo */
const Dawn: React.FC<{t: number; t0: number; tSabe: number; t1: number}> = ({t, t0, tSabe, t1}) => {
  const k = t - t0;
  const cam: Cam = {pos: [0, 1.3, 9 - k * 0.15], look: [0, 0.9, -10], fov: 40};
  return (
    <AbsoluteFill style={{opacity: fadeIO(t, t0, t1, 0.4)}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #0B1B2E 0%, #3B4E6A 40%, #E59A6A 58%, #10202E 62%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 57%, rgba(255,214,160,0.7) 0%, rgba(255,160,90,0.2) 8%, rgba(0,0,0,0) 22%)'}} />
      <Stage12 cam={cam} fog={['#2A3446', 0.035]}>
        <ambientLight intensity={0.4} color="#FFD7B0" />
        <directionalLight position={[0, 2, -30]} intensity={2.2} color="#FFC08A" />
        <StormSea t={t * 0.5} size={120} amp={0.18} lights={false} />
      </Stage12>
      <SerifLine t={t} t0={tSabe - 0.1} text="lo sabe solamente el mar" size={84} y={300} color={K.bone} />
    </AbsoluteFill>
  );
};

/* ================================================================== LOS 44 NOMBRES Y PLACA FINAL */
export const Names: React.FC<{t: number; dur: number}> = ({t, dur}) => {
  const o = prog(t, 0, 0.6) * (1 - prog(t, dur - 0.6, 0.6));
  const cols = 4, rows = 11;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, #0A2238 0%, ${K.abyss} 75%)`}} />
      <MarineSnow t={t} o={0.35} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 52, textAlign: 'center', ...mono(22, K.celeste, 600), letterSpacing: '0.4em', opacity: prog(t, 0.2, 0.6)}}>
        ARA SAN JUAN (S-42) · 15 DE NOVIEMBRE DE 2017
      </div>
      <div style={{position: 'absolute', left: 120, top: 110, width: 1680, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoFlow: 'column', gridTemplateRows: `repeat(${rows}, 76px)`, columnGap: 40}}>
        {CREW.map(([rank, name], i) => {
          const p = prog(t, 0.6 + i * 0.27, 0.8);
          return (
            <div key={i} style={{opacity: p, transform: `translateY(${(1 - p) * 12}px)`, filter: `blur(${(1 - p) * 6}px)`}}>
              <div style={{...mono(14, K.mute, 500), letterSpacing: '0.16em', textTransform: 'uppercase'}}>{rank}</div>
              <div style={{fontFamily: F12.serif, fontSize: 33, color: K.bone, lineHeight: 1.15, whiteSpace: 'nowrap'}}>{name}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 860, right: 860, bottom: 34, height: 3, background: K.celeste, opacity: prog(t, 13, 1)}} />
    </AbsoluteFill>
  );
};

export const EndCard12: React.FC<{t: number; total: number}> = ({t, total}) => {
  const bg = prog(t, 0, 0.6);
  const fadeOut = prog(t, total - 0.6, 0.6);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: K.abyss, opacity: bg}} />
      <AbsoluteFill style={{opacity: bg, background: `radial-gradient(circle at ${28 + 3 * Math.sin(t * 0.5)}% 55%, rgba(86,216,255,0.16) 0%, rgba(0,0,0,0) 50%)`}} />
      <MarineSnow t={t} o={0.4 * bg} />
      <div style={{position: 'absolute', left: 230, top: 210, transform: `rotate(${Math.sin(t * 0.6) * 1.2}deg)`}}>
        <LogoMark size={300} t={t} t0={0.1} />
      </div>
      <div style={{position: 'absolute', left: 120, width: 560, top: 560, textAlign: 'center', fontFamily: F.head, fontSize: 84, color: '#fff', letterSpacing: 6, opacity: prog(t, 0.5, 0.5)}}>CONTEXTO</div>
      <div style={{position: 'absolute', left: 210, top: 690, opacity: prog(t, 0.8, 0.3), transform: `scale(${pop(t, 0.8) * (1 + 0.025 * Math.sin(t * 4))})`}}>
        <div style={{width: 380, height: 84, background: K.red, borderRadius: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, letterSpacing: 3, color: '#fff', ...vf(100, 800), boxShadow: '0 10px 30px rgba(255,75,58,0.45)'}}>SUSCRIBITE</div>
      </div>
      <div style={{position: 'absolute', left: 1010, top: 170, opacity: prog(t, 0.4, 0.5)}}>
        <div style={{...mono(24, K.mute, 600), letterSpacing: '0.3em', marginBottom: 16}}>SEGUÍ MIRANDO</div>
        {[0, 1].map((i) => (
          <div key={i} style={{width: 760, height: 330, marginBottom: 40, borderRadius: 10, border: `3px solid rgba(255,255,255,${0.16 + 0.06 * Math.sin(t * 2 + i)})`, background: 'rgba(255,255,255,0.04)', transform: `translateX(${(1 - prog(t, 0.5 + i * 0.15, 0.6)) * 80}px)`}} />
        ))}
      </div>
      <AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};
