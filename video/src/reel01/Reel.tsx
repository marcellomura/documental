/* Reel 01 · LA MAESTRA QUE IBA A CABALLO (el caso Nanci Godoy). Edición especial solo vertical (1080×1920, 2:42) para
   Reels, TikTok y Facebook. Treinta y dos planos atados a la locución (src/data/reel01): el gancho a caballo, quién era,
   el camino por el bañado, la carta, el último audio, la tormenta, la búsqueda, los detenidos (sin nombres ni rostros),
   el hallazgo, el debate con las dos posturas atribuidas y la encuesta del cierre. El 3D está en three.tsx y los
   gráficos en kit.tsx. Nada muestra el cuerpo ni la violencia. */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useAssets} from './assets';
import {at, atE, TL} from './lib';
import {
  K, VW, mix, fio, hd, sr, mn, prog, pop, clamp, easeInOut, easeOut, rnd, Captions, Vignette, Scrims, Kicker, Headline, Chip, Counter, IconMic, IconHorse, IconDoc, IconClock, Signal,
  IconBadge, IconPaw, IconDrone, IconHeli, IconBolt, IconWaves, IconChat,
  AudioBubble, Calendar, Stamp, Figure, Quote, Letter, SatView, satPoint, satMpp, SAT_CREDIT, Pin, ArgMap, Logo,
} from './kit';
import {Stage, SkyDome, Lights, Water, MudFloor, Marsh, Mist, Egrets, Horse, School, Classroom, Rain, Bolt, Stars, Ripples, flashAt, camPath, WALK_CYCLE, type Mood, type Cam, type V3} from './three';

export const REEL_TOTAL = TL.total;

/* ================================================================== tiempos clave */
const T = {
  clases: atE('r01', 'clases.'),
  dias21: at('r01', '21 días'),
  suUltimo: at('r01', 'su último mensaje'),
  policia: at('r01', 'un policía'),
  encontro: at('r01', 'encontró'),
  km: at('r01', '2,5 kilómetros'),
  muerte: at('r01', 'Y su muerte'),
  divide: at('r01', 'divide'),
  title: atE('r01', 'país.') + 0.2,
  nanci: at('r02', 'Nanci'),
  anios: at('r02', '52 años'),
  agosto: at('r02', 'agosto'),
  escuela626: at('r02', 'Escuela Rural N.º 626'),
  esquina: at('r02', 'Esquina'),
  unica: at('r02', 'única'),
  directora: at('r02', 'directora'),
  maestra: at('r02', 'maestra'),
  cocinera: at('r02', 'cocinera'),
  chicos: at('r02', '8 chicos'),
  peones: at('r02', 'hijos de peones'),
  r03: TL.starts.r03,
  privada: at('r03', 'privada'),
  curupi: at('r03', 'El Curupí'),
  coto: at('r03', 'coto de caza'),
  viajaba: at('r03', 'Nanci viajaba'),
  ciudad: at('r03', 'ciudad'),
  campo: at('r03', 'campo'),
  seguia: at('r03', 'y de ahí seguía'),
  dosHoras: at('r03', 'dos horas'),
  baqueana: at('r03', 'con una baqueana'),
  banados: at('r03', 'entre bañados'),
  senal: at('r03', 'Sin señal.'),
  semana: at('r03', 'Se quedaba'),
  r04: TL.starts.r04,
  carta: at('r04', 'En una carta'),
  abandonada: at('r04', '«totalmente abandonada»:'),
  agua: at('r04', 'sin agua potable'),
  ratas: at('r04', 'con ratas'),
  registros: at('r04', 'y sin registros'),
  reclamo: at('r04', 'El reclamo'),
  consejo: at('r04', 'Consejo'),
  audio: at('r04', 'Y en un audio'),
  fantasma: at('r04', '«Una escuela fantasma, alumnos fantasmas».'),
  r05: TL.starts.r05,
  nueve: at('r05', '9 de la noche'),
  mando: at('r05', 'mandó'),
  volver: at('r05', 'Tenía que volver'),
  el9: at('r05', 'el 9.'),
  noVolvio: at('r05', 'No volvió.'),
  tormentas: at('r05', 'tormentas'),
  caminos: at('r05', 'los caminos anegados'),
  faltaSenal: at('r05', 'la falta de señal'),
  denuncia: at('r05', 'la denuncia'),
  el15: at('r05', 'el 15.'),
  r06: TL.starts.r06,
  cien: at('r06', 'unos 100 policías,'),
  caballos: at('r06', 'caballos'),
  perros: at('r06', 'perros'),
  drones: at('r06', 'drones'),
  helicop: at('r06', 'helicópteros.'),
  antes: at('r06', 'Antes de encontrarla'),
  cinco: at('r06', '5 detenidos:'),
  capataz: at('r06', 'el capataz'),
  dos: at('r06', 'dos trabajadores'),
  femicidio: at('r06', 'imputados por femicidio'),
  baq: at('r06', 'la baqueana'),
  homicidio: at('r06', 'por homicidio simple'),
  otro: at('r06', 'y otro hombre'),
  falso: at('r06', 'por falso testimonio'),
  todos: at('r06', 'Todos tienen'),
  presuncion: at('r06', 'presunción'),
  defensa: at('r06', 'Y la defensa'),
  golpearon: at('r06', 'golpearon'),
  r07: TL.starts.r07,
  oct28: at('r07', '28 de octubre,'),
  recorria: at('r07', 'recorría'),
  rastrillado: at('r07', 'rastrillado.'),
  comoNo: at('r07', 'Como no había señal'),
  avisar: at('r07', 'para avisar'),
  cabalgando: at('r07', 'cabalgando.'),
  r08: TL.starts.r08,
  fiscalia: at('r08', 'La fiscalía'),
  pero: at('r08', 'Pero la discusión'),
  familia: at('r08', 'Su familia y los gremios'),
  estadoFam: at('r08', 'el Estado'),
  sola: at('r08', 'dejó sola:'),
  horas: at('r08', 'a horas de caballo'),
  sinSenal: at('r08', 'sin señal,'),
  escuelaDen: at('r08', 'en una escuela'),
  hijo: at('r08', 'Su hijo'),
  quoteHijo: at('r08', '«Que el Estado esté presente, hoy no lo está».'),
  noDescarta: at('r08', 'Su familia no descarta'),
  paro: at('r08', 'Y los gremios hicieron paro'),
  pais: at('r08', 'país.'),
  r09: TL.starts.r09,
  gobernador: at('r09', 'El gobernador'),
  operativo: at('r09', '«un operativo muy fuerte».'),
  vos: at('r09', '¿Vos qué pensás?'),
  crimen: at('r09', '¿Fue un crimen'),
  oEstado: at('r09', 'o el Estado'),
  leo: at('r09', 'Te leo'),
  end: TL.end,
};
/* cortes entre planos */
const C = {
  s2: T.dias21 - 0.12, s3: T.policia - 0.1, s4: T.encontro - 0.05, s5: T.muerte - 0.12, s6: T.title,
  s7: TL.starts.r02 - 0.05, s8: T.agosto - 0.25, s8b: T.escuela626 + 0.35, s9: T.unica - 0.35,
  s10: T.r03 - 0.25, s11: T.viajaba - 0.15, s12: T.seguia - 0.12, s12b: T.banados - 0.15, s12c: T.senal - 0.1, s12d: T.semana - 0.15,
  s13: T.r04 - 0.3, s14: T.carta - 0.15, s15: T.reclamo - 0.25, s16: T.audio - 0.15,
  s17: T.r05 - 0.35, s18: T.volver - 0.15, s19: T.tormentas - 0.2, s19b: T.denuncia - 0.25,
  s20: T.r06 - 0.25, s21: T.antes - 0.15,
  s22: T.r07 - 0.25, s23: T.comoNo - 0.1, s24: atE('r07', 'cabalgando.') + 0.6,
  s25: T.r08 - 0.15, s26: T.familia - 0.2, s27: T.hijo - 0.1, s28: T.noDescarta - 0.15, s29: T.paro - 0.15,
  s30: T.r09 - 0.2, s31: T.vos - 0.15, s32: T.end + 0.05,
};
/* los subtítulos se esconden cuando el texto grande en pantalla ya dice lo mismo */
const NO_CAPS: [number, number][] = [
  [0, T.suUltimo - 0.05], [T.title - 0.3, TL.starts.r02], [T.fantasma - 0.1, C.s17], [T.noVolvio - 0.05, C.s19],
  [C.s25, C.s26], [T.estadoFam - 0.15, C.s28], [T.operativo - 0.1, T.leo - 0.05], [T.end, 999],
];
const capsHidden = (t: number) => NO_CAPS.some(([a, b]) => t >= a && t < b);

/* ================================================================== fondos 2D */
/** pizarra oscura: degradé, polvo de tiza y viñeta */
const Slate: React.FC<{t: number; glow?: string; x?: number; y?: number}> = ({t, glow = 'rgba(240,168,90,0.16)', x = 50, y = 35}) => (
  <AbsoluteFill style={{background: K.deep}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at ${x}% ${y}%, ${glow} 0%, rgba(11,20,25,0) 70%)`}} />
    <svg width={VW} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: 0.5}}>
      {Array.from({length: 90}, (_, i) => (
        <circle key={i} cx={rnd(i * 3.7) * VW} cy={(rnd(i * 5.1) * 1920 - t * (6 + rnd(i) * 10)) % 1920 + (rnd(i * 5.1) * 1920 - t * 10 < 0 ? 1920 : 0)} r={0.8 + rnd(i * 2.2) * 1.6} fill="rgba(243,239,228,0.35)" />
      ))}
    </svg>
    <Vignette k={0.9} />
  </AbsoluteFill>
);
/** ventana [a, b) con fundido; fuera de la ventana no dibuja nada (el 3D no se calcula) */
const Win: React.FC<{t: number; a: number; b: number; fin?: number; fout?: number; children: React.ReactNode}> = ({t, a, b, fin = 0, fout = 0, children}) => {
  if (t < a - fin || t >= b + fout) return null;
  const o = Math.min(fin > 0 ? clamp((t - (a - fin)) / fin) : 1, fout > 0 ? clamp((b + fout - t) / fout) : 1);
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

/* ================================================================== el bañado en 3D */
type Rider = {pos: V3; yaw: number; clips: {name: 'Walk' | 'Gallop' | 'Idle' | 'Idle_Headlow' | 'Eating'; w: number; ts?: number; t0?: number}[]; coat?: 'bay' | 'gray' | 'black' | 'chestnut'; rider?: 'maestra' | 'baqueana' | 'policia' | 'none'; tt?: number};
/** ondas de las patas al pisar el agua (cuatro por ciclo de paso) a lo largo del recorrido del caballo */
const hoofSpots = (t: number, path: (tt: number) => V3, ts: number, side = 0.17) => {
  const cyc = WALK_CYCLE / ts;
  const out: {x: number; z: number; t0: number; s?: number}[] = [];
  const n0 = Math.floor((t - 2.2) / (cyc / 4));
  for (let n = n0; n <= Math.floor(t / (cyc / 4)); n++) {
    const t0 = n * (cyc / 4);
    if (t0 > t) continue;
    const p = path(t0);
    const leg = ((n % 4) + 4) % 4;
    const fx = leg % 2 ? side : -side, fz = leg < 2 ? -0.55 : 0.6;
    out.push({x: p[0] + fx, z: p[2] + fz, t0, s: 0.8});
  }
  return out;
};
const Marsh3D: React.FC<{
  t: number; cam: Cam; mood: Mood; riders?: Rider[]; school?: {pos: V3; yaw?: number; night?: number}; rain?: number; bolts?: number[]; egrets?: number; mist?: number; dense?: number; lane?: number;
  ripples?: {x: number; z: number; t0: number; s?: number}[]; exposure?: number; holes?: [number, number, number][]; seed?: number; area?: [number, number, number, number];
}> = ({t, cam, mood, riders = [], school, rain = 0, bolts = [], egrets = 0, mist = 1, dense = 1, lane = 3.2, ripples = [], exposure = 1, holes, seed = 1, area}) => {
  const flash = flashAt(t, bolts);
  return (
    <Stage cam={cam} mood={mood} exposure={exposure + flash * 0.6}>
      <SkyDome mood={mood} flash={flash} />
      <Lights mood={mood} flash={flash} />
      <Stars k={SKY_STARS[mood]} />
      <MudFloor />
      <Water mood={mood} t={t} />
      <Marsh t={t} mood={mood} dense={dense} lane={lane} holes={holes} seed={seed} area={area} />
      <Mist t={t} color={mood === 'cold' ? '#E3E8E6' : mood === 'dawn' ? '#F3D2B0' : mood === 'dusk' ? '#E7B08A' : '#3A4A58'} k={mist} />
      <Egrets t={t} k={egrets} />
      {school ? <School t={t} pos={school.pos} yaw={school.yaw} night={school.night} /> : null}
      {riders.map((r, i) => (
        <Horse key={i} t={r.tt ?? t} pos={r.pos} yaw={r.yaw} clips={r.clips} coat={r.coat} rider={r.rider} />
      ))}
      <Ripples t={t} spots={ripples} color={mood === 'night' || mood === 'storm' ? '#8FA6C0' : '#FFF2DE'} />
      {rain > 0 ? <Rain t={t} center={cam.pos} k={rain} /> : null}
      {bolts.length ? <Bolt k={flash} /> : null}
    </Stage>
  );
};
const SKY_STARS: Record<Mood, number> = {dawn: 0, cold: 0, night: 1, storm: 0, dusk: 0.3};

/* ================================================================== los planos */
/** 1-2 · el gancho: la maestra cruza el bañado al amanecer, en contraluz */
const Hook: React.FC<{t: number}> = ({t}) => {
  const ts = 0.9, v = 1.05;
  const path = (tt: number): V3 => [0, 0, -tt * v];
  const z = path(t)[2];
  const cam = camPath(t, [
    [0, {pos: [-3.4, 0.85, z + 3.3], look: [0.7, 1.4, z - 1.6], fov: 40}],
    [C.s2 - 0.3, {pos: [-7.5, 3.4, z + 9.5], look: [1.2, 1.0, z - 6], fov: 40}],
  ], 2.2);
  return (
    <>
      <Marsh3D t={t} cam={cam} mood="dawn" egrets={1} riders={[{pos: path(t), yaw: Math.PI, clips: [{name: 'Walk', w: 1, ts}]}]} ripples={hoofSpots(t, path, ts)} />
      <Scrims top={0.5} bottom={0.35} />
      <Headline t={t} y={300} size={150} words={[['Iba', 0.25], ['a', 0.49], ['caballo', 0.63, K.amber], ['a', 1.03], ['dar', 1.15], ['clases', 1.27]]} o={1 - prog(t, C.s2 - 0.25, 0.3)} />
      {/* 21 días después de su último mensaje */}
      <Win t={t} a={C.s2} b={C.s3}>
        <AudioBubble t={t} t0={T.dias21 + 0.9} x={120} y={330} label="Último audio · 7 de octubre" time="20:45" w={760} play={clamp((t - T.dias21 - 1) / 1.6)} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: prog(t, T.dias21, 0.3)}}>
          <Counter t={t} t0={T.dias21} n={21} dur={0.9} style={{...hd(300, 900, K.chalk, 70, 0), textShadow: '0 10px 50px rgba(0,0,0,0.5)'}} />
          <div style={{...hd(80, 800, K.amber, 74, 0.04), marginTop: -10}}>días después</div>
        </div>
      </Win>
    </>
  );
};
/** 3 · un policía, también a caballo (mañana fría, entre juncos altos) */
const PoliceHook: React.FC<{t: number}> = ({t}) => {
  const tt = t - C.s3 + 6, ts = 0.8;
  const path = (x: number): V3 => [0, 0, -(x - C.s3 + 6) * 0.95 - 10];
  const z = path(t)[2];
  const cam = {pos: [1.9, 1.6, z + 4.6] as V3, look: [0, 1.35, z - 1.5] as V3, fov: 42};
  return (
    <>
      <Marsh3D t={t} cam={cam} mood="cold" dense={1.3} lane={2.2} seed={3} riders={[{pos: path(t), yaw: Math.PI, coat: 'black', rider: 'policia', clips: [{name: 'Walk', w: 1, ts}], tt}]} ripples={hoofSpots(t, path, ts)} />
      <Scrims top={0.45} bottom={0.45} />
      <Kicker t={t} t0={T.policia + 0.2} text="La búsqueda · a caballo" y={280} color={K.water} />
    </>
  );
};
/** 4 · a 2,5 km de la escuela (satélite del 19 de octubre, la zona del paraje) */
const KmSat: React.FC<{t: number}> = ({t}) => {
  const [mx, my] = satPoint('zona', 'malezal');
  const z = mix(0.9, 1.08, easeInOut(clamp((t - C.s4) / 3.4)));
  const r = 2500 / satMpp('zona');
  const k = prog(t, T.km - 0.1, 0.8);
  return (
    <SatView name="zona" cx={mx} cy={my} z={z} dark={0.3}>
      {(P, zz) => {
        const [x, y] = P(mx, my);
        return (
          <>
            <svg width={VW} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
              <circle cx={x} cy={y} r={r * zz} fill="rgba(240,168,90,0.08)" stroke={K.dawn} strokeWidth={5} strokeDasharray="18 14" opacity={k} />
              <line x1={x} y1={y} x2={x + r * zz * k} y2={y} stroke={K.chalk} strokeWidth={4} />
            </svg>
            <div style={{position: 'absolute', left: x + (r * zz) / 2 - 140, top: y - 92, width: 280, textAlign: 'center', ...hd(78, 900, K.chalk, 74), opacity: k, textShadow: '0 4px 0 #05080B, 0 0 24px rgba(0,0,0,0.8)'}}>2,5 km</div>
            <Pin x={x} y={y} t={t} t0={C.s4 + 0.3} label="La escuela" sub="Paraje El Malezal (zona)" side="left" ring={false} />
            <div style={{position: 'absolute', left: 60, bottom: 650, ...mn(22, K.mute, 500, 0.06), opacity: 0.85}}>{SAT_CREDIT} · ubicación aproximada</div>
          </>
        );
      }}
    </SatView>
  );
};
/** 5 · una pregunta que divide al país: el mapa se parte en dos */
const Divide: React.FC<{t: number}> = ({t}) => {
  const k = prog(t, T.divide, 0.8);
  const w = 760, h = 1240;
  return (
    <>
      <Slate t={t} glow="rgba(116,172,223,0.12)" />
      <div style={{position: 'absolute', left: (VW - w) / 2 - 60 * k, top: 260, width: w / 2, height: h, overflow: 'hidden'}}>
        <ArgMap x={0} y={0} w={w} h={h} fill={() => `rgba(240,168,90,${0.2 + 0.5 * k})`} stroke="rgba(243,239,228,0.35)" />
      </div>
      <div style={{position: 'absolute', left: VW / 2 + 60 * k, top: 260, width: w / 2, height: h, overflow: 'hidden'}}>
        <ArgMap x={-w / 2} y={0} w={w} h={h} fill={() => `rgba(116,172,223,${0.2 + 0.5 * k})`} stroke="rgba(243,239,228,0.35)" />
      </div>
      <div style={{position: 'absolute', left: 90, top: 420, ...hd(76, 900, K.dawn, 72), opacity: prog(t, T.divide + 0.3, 0.4), transform: `translateX(${(1 - prog(t, T.divide + 0.3, 0.5)) * -40}px)`}}>¿Crimen?</div>
      <div style={{position: 'absolute', right: 90, top: 980, ...hd(76, 900, K.celeste, 72), textAlign: 'right', opacity: prog(t, T.divide + 0.55, 0.4), transform: `translateX(${(1 - prog(t, T.divide + 0.55, 0.5)) * 40}px)`}}>¿Abandono?</div>
    </>
  );
};
/** 6 · el título */
const Title: React.FC<{t: number}> = ({t}) => {
  const k = prog(t, C.s6, 0.5);
  return (
    <>
      <Slate t={t} glow="rgba(240,168,90,0.22)" y={42} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center'}}>
        <div style={{...mn(30, K.dawn, 600, 0.3), opacity: k}}>EDICIÓN ESPECIAL</div>
        <div style={{...hd(150, 900, K.chalk, 68, 0), marginTop: 26, lineHeight: 0.9, transform: `scale(${0.92 + 0.08 * pop(t, C.s6, 1.2)})`}}>
          La maestra
          <br />
          que iba
          <br />
          <span style={{color: K.amber}}>a caballo</span>
        </div>
        <div style={{...sr(58, K.mute, true), marginTop: 30, opacity: prog(t, C.s6 + 0.4, 0.5)}}>El caso Nanci Godoy</div>
      </div>
      <div style={{position: 'absolute', left: (VW - 110) / 2, top: 1180}}>
        <Logo size={110} t={t} t0={C.s6 + 0.5} />
      </div>
    </>
  );
};
/** 7 · se llamaba Nanci Godoy: la escuela al amanecer y su nombre */
const NameCard: React.FC<{t: number}> = ({t}) => {
  const cam = camPath(t, [
    [C.s7, {pos: [-12, 2.3, 30], look: [0, 3.2, 0], fov: 38}],
    [C.s7 + 0.1, {pos: [-8.5, 2.0, 22], look: [0, 3.0, 0], fov: 38}],
  ], C.s8 - C.s7);
  return (
    <>
      <Marsh3D t={t} cam={cam} mood="dawn" school={{pos: [0, 0, 0]}} holes={[[0, 2, 17]]} egrets={0.8} seed={5} />
      <Scrims top={0.6} bottom={0.55} />
      <div style={{position: 'absolute', left: 80, top: 300, right: 80}}>
        <div style={{...mn(28, K.dawn, 600, 0.24), opacity: prog(t, T.nanci - 0.2, 0.4)}}>MAESTRA RURAL</div>
        <div style={{...sr(132, K.chalk), marginTop: 10, opacity: prog(t, T.nanci, 0.5), transform: `translateY(${(1 - prog(t, T.nanci, 0.6)) * 24}px)`, textShadow: '0 6px 40px rgba(0,0,0,0.6)'}}>
          Nanci Estela
          <br />
          Godoy
        </div>
        <div style={{display: 'flex', gap: 18, marginTop: 30, alignItems: 'baseline', opacity: prog(t, T.anios, 0.4)}}>
          <span style={{...hd(110, 900, K.amber, 70, 0)}}>52</span>
          <span style={{...mn(34, K.chalk, 600, 0.12)}}>años</span>
        </div>
      </div>
    </>
  );
};
/** 8 · agosto, la Escuela Rural N.º 626, en Esquina, Corrientes: mapa del país, la provincia y el satélite */
const WhereMap: React.FC<{t: number}> = ({t}) => {
  const zoom = easeInOut(clamp((t - (T.agosto + 0.3)) / 1.6));
  const sat = prog(t, C.s8b, 0.6);
  const [ex, ey] = satPoint('region', 'esquina');
  const [mx, my] = satPoint('region', 'malezal');
  const z = mix(1.22, 1.32, clamp((t - C.s8b) / 3));
  return (
    <>
      <Slate t={t} glow="rgba(116,172,223,0.14)" />
      <div style={{opacity: 1 - sat}}>
        <ArgMap x={140} y={300} w={800} h={1180} hl="Corrientes" hlK={prog(t, T.agosto, 0.6)} scale={mix(1, 4.2, zoom)} focus={[-58.6, -28.8]} dots={[{lon: -59.53, lat: -30.02, k: pop(t, T.agosto + 1.2, 1), color: K.amber, r: 7}]} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', ...hd(70, 900, K.dawn, 72), opacity: prog(t, T.agosto + 0.6, 0.4)}}>Corrientes</div>
      </div>
      {sat > 0 ? (
        <AbsoluteFill style={{opacity: sat}}>
          <SatView name="region" cx={mx - 120} cy={my} z={z} dark={0.25}>
            {(P) => {
              const [x2, y2] = P(mx, my);
              return (
                <>
                  <div style={{position: 'absolute', left: 50, top: y2 - 40, display: 'flex', alignItems: 'center', gap: 14, opacity: prog(t, T.esquina - 0.1, 0.4)}}>
                    <span style={{...hd(70, 900, K.celeste, 74)}}>←</span>
                    <span style={{...hd(46, 800, K.chalk, 76), textShadow: '0 3px 0 #05080B'}}>Esquina</span>
                  </div>
                  <Pin x={x2} y={y2} t={t} t0={C.s8b + 0.2} label="Escuela N.º 626" sub="Paraje El Malezal" side="left" />
                  <div style={{position: 'absolute', left: 60, bottom: 650, ...mn(22, K.mute, 500, 0.06)}}>{SAT_CREDIT}</div>
                </>
              );
            }}
          </SatView>
        </AbsoluteFill>
      ) : null}
      <Chip t={t} t0={T.agosto} x={80} y={250} text="Agosto 2026 · se hace cargo" icon={<IconDoc s={34} />} />
    </>
  );
};
/** 9 · la única docente: directora, maestra y cocinera de 8 chicos */
const Roles: React.FC<{t: number}> = ({t}) => {
  const tags: [string, number][] = [['Directora', T.directora], ['Maestra', T.maestra], ['Cocinera', T.cocinera]];
  const desks = prog(t, T.chicos - 0.1, 0.3);
  return (
    <>
      <Slate t={t} glow="rgba(240,168,90,0.14)" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center', ...hd(92, 900, K.chalk, 72), opacity: prog(t, T.unica - 0.1, 0.4)}}>
        La <span style={{color: K.amber}}>única</span> docente
      </div>
      <div style={{position: 'absolute', left: 120, top: 470, opacity: prog(t, C.s9 + 0.1, 0.5) * (1 - 0.6 * desks)}}>
        <Figure w={210} c="#3A4A52" braid />
      </div>
      {tags.map(([txt, t0], i) => {
        const k = pop(t, t0, 1.2);
        if (t < t0) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 400, top: 520 + i * 120, padding: '16px 34px', borderRadius: 14, background: i === 1 ? K.amber : 'rgba(243,239,228,0.94)', transform: `scale(${clamp(k, 0, 1.15)}) rotate(${(i - 1) * -2}deg)`, transformOrigin: 'left center', ...hd(68, 900, K.deep, 76), opacity: 1 - 0.5 * desks}}>
            {txt}
          </div>
        );
      })}
      {/* los ocho bancos */}
      <div style={{position: 'absolute', left: 80, right: 80, top: 930, display: 'flex', flexWrap: 'wrap', gap: 22, justifyContent: 'center', opacity: desks}}>
        {Array.from({length: 8}, (_, i) => {
          const k = pop(t, T.chicos + i * 0.09, 1.4);
          return (
            <svg key={i} width={186} height={130} viewBox="0 0 186 130" style={{transform: `scale(${clamp(k, 0, 1.1)})`}}>
              <rect x="18" y="30" width="150" height="16" rx="3" fill={K.paper2} />
              <rect x="30" y="46" width="8" height="64" fill={K.mute} />
              <rect x="148" y="46" width="8" height="64" fill={K.mute} />
              <rect x="40" y="78" width="106" height="10" rx="3" fill="#8A6E50" />
              <text x="93" y="22" textAnchor="middle" style={{...mn(22, K.amber, 600, 0)}}>{i + 1}</text>
            </svg>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1210, textAlign: 'center', opacity: prog(t, T.peones, 0.4), ...mn(30, K.mute, 600, 0.14)}}>hijos de peones del campo</div>
    </>
  );
};
/** 10 · adentro de una estancia privada, que también es coto de caza */
const Estancia: React.FC<{t: number}> = ({t}) => {
  const [cx, cy] = satPoint('zona', 'curupi');
  const z = mix(0.95, 1.4, easeInOut(clamp((t - C.s10) / (C.s11 - C.s10))));
  return (
    <SatView name="zona" cx={cx} cy={cy} z={z} dark={0.3}>
      {(P) => {
        const [x, y] = P(cx, cy);
        const k = prog(t, T.privada - 0.2, 0.7);
        return (
          <>
            <div style={{position: 'absolute', left: x - 330, top: y - 330, width: 660, height: 660, borderRadius: 999, background: 'radial-gradient(circle, rgba(240,168,90,0.22) 0%, rgba(240,168,90,0.08) 55%, rgba(240,168,90,0) 72%)', opacity: k}} />
            <Pin x={x} y={y} t={t} t0={T.curupi} label="Estancia El Curupí" sub="campo privado · coto de caza" side={x > VW / 2 ? 'left' : 'right'} />
            <Chip t={t} t0={T.privada - 0.3} x={80} y={270} icon={<IconDoc s={34} />} text="La escuela funciona adentro" />
            <div style={{position: 'absolute', left: 60, bottom: 650, ...mn(22, K.mute, 500, 0.06)}}>{SAT_CREDIT} · ubicación aproximada</div>
          </>
        );
      }}
    </SatView>
  );
};
const Crosshair: React.FC<{s?: number; c?: string}> = ({s = 36, c = K.red}) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="8" fill="none" stroke={c} strokeWidth="2" />
    <path d="M12 1 v6 M12 17 v6 M1 12 h6 M17 12 h6" stroke={c} strokeWidth="2" />
  </svg>
);
/** 11 · desde la ciudad hasta el campo (recorrido ilustrativo) */
const Route: React.FC<{t: number}> = ({t}) => {
  const [ex, ey] = satPoint('region', 'esquina');
  const [mx, my] = satPoint('region', 'malezal');
  const k = easeInOut(clamp((t - T.ciudad + 0.1) / (T.campo - T.ciudad + 0.6)));
  const pan = easeInOut(clamp((t - C.s11 - 0.2) / (C.s12 - C.s11 - 0.3)));
  return (
    <SatView name="region" cx={mix(ex + 260, mx - 260, pan)} cy={mix(ey, my, pan)} z={1.22} dark={0.3}>
      {(P) => {
        const [x1, y1] = P(ex, ey), [x2, y2] = P(mx, my);
        const len = Math.hypot(x2 - x1, y2 - y1);
        return (
          <>
            <svg width={VW} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={K.chalk} strokeWidth={6} strokeDasharray={`${len * k} 9999`} strokeLinecap="round" />
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#05080B" strokeWidth={2} strokeDasharray="10 14" opacity={0.6 * k} />
            </svg>
            <Pin x={x1} y={y1} t={t} t0={T.ciudad - 0.1} label="La ciudad" sub="Esquina" color={K.celeste} side="right" ring={false} />
            <Pin x={x2} y={y2} t={t} t0={T.campo} label="El campo" sub="El Curupí" side="left" ring={false} />
            <div style={{position: 'absolute', left: 60, bottom: 650, ...mn(22, K.mute, 500, 0.06)}}>{SAT_CREDIT} · recorrido ilustrativo</div>
          </>
        );
      }}
    </SatView>
  );
};
/** 12 · casi dos horas a caballo, con una baqueana, entre bañados y juncos; sin señal; la llegada a la escuela */
const Journey: React.FC<{t: number}> = ({t}) => {
  const ts = 0.9, v = 1.05, t0 = C.s12;
  const schoolPos: V3 = [7, 0, -100];
  // hasta la llegada van por el bañado; en la llegada (salto de montaje) ya están a unos 20 m de la escuela
  const zOf = (x: number, lead: number) => (x < C.s12d ? -(x - t0) * v - 18 - lead : schoolPos[2] + 24 - (x - C.s12d) * v - lead);
  const pathA = (x: number): V3 => [0.15, 0, zOf(x, 0)];
  const pathB = (x: number): V3 => [-0.35, 0, zOf(x, 4.5)];
  const za = pathA(t)[2];
  const cam = camPath(t, [
    [t0, {pos: [-4.8, 1.7, za + 6.5], look: [0.3, 1.2, za - 3.5], fov: 42}],
    [C.s12b - 0.01, {pos: [-3.7, 0.55, za + 4.4], look: [0.1, 0.95, za - 1.0], fov: 46}],
    [C.s12c - 0.01, {pos: [-15, 9.5, za + 18], look: [0, 0.4, za - 8], fov: 38}],
    [C.s12d - 0.01, {pos: [-3.2, 2.0, za + 7.5], look: [5.5, 2.2, schoolPos[2]], fov: 40}],
  ], 0.01);
  // dentro de cada plano, un movimiento lento continuo
  const drift = (t - [t0, C.s12b, C.s12c, C.s12d].filter((x) => x <= t).pop()!) * 0.12;
  const camD: Cam = {...cam, pos: [cam.pos[0] + drift, cam.pos[1], cam.pos[2]]};
  return (
    <>
      <Marsh3D
        t={t} cam={camD} mood="dawn" egrets={t > C.s12c && t < C.s12d ? 1 : 0.5} seed={7} holes={[[schoolPos[0], schoolPos[2] + 2, 17]]} area={[-60, 60, -125, 14]}
        school={{pos: schoolPos, yaw: -0.25}}
        riders={[
          {pos: pathB(t), yaw: Math.PI, coat: 'gray', rider: 'baqueana', clips: [{name: 'Walk', w: 1, ts}], tt: t + 0.37},
          {pos: pathA(t), yaw: Math.PI, coat: 'bay', rider: 'maestra', clips: [{name: 'Walk', w: 1, ts}]},
        ]}
        ripples={[...hoofSpots(t, pathA, ts), ...hoofSpots(t + 0.37, (x) => pathB(x - 0.37), ts).map((s) => ({...s, t0: s.t0 - 0.37}))]}
      />
      <Scrims top={0.5} bottom={0.45} />
      <Win t={t} a={t0} b={C.s12c}>
        <Chip t={t} t0={T.dosHoras - 0.1} x={80} y={270} icon={<IconClock s={36} />} text="≈ 2 horas a caballo" />
        <Chip t={t} t0={T.baqueana} x={80} y={370} icon={<IconHorse s={38} />} text="con una baqueana" />
      </Win>
      <Win t={t} a={C.s12c} b={C.s12d} fout={0.2}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
          <div style={{transform: `scale(${clamp(pop(t, T.senal, 1.2), 0, 1.15)})`}}>
            <Signal k={1 - prog(t, T.senal + 0.05, 0.5)} s={170} />
          </div>
          <div style={{...hd(110, 900, K.red, 72), opacity: prog(t, T.senal + 0.2, 0.3), textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>Sin señal</div>
        </div>
      </Win>
      <Win t={t} a={C.s12d} b={C.s13}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', gap: 14}}>
          {['L', 'M', 'M', 'J', 'V'].map((d, i) => {
            const k = prog(t, T.semana + 0.15 + i * 0.12, 0.3);
            return (
              <div key={i} style={{width: 120, height: 120, borderRadius: 18, border: `3px solid ${K.chalk}`, background: `rgba(240,168,90,${0.85 * k})`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...hd(64, 900, k > 0.5 ? K.deep : K.chalk, 76)}}>
                {d}
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 450, textAlign: 'center', ...mn(30, K.chalk, 600, 0.16), opacity: prog(t, T.semana + 0.7, 0.4), textShadow: '0 3px 14px rgba(0,0,0,0.6)'}}>se quedaba toda la semana</div>
      </Win>
    </>
  );
};
/** 13 y 16 · el aula vacía (16: los bancos se vuelven fantasmas) */
const Aula: React.FC<{t: number; a: number; ghost?: number}> = ({t, a, ghost = 0}) => {
  const k = clamp((t - a) / 5);
  const cam: Cam = {pos: [mix(-0.4, 0.3, k), mix(1.55, 1.42, k), mix(2.7, 1.5, k)], look: [mix(-0.2, 0.1, k), 1.0, -1.6], fov: 54};
  return (
    <>
      <Stage cam={cam} mood="dawn" env={0.55} fog={0} exposure={1.15}>
        <ambientLight intensity={0.55} color="#C8D0D8" />
        <directionalLight position={[3, 3, 2]} intensity={1.1} color="#FFD9A8" />
        <Classroom t={t} ghost={ghost} />
      </Stage>
      <Vignette k={1.1} />
    </>
  );
};
/** 14 · la carta escrita a mano (recreación con las frases que citó la prensa) */
const Carta: React.FC<{t: number}> = ({t}) => (
  <>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 70% at 50% 40%, #3A2C20 0%, #1B140E 70%, #0E0A07 100%)'}} />
    <Letter
      t={t}
      t0={C.s14}
      date="15 de agosto"
      y={250}
      lines={[
        {text: 'Escuela Rural N.º 626', t0: C.s14 + 0.3},
        {text: 'La escuela está totalmente', t0: T.abandonada - 0.6, hl: true},
        {text: 'abandonada.', t0: T.abandonada, hl: true},
        {text: '· Sin agua potable.', t0: T.agua},
        {text: '· Ratas y murciélagos.', t0: T.ratas},
        {text: '· Sin registros desde 2024.', t0: T.registros},
      ]}
    />
    <Kicker t={t} t0={C.s14 + 0.5} text="Recreación · frases citadas por la prensa" y={1250} x={90} size={24} color={K.dawn} />
  </>
);
/** 15 · el reclamo llegó al Consejo General de Educación */
const Expediente: React.FC<{t: number}> = ({t}) => {
  const k = easeInOut(clamp((t - C.s15 - 0.2) / 1.6));
  return (
    <>
      <Slate t={t} glow="rgba(116,172,223,0.14)" />
      <div style={{position: 'absolute', left: mix(120, 300, k), top: mix(420, 470, k), width: 480, height: 600, transform: `rotate(${mix(-6, 2, k)}deg) scale(${mix(1, 0.8, k)})`, background: '#C9B48A', borderRadius: 10, boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
        <div style={{position: 'absolute', left: -2, top: -36, width: 200, height: 50, background: '#C9B48A', borderRadius: '10px 10px 0 0'}} />
        <div style={{position: 'absolute', left: 40, right: 40, top: 60, ...mn(26, '#3A2C1C', 600, 0.1)}}>RECLAMO</div>
        <div style={{position: 'absolute', left: 40, right: 40, top: 110, ...hd(56, 900, '#2A1E12', 78)}}>Escuela Rural N.º 626</div>
        <div style={{position: 'absolute', left: 40, right: 40, top: 200, ...mn(22, '#3A2C1C', 500, 0.06)}}>Paraje El Malezal · Esquina</div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{position: 'absolute', left: 40, right: 60 + i * 30, top: 290 + i * 46, height: 10, background: 'rgba(58,44,28,0.25)', borderRadius: 4}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1110, textAlign: 'center', opacity: prog(t, T.consejo - 0.1, 0.4)}}>
        <div style={{...mn(28, K.mute, 600, 0.2)}}>DESTINO</div>
        <div style={{...hd(76, 900, K.chalk, 72), marginTop: 10}}>Consejo General de Educación</div>
        <div style={{...mn(28, K.celeste, 600, 0.2), marginTop: 10}}>CORRIENTES</div>
      </div>
    </>
  );
};
/** 16 · «una escuela fantasma, alumnos fantasmas» */
const Fantasma: React.FC<{t: number}> = ({t}) => (
  <>
    <Aula t={t} a={C.s16 - 2} ghost={prog(t, T.fantasma, 1.4)} />
    <AbsoluteFill style={{background: 'rgba(5,8,11,0.35)'}} />
    <Win t={t} a={C.s16} b={T.fantasma - 0.3} fout={0.25}>
      <AudioBubble t={t} t0={T.audio + 0.2} x={140} y={500} label="Audio de Nanci" time="" w={760} play={clamp((t - T.audio - 0.3) / 1.5)} />
    </Win>
    <Quote t={t} t0={T.fantasma} text="Una escuela fantasma, alumnos fantasmas." who="NANCI GODOY, EN UN AUDIO" y={430} size={104} />
  </>
);
/** 17 · el 7 de octubre a la noche: el último audio */
const Noche: React.FC<{t: number}> = ({t}) => {
  const k = clamp((t - C.s17) / (C.s18 - C.s17));
  const cam: Cam = {pos: [mix(-10, -7.5, k), 2.3, mix(24, 19, k)], look: [0, 2.4, 0], fov: 40};
  return (
    <>
      <Marsh3D t={t} cam={cam} mood="night" school={{pos: [0, 0, 0], night: 1}} holes={[[0, 2, 17]]} mist={0.6} seed={5} />
      <Scrims top={0.5} bottom={0.5} />
      <Kicker t={t} t0={C.s17 + 0.3} text="Miércoles 7 de octubre · 20:45" y={280} color={K.amber} />
      <AudioBubble t={t} t0={T.mando} x={140} y={430} label="Último audio" time="20:45" w={760} play={clamp((t - T.mando - 0.2) / 1.2)} />
    </>
  );
};
/** 18 y 19b · el calendario: 7, 9, 15 */
const Cal: React.FC<{t: number; phase: 1 | 2}> = ({t, phase}) => (
  <>
    {phase === 1 ? <Slate t={t} glow="rgba(224,71,59,0.12)" /> : <AbsoluteFill style={{background: 'rgba(5,8,11,0.72)'}} />}
    <Calendar
      t={t}
      t0={phase === 1 ? C.s18 : C.s19b - 3}
      y={phase === 1 ? 520 : 470}
      days={[6, 7, 8, 9, 10, 11, 12, 13, 14, 15].slice(phase === 1 ? 0 : 0)}
      marks={[
        {d: 7, t0: phase === 1 ? C.s18 + 0.1 : 0, label: 'último audio', color: K.amber},
        {d: 9, t0: phase === 1 ? T.el9 : 0, label: 'debía volver', color: K.chalk, circle: true, cross: phase === 1 ? T.noVolvio : 0},
        ...(phase === 2 ? [{d: 15, t0: T.el15 - 0.05, label: 'la denuncia', color: K.red, circle: true}] : []),
      ]}
      bracket={phase === 2 ? {from: 7, to: 15, t0: T.el15 + 0.2, label: '8 días'} : undefined}
    />
    {phase === 1 ? <div style={{position: 'absolute', left: 0, right: 0, top: 1140, textAlign: 'center', ...hd(120, 900, K.red, 72), opacity: prog(t, T.noVolvio, 0.3), transform: `scale(${0.9 + 0.1 * clamp(pop(t, T.noVolvio, 1.3), 0, 1.1)})`}}>No volvió</div> : null}
  </>
);
/** 19 · tormentas, caminos anegados, sin señal */
const Tormenta: React.FC<{t: number}> = ({t}) => {
  const bolts = [T.tormentas + 0.15, T.faltaSenal + 0.2, T.el15 + 0.6];
  const cam: Cam = {pos: [0, 1.3, 8 - (t - C.s19) * 0.4], look: [2, 3.2, -30], fov: 50};
  return (
    <>
      <Marsh3D t={t} cam={cam} mood="storm" rain={1} bolts={bolts} school={{pos: [-16, 0, -42], night: 0}} holes={[[-16, -40, 17]]} mist={0.5} seed={9} />
      <Scrims top={0.45} bottom={0.5} />
      <Win t={t} a={C.s19} b={C.s19b}>
        <Chip t={t} t0={T.tormentas} x={80} y={280} text="Tormentas" icon={<IconBolt s={38} />} />
        <Chip t={t} t0={T.caminos} x={80} y={380} text="Caminos anegados" icon={<IconWaves s={40} />} />
        <Chip t={t} t0={T.faltaSenal} x={80} y={480} text="Sin señal" icon={<Signal k={0} s={40} x={false} />} color={K.red} />
      </Win>
      <Win t={t} a={C.s19b} b={C.s20} fin={0.25}>
        <Cal t={t} phase={2} />
      </Win>
    </>
  );
};
/** 20 · la búsqueda: el satélite del 19 de octubre y los recursos */
const Busqueda: React.FC<{t: number}> = ({t}) => {
  const [mx, my] = satPoint('zona', 'malezal');
  const z = mix(0.9, 1.02, clamp((t - C.s20) / 6));
  const sweep = ((t - C.s20) / 2.4) % 1;
  const items: [string, number, React.ReactNode][] = [
    ['100 policías', T.cien + 0.2, <IconBadge key="p" s={38} />],
    ['Caballos', T.caballos, <IconHorse key="c" s={38} />],
    ['Perros', T.perros, <IconPaw key="d" s={38} />],
    ['Drones', T.drones, <IconDrone key="r" s={40} />],
    ['Helicópteros', T.helicop, <IconHeli key="h" s={40} />],
  ];
  return (
    <SatView name="zona" cx={mx} cy={my} z={z} dark={0.35}>
      {(P, zz) => {
        const [x, y] = P(mx, my);
        const g = 300 * zz;
        return (
          <>
            <svg width={VW} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
              {Array.from({length: 11}, (_, i) => (
                <React.Fragment key={i}>
                  <line x1={x + (i - 5) * g} y1={y - 5 * g} x2={x + (i - 5) * g} y2={y + 5 * g} stroke="rgba(243,239,228,0.18)" strokeWidth={1.5} />
                  <line x1={x - 5 * g} y1={y + (i - 5) * g} x2={x + 5 * g} y2={y + (i - 5) * g} stroke="rgba(243,239,228,0.18)" strokeWidth={1.5} />
                </React.Fragment>
              ))}
              <rect x={x - 5 * g + sweep * 10 * g} y={y - 5 * g} width={g * 0.6} height={10 * g} fill="rgba(116,172,223,0.18)" />
            </svg>
            <Kicker t={t} t0={C.s20 + 0.2} text="Satélite · 19 de octubre, en plena búsqueda" y={260} size={26} color={K.celeste} />
            {items.map(([txt, t0, ic], i) => (
              <Chip key={i} t={t} t0={t0} x={80} y={360 + i * 96} icon={ic} text={txt} size={32} />
            ))}
            <div style={{position: 'absolute', left: 60, bottom: 650, ...mn(22, K.mute, 500, 0.06)}}>Copernicus Sentinel-2 · zona aproximada</div>
          </>
        );
      }}
    </SatView>
  );
};
/** 21 · cinco detenidos (sin nombres ni rostros) y la presunción de inocencia */
const Detenidos: React.FC<{t: number}> = ({t}) => {
  const figs: {label: string; t0: number; charge: string; tc: number; color: string; hat?: boolean; braid?: boolean}[] = [
    {label: 'Capataz', t0: T.capataz, charge: 'Femicidio', tc: T.femicidio, color: K.red, hat: true},
    {label: 'Trabajador rural', t0: T.dos, charge: 'Femicidio', tc: T.femicidio + 0.1, color: K.red},
    {label: 'Trabajador rural', t0: T.dos + 0.2, charge: 'Femicidio', tc: T.femicidio + 0.2, color: K.red},
    {label: 'Baqueana', t0: T.baq, charge: 'Homicidio simple', tc: T.homicidio, color: K.dawn, braid: true},
    {label: 'Otro hombre', t0: T.otro, charge: 'Falso testimonio', tc: T.falso, color: K.celeste},
  ];
  const fw = 176;
  return (
    <>
      <Slate t={t} glow="rgba(224,71,59,0.12)" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', opacity: fio(t, C.s21, T.cinco - 0.1, 0.3), ...mn(34, K.mute, 600, 0.18)}}>ANTES DE ENCONTRARLA</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', opacity: prog(t, T.cinco - 0.1, 0.4)}}>
        <span style={{...hd(150, 900, K.chalk, 70, 0)}}>5</span>
        <span style={{...hd(80, 900, K.chalk, 72), marginLeft: 20}}>detenidos</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', gap: 22}}>
        {figs.map((f, i) => {
          const k = prog(t, C.s21 + 0.1 + i * 0.1, 0.4);
          const on = t >= f.t0;
          return (
            <div key={i} style={{width: fw, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 40}px)`}}>
              <div style={{filter: on ? 'none' : 'brightness(0.55)'}}>
                <Figure w={fw} c={on ? '#4A5A62' : '#2A363C'} hat={f.hat} braid={f.braid} />
              </div>
              <div style={{...mn(26, on ? K.chalk : K.dim, 600, 0.02), marginTop: 12, minHeight: 64, lineHeight: 1.15, opacity: prog(t, f.t0, 0.3)}}>{f.label}</div>
              <div style={{marginTop: 8, padding: '10px 2px', borderRadius: 8, background: f.color, ...hd(29, 900, K.deep, 70), lineHeight: 1.05, opacity: prog(t, f.tc, 0.3), transform: `scale(${clamp(pop(t, f.tc, 1.4), 0, 1.1)})`}}>{f.charge}</div>
            </div>
          );
        })}
      </div>
      <Stamp t={t} t0={T.presuncion - 0.05} text="Presunción de inocencia" x={VW / 2} y={1095} size={58} color={K.chalk} rot={-4} />
      <Win t={t} a={T.defensa - 0.1} b={C.s22}>
        <div style={{position: 'absolute', left: 90, right: 90, top: 1190, textAlign: 'center', ...mn(30, K.amber, 600, 0.04), opacity: prog(t, T.defensa, 0.4)}}>Una defensa denunció golpes en un interrogatorio</div>
      </Win>
    </>
  );
};
/** 22-24 · el hallazgo: el policía recorre un bañado sin rastrillar y sale a galope a buscar señal */
const Hallazgo: React.FC<{t: number}> = ({t}) => {
  const t0 = C.s22, tg = T.avisar - 0.1;
  const zAt = (x: number) => (x < tg ? -(x - t0) * 0.85 : -(tg - t0) * 0.85 - (x - tg) * 4.2) - 8;
  const turn = easeInOut(clamp((t - (tg - 0.6)) / 0.9));
  const pos: V3 = [mix(0.2, 2.2, turn), 0, zAt(t)];
  const gal = easeInOut(clamp((t - tg) / 0.5));
  const cam = t < C.s23
    ? ({pos: [2.4, 1.35, zAt(t) + 4.4], look: [0, 1.3, zAt(t) - 2], fov: 44} as Cam)
    : ({pos: [3.6, 2.1, zAt(C.s23) + 7.5], look: [1.4, 1.1, zAt(C.s23) - 12], fov: 40} as Cam);
  const quiet = t >= C.s24;
  const camQ: Cam = {pos: [1, 1.15, zAt(C.s23) + 6 - (t - C.s24) * 0.6], look: [0, 1, zAt(C.s23) - 30], fov: 42};
  const path = (x: number): V3 => [0.2, 0, zAt(x)];
  return (
    <>
      <Marsh3D
        t={t} cam={quiet ? camQ : cam} mood="cold" dense={1.6} lane={2.0} seed={11} mist={1.2}
        riders={quiet ? [] : [{pos, yaw: Math.PI + turn * -0.5, coat: 'black', rider: 'policia', clips: [{name: 'Walk', w: 1 - gal, ts: 0.8}, {name: 'Gallop', w: gal, ts: 1}]}]}
        ripples={quiet ? [] : hoofSpots(t, path, gal > 0.5 ? 2.2 : 0.8)}
      />
      <Scrims top={0.45} bottom={0.45} />
      <Win t={t} a={t0} b={C.s23}>
        <Chip t={t} t0={T.oct28} x={80} y={280} icon={<IconClock s={36} />} text="28 de octubre · 9:30" />
        <Kicker t={t} t0={T.rastrillado - 0.6} text="Un sector que no se había rastrillado" y={400} size={26} color={K.water} />
      </Win>
      <Win t={t} a={C.s23} b={C.s24} fout={0.4}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Signal k={0} s={150} />
          <div style={{...hd(90, 900, K.red, 72), opacity: prog(t, T.comoNo + 0.3, 0.3), textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>Sin señal</div>
        </div>
      </Win>
    </>
  );
};
/** 25 · la fiscalía investiga un femicidio. Pero la discusión ya no es solo judicial */
const Fiscalia: React.FC<{t: number}> = ({t}) => {
  const k2 = prog(t, T.pero, 0.5);
  return (
    <>
      <Slate t={t} glow="rgba(224,71,59,0.14)" />
      <div style={{position: 'absolute', left: 80, right: 80, top: mix(560, 330, k2), transform: `scale(${mix(1, 0.7, k2)})`, transformOrigin: 'left top'}}>
        <div style={{...mn(30, K.red, 600, 0.2), opacity: prog(t, C.s25 + 0.1, 0.4)}}>LA CAUSA</div>
        <div style={{...hd(120, 900, K.chalk, 70, 0), marginTop: 14, opacity: prog(t, C.s25 + 0.15, 0.4)}}>
          La fiscalía investiga un <span style={{color: K.red}}>femicidio</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 860, opacity: k2, transform: `translateY(${(1 - k2) * 30}px)`}}>
        <div style={{...sr(96, K.amber, true)}}>Pero la discusión</div>
        <div style={{...sr(96, K.chalk, true)}}>ya no es solo judicial.</div>
      </div>
    </>
  );
};
/** 26 · familia y gremios: «el Estado la dejó sola» */
const Familia: React.FC<{t: number}> = ({t}) => {
  const items: [React.ReactNode, string, number][] = [
    [<IconHorse key="h" s={60} c={K.amber} />, 'A horas de caballo', T.horas],
    [<Signal key="s" k={0} s={60} x={false} />, 'Sin señal', T.sinSenal],
    [<IconDoc key="d" s={60} c={K.amber} />, 'Una escuela que ella misma había denunciado', T.escuelaDen],
  ];
  return (
    <>
      <Slate t={t} glow="rgba(240,168,90,0.16)" y={25} />
      <div style={{position: 'absolute', left: 80, right: 80, top: 270}}>
        <div style={{...mn(30, K.amber, 600, 0.2), opacity: prog(t, C.s26 + 0.1, 0.4)}}>SU FAMILIA Y LOS GREMIOS DICEN QUE</div>
        <div style={{...hd(118, 900, K.chalk, 70, 0), marginTop: 18, opacity: prog(t, T.estadoFam - 0.1, 0.4), lineHeight: 0.92}}>
          El Estado
          <br />
          la dejó <span style={{color: K.amber}}>sola</span>
        </div>
      </div>
      {items.map(([ic, txt, t0], i) => (
        <div key={i} style={{position: 'absolute', left: 80, right: 80, top: 720 + i * 150, display: 'flex', alignItems: 'center', gap: 30, opacity: prog(t, t0 - 0.05, 0.35), transform: `translateX(${(1 - prog(t, t0 - 0.05, 0.4)) * -40}px)`}}>
          <div style={{width: 110, height: 110, borderRadius: 999, border: `3px solid ${K.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(21,35,42,0.9)', flexShrink: 0}}>{ic}</div>
          <div style={{...hd(i === 2 ? 52 : 64, 800, K.chalk, 76)}}>{txt}</div>
        </div>
      ))}
    </>
  );
};
/** 27 · la cita del hijo */
const Hijo: React.FC<{t: number}> = ({t}) => (
  <>
    <Slate t={t} glow="rgba(240,168,90,0.18)" />
    <Kicker t={t} t0={C.s27 + 0.05} text="Sebastián, su hijo" y={300} color={K.amber} size={34} />
    <div style={{position: 'absolute', left: 80, top: 420, ...sr(260, K.dawn), opacity: prog(t, C.s27 + 0.2, 0.5) * (1 - prog(t, T.quoteHijo - 0.05, 0.2))}}>“</div>
    <Quote t={t} t0={T.quoteHijo - 0.05} text="Que el Estado esté presente, hoy no lo está." who="SEBASTIÁN, HIJO DE NANCI" y={420} size={112} />
  </>
);
/** 28 · la familia no descarta que tenga que ver con lo que denunció */
const Hipotesis: React.FC<{t: number}> = ({t}) => {
  const k = prog(t, T.noDescarta + 0.3, 1.2);
  return (
    <>
      <Slate t={t} glow="rgba(116,172,223,0.14)" />
      <div style={{position: 'absolute', left: 120, top: 520, width: 300, height: 380, background: K.paper, borderRadius: 8, transform: 'rotate(-5deg)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', opacity: prog(t, C.s28, 0.4)}}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{position: 'absolute', left: 30, right: 30 + (i % 2) * 40, top: 60 + i * 56, height: 8, background: 'rgba(34,48,90,0.45)', borderRadius: 4}} />
        ))}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 24, textAlign: 'center', ...mn(22, '#3A2C1C', 600, 0.1)}}>SU DENUNCIA</div>
      </div>
      <svg width={VW} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d="M 430 700 C 560 640 640 760 700 700" stroke={K.chalk} strokeWidth={5} fill="none" strokeDasharray="14 12" strokeDashoffset={0} opacity={k} pathLength={1} />
      </svg>
      <div style={{position: 'absolute', left: 690, top: 520, ...hd(320, 900, K.amber, 70, 0), opacity: prog(t, T.noDescarta + 1.2, 0.4), transform: `scale(${clamp(pop(t, T.noDescarta + 1.2, 1.2), 0, 1.1)})`}}>?</div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 1000, opacity: prog(t, T.noDescarta, 0.4)}}>
        <div style={{...mn(26, K.mute, 600, 0.16)}}>HIPÓTESIS DE LA FAMILIA</div>
        <div style={{...sr(64, K.chalk), marginTop: 14}}>«No descartamos que el crimen tenga que ver con eso»</div>
        <div style={{...mn(24, K.dim, 600, 0.1), marginTop: 14}}>ABOGADO DE LA FAMILIA, A A24</div>
      </div>
    </>
  );
};
/** 29 · paro docente en todo el país */
const PROV_C: [number, number][] = [
  [-58.4, -34.6], [-60.7, -31.6], [-64.2, -31.4], [-68.8, -32.9], [-65.2, -26.8], [-65.4, -24.8], [-58.8, -27.5], [-55.9, -27.4], [-58.2, -26.2], [-60.4, -27.5], [-64.3, -27.8], [-66.3, -33.3],
  [-67.8, -40.8], [-68.1, -38.9], [-65.1, -43.3], [-69.2, -51.6], [-64.3, -36.6], [-68.5, -31.5], [-66.8, -29.4], [-65.7, -28.5], [-59.5, -32.4], [-57.6, -38.0], [-62.3, -38.7], [-59.5, -30.0],
];
const Paro: React.FC<{t: number}> = ({t}) => (
  <>
    <Slate t={t} glow="rgba(240,168,90,0.14)" y={50} />
    <ArgMap x={190} y={380} w={700} h={1000} stroke="rgba(243,239,228,0.3)" dots={PROV_C.map(([lon, lat], i) => ({lon, lat, k: pop(t, T.paro + 0.3 + rnd(i * 3.1) * 1.4, 1.3), color: i === 23 ? K.red : K.amber, r: i === 23 ? 12 : 8}))} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', opacity: prog(t, T.paro, 0.4)}}>
      <div style={{...hd(110, 900, K.chalk, 70, 0)}}>Paro docente</div>
      <div style={{...mn(32, K.amber, 600, 0.2), marginTop: 12}}>EN TODO EL PAÍS · 29/10</div>
    </div>
  </>
);
/** 30 · el gobierno de Corrientes: «un operativo muy fuerte» */
const Gobierno: React.FC<{t: number}> = ({t}) => (
  <>
    <Slate t={t} glow="rgba(116,172,223,0.18)" y={25} />
    {/* la provincia de Corrientes, de fondo */}
    <div style={{opacity: 0.55 * prog(t, C.s30, 0.6) * (1 - 0.6 * prog(t, T.operativo - 0.1, 0.4))}}>
      <ArgMap x={-260} y={380} w={1600} h={2300} scale={3.4} focus={[-57.8, -28.6]} fill={(n) => (n === 'Corrientes' ? 'rgba(116,172,223,0.35)' : 'rgba(34,52,61,0.4)')} stroke="rgba(243,239,228,0.25)" />
    </div>
    <div style={{position: 'absolute', left: 80, right: 80, top: 270, opacity: prog(t, C.s30 + 0.1, 0.4)}}>
      <div style={{...mn(30, K.celeste, 600, 0.2)}}>EN CAMBIO</div>
      <div style={{...hd(92, 900, K.chalk, 72), marginTop: 16}}>El gobierno de Corrientes</div>
    </div>
    <Quote t={t} t0={T.operativo - 0.05} text="Hay un operativo muy fuerte." who="JUAN PABLO VALDÉS, GOBERNADOR · 19/10" y={540} size={116} mark={K.celeste} />
  </>
);
/** 31 · ¿vos qué pensás? (encuesta A / B) */
const Encuesta: React.FC<{t: number}> = ({t}) => {
  const opts: [string, string, number, string][] = [
    ['A', 'Fue un crimen que nadie podía evitar', T.crimen, K.dawn],
    ['B', 'El Estado también es responsable', T.oEstado, K.celeste],
  ];
  return (
    <>
      <Slate t={t} glow="rgba(243,239,228,0.1)" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 280, textAlign: 'center', ...hd(120, 900, K.chalk, 70, 0), opacity: prog(t, C.s31, 0.4), transform: `scale(${0.9 + 0.1 * clamp(pop(t, C.s31, 1.2), 0, 1.1)})`}}>
        ¿Vos qué pensás?
      </div>
      {opts.map(([l, txt, t0, col], i) => {
        const k = pop(t, t0 - 0.05, 1.2);
        if (t < t0 - 0.05) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 80, right: 80, top: 520 + i * 260, height: 220, borderRadius: 28, border: `4px solid ${col}`, background: 'rgba(21,35,42,0.92)', display: 'flex', alignItems: 'center', gap: 34, padding: '0 40px', transform: `scale(${clamp(k, 0, 1.08)})`}}>
            <div style={{width: 120, height: 120, borderRadius: 999, background: col, display: 'flex', alignItems: 'center', justifyContent: 'center', ...hd(84, 900, K.deep, 76), flexShrink: 0}}>{l}</div>
            <div style={{...hd(62, 800, K.chalk, 76), lineHeight: 1}}>{txt}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1080, textAlign: 'center', opacity: prog(t, T.leo - 0.1, 0.4)}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 20, padding: '22px 44px', borderRadius: 999, background: K.chalk}}>
          <IconChat s={56} />
          <span style={{...hd(58, 900, K.deep, 76)}}>Comentá A o B</span>
        </div>
      </div>
    </>
  );
};
/** 32 · la placa final: el caballo sin jinete frente a la escuela, al atardecer */
const Final: React.FC<{t: number}> = ({t}) => {
  const k = clamp((t - C.s32) / 3.2);
  const cam: Cam = {pos: [mix(6.5, 9, k), mix(1.6, 2.1, k), mix(21, 26, k)], look: [0, 2.3, 3], fov: 42};
  return (
    <>
      <Marsh3D t={t} cam={cam} mood="dusk" school={{pos: [0, 0, 0]}} holes={[[0, 2, 17]]} riders={[{pos: [3.2, 0, 12.5], yaw: -0.95, coat: 'bay', rider: 'none', clips: [{name: 'Idle_Headlow', w: 1}]}]} seed={5} mist={0.8} />
      <Scrims top={0.6} bottom={0.6} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', opacity: prog(t, C.s32 + 0.3, 0.8)}}>
        <div style={{...sr(110, K.chalk), textShadow: '0 6px 40px rgba(0,0,0,0.6)'}}>Nanci Estela Godoy</div>
        <div style={{...mn(30, K.amber, 600, 0.22), marginTop: 18, textShadow: '0 2px 0 #05080B, 0 0 18px rgba(5,8,11,0.7)'}}>MAESTRA RURAL · ESCUELA N.º 626</div>
      </div>
      <div style={{position: 'absolute', left: (VW - 92) / 2, top: 560}}>
        <Logo size={92} t={t} t0={C.s32 + 1.2} />
      </div>
    </>
  );
};

/* ================================================================== la composición */
export const ReelGodoy: React.FC = () => {
  const ok = useAssets();
  const t = useCurrentFrame() / 30;
  if (!ok) return null;
  return (
    <AbsoluteFill style={{background: K.void}}>
      <Win t={t} a={0} b={C.s3}><Hook t={t} /></Win>
      <Win t={t} a={C.s3} b={C.s4}><PoliceHook t={t} /></Win>
      <Win t={t} a={C.s4} b={C.s5}><KmSat t={t} /></Win>
      <Win t={t} a={C.s5} b={C.s6}><Divide t={t} /></Win>
      <Win t={t} a={C.s6} b={C.s7}><Title t={t} /></Win>
      <Win t={t} a={C.s7} b={C.s8}><NameCard t={t} /></Win>
      <Win t={t} a={C.s8} b={C.s9}><WhereMap t={t} /></Win>
      <Win t={t} a={C.s9} b={C.s10}><Roles t={t} /></Win>
      <Win t={t} a={C.s10} b={C.s11}><Estancia t={t} /></Win>
      <Win t={t} a={C.s11} b={C.s12}><Route t={t} /></Win>
      <Win t={t} a={C.s12} b={C.s13}><Journey t={t} /></Win>
      <Win t={t} a={C.s13} b={C.s14}><Aula t={t} a={C.s13} /></Win>
      <Win t={t} a={C.s14} b={C.s15}><Carta t={t} /></Win>
      <Win t={t} a={C.s15} b={C.s16}><Expediente t={t} /></Win>
      <Win t={t} a={C.s16} b={C.s17}><Fantasma t={t} /></Win>
      <Win t={t} a={C.s17} b={C.s18}><Noche t={t} /></Win>
      <Win t={t} a={C.s18} b={C.s19}><Cal t={t} phase={1} /></Win>
      <Win t={t} a={C.s19} b={C.s20}><Tormenta t={t} /></Win>
      <Win t={t} a={C.s20} b={C.s21}><Busqueda t={t} /></Win>
      <Win t={t} a={C.s21} b={C.s22}><Detenidos t={t} /></Win>
      <Win t={t} a={C.s22} b={C.s25}><Hallazgo t={t} /></Win>
      <Win t={t} a={C.s25} b={C.s26}><Fiscalia t={t} /></Win>
      <Win t={t} a={C.s26} b={C.s27}><Familia t={t} /></Win>
      <Win t={t} a={C.s27} b={C.s28}><Hijo t={t} /></Win>
      <Win t={t} a={C.s28} b={C.s29}><Hipotesis t={t} /></Win>
      <Win t={t} a={C.s29} b={C.s30}><Paro t={t} /></Win>
      <Win t={t} a={C.s30} b={C.s31}><Gobierno t={t} /></Win>
      <Win t={t} a={C.s31} b={C.s32}><Encuesta t={t} /></Win>
      <Win t={t} a={C.s32} b={999}><Final t={t} /></Win>
      <Captions t={t} hide={capsHidden(t)} />
    </AbsoluteFill>
  );
};
export const REEL_CUTS = C;
export const REEL_T = T;
