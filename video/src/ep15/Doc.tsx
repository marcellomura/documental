/* Ep15 · EL HOMBRE DE LAS MIL CARAS (largo para YouTube, 1920×1080 → se renderiza a 1440p). Sin subtítulos quemados.
   Cada plano empieza en una palabra de la locución (L.at). Los planos son contiguos: cada uno dura hasta que empieza
   el siguiente, y el siguiente puede entrar con un fundido (fi). Encima van los textos, las placas y las transiciones. */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {L} from './lib';
import {useAssets15, SAT_CREDIT} from './three15';
import {K, F, Win, FilmLook, Flash, Dip, Leak, Glitch, Photo, Credit, Slate, Chapter, NameCard, Quote, Stamp, Filters, Paper, BigNumber, Logo, prog, clamp, mix, easeInOut, easeOut} from './kit';
import {Neon, Bokeh, TailLights, Polaroid, Stutter, Trunk, YearRoll, Lines, Strike, FilmBeam, BigWord, Tag, TitleCard, PhotoCredit} from './kit2';
import {Map15, GlobeArc, viewPath, PT, PARQUE, LUX, moveShape, squareKm, arcRoute, smoothRoute, type View} from './map15';
import {dolly, CabezaShot, PuebloShot, TierraShot, YateShot, CadenasShot, TamboresShot, PabellonShot, SiluetaShot, satPoint, type Cam} from './shots15';
import {Bug} from '../ep04/kit';

const A = L.at, E = L.atE, S = L.start;
type Shot = {a: number; fi?: number; sat?: boolean; el: (t: number) => React.ReactNode};

/* ------------------------------------------------------------------ cámaras y vistas que se repiten */
const PK = satPoint('region', 'parque');
const HEAD_FRONT: Cam = {pos: [0, -0.05, 5.2], look: [0, -0.12, 0], fov: 30};
const HEAD_34: Cam = {pos: [3.2, 0.3, 4.2], look: [0, -0.1, 0], fov: 30};
const HEAD_CLOSE: Cam = {pos: [0.9, 0.15, 3.1], look: [0, 0.0, 0.2], fov: 28};
const HEAD_PROF: Cam = {pos: [5.4, 0.05, 0.5], look: [0, -0.1, 0.15], fov: 28};
const V_NE: View = {lon: -58.6, lat: -26.6, scale: 5600};
const V_MIS: View = {lon: -55.7, lat: -27.2, scale: 14000};
const V_PY: View = {lon: -56.8, lat: -26.2, scale: 9500};
const V_ASU: View = {lon: -57.66, lat: -25.3, scale: 80000};
const V_CHACO: View = {lon: -60.45, lat: -26.05, scale: 26000};
const V_FID: View = {lon: -60.55, lat: -25.05, scale: 26000};
const V_CTES: View = {lon: -58.55, lat: -27.38, scale: 34000};
const V_SUR: View = {lon: -61.5, lat: -35.5, scale: 1900};
const lux = moveShape(LUX, [-59.85, -25.0]);
const sq = squareKm([-61.2, -25.0], 50);

/* ------------------------------------------------------------------ los planos */
const SHOTS: Shot[] = [
  /* ---------- apertura en frío: Castelli, 13 de enero de 2011 ---------- */
  {a: 0, el: (t) => (
    <PuebloShot t={t} cam={dolly(t, 0, A('s01', 'adentro'), {pos: [15, 1.8, 27], look: [-7, 1.9, 6], fov: 38}, {pos: [6.5, 1.6, 18], look: [-3.5, 1.5, 5], fov: 36}, true)}
      walkers={[{t0: A('s01', 'tres') - 1.4, from: [-30, 0, 10.0], to: [-0.6, 0, 4.4], dur: 6.8, vanish: true}, {t0: A('s01', 'tres') - 1.0, from: [-31.5, 0, 11.0], to: [-0.6, 0, 4.4], dur: 7.3, vanish: true}, {t0: A('s01', 'tres') - 0.6, from: [-33, 0, 10.4], to: [-0.6, 0, 4.4], dur: 7.8, vanish: true}]}
      door={prog(t, A('s01', 'castelli') + 0.6, 1.4)} />
  )},
  {a: A('s01', 'adentro') - 0.1, fi: 0.5, el: (t) => <Photo file="castelli_plaza.jpg" t={t} t0={A('s01', 'adentro') - 0.6} dur={6} from={[40, 55, 1.06]} to={[55, 50, 1.16]} grade="warm" />},
  {a: A('s01', 'dormia') - 0.2, fi: 0.4, el: (t) => (
    <PuebloShot t={t} cam={dolly(t, A('s01', 'dormia') - 0.6, A('s01', 'y era'), {pos: [10.5, 1.0, 13.5], look: [6.8, 0.9, 9.4], fov: 34}, {pos: [9.2, 1.25, 11.6], look: [6.4, 1.0, 9.2], fov: 32})} jeep />
  )},
  {a: A('s01', 'y era') - 0.15, fi: 0.5, sat: true, el: (t) => <TierraShot t={t} crop="region" cam={dolly(t, A('s01', 'y era') - 0.6, A('s01', 'un campo'), {pos: [PK[0] - 140, 260, PK[2] + 380], look: [PK[0], 0, PK[2] - 20], fov: 46}, {pos: [PK[0] - 60, 170, PK[2] + 250], look: [PK[0] + 10, 0, PK[2] - 40], fov: 44}, true)} />},
  {a: A('s01', 'un campo') - 0.1, fi: 0.4, el: (t) => (
    <Map15 t={t} view={viewPath(t, [[0, {lon: -60.55, lat: -25.0, scale: 30000}]])} provO={0.35} gridO={0.4} labelsO={0} riverLabelsO={0}
      areas={[{ring: sq, o: 1, p: prog(t, A('s01', 'un campo'), 0.9), label: '250.000 HA', labelAt: [-61.2, -24.66]}, {ring: lux, o: 1, p: prog(t, A('s01', 'luxemburgo') - 0.2, 0.9), stroke: K.steel, fill: 'rgba(141,176,195,0.14)', label: 'LUXEMBURGO', labelAt: [-59.85, -24.5]}]} />
  )},
  {a: A('s01', 'uno de los hombres') - 0.1, fi: 0.6, el: (t) => (
    <CabezaShot t={t} cam={dolly(t, A('s01', 'uno de los hombres') - 0.7, E('s01', 'cara'), HEAD_34, HEAD_FRONT, true)} key={prog(t, A('s01', 'uno de los hombres'), 2.0)} red={0.4}
      proj={t > A('s01', 'nombre') ? {k: 1.1 * prog(t, A('s01', 'nombre'), 0.4), mode: t > A('s01', 'pais') ? 'grilla' : 'nombres', off: t * 0.01} : undefined}
      scatter={0.32 * prog(t, A('s01', 'cara') - 0.1, 0.5) * (1 - prog(t, A('s01', 'sus amigos') - 0.4, 1.0))} rotY={-0.25 + (t - S('s01')) * 0.012} />
  )},
  {a: A('s01', 'sus amigos') - 0.05, el: (t) => (
    <CabezaShot t={t} cam={dolly(t, A('s01', 'sus amigos'), E('s01', 'caras') + 0.3, HEAD_FRONT, {pos: [0, -0.05, 4.4], look: [0, -0.1, 0], fov: 30}, true)} red={0.55}
      id={mix(0, 2, prog(t, A('s01', 'la prensa'), 2.4))} proj={{k: 1.15, mode: 'nombres', off: t * 0.012}}
      scatter={prog(t, A('s01', 'el hombre de las mil caras') + 0.3, 2.6)} rotY={0.18 - (t - A('s01', 'sus amigos')) * 0.02} />
  )},
  /* título: la cabeza ya es polvo */
  {a: E('s01', 'caras') + 0.45, el: (t) => (
    <CabezaShot t={t} cam={{pos: [0, -0.05, 4.4], look: [0, -0.1, 0], fov: 30}} red={0.3} id={2} proj={{k: 0.4, mode: 'nombres', off: t * 0.012}} scatter={0.85 + 0.15 * prog(t, E('s01', 'caras'), 4)} rotY={0.0} key={0.7} />
  )},
  {a: S('s02') - 2.1, el: () => <AbsoluteFill style={{background: '#000'}} />},

  /* ---------- I · EL GUSANO: Posadas, la yerba, Puerto Menocchio ---------- */
  {a: S('s02') + 0.3, fi: 0.6, el: (t) => (
    <Map15 t={t} view={viewPath(t, [[0, V_NE], [S('s02') + 0.4, V_MIS]], 2.6)} hi={['ARG']} hiProv={['Misiones']}
      pins={[{at: PT['Posadas'], label: 'POSADAS', sub: 'MISIONES · 1959', o: prog(t, A('s02', 'posadas'), 0.4), color: K.ember}]} />
  )},
  {a: A('s02', 'en una de las familias') - 0.1, fi: 0.5, el: (t) => <Photo file="posadas_costanera.jpg" t={t} t0={A('s02', 'en una de las familias') - 0.6} dur={4.5} from={[50, 60, 1.05]} to={[45, 55, 1.15]} grade="warm" />},
  {a: A('s02', 'su padre') - 0.1, fi: 0.4, el: (t) => <Photo file="yerba_secado.jpg" t={t} t0={A('s02', 'su padre') - 0.5} dur={8} from={[60, 50, 1.08]} to={[40, 52, 1.2]} grade="warm" shade={0.6} />},
  {a: A('s02', 'tan grande') - 0.1, fi: 0.4, el: (t) => <Photo file="yerba_canchada.jpg" t={t} t0={A('s02', 'tan grande') - 0.5} dur={4} from={[50, 50, 1.12]} to={[50, 45, 1.02]} grade="warm" />},
  {a: A('s02', 'puerto menocchio') - 0.6, fi: 0.4, el: (t) => (
    <Map15 t={t} view={viewPath(t, [[0, V_MIS], [A('s02', 'puerto menocchio') - 0.5, {lon: -55.55, lat: -27.15, scale: 26000}]], 2.0)} hi={['ARG']} hiProv={['Misiones']}
      pins={[{at: PT['Posadas'], label: 'POSADAS', o: 0.5, size: 0.8, pulse: false}, {at: PT['Puerto Menocchio'], label: 'PUERTO MENOCCHIO', sub: 'UN PUEBLO CON SU APELLIDO', o: prog(t, A('s02', 'puerto menocchio'), 0.4), color: K.ember}]} />
  )},
  {a: A('s02', 'a luis') - 0.1, fi: 0.5, el: (t) => (
    <CabezaShot t={t} cam={dolly(t, A('s02', 'a luis'), A('s02', 'era muy alto'), HEAD_PROF, {pos: [4.6, 0.2, 2.6], look: [0, -0.1, 0.1], fov: 29})} red={0.3}
      proj={{k: 0.9, mode: 'nombres', off: t * 0.015}} id={mix(1, 0, prog(t, A('s02', 'despues'), 1.6))} />
  )},
  {a: A('s02', 'era muy alto') - 0.1, fi: 0.4, el: (t) => <SiluetaShot t={t} cam={dolly(t, A('s02', 'era muy alto'), A('s02', 'y cuando'), {pos: [0, 1.0, 7.5], look: [0, 1.6, 0], fov: 38}, {pos: [0, 0.6, 5.6], look: [0, 1.7, 0], fov: 40})} />},
  {a: A('s02', 'y cuando') - 0.05, el: () => <AbsoluteFill style={{background: '#050607'}} />},
  {a: A('s02', 'en 1982') - 0.1, fi: 0.4, el: (t) => <Photo file="yerba_secado.jpg" t={t} t0={A('s02', 'en 1982') - 0.5} dur={6} from={[30, 50, 1.25]} to={[35, 50, 1.32]} grade="noir" shade={0.8} credit={false} />},
  {a: A('s02', 'y los menocchio') - 0.1, fi: 0.5, el: (t) => (
    <Map15 t={t} view={viewPath(t, [[0, V_MIS], [A('s02', 'y los menocchio'), V_PY]], 2.6)} hi={['PRY']}
      routes={[{pts: smoothRoute([PT['Posadas'], PT['Encarnación'], [-56.9, -26.6], [-57.3, -25.9], PT['Asunción']]), p: prog(t, A('s02', 'se fueron') - 0.2, 3.0, easeInOut)}]}
      pins={[{at: PT['Posadas'], label: 'POSADAS', o: 1, size: 0.85, pulse: false}, {at: PT['Asunción'], label: 'ASUNCIÓN', sub: 'PARAGUAY', o: prog(t, A('s02', 'paraguay'), 0.4), color: K.blood}]} />
  )},

  /* ---------- Asunción, 15 de agosto de 2004 ---------- */
  {a: S('s03') - 0.2, fi: 0.5, el: (t) => <Photo file="asuncion_palacio.jpg" t={t} t0={S('s03') - 0.7} dur={7} from={[50, 50, 1.04]} to={[52, 46, 1.14]} grade="night" />},
  {a: A('s03', 'y acumula') - 0.1, fi: 0.3, el: (t) => <Photo file="asuncion_palacio.jpg" t={t} t0={A('s03', 'y acumula') - 2} dur={5} from={[52, 46, 1.2]} to={[52, 46, 1.25]} grade="noir" shade={0.9} credit={false} />},
  {a: A('s03', 'la noche') - 0.1, fi: 0.5, el: (t) => <Photo file="asuncion_cabildo.jpg" t={t} t0={A('s03', 'la noche') - 0.6} dur={5.5} from={[50, 55, 1.05]} to={[50, 50, 1.14]} grade="night" />},
  {a: A('s03', 'el puerto madero') - 0.2, fi: 0.3, el: (t) => <Bokeh t={t} />},
  {a: A('s03', 'a la madrugada') - 0.1, fi: 0.5, el: (t) => <TailLights t={t} t0={A('s03', 'los tres') + 0.4} dur={5} />},
  {a: A('s03', 'once dias') - 0.15, fi: 0.4, el: (t) => <TamboresShot t={t} cam={dolly(t, A('s03', 'once dias') - 0.5, A('s03', 'adentro'), {pos: [3.6, 1.5, 9.4], look: [0, 0.35, 2.8], fov: 36}, {pos: [1.9, 0.9, 6.4], look: [-0.1, 0.35, 2.8], fov: 34}, true)} />},
  {a: A('s03', 'adentro') - 0.15, el: () => <AbsoluteFill style={{background: '#000'}} />},
  {a: A('s03', 'para la policia') - 0.15, fi: 0.5, el: (t) => <CabezaShot t={t} cam={dolly(t, A('s03', 'para la policia'), A('s03', 'el siempre'), HEAD_FRONT, {pos: [0.4, 0, 4.3], look: [0, -0.1, 0], fov: 30})} red={0.7} proj={{k: 0.9, mode: 'grilla'}} scan={{y: mix(1.1, -1.0, ((t - A('s03', 'para la policia')) / 2.5) % 1), k: 1}} />},
  {a: A('s03', 'el siempre') - 0.1, fi: 0.4, el: (t) => <Photo file="asuncion_cabildo.jpg" t={t} t0={A('s03', 'el siempre') - 2} dur={8} from={[40, 50, 1.2]} to={[44, 50, 1.3]} grade="noir" shade={0.85} credit={false} />},
  {a: A('s03', 'cuando allanaron') - 0.1, fi: 0.4, el: (t) => (
    <Map15 t={t} view={viewPath(t, [[0, {lon: -57.6, lat: -25.3, scale: 42000}], [A('s03', 'cuando allanaron'), {lon: -57.6, lat: -25.3, scale: 70000}]], 2.6)} hi={['PRY']} riverLabelsO={0}
      pins={[{at: PT['Asunción'], label: 'ASUNCIÓN', o: 1 - prog(t, A('s03', 'ya se habia') + 0.2, 0.25), color: K.blood}]} />
  )},

  /* ---------- II · HUGO JARA: la fuga y la otra cara ---------- */
  {a: S('s04') + 0.35, fi: 0.6, el: (t) => (
    <Map15 t={t} view={viewPath(t, [[0, {lon: -58.0, lat: -26.2, scale: 9000}], [A('s04', 'la otra') - 0.3, {lon: -57.75, lat: -25.33, scale: 70000}]], 2.4)} hi={['PRY']}
      routes={[
        {pts: arcRoute(PT['Asunción'], [-58.9, -27.7], 0.22), p: prog(t, A('s04', 'en avion') - 0.3, 1.4), color: K.steel, dash: true, label: 'VERSIÓN 1: EN AVIÓN', labelAt: 0.55, o: 1 - prog(t, A('s04', 'la otra') - 0.3, 0.6)},
        {pts: smoothRoute([[-57.69, -25.255], [-57.705, -25.272], [-57.715, -25.29], [-57.718, -25.296]], 10), p: prog(t, A('s04', 'cruzo'), 1.8), color: K.blood, width: 6, label: 'VERSIÓN 2: EN BALSA', labelAt: 0.5},
      ]}
      pins={[{at: PT['Asunción'], label: 'ASUNCIÓN', o: 1, align: 'right'}, {at: PT['Clorinda'], label: 'CLORINDA', sub: 'FORMOSA · ARGENTINA', o: prog(t, A('s04', 'hasta clorinda'), 0.4), color: K.ember, align: 'left'}]} />
  )},
  {a: A('s04', 'en una balsa') - 0.1, fi: 0.5, el: (t) => <Photo file="pilcomayo_clorinda.jpg" t={t} t0={A('s04', 'en una balsa') - 0.6} dur={6} from={[50, 55, 1.05]} to={[58, 50, 1.16]} grade="warm" />},
  {a: A('s04', 'lo cierto') - 0.1, fi: 0.5, el: (t) => (
    <CabezaShot t={t} cam={dolly(t, A('s04', 'lo cierto'), A('s04', 'como hugo'), HEAD_FRONT, HEAD_CLOSE)} red={0.4}
      proj={{k: t > A('s04', 'segun conto') ? 1.5 : 1.1, mode: t > A('s04', 'segun conto') ? 'huella' : 'jara', off: t > A('s04', 'segun conto') ? 0 : t * 0.01, color: t > A('s04', 'segun conto') ? '#FF6A50' : '#FFE3C4'}}
      id={mix(0, 1, prog(t, A('s04', 'se opero'), 1.2))} scatter={0.25 * Math.sin(Math.PI * clamp((t - A('s04', 'se opero')) / 1.6))} rotY={0.1 - (t - S('s04')) * 0.01} />
  )},
  {a: A('s04', 'como hugo') - 0.1, fi: 0.5, el: (t) => <FilmBeam t={t} />},
  {a: A('s04', 'vivia') - 0.1, fi: 0.6, el: (t) => <YateShot t={t} cam={dolly(t, A('s04', 'vivia') - 0.7, A('s05', 'y paran'), {pos: [-20, 2.6, 24], look: [0, 1.4, -2], fov: 34}, {pos: [-12, 1.8, 14], look: [0, 1.6, -2], fov: 34}, true)} />},

  /* ---------- el Paraná, marzo de 2005 ---------- */
  {a: A('s05', 'y paran') - 0.1, fi: 0.5, el: (t) => <Photo file="parana_corrientes.jpg" t={t} t0={A('s05', 'y paran') - 0.6} dur={4.5} from={[50, 50, 1.04]} to={[46, 50, 1.12]} grade="warm" />},
  {a: A('s05', 'despues') - 0.1, fi: 0.5, el: (t) => <Photo file="itati_basilica.jpg" t={t} t0={A('s05', 'despues') - 0.6} dur={6} from={[50, 40, 1.04]} to={[50, 46, 1.14]} grade="cold" />},
  {a: A('s05', 'a los pocos') - 0.1, fi: 0.6, el: (t) => <CadenasShot t={t} t0={A('s05', 'a los pocos') - 1} cam={dolly(t, A('s05', 'a los pocos') - 0.6, A('s05', 'era nozzi'), {pos: [0.5, 1.2, 8.6], look: [0, -0.6, 0], fov: 46}, {pos: [0.7, -1.4, 7.4], look: [0, -2.6, 0], fov: 46})} />},
  {a: A('s05', 'era nozzi') - 0.1, el: () => <AbsoluteFill style={{background: '#000'}} />},
  {a: A('s05', 'la prefectura') - 0.1, fi: 0.5, el: (t) => <Photo file="prefectura.jpg" t={t} t0={A('s05', 'la prefectura') - 0.6} dur={5} from={[50, 50, 1.05]} to={[55, 50, 1.14]} grade="cold" />},
  {a: A('s05', 'pero el nombre') - 0.1, fi: 0.4, el: (t) => (
    <CabezaShot t={t} cam={dolly(t, A('s05', 'pero el nombre'), A('s05', 'paraguay pide'), HEAD_CLOSE, HEAD_FRONT)} red={0.6}
      proj={{k: 1.1, mode: t < A('s05', 'es luis') ? 'jara' : 'nombres', off: t * 0.012}} scatter={0.35 * Math.sin(Math.PI * clamp((t - A('s05', 'se cae') + 0.2) / 0.9))} id={mix(1, 0, prog(t, A('s05', 'se cae'), 0.8))} />
  )},
  {a: A('s05', 'paraguay pide') - 0.1, fi: 0.5, el: (t) => (
    <Map15 t={t} view={viewPath(t, [[0, {lon: -58.2, lat: -26.4, scale: 11000}]])} hi={['PRY', 'ARG']}
      routes={[
        {pts: arcRoute(PT['Asunción'], PT['Corrientes'], 0.18), p: prog(t, A('s05', 'pide'), 1.2), color: K.blood, label: 'PEDIDO DE EXTRADICIÓN', labelAt: 0.5},
        {pts: arcRoute(PT['Corrientes'], PT['Asunción'], 0.18), p: prog(t, A('s05', 'la argentina responde'), 1.2), color: K.steel, label: 'PRIMERO, EL JUICIO', labelAt: 0.5},
      ]}
      pins={[{at: PT['Asunción'], label: 'ASUNCIÓN', o: 1, align: 'right'}, {at: PT['Corrientes'], label: 'CORRIENTES', o: 1, color: K.ember, align: 'left'}]} />
  )},
  {a: A('s05', 'y el juicio') - 0.1, fi: 0.5, el: (t) => <PabellonShot t={t} cam={dolly(t, A('s05', 'y el juicio'), A('s05', 'y se va'), {pos: [0, 1.6, 4], look: [0, 1.4, -30], fov: 48}, {pos: [0, 1.55, -12], look: [0.4, 1.3, -40], fov: 48}, true)} />},
  {a: A('s05', 'y se va') - 0.1, fi: 0.5, el: (t) => <Photo file="corrientes_puente.jpg" t={t} t0={A('s05', 'y se va') - 0.6} dur={5} from={[50, 50, 1.05]} to={[44, 52, 1.14]} grade="warm" />},

  /* ---------- III · LA FIDELIDAD: Manuel Roseo y el monte ---------- */
  {a: S('s06') - 0.4, fi: 0.8, sat: true, el: (t) => <TierraShot t={t} crop="rio" cam={dolly(t, S('s06') - 1.2, A('s06', 'manuel roseo') + 0.4, {pos: [-70, 40, 120], look: [10, 0, -10], fov: 48}, {pos: [-30, 26, 70], look: [20, 0, -30], fov: 48}, true)} />},
  {a: A('s06', 'manuel roseo') + 0.1, fi: 0.5, el: (t) => <GlobeArc t={t} t0={A('s06', 'roma') - 0.6} from={PT['Roma']} to={PT['Buenos Aires']} dur={4.8} label={['ROMA · 1935', 'ARGENTINA · 1956']} />},
  {a: A('s06', 'a principios') - 0.1, fi: 0.5, el: (t) => <Photo file="bermejo_norte.jpg" t={t} t0={A('s06', 'a principios') - 0.6} dur={5.5} from={[50, 55, 1.05]} to={[52, 48, 1.16]} grade="warm" shade={0.6} />},
  {a: A('s06', '250000') - 0.15, fi: 0.5, sat: true, el: (t) => <TierraShot t={t} crop="region" cam={dolly(t, A('s06', '250000') - 0.6, A('s06', 'mientras'), {pos: [PK[0] - 40, 330, PK[2] + 300], look: [PK[0] + 20, 0, PK[2] - 60], fov: 46}, {pos: [PK[0] + 60, 120, PK[2] + 40], look: [PK[0] + 40, 0, PK[2] - 200], fov: 46}, true)} />},
  {a: A('s06', 'mientras') - 0.1, fi: 0.5, sat: true, el: (t) => <TierraShot t={t} crop="region" cam={dolly(t, A('s06', 'mientras') - 0.5, A('s06', 'y manuel'), {pos: [PK[0] + 210, 135, PK[2] - 60], look: [PK[0] + 280, 0, PK[2] - 150], fov: 44}, {pos: [PK[0] + 225, 118, PK[2] - 85], look: [PK[0] + 285, 0, PK[2] - 165], fov: 42}, true)} />},
  {a: A('s06', 'y manuel') - 0.1, fi: 0.5, el: (t) => <Photo file="bermejo_chaco.jpg" t={t} t0={A('s06', 'y manuel') - 0.6} dur={12} from={[50, 55, 1.04]} to={[50, 50, 1.2]} grade="warm" shade={0.7} />},
  {a: A('s06', 'un campo asi') - 0.1, fi: 0.6, sat: true, el: (t) => <TierraShot t={t} crop="rio" cam={dolly(t, A('s06', 'un campo asi') - 0.6, E('s06', 'custodia') + 1.6, {pos: [60, 60, 130], look: [0, 0, -20], fov: 46}, {pos: [10, 34, 70], look: [-20, 0, -40], fov: 46}, true)} />},

  /* ---------- IV · CALLE ESPAÑA ---------- */
  {a: S('s07') + 0.5, fi: 0.6, el: (t) => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #1A1E22 0%, #07090B 75%)'}} />},
  {a: A('s07', 'en diciembre') - 0.1, fi: 0.4, el: (t) => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #1C1712 0%, #070605 75%)'}} />},
  {a: A('s07', 'el 6 de enero') - 0.1, fi: 0.5, el: (t) => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #1E1A15 0%, #080706 75%)'}} />},
  {a: A('s07', 'siete dias') - 0.1, fi: 0.4, el: (t) => <PuebloShot t={t} cam={dolly(t, A('s07', 'siete dias') - 0.5, A('s07', 'roseo y su'), {pos: [7, 1.5, 19], look: [-0.6, 1.4, 4], fov: 34}, {pos: [2.8, 1.45, 12.5], look: [-0.6, 1.3, 4], fov: 32}, true)} door={prog(t, A('s07', 'entran'), 1.4)} jeep />},
  {a: A('s07', 'roseo y su') - 0.1, fi: 0.5, el: (t) => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #15110E 0%, #050404 80%)'}} />},
  {a: A('s07', 'buscaban') - 0.1, fi: 0.3, el: () => <AbsoluteFill style={{background: '#0A0908'}} />},
  {a: A('s07', 'los dos murieron') - 0.2, el: () => <AbsoluteFill style={{background: '#000'}} />},
  {a: A('s07', 'despues los') - 0.1, fi: 0.7, el: (t) => <PuebloShot t={t} cam={dolly(t, A('s07', 'despues los') - 0.7, S('s08') + 0.3, {pos: [-6, 1.6, 21], look: [1, 1.6, 3], fov: 34}, {pos: [-3, 1.6, 16], look: [0.6, 1.5, 3], fov: 33}, true)} jeep exposure={0.85} />},

  /* ---------- el error: Sergio Berg ---------- */
  {a: S('s08') - 0.05, fi: 0.4, el: (t) => <Photo file="castelli_plaza.jpg" t={t} t0={S('s08') - 0.5} dur={7} from={[60, 50, 1.2]} to={[56, 50, 1.3]} grade="noir" shade={0.8} />},
  {a: A('s08', 'lo golpearon') - 0.1, fi: 0.2, el: (t) => <Trunk t={t} t0={A('s08', 'lo metieron')} />},
  {a: A('s08', 'lo dejaron') - 0.1, fi: 0.5, el: (t) => (
    <Map15 t={t} view={viewPath(t, [[0, V_CHACO]])} hi={['ARG']} hiProv={['Chaco']}
      routes={[{pts: smoothRoute([PT['Castelli'], [-60.55, -26.12], PT['Tres Isletas']]), p: prog(t, A('s08', 'lo dejaron'), 1.6, easeInOut), color: K.blood}]}
      pins={[{at: PT['Castelli'], label: 'CASTELLI', o: 1, size: 0.9, pulse: false}, {at: PT['Tres Isletas'], label: 'TRES ISLETAS', sub: 'UN POZO RECIÉN CAVADO', o: prog(t, A('s08', 'tres isletas'), 0.4), color: K.blood}]} />
  )},
  {a: A('s08', 'berg rompio') - 0.4, el: () => <AbsoluteFill style={{background: '#000'}} />},
  {a: A('s08', 'habia escuchado') - 0.1, fi: 0.4, el: () => <AbsoluteFill style={{background: '#06070A'}} />},
  {a: A('s08', 'once dias') - 0.1, fi: 0.5, el: (t) => <Photo file="corrientes_puente.jpg" t={t} t0={A('s08', 'once dias') - 0.6} dur={7.5} from={[60, 50, 1.06]} to={[50, 50, 1.16]} grade="cold" />},

  /* ---------- V · DOS PERPETUAS ---------- */
  {a: S('s09') - 0.2, fi: 0.5, el: () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1A1712 0%, #060504 80%)'}} />},
  {a: A('s09', 'menocchio nego') - 0.1, fi: 0.5, el: (t) => <CabezaShot t={t} cam={dolly(t, A('s09', 'menocchio nego'), E('s09', 'repite') + 1.5, {pos: [5.4, 0.05, 1.1], look: [0, -0.1, 1.1], fov: 28}, {pos: [4.6, 0.1, 1.9], look: [0, -0.05, 0.95], fov: 28})} red={0.25} key={0.7} />},

  /* ---------- VI · EL IMPENETRABLE ---------- */
  {a: S('s10') - 0.2, fi: 0.6, sat: true, el: (t) => <TierraShot t={t} crop="rio" cam={dolly(t, S('s10') - 0.8, A('s10', 'ese mismo'), {pos: [-80, 70, 160], look: [0, 0, 0], fov: 48}, {pos: [-50, 50, 110], look: [10, 0, -10], fov: 48}, true)} />},
  {a: A('s10', 'y el ambientalista') - 0.1, fi: 0.5, el: (t) => <Photo file="tompkins.jpg" t={t} t0={A('s10', 'y el ambientalista') - 0.6} dur={6} from={[50, 35, 1.04]} to={[50, 30, 1.12]} grade="warm" />},
  {a: A('s10', 'en 2014') - 0.1, fi: 0.6, sat: true, el: (t) => <TierraShot t={t} crop="region" outline={prog(t, A('s10', 'parque nacional') - 0.3, 3.5, easeInOut)} cam={dolly(t, A('s10', 'en 2014') - 0.6, A('s10', 'en 2019'), {pos: [PK[0] - 30, 520, PK[2] + 420], look: [PK[0], 0, PK[2] - 10], fov: 50}, {pos: [PK[0] - 10, 420, PK[2] + 300], look: [PK[0], 0, PK[2] - 20], fov: 50}, true)} />},
  {a: A('s10', 'en 2019') - 0.1, fi: 0.5, el: (t) => <Photo file="yaguarete_rio.jpg" t={t} t0={A('s10', 'en 2019') - 0.6} dur={9} from={[38, 60, 1.05]} to={[40, 62, 1.2]} grade="warm" />},
  {a: A('s10', 'el campo por') - 0.1, fi: 0.6, el: (t) => <Photo file="bermejo_chaco.jpg" t={t} t0={A('s10', 'el campo por') - 0.6} dur={9} from={[50, 50, 1.03]} to={[50, 55, 1.14]} grade="warm" />},

  /* ---------- VII · LAS MIL CARAS ---------- */
  {a: S('s11') - 0.3, fi: 0.6, el: (t) => <CabezaShot t={t} cam={dolly(t, S('s11') - 0.6, A('s11', 'en 2014'), {pos: [0, 0.1, 6.5], look: [0, -0.1, 0], fov: 30}, HEAD_FRONT)} red={0.45} key={prog(t, S('s11') - 0.3, 1.5)} proj={{k: 0.7, mode: 'nombres', off: t * 0.012}} />},
  {a: A('s11', 'en 2014') - 0.1, fi: 0.5, el: (t) => (
    <Map15 t={t} view={viewPath(t, [[0, V_SUR]])} hi={['ARG']} hiProv={['Chubut']} riverLabelsO={0}
      routes={[{pts: arcRoute(PT['Corrientes'], PT['Rawson'], 0.12), p: prog(t, A('s11', 'lo mandaron'), 1.6, easeInOut), color: K.blood}]}
      pins={[{at: PT['Corrientes'], label: 'CORRIENTES', o: 0.8, size: 0.85, pulse: false}, {at: PT['Rawson'], label: 'RAWSON', sub: 'UNIDAD 6 · MÁXIMA SEGURIDAD', o: prog(t, A('s11', 'rawson'), 0.4), color: K.blood}]} />
  )},
  {a: A('s11', 'ahi paso') - 0.2, fi: 0.5, el: (t) => <PabellonShot t={t} cam={dolly(t, A('s11', 'ahi paso') - 0.6, A('s11', 'el lo niega'), {pos: [0, 1.6, 3], look: [0, 1.4, -30], fov: 50}, {pos: [0.2, 1.5, -14], look: [0.9, 1.25, -30], fov: 46}, true)} />},
  {a: A('s11', 'un fin de semana') - 0.1, fi: 0.5, el: (t) => (
    <Map15 t={t} view={viewPath(t, [[0, V_SUR], [A('s11', 'un fin de semana'), {lon: -61.8, lat: -38.5, scale: 2400}]], 2.0)} hi={['ARG']} hiProv={['Chubut', 'Buenos Aires']} riverLabelsO={0}
      routes={[{pts: arcRoute(PT['Rawson'], PT['Ezeiza'], -0.12), p: prog(t, A('s11', 'lo trasladaron'), 1.6, easeInOut), color: K.blood}]}
      pins={[{at: PT['Rawson'], label: 'RAWSON', o: 1, size: 0.85, pulse: false}, {at: PT['Ezeiza'], label: 'EZEIZA', sub: 'PABELLÓN DE ALTO RIESGO', o: prog(t, A('s11', 'ezeiza'), 0.4), color: K.blood}]} />
  )},
  {a: A('s11', 'y su abogado') - 0.1, fi: 0.5, el: (t) => <FilmBeam t={t} k={0.8} />},
  {a: A('s11', 'luis raul') - 0.3, fi: 0.6, el: (t) => (
    <CabezaShot t={t} cam={dolly(t, A('s11', 'luis raul') - 0.6, A('s11', 'y el campo'), HEAD_34, HEAD_FRONT, true)} red={0.5}
      proj={{k: 1.1, mode: 'nombres', off: t * 0.012}} id={mix(0, 2, prog(t, A('s11', 'de cara') - 0.5, 1.2))} scatter={prog(t, A('s11', 'y el campo') - 1.2, 1.4) * 0.9} />
  )},
  {a: A('s11', 'y el campo') - 0.2, fi: 0.8, sat: true, el: (t) => <TierraShot t={t} crop="region" outline={1} outlineO={prog(t, A('s11', 'hoy es de todos') - 0.4, 1.2)} cam={dolly(t, A('s11', 'y el campo') - 1, L.TOTAL, {pos: [PK[0] - 20, 90, PK[2] + 140], look: [PK[0] + 10, 0, PK[2] - 60], fov: 46}, {pos: [PK[0] - 40, 520, PK[2] + 520], look: [PK[0], 0, PK[2] - 20], fov: 50}, true)} />},
];

/* ------------------------------------------------------------------ textos, placas y transiciones */
const Overlays: React.FC<{t: number}> = ({t}) => {
  const out = (k: string, p: string, d = 0) => A(k, p) + d;
  return (
    <>
      {/* s01 */}
      <Slate t={t} t0={0.7} lines={['JUAN JOSÉ CASTELLI, CHACO', '13 DE ENERO DE 2011 · PASADAS LAS 7']} out={A('s01', 'adentro') - 0.6} />
      <NameCard t={t} t0={A('s01', 'manuel roseo')} name="Manuel Roseo" role="75 años · dueño de La Fidelidad" out={A('s01', 'dormia') - 0.4} />
      <Lines t={t} x={110} y={150} items={[{text: 'Cama de hierro oxidada', at: A('s01', 'cama')}, {text: 'Jeep tapado con arpillera', at: A('s01', 'jeep')}]} out={A('s01', 'y era') - 0.3} />
      <BigNumber t={t} t0={A('s01', '250000')} to={250000} unit="ha" label="de monte" out={A('s01', 'un campo') - 0.25} y={360} />
      <Tag t={t} t0={A('s01', 'un campo')} text="Misma escala" out={A('s01', 'uno de los hombres') - 0.3} />
      <Lines t={t} x={110} y={760} items={[{text: 'Cambió de nombre', at: A('s01', 'nombre')}, {text: 'de país', at: A('s01', 'pais')}, {text: 'y de cara', at: A('s01', 'cara'), red: true}]} out={A('s01', 'sus amigos') - 0.3} size={34} />
      <BigWord t={t} t0={A('s01', 'el gusano')} text="EL GUSANO" out={A('s01', 'la prensa') - 0.2} size={150} y={800} />
      <Glitch t={t} t0={A('s01', 'cara') - 0.1} d={0.5} seed={2} />
      <Glitch t={t} t0={A('s01', 'mil caras') - 0.1} d={0.6} seed={5} />
      <TitleCard t={t} t0={E('s01', 'caras') + 0.5} dur={S('s02') - 2.1 - E('s01', 'caras') - 0.5} />
      <Flash t={t} tc={E('s01', 'caras') + 0.45} k={0.55} />
      <Chapter t={t} t0={S('s02') - 2.0} n="I" title="EL GUSANO" sub="Posadas · Asunción" dur={2.3} />
      {/* s02 */}
      <BigWord t={t} t0={A('s02', '1959')} text="1959" out={A('s02', 'en una de las familias') - 0.3} size={120} y={760} color={K.ember} />
      <Lines t={t} x={110} y={170} items={[{text: 'Padre diputado', at: A('s02', 'diputado')}, {text: 'Presidente del Banco de Misiones', at: A('s02', 'presidente')}, {text: 'Una gran empresa de yerba mate', at: A('s02', 'una gran empresa')}]} out={A('s02', 'tan grande') - 0.3} />
      <BigWord t={t} t0={A('s02', 'el nino raul')} text="EL NIÑO RAÚL" out={A('s02', 'despues') - 0.1} size={120} y={820} color={K.ash} />
      <BigWord t={t} t0={A('s02', 'el gusano')} text="EL GUSANO" out={A('s02', 'era muy alto') - 0.15} size={140} y={800} />
      <Glitch t={t} t0={A('s02', 'el gusano') - 0.15} d={0.45} seed={8} />
      <Lines t={t} x={1180} y={420} items={[{text: 'Muy alto', at: A('s02', 'muy alto')}, {text: 'Muy flaco', at: A('s02', 'muy flaco')}]} out={A('s02', 'y cuando') - 0.2} />
      <Stutter t={t} t0={A('s02', 'tartamudeaba') - 0.6} word="TARTAMUDEABA" out={A('s02', 'en 1982') - 0.3} />
      <Paper t={t} t0={A('s02', 'en 1982')} x={560} y={150} w={800} h={560} rot={-1.2} head="QUIEBRA · 1982" lines={[{text: 'Empresa de yerba mate de la familia Menocchio', at: A('s02', 'la empresa')}, {text: 'Denuncia de fraude', at: A('s02', 'denuncia'), red: true, big: true}]} o={1 - prog(t, A('s02', 'y los menocchio') - 0.4, 0.4)} />
      <Stamp t={t} t0={A('s02', 'quebro')} text="QUIEBRA" x={1320} y={620} rot={-9} size={78} out={A('s02', 'y los menocchio') - 0.4} />
      {/* s03 */}
      <Slate t={t} t0={S('s03') + 0.1} lines={['ASUNCIÓN, PARAGUAY']} out={A('s03', 'y acumula') - 0.2} />
      <Lines t={t} x={110} y={760} items={[{text: 'Televisión por cable', at: A('s03', 'television')}, {text: 'Seguridad privada', at: A('s03', 'seguridad')}]} out={A('s03', 'y acumula') - 0.1} />
      <Stamp t={t} t0={A('s03', 'denuncias') - 0.1} text="DENUNCIA" x={700} y={420} rot={-8} size={80} out={A('s03', 'la noche') - 0.2} />
      <Stamp t={t} t0={A('s03', 'denuncias') + 0.25} text="DENUNCIA" x={1080} y={560} rot={5} size={80} out={A('s03', 'la noche') - 0.2} />
      <Stamp t={t} t0={A('s03', 'denuncias') + 0.55} text="DENUNCIA" x={860} y={700} rot={-3} size={80} out={A('s03', 'la noche') - 0.2} />
      <Slate t={t} t0={A('s03', 'la noche')} lines={['15 DE AGOSTO DE 2004', 'NOCHE']} out={A('s03', 'el puerto madero') - 0.3} />
      <Neon t={t} t0={A('s03', 'el puerto madero')} text="PUERTO MADERO" sub="BOLICHE · ASUNCIÓN" out={A('s03', 'con su dueno') + 0.6} />
      <NameCard t={t} t0={A('s03', 'eduardo maciel')} name="Eduardo Maciel" role="dueño del boliche" x={180} y={720} out={A('s03', 'a la madrugada') - 0.3} />
      <NameCard t={t} t0={A('s03', 'graciela mendez')} name="Graciela Méndez" role="19 años" x={1100} y={720} out={A('s03', 'a la madrugada') - 0.3} />
      <Slate t={t} t0={A('s03', 'a la madrugada')} lines={['ESA MADRUGADA']} out={A('s03', 'es la ultima') + 0.4} />
      <BigWord t={t} t0={A('s03', 'es la ultima') + 0.2} text="LA ÚLTIMA VEZ QUE LOS VEN CON VIDA" size={64} y={860} spacing={3} out={A('s03', 'once dias') - 0.3} />
      <BigWord t={t} t0={A('s03', 'once dias')} text="+11 DÍAS" size={110} y={120} color={K.ember} out={A('s03', 'en una laguna') + 0.5} />
      <Slate t={t} t0={A('s03', 'en una laguna')} lines={['FERNANDO DE LA MORA, PARAGUAY', 'UNA LAGUNA · AGOSTO DE 2004']} out={A('s03', 'adentro') - 0.3} />
      <BigNumber t={t} t0={A('s03', '200 litros')} to={200} unit="litros" label="dos tambores · sellados con cemento" x={1050} y={640} size={150} align="left" out={A('s03', 'adentro') - 0.3} />
      <BigWord t={t} t0={A('s03', 'adentro') + 0.3} text="EDUARDO MACIEL · GRACIELA MÉNDEZ" size={52} y={500} color={K.ash} spacing={6} out={A('s03', 'para la policia') - 0.4} />
      <Stamp t={t} t0={A('s03', 'principal sospechoso')} text="PRINCIPAL SOSPECHOSO" sub="SEGÚN LA POLICÍA PARAGUAYA" x={1590} y={330} rot={-6} size={58} out={A('s03', 'el siempre') - 0.2} />
      <Tag t={t} t0={A('s03', 'el siempre')} text="Su versión" out={A('s03', 'nunca lo') - 0.1} />
      <BigWord t={t} t0={A('s03', 'el siempre') + 0.3} text="Los dejó cerca de un hotel." font={F.serif} size={96} spacing={0} y={430} out={A('s03', 'nunca lo') - 0.1} />
      <Stamp t={t} t0={A('s03', 'juzgaron')} text="NUNCA FUE JUZGADO" x={960} y={540} rot={-6} size={96} out={A('s03', 'cuando allanaron') - 0.2} />
      <BigWord t={t} t0={A('s03', 'ya se habia') + 0.3} text="YA NO ESTABA" size={110} y={800} color={K.blood} out={S('s04') - 2.6} />
      <Glitch t={t} t0={A('s03', 'ya se habia') + 0.1} d={0.5} seed={11} />
      <Chapter t={t} t0={E('s03', 'ido') + 0.25} n="II" title="HUGO JARA" sub="Clorinda · el Paraná" dur={2.2} />
      {/* s04 */}
      <Tag t={t} t0={A('s04', 'dos versiones')} text="Dos versiones" out={A('s04', 'en una balsa') - 0.2} />
      <Lines t={t} x={110} y={150} items={[{text: 'Balsa cargada de verduras', at: A('s04', 'cargada')}, {text: 'Mochila llena de dólares', at: A('s04', 'mochila')}]} out={A('s04', 'lo cierto') - 0.2} />
      <BigWord t={t} t0={A('s04', 'hugo jara')} text="HUGO JARA" size={170} y={780} out={A('s04', 'se opero') - 0.1} />
      <Glitch t={t} t0={A('s04', 'hugo jara') - 0.1} d={0.5} seed={13} />
      <Lines t={t} x={110} y={160} items={[{text: 'Se operó la cara', at: A('s04', 'se opero')}, {text: 'Se tiñó el pelo de blanco', at: A('s04', 'se tino')}, {text: 'Se quemó las huellas con ácido', at: A('s04', 'se quemo'), red: true}]} out={A('s04', 'como hugo') - 0.2} size={36} />
      <Tag t={t} t0={A('s04', 'segun conto')} text="Según un abogado que lo conocía" x={110} y={420} out={A('s04', 'como hugo') - 0.2} />
      <Tag t={t} t0={A('s04', 'se opero') + 0.2} text="Según su propio relato" x={1360} y={110} out={A('s04', 'segun conto') - 0.1} color={K.steel} />
      <NameCard t={t} t0={A('s04', 'claudio nozzi')} name="Claudio Nozzi" role="productor de cine y televisión" out={A('s04', 'le hablaba') - 0.2} />
      <BigNumber t={t} t0={A('s04', '10 millones')} to={10000000} pre="US$" label="una película" out={A('s04', 'vivia') - 0.2} />
      <Slate t={t} t0={A('s04', 'navegaba')} lines={['RÍO PARANÁ']} out={A('s05', 'y paran') - 0.3} />
      <Slate t={t} t0={S('s05')} lines={['MARZO DE 2005']} y={136} out={A('s05', 'y paran') - 0.3} />
      {/* s05 */}
      <BigWord t={t} t0={A('s05', 'trasulag')} text="TRASULAG II" size={90} y={150} spacing={10} out={A('s05', 'y paran') - 0.2} />
      <Slate t={t} t0={A('s05', 'en corrientes')} lines={['CORRIENTES', 'HOTEL DE TURISMO']} out={A('s05', 'despues') - 0.2} />
      <Slate t={t} t0={A('s05', 'cerca de itati')} lines={['ITATÍ, CORRIENTES']} out={A('s05', 'a los pocos') - 0.2} />
      <Strike t={t} t0={A('s05', 'claudio nozzi')} text="CLAUDIO NOZZI" strikeAt={A('s05', 'desaparece') + 0.2} y={780} size={110} out={A('s05', 'a los pocos') - 0.2} />
      <Lines t={t} x={110} y={150} items={[{text: 'Atado con cadenas', at: A('s05', 'atado')}, {text: 'A dos anclas viejas', at: A('s05', 'a dos anclas')}]} out={A('s05', 'era nozzi') - 0.2} />
      <BigWord t={t} t0={A('s05', 'era nozzi') + 0.1} text="CLAUDIO NOZZI" size={90} y={470} color={K.bone} spacing={10} out={A('s05', 'la prefectura') - 0.4} />
      <Stamp t={t} t0={A('s05', 'detiene')} text="DETENIDO" x={1400} y={260} rot={-8} size={84} out={A('s05', 'pero el nombre') - 0.2} />
      <BigWord t={t} t0={A('s05', 'hugo jara')} text="«HUGO JARA»" size={110} y={780} out={A('s05', 'pero el nombre') - 0.2} />
      <Strike t={t} t0={A('s05', 'pero el nombre')} text="HUGO JARA" strikeAt={A('s05', 'se cae') - 0.1} y={170} size={110} out={A('s05', 'es luis') + 0.1} />
      <BigWord t={t} t0={A('s05', 'es luis')} text="LUIS RAÚL MENOCCHIO" size={110} y={780} out={A('s05', 'paraguay pide') - 0.2} />
      <Stamp t={t} t0={A('s05', 'interpol')} text="BUSCADO POR INTERPOL" x={960} y={180} rot={-5} size={64} out={A('s05', 'paraguay pide') - 0.2} />
      <Glitch t={t} t0={A('s05', 'se cae') - 0.1} d={0.6} seed={17} />
      <YearRoll t={t} t0={A('s05', 'en mayo')} from={2005} to={2009} dur={1.6} label="CUATRO AÑOS PRESO SIN CONDENA" y={300} out={A('s05', 'y se va') - 0.3} />
      <Stamp t={t} t0={A('s05', 'libertad')} text="LIBRE" x={1480} y={760} rot={-10} size={110} color={K.ember} out={A('s05', 'y se va') - 0.2} />
      <Slate t={t} t0={A('s05', 'al hotel')} lines={['HOTEL DE TURISMO', 'CORRIENTES · 2009']} out={S('s06') - 3.0} />
      <Chapter t={t} t0={E('s05', 'corrientes', 1) + 0.3} n="III" title="LA FIDELIDAD" sub="Manuel Roseo y el monte" dur={2.5} />
      {/* s06 */}
      <NameCard t={t} t0={A('s06', 'manuel roseo')} name="Manuel Roseo" role="Roma, 1935 · llegó a los 21 años" y={860} out={A('s06', 'a principios') - 0.2} />
      <Paper t={t} t0={A('s06', 'a principios') + 0.1} x={1120} y={170} w={620} h={420} rot={1.8} head="LA FIDELIDAD" lines={[{text: 'Principios de los 70', at: A('s06', 'los 70')}, {text: 'Manuel y Luis Roseo', at: A('s06', 'con su hermano')}]} o={1 - prog(t, A('s06', '250000') - 0.4, 0.3)} />
      <BigNumber t={t} t0={A('s06', '250000')} to={250000} unit="ha" label="La Fidelidad" out={A('s06', 'uno de los') - 0.2} y={340} />
      <Lines t={t} x={110} y={140} items={[{text: 'Uno de los últimos montes intactos del Gran Chaco', at: A('s06', 'uno de los')}, {text: 'Partido al medio por el río Bermejo', at: A('s06', 'partidas')}]} out={A('s06', 'mientras') - 0.2} size={34} />
      <Lines t={t} x={110} y={140} items={[{text: 'Al este: desmonte y cultivos', at: A('s06', 'se convertia'), red: true}, {text: 'La Fidelidad: casi intacta', at: A('s06', 'los roseo')}]} out={A('s06', 'y manuel') - 0.2} size={34} />
      <Quote t={t} t0={A('s06', 'yo como')} text="Yo, como no tengo hijos, me puedo dar el lujo de vivir mal." who="Manuel Roseo · Diario Norte, 2000" out={A('s06', 'un campo asi') - 0.3} />
      <BigWord t={t} t0={A('s06', 'cientos')} text="CIENTOS DE MILLONES DE DÓLARES" size={74} y={170} spacing={3} out={A('s06', 'y su dueno') - 0.2} />
      <Lines t={t} x={110} y={640} items={[{text: '75 años', at: A('s06', '75'), big: true}, {text: 'Ningún hijo con su apellido', at: A('s06', 'ningun hijo')}, {text: 'Ninguna custodia', at: A('s06', 'ninguna custodia'), red: true}]} size={40} out={S('s07') - 1.8} />
      <Chapter t={t} t0={E('s06', 'custodia') + 0.15} n="IV" title="CALLE ESPAÑA" sub="Castelli, enero de 2011" dur={2.1} />
      {/* s07 */}
      <Paper t={t} t0={S('s07') + 0.7} x={360} y={130} w={760} h={820} rot={-1.6} head="BOLETO DE COMPRAVENTA" lines={[{text: 'Vendedor: Manuel Roseo', at: A('s07', 'le inicio')}, {text: 'Juicio en Santa Fe · 2010', at: A('s07', 'en santa fe')}, {text: '\nFirma: _______________', at: A('s07', 'con un boleto'), big: true}]} o={1 - prog(t, A('s07', 'en diciembre') - 0.3, 0.3)} />
      <NameCard t={t} t0={A('s07', 'claudio gomez')} name="Claudio Gómez" role="vendedor de autos usados" x={1200} y={300} out={A('s07', 'en diciembre') - 0.3} />
      <Stamp t={t} t0={A('s07', 'nego')} text="FIRMA NEGADA" x={760} y={760} rot={-9} size={80} out={A('s07', 'en diciembre') - 0.3} />
      <BigNumber t={t} t0={A('s07', '40 millones')} to={40000000} pre="US$" label="lo que Menocchio dice que pagó" out={A('s07', 'el 6 de enero') - 0.2} />
      <Stamp t={t} t0={A('s07', 'probar')} text="NUNCA SE PROBÓ" x={960} y={760} rot={-6} size={90} out={A('s07', 'el 6 de enero') - 0.2} />
      <Polaroid t={t} t0={A('s07', 'el 6 de enero')} file="castelli_plaza.jpg" caption="Castelli · 6/1/2011" flashAt={A('s07', 'foto')} rot={-4} out={A('s07', 'siete dias') - 0.25} />
      <PhotoCredit file="castelli_plaza.jpg" o={fioP(t, A('s07', 'el 6 de enero'), A('s07', 'siete dias'))} extra="Ilustración: no es la foto de la visita" />
      <Flash t={t} tc={A('s07', 'foto')} k={0.9} color="rgba(255,255,255,1)" />
      <BigWord t={t} t0={A('s07', 'siete dias')} text="+7 DÍAS" size={110} y={110} color={K.ember} out={A('s07', 'la casa') + 0.6} />
      <Slate t={t} t0={A('s07', 'calle espana')} lines={['CALLE ESPAÑA 365', 'JUAN JOSÉ CASTELLI']} out={A('s07', 'roseo y su') - 0.3} />
      <NameCard t={t} t0={A('s07', 'roseo y su')} name="Manuel Roseo" role="75 años" x={200} y={380} out={A('s07', 'buscaban') - 0.3} />
      <NameCard t={t} t0={A('s07', 'nelida')} name="Nélida Bartolomé" role="73 años · maestra jubilada" x={1020} y={380} out={A('s07', 'buscaban') - 0.3} />
      <BigWord t={t} t0={A('s07', 'durante')} text="MÁS DE UNA HORA" size={90} y={760} color={K.blood} spacing={6} out={A('s07', 'buscaban') - 0.3} />
      <Lines t={t} align="center" x={0} w={1920} y={300} items={[{text: 'Una firma', at: A('s07', 'una firma'), big: true}, {text: 'Una huella', at: A('s07', 'una huella'), big: true}, {text: 'Las escrituras', at: A('s07', 'el lugar'), big: true, red: true}]} size={56} out={A('s07', 'los dos murieron') - 0.3} />
      <BigWord t={t} t0={A('s07', 'asfixiados') + 0.2} text="MANUEL ROSEO · NÉLIDA BARTOLOMÉ" size={50} y={500} color={K.ash} spacing={6} out={A('s07', 'despues los') - 0.3} />
      <Lines t={t} x={110} y={150} items={[{text: 'Limpiaron con solvente', at: A('s07', 'limpiaron')}, {text: 'Simularon un robo', at: A('s07', 'simularon'), red: true}]} out={S('s08') - 0.1} />
      {/* s08 */}
      <BigWord t={t} t0={A('s08', 'un error')} text="UN ERROR" size={130} y={140} color={K.blood} out={A('s08', 'un empleado') + 0.4} />
      <NameCard t={t} t0={A('s08', 'sergio berg')} name="Sergio Berg" role="empleado de Roseo · testigo" out={A('s08', 'lo golpearon') - 0.2} />
      <Quote t={t} t0={A('s08', 'tenemos')} text="Tenemos que hacer desaparecer a este." who="Lo que escuchó Sergio Berg" align="center" x={160} w={1600} y={330} out={A('s08', 'lo dejaron') - 0.2} />
      <BigWord t={t} t0={A('s08', 'sobrevivio')} text="SOBREVIVIÓ" size={190} y={400} out={A('s08', 'habia escuchado') - 0.3} />
      <BigWord t={t} t0={A('s08', 'raul')} text="«RAÚL»" size={190} y={250} out={A('s08', 'y una forma') - 0.1} />
      <Stutter t={t} t0={A('s08', 'tartamudeo') - 0.5} word="TARTAMUDEO" out={A('s08', 'once dias') - 0.3} />
      <Slate t={t} t0={A('s08', 'once dias')} lines={['CORRIENTES', '24 DE ENERO DE 2011']} out={A('s08', 'dijo que') - 0.2} />
      <Stamp t={t} t0={A('s08', 'encontro')} text="DETENIDO" x={1420} y={300} rot={-8} size={90} out={A('s08', 'dijo que') + 0.2} />
      <BigWord t={t} t0={A('s08', 'dijo que') + 0.2} text="DE VACACIONES" sub="Su explicación" size={110} y={760} out={S('s09') - 2.6} />
      <Chapter t={t} t0={E('s08', 'vacaciones') + 0.35} n="V" title="DOS PERPETUAS" sub="Corrientes, 2012 · Sáenz Peña, 2013" dur={2.2} />
      {/* s09 */}
      <Paper t={t} t0={S('s09') + 0.1} x={150} y={150} w={760} h={700} rot={-1.4} head="TRIBUNAL ORAL EN LO CRIMINAL N.º 1 · CORRIENTES" lines={[{text: '30 de mayo de 2012', at: A('s09', 'en mayo')}, {text: 'Víctima: Claudio Nozzi', at: A('s09', 'por el asesinato')}, {text: 'PRISIÓN PERPETUA', at: A('s09', 'prision'), big: true, red: true}]} out={A('s09', 'menocchio nego') - 0.4} />
      <Paper t={t} t0={A('s09', 'en octubre')} x={1010} y={170} w={760} h={700} rot={1.4} head="CÁMARA SEGUNDA EN LO CRIMINAL · SÁENZ PEÑA" lines={[{text: '7 de octubre de 2013', at: A('s09', 'en octubre') + 0.3}, {text: 'Víctimas: Manuel Roseo y Nélida Bartolomé', at: A('s09', 'por los crimenes')}, {text: 'También condenados: Claudio Gómez y Salvador Borda', at: A('s09', 'junto con')}, {text: 'PRISIÓN PERPETUA', at: A('s09', 'la segunda'), big: true, red: true}]} out={A('s09', 'menocchio nego') - 0.4} />
      <Stamp t={t} t0={A('s09', 'perpetua') + 0.1} text="PERPETUA" x={640} y={760} rot={-10} size={84} out={A('s09', 'menocchio nego') - 0.2} />
      <Stamp t={t} t0={A('s09', 'perpetua', 1) + 0.1} text="PERPETUA" x={1500} y={780} rot={7} size={84} out={A('s09', 'menocchio nego') - 0.2} />
      <Tag t={t} t0={A('s09', 'menocchio nego')} text="Su versión" out={A('s09', 'era mi') - 0.2} />
      <Lines t={t} x={110} y={200} items={[{text: 'Compró el campo de verdad', at: A('s09', 'dice que compro')}, {text: 'Lo eligieron por su pasado', at: A('s09', 'que lo eligieron')}, {text: 'A Nozzi no lo mató', at: A('s09', 'y que a nozzi')}]} out={A('s09', 'era mi') - 0.2} size={38} />
      <Quote t={t} t0={A('s09', 'era mi')} text="Era mi amigo." who="Menocchio, sobre Claudio Nozzi" x={110} y={360} w={1000} out={S('s10') - 2.8} />
      <Chapter t={t} t0={E('s09', 'repite') + 0.3} n="VI" title="EL IMPENETRABLE" sub="De campo en disputa a parque nacional" dur={2.4} />
      {/* s10 */}
      <Stamp t={t} t0={A('s10', 'expropiar')} text="EXPROPIACIÓN" sub="GOBIERNO DEL CHACO · 2013" x={960} y={540} rot={-6} size={96} out={A('s10', 'y el ambientalista') - 0.2} />
      <NameCard t={t} t0={A('s10', 'douglas')} name="Douglas Tompkins" role="ambientalista estadounidense · 1943-2015" out={A('s10', 'en 2014') - 0.2} />
      <Slate t={t} t0={A('s10', 'una ley')} lines={['LEY 26.996 · 2014', 'PARQUE NACIONAL EL IMPENETRABLE']} out={A('s10', 'en 2019') - 0.3} />
      <BigNumber t={t} t0={A('s10', '128000')} to={128000} unit="ha" label="de monte nativo sobre el Bermejo" y={720} out={A('s10', 'en 2019') - 0.3} />
      <NameCard t={t} t0={A('s10', 'qaramta')} name="Qaramta" role="yaguareté silvestre · 2019" out={A('s10', 'el campo por') - 0.2} color={K.ember} />
      <Tag t={t} t0={A('s10', 'en 2019') + 0.3} text="Imagen ilustrativa: yaguareté en el Pantanal (Brasil)" out={A('s10', 'el campo por') - 0.2} color={K.ash} />
      <BigWord t={t} t0={A('s10', 'santuario')} text="UN SANTUARIO" size={120} y={780} out={A('s10', 'y la pelea') - 0.1} />
      <Lines t={t} x={110} y={760} items={[{text: 'La herencia, todavía en la Justicia', at: A('s10', 'y la pelea')}]} out={S('s11') - 2.9} />
      <Chapter t={t} t0={E('s10', 'justicia') + 0.3} n="VII" title="LAS MIL CARAS" sub="Rawson · Ezeiza" dur={2.4} />
      {/* s11 */}
      <BigWord t={t} t0={A('s11', 'mil caras')} text="¿Y EL HOMBRE DE LAS MIL CARAS?" size={80} y={860} spacing={3} out={A('s11', 'en 2014') - 0.2} />
      <Tag t={t} t0={A('s11', 'despues de un')} text="Tras un intento de fuga" out={A('s11', 'ahi paso') - 0.3} />
      <BigWord t={t} t0={A('s11', 'doce anos')} text="12 AÑOS" size={150} y={360} out={A('s11', 'en agosto') - 0.2} />
      <Slate t={t} t0={A('s11', 'en agosto')} lines={['AGOSTO DE 2026', 'SEGÚN EL GOBIERNO DEL CHUBUT']} out={A('s11', 'el lo niega') - 0.3} />
      <Lines t={t} x={110} y={760} items={[{text: 'Una red narco manejada desde su celda', at: A('s11', 'red narco')}]} out={A('s11', 'hubo') - 0.1} size={36} />
      <BigNumber t={t} t0={A('s11', '40')} to={40} label="allanamientos" x={300} y={640} size={170} align="left" out={A('s11', 'el lo niega') - 0.2} />
      <BigNumber t={t} t0={A('s11', '17')} to={17} label="detenidos · familiares entre ellos" x={980} y={640} size={170} align="left" out={A('s11', 'el lo niega') - 0.2} />
      <BigWord t={t} t0={A('s11', 'el lo niega')} text="ÉL LO NIEGA" size={140} y={420} color={K.steel} out={A('s11', 'un fin de semana') - 0.1} />
      <Tag t={t} t0={A('s11', 'y su abogado')} text="Según su abogado" out={A('s11', 'luis raul') - 0.4} />
      <BigWord t={t} t0={A('s11', 'netflix')} text="NETFLIX QUIERE CONTAR SU VIDA" size={80} y={420} spacing={3} out={A('s11', 'luis raul') - 0.4} />
      <Stamp t={t} t0={A('s11', 'no lo confirmo')} text="NO CONFIRMADO" sub="NETFLIX NO LO CONFIRMÓ" x={960} y={760} rot={-5} size={84} out={A('s11', 'luis raul') - 0.4} />
      <Lines t={t} x={110} y={560} w={540} items={[{text: '2 perpetuas', at: A('s11', 'tiene dos'), red: true}, {text: '3 asesinatos', at: A('s11', 'tres asesinatos'), red: true}, {text: 'Paraguay todavía', at: A('s11', 'y paraguay')}, {text: 'lo busca por otros 2', at: A('s11', 'y paraguay') + 0.5}]} out={A('s11', 'y el campo') - 0.2} size={34} />
      {/* final */}
      <EndCard t={t} t0={L.TL.end + 0.4} />
    </>
  );
};
/** opacidad de un elemento entre a y b */
function fioP(t: number, a: number, b: number) { return Math.min(prog(t, a, 0.4), 1 - prog(t, b - 0.4, 0.4)); }

const EndCard: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  if (t < t0) return null;
  const o = prog(t, t0, 0.8) * (1 - prog(t, L.TOTAL - 1.2, 1.0));
  return (
    <AbsoluteFill style={{background: `rgba(4,5,6,${0.82 * prog(t, t0, 1.2)})`, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: o}}>
      <Logo t={t} t0={t0 + 0.3} size={150} />
      <div style={{fontFamily: F.title, fontSize: 64, letterSpacing: 18, color: K.bone, marginTop: 26, opacity: prog(t, t0 + 0.6, 0.6)}}>CONTEXTO</div>
      <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: 5, color: K.ash, marginTop: 36, opacity: prog(t, t0 + 1.2, 0.6), textAlign: 'center', lineHeight: 1.8}}>
        FUENTES Y CRÉDITOS DE CADA IMAGEN EN LA DESCRIPCIÓN<br />IMAGEN SATELITAL: COPERNICUS SENTINEL-2 (2026) · MAPAS: NATURAL EARTH, OPENSTREETMAP
      </div>
    </AbsoluteFill>
  );
};

/** ventanas en las que el crédito satelital tiene que verse (planos de Tierra) */
export const Doc: React.FC = () => {
  const ok = useAssets15();
  const f = useCurrentFrame();
  const t = f / L.TL.fps;
  if (!ok) return null;
  const nodes: React.ReactNode[] = [];
  SHOTS.forEach((s, i) => {
    const end = i + 1 < SHOTS.length ? SHOTS[i + 1].a : L.TOTAL + 1;
    const start = s.a - (s.fi ?? 0);
    if (t < start || t >= end) return;
    const o = s.fi ? easeInOut(clamp((t - start) / s.fi)) : 1;
    nodes.push(<AbsoluteFill key={i} style={{opacity: o}}>{s.el(t)}</AbsoluteFill>);
  });
  const cur = SHOTS.reduce((k, s, i) => (t >= s.a ? i : k), 0);
  const satO = SHOTS[cur].sat ? Math.min(1, (t - SHOTS[cur].a) / 0.5) : 0;
  const bug = t > S('s02') && t < L.TL.end - 0.5 ? Math.min(1, (t - S('s02')) / 0.6, (L.TL.end - 0.5 - t) / 0.4) : 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Filters />
      {nodes}
      <FilmLook t={t} bars={0} />
      <Overlays t={t} />
      {satO > 0 ? <div style={{opacity: satO}}><Credit text={SAT_CREDIT} side="left" /></div> : null}
      <Bug o={bug} />
    </AbsoluteFill>
  );
};
