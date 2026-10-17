/* Escenas 5 a 9 del episodio 14 (CAMPO DEL CIELO): el otro bloque y las pistolas (1803-1825), los gigantes del siglo
   XX y la grúa de 1990, la ley, la muestra de arte, la venta ilegal y Gancedo, la búsqueda, y el cierre con la pregunta.
   t = segundos desde el inicio del segmento. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {cue, cueE, ins, insEnd, T_ALG, T_CAMION, T_GIG, TL} from './lib';
import {
  K, F, ar, fr, fell, jm, clamp, easeIn, easeInOut, easeOut, fadeIO, mix, pop, prog, rnd,
  NightSky, Parchment, Vignette, Kicker14, Title14, Quote14, YearRoll, Stat14, NameCard14, Stamp14, OldSheet, InkLines,
  SearchHUD, YearRibbon, Photo14, Plate14, Credit14, Source14, FilmLook, Poll14, Odo14,
} from './kit14';
import {CraneTruck, PoliceCar, Truck, FlintlockPistol, MonteBackdrop} from './art14';
import {LogoMark} from '../ep04/kit';
import {SlabShot, Streak, BuriedSection, WorldArc, Listings} from './shots14';
import {Map14, PT, viewPath, smoothRoute, craterField, searchTrack, type View} from './map14';
import {IronMass, BLOQUE, ContactShadow, camPath, type Cam} from './three14';
import geo from '../data/ep14/geo.json';

type P = {t: number};

/* ================================================================== S05 · 1803-1825 */
export const S05: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s05', p, n);
  const tEn = c('En mil ochocientos'), tEnc = c('encuentra otro'), tConv = c('Convencido'), tImg = c('La imagen también'), tBloq = c('El bloque llega');
  const tForj = c('Y con ese hierro'), tSeg = c('Según las crónicas'), tHoy = c('Hoy, un museo'), tEst = c('¿Están hechas'), tNad = c('Nadie lo pudo');
  const tPed = c('Y el pedazo'), tLon = c('Hoy está en');
  const cam: Cam = camPath(t, [
    [-1, {pos: [6.4, 2.6, 8.4], look: [0, 0.2, 0], fov: 38}],
    [0.2, {pos: [5.8, 1.6, 6.2], look: [3.2, 0.3, -2.2], fov: 36}],
    [tEnc, {pos: [5.6, 1.2, 1.4], look: [3.4, 0.35, -2.4], fov: 32}],
  ], 2.4);
  const v: View = viewPath(t, [
    [0, {lon: -62.4, lat: -30.4, scale: 4600}],
    [tBloq, {lon: -61.0, lat: -31.0, scale: 4300}],
  ], 1.6);
  const R_BA = smoothRoute([[-62.9, -27.7], [-62.0, -29.4], PT['Santa Fe'], [-59.7, -33.1], PT['Buenos Aires']], 0.15, 5);
  return (
    <AbsoluteFill style={{background: K.void}}>
      {t < tConv + 0.3 ? (
        <SlabShot
          t={t} cam={cam} mood="night" slabO={1 - prog(t, tEnc - 0.4, 0.8)} grass={0.7}
          extra={<group><ContactShadow w={2.4} d={2.0} pos={[3.4, 0.02, -2.4]} o={prog(t, 0.4, 0.8)} /><IronMass shape={BLOQUE} pos={[3.4, 0.36, -2.4]} rot={[0.1, 1.1, 0.05]} o={prog(t, 0.4, 0.8)} /></group>}
        />
      ) : null}
      <YearRoll t={t} t0={tEn - 0.1} t1={tEnc + 0.4} text="1803" x={160} y={300} size={210} align="left" />
      <YearRibbon t={t} t0={tEn - 0.2} t1={tConv} year={1803} from={1783} dur={1.2} />
      <NameCard14 t={t} t0={c('un militar') - 0.1} t1={tConv} name="Diego Bravo de Rueda" role="Militar de Santiago del Estero" x={130} y={760} />
      <Stat14 t={t} t0={tEnc + 0.6} t1={tConv + 0.2} x={1250} y={300} value={1000} label="Otro bloque" suffix="kg" size={160} />
      {/* la imagen del apóstol, hecha con ese hierro, que se pierde */}
      {t > tConv - 0.4 && t < tBloq + 0.2 ? (
        <AbsoluteFill style={{opacity: prog(t, tConv - 0.4, 0.5) * (1 - prog(t, tBloq - 0.2, 0.4))}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 70% at 50% 50%, #241A12 0%, #050403 100%)'}} />
          {/* «convencido de que había caído del cielo»: el bólido cae donde después aparece la imagen */}
          <Streak t={t} t0={tConv - 0.05} dur={1.6} x0={260} y0={40} x1={960} y1={420} w={1.2} flash />
          <SaintFigure t={t} t0={c('manda hacer')} lost={prog(t, tImg + 0.3, 1.6)} />
          <Kicker14 t={t} t0={c('una imagen')} text="Una imagen del apóstol Santiago" x={130} y={150} />
          <div style={{position: 'absolute', left: 134, top: 196, ...fr(30, 380, K.mute, 72, 50), fontStyle: 'italic', opacity: prog(t, c('una imagen') + 0.4, 0.5)}}>hecha con el hierro del bloque</div>
          <Stamp14 t={t} t0={tImg + 0.5} text="SE PERDIÓ" sub="DESPUÉS DE 1871" x={1400} y={760} size={64} dark color={K.ember} />
          <Source14 t={t} t0={tImg + 0.6} text="Faivovich y Goldberg, «Una guía a Campo del Cielo»" />
        </AbsoluteFill>
      ) : null}
      {/* el bloque viaja a Buenos Aires */}
      {t > tBloq - 0.4 && t < tForj + 0.3 ? (
        <AbsoluteFill style={{opacity: prog(t, tBloq - 0.4, 0.5) * (1 - prog(t, tForj, 0.4))}}>
          <Parchment>
            <Map14
              t={t} view={v} style="old" provO={0.15} gridO={0.7}
              routes={[{pts: R_BA, p: prog(t, tBloq, 2.0, easeInOut)}]}
              marks={[{at: PT['Buenos Aires'], label: 'Fábrica de armas de Buenos Aires', o: prog(t, tBloq + 1.6, 0.5), kind: 'town', size: 1.2}, {at: [-62.9, -27.7], o: prog(t, tBloq - 0.2, 0.4), kind: 'iron', size: 1.4}]}
            />
          </Parchment>
        </AbsoluteFill>
      ) : null}
      {/* la forja: fusiles y pistolas */}
      {t > tForj - 0.4 && t < tSeg + 0.3 ? (
        <AbsoluteFill style={{opacity: prog(t, tForj - 0.4, 0.4) * (1 - prog(t, tSeg, 0.4))}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 60% at 50% 60%, #3A1A08 0%, #0A0503 100%)'}} />
          <Sparks t={t} t0={tForj} />
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            <FlintlockPistol x={900} y={560} s={1.7} p={prog(t, tForj + 0.3, 2.2, easeInOut)} color={K.glow} />
          </svg>
          <Kicker14 t={t} t0={tForj + 0.2} text="Fusiles y pistolas" x={130} y={150} color={K.ember} />
        </AbsoluteFill>
      ) : null}
      {/* Madison */}
      {t > tSeg - 0.4 && t < tPed + 0.3 ? (
        <AbsoluteFill style={{opacity: prog(t, tSeg - 0.4, 0.4) * (1 - prog(t, tPed - 0.2, 0.5))}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 40% 45%, #141B2B 0%, #04060C 100%)'}} />
          <Plate14 src="ep14/img/madison.jpg" t={t} t0={tSeg} t1={tHoy - 0.1} x={600} y={500} w={520} h={640} caption="James Madison" note="Presidente de Estados Unidos (1809-1817)" credit="Gilbert Stuart, c. 1821 · National Gallery of Art · CC0" focus="50% 30%" />
          <Kicker14 t={t} t0={tSeg} t1={tHoy - 0.1} text="Según las crónicas" x={1060} y={260} />
          <Title14 t={t} t0={c('un par viaja')} t1={tHoy - 0.1} text="Un par, de regalo" size={86} x={1060} y={360} align="left" italic w0={260} w1={480} />
          {/* el museo de Virginia */}
          {t > tHoy - 0.3 ? (
            <AbsoluteFill style={{opacity: prog(t, tHoy - 0.3, 0.4)}}>
              <Plate14 src="ep14/img/pistolas_met.jpg" t={t} t0={tHoy} x={640} y={470} w={860} h={540} caption="Pistola de chispa de la época" note="Imagen ilustrativa · no es la del museo" credit="The Metropolitan Museum of Art · CC0" focus="40% 50%" zoom={[1.05, 1.15]} />
              <MuseumCard t={t} t0={tHoy + 0.6} />
              {t > tEst - 0.2 ? <div style={{position: 'absolute', left: 640, top: 470, transform: `translate(-50%,-50%) scale(${pop(t, tEst, 1.2)})`, ...fr(420, 560, K.ember, 144, 0), lineHeight: 1, opacity: 0.9 * (1 - prog(t, tPed - 0.4, 0.4)), textShadow: '0 10px 60px rgba(0,0,0,0.7)'}}>?</div> : null}
              <Stamp14 t={t} t0={tNad + 0.55} text="SIN COMPROBAR" x={1460} y={820} size={60} rot={-7} dark color={K.red} />
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {/* el pedazo más grande: Woodbine Parish y Londres */}
      {t > tPed - 0.4 ? (
        <AbsoluteFill style={{opacity: prog(t, tPed - 0.4, 0.5)}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 45%, #171A22 0%, #050608 100%)'}} />
          <Plate14 src="ep14/img/parish.jpg" t={t} t0={tPed} t1={tLon - 0.1} x={520} y={500} w={460} h={600} caption="Woodbine Parish" note="Cónsul británico en Buenos Aires" credit="Grabado del siglo XIX · dominio público" grade="print" focus="50% 30%" />
          <Plate14 src="ep14/img/cc_nhm_dibujo.jpg" t={t} t0={tPed + 0.5} t1={tLon - 0.1} x={1250} y={500} w={620} h={640} caption="«Otumpa»: el trozo mayor" note="Más de 600 kg · donado en 1825" credit="Grabado del siglo XIX · dominio público" grade="print" focus="50% 45%" />
          {t > tLon - 0.3 ? <Photo14 src="ep14/img/cc_nhm_london.jpg" t={t} t0={tLon - 0.3} from={{s: 1.05, x: 0, y: 0}} to={{s: 1.16, x: 0, y: -20}} dur={4} grade="museum" dim={0.35} credit="Natural History Museum, Londres · CherryX · CC BY-SA 3.0" /> : null}
          <Title14 t={t} t0={tLon} text="Hoy está en Londres." size={100} y={880} italic w0={260} w1={520} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
/** figura del apóstol Santiago (peregrino con bordón) en hierro; se deshace en polvo con lost 0→1 */
const SaintFigure: React.FC<{t: number; t0: number; lost: number}> = ({t, t0, lost}) => {
  const p = prog(t, t0, 1.4, easeOut);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <linearGradient id="ironfig" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8E8A86" />
          <stop offset="0.5" stopColor="#4E4844" />
          <stop offset="1" stopColor="#2A2522" />
        </linearGradient>
      </defs>
      <g transform="translate(960,560)" opacity={p * (1 - lost)}>
        <ellipse cx={0} cy={-90} rx={280} ry={380} fill="rgba(255,150,70,0.14)" style={{filter: 'blur(40px)'}} />
        {/* peana */}
        <path d="M-130 300 L130 300 L110 340 L-110 340 Z" fill="#2A2522" />
        <rect x={-150} y={340} width={300} height={36} fill="#221D1A" />
        {/* túnica y capa */}
        <path d="M-58 300 C-66 200 -70 80 -52 -40 L52 -40 C70 80 66 200 58 300 Z" fill="url(#ironfig)" />
        <path d="M-60 -60 C-120 20 -128 160 -96 296 L-40 300 C-62 180 -60 60 -30 -40 Z" fill="#3E3834" />
        <path d="M60 -60 C110 10 118 150 92 296 L44 300 C60 180 58 60 30 -40 Z" fill="#46403B" />
        {/* esclavina con la vieira */}
        <path d="M-70 -60 C-40 -100 40 -100 70 -60 C50 -20 -50 -20 -70 -60 Z" fill="#5A534D" />
        <path d="M-12 -62 C-8 -78 8 -78 12 -62 C6 -54 -6 -54 -12 -62 Z" fill="#D8D0C4" opacity={0.75} />
        {/* cabeza y barba */}
        <ellipse cx={0} cy={-128} rx={30} ry={36} fill="url(#ironfig)" />
        <path d="M-24 -116 C-20 -84 20 -84 24 -116 C14 -100 -14 -100 -24 -116 Z" fill="#3A3430" />
        {/* sombrero de ala ancha */}
        <ellipse cx={0} cy={-160} rx={78} ry={14} fill="#2E2925" />
        <path d="M-34 -162 C-30 -196 30 -196 34 -162 Z" fill="#35302C" />
        {/* brazo y bordón con calabaza */}
        <path d="M44 -30 C70 -10 84 20 96 40" stroke="#4E4844" strokeWidth={22} strokeLinecap="round" fill="none" />
        <line x1={104} y1={-230} x2={112} y2={300} stroke="#5A544E" strokeWidth={9} strokeLinecap="round" />
        <ellipse cx={100} cy={-170} rx={14} ry={20} fill="#6A625A" />
      </g>
      {lost > 0
        ? Array.from({length: 120}, (_, i) => {
            const x0 = 960 + (rnd(i * 3) - 0.5) * 220, y0 = 560 + (rnd(i * 7) - 0.6) * 560;
            const a = lost * (0.6 + rnd(i * 11) * 0.8);
            return <circle key={i} cx={x0 + a * (120 + rnd(i * 13) * 260)} cy={y0 - a * (60 + rnd(i * 17) * 200)} r={2 + rnd(i) * 4} fill="#8E8A86" opacity={clamp(lost * 3) * (1 - a * 0.8)} />;
          })
        : null}
    </svg>
  );
};
/** chispas de la forja */
const Sparks: React.FC<{t: number; t0: number}> = ({t, t0}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 70}, (_, i) => {
      const burst = Math.floor(i / 14), at = t0 + 0.1 + burst * 0.58;
      const a = t - at;
      if (a < 0 || a > 1.3) return null;
      const ang = -Math.PI / 2 + (rnd(i * 3) - 0.5) * 2.2, sp = 380 + rnd(i * 7) * 520;
      const x = 960 + Math.cos(ang) * sp * a, y = 760 + Math.sin(ang) * sp * a + 600 * a * a;
      return <line key={i} x1={x} y1={y} x2={x - Math.cos(ang) * 22} y2={y - Math.sin(ang) * 22 - 18 * a} stroke="#FFC27A" strokeWidth={3} strokeLinecap="round" opacity={1 - a / 1.3} />;
    })}
  </svg>
);
/** ficha del museo (recreación tipográfica de la ficha, sin imágenes del museo) */
const MuseumCard: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const o = fadeIO(t, t0, Infinity, 0.4);
  if (o <= 0) return null;
  const p = prog(t, t0, 0.7);
  return (
    <div style={{position: 'absolute', left: 1180, top: 300, width: 600, opacity: o, transform: `translateX(${(1 - p) * 40}px)`, padding: '30px 36px', background: 'rgba(241,238,232,0.96)', boxShadow: '0 30px 70px rgba(0,0,0,0.6)'}}>
      <div style={{...ar(16, 700, K.sepia, 85, 0.24)}}>JAMES MONROE MUSEUM · FREDERICKSBURG, VIRGINIA</div>
      <div style={{...fr(42, 520, K.ink, 72, 0), marginTop: 14, lineHeight: 1.1}}>Par de pistolas de chispa</div>
      <div style={{...fr(26, 380, K.ink, 72, 50), fontStyle: 'italic', marginTop: 10}}>Regalo de Buenos Aires a James Madison, 1816</div>
      <div style={{...jm(18, K.sepia, 500, 0.06), marginTop: 18}}>N.º JM76.213</div>
      <div style={{...ar(14, 650, 'rgba(42,32,22,0.55)', 85, 0.2), marginTop: 14}}>EL MUSEO NO MENCIONA HIERRO METEÓRICO</div>
    </div>
  );
};

/* ================================================================== S06 · EL SIGLO XX Y LA GRÚA DE 1990 */
export const S06: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s06', p, n);
  const tMil = c('En mil novecientos sesenta'), tDet = c('con detectores'), tOch = c('En mil novecientos ochenta'), tLlam = c('La llaman');
  const tVein = c('Veintiuno de enero'), tPar = c('Paraje La Tota'), tPol = c('La policía'), tDetn = c('Los detenidos'), tSeis = c('Seis días');
  const tHaag = c('Haag queda'), tReb = c('En mil novecientos noventa y dos'), tCausa = c('La causa quedó');
  const v: View = viewPath(t, [
    [0, {lon: -62.6, lat: -27.5, scale: 9000}],
    [tVein + 0.6, {lon: -61.75, lat: -27.57, scale: 60000}],
  ], 1.8);
  return (
    <AbsoluteFill style={{background: K.void}}>
      {/* el suelo devuelve gigantes */}
      {t < tOch + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tOch, 0.3)}}>
          <BuriedSection
            t={t} dy={mix(0, 260, prog(t, 0.2, 2.5, easeInOut))}
            masses={[
              {x: 1180, y: 980, w: 260, h: 130, o: prog(t, 0.8, 0.8), glow: 0.6 + 0.4 * Math.sin(t * 3)},
              {x: 520, y: 1160, w: 150, h: 90, o: prog(t, 1.2, 0.8), glow: 0.5},
              {x: 1560, y: 1300, w: 120, h: 70, o: prog(t, 1.5, 0.8), glow: 0.4},
            ]}
            detector={{x: 1180, o: prog(t, tDet - 0.2, 0.5), beep: 1}}
            depth={{x: 1440, y0: 420, y1: 930, o: prog(t, c('cinco metros') - 0.2, 0.6), label: '5 m'}}
          />
          <YearRoll t={t} t0={tMil - 0.1} text="1969" x={150} y={130} size={130} align="left" mono />
          <Kicker14 t={t} t0={0.2} t1={tMil} text="El siglo XX" x={150} y={120} />
          <YearRibbon t={t} t0={0} t1={tMil + 1.5} year={1969} from={1825} dur={1.4} />
        </AbsoluteFill>
      ) : null}
      {/* la extracción y el cartel con el peso de la época */}
      {t > tOch - 0.4 && t < T_ALG + 0.8 ? (
        <AbsoluteFill style={{opacity: prog(t, tOch - 0.4, 0.4) * (1 - prog(t, T_ALG + 0.4, 0.4))}}>
          <Photo14 src="ep14/img/piguen2.jpg" t={t} t0={tOch - 0.4} from={{s: 1.05, x: 0, y: 0}} to={{s: 1.9, x: 250, y: 120}} dur={T_ALG - tOch + 0.8} grade="warm" dim={0.25} focus="40% 40%" credit="El Chaco en Campo del Cielo · Anto Giacomel · CC BY-SA 4.0" />
          <YearRoll t={t} t0={tOch} t1={tLlam + 0.3} text="1980" x={150} y={150} size={130} align="left" mono />
          <Title14 t={t} t0={tLlam} t1={T_ALG - 0.1} text="«El Chaco»" size={120} x={140} y={180} align="left" italic w0={260} w1={520} />
          <Kicker14 t={t} t0={c('según la balanza') - 0.1} t1={T_ALG - 0.1} text="Según la balanza de la época" x={146} y={290} color={K.glow} />
          <AbsoluteFill style={{background: 'rgba(120,0,0,0.35)', mixBlendMode: 'multiply', opacity: prog(t, c('alguien la quiere'), 0.5)}} />
        </AbsoluteFill>
      ) : null}
      <Title14 t={t} t0={c('Y alguien') - 0.05} t1={T_ALG + 0.85} text="Y alguien la quiere." size={110} y={540} italic w0={280} w1={540} color={K.bone} />
      {/* 21 de enero de 1990: La Tota */}
      {t > T_ALG + 0.6 && t < tPol + 0.3 ? (
        <AbsoluteFill style={{opacity: prog(t, T_ALG + 0.6, 0.4) * (1 - prog(t, tPol, 0.35))}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 50%, #0E1526 0%, #03050A 100%)'}} />
          <Map14
            t={t} view={v} style="modern" gridO={0.6} provO={0.8} riverO={0.4} border={{o: 0.9, p: prog(t, tPar + 0.5, 1.2), color: K.ember}}
            marks={[
              {at: PT['La Tota'], label: 'Paraje La Tota', o: prog(t, tPar, 0.5), kind: 'pin', pulse: 1, color: K.red},
              {at: PT.Gancedo, label: 'Gancedo', o: prog(t, tPar - 0.2, 0.5), kind: 'dot'},
            ]}
            regionLabels={[{at: [-61.93, -27.66], text: 'SANTIAGO DEL ESTERO', o: prog(t, tPar + 0.9, 0.6), size: 20}, {at: [-61.55, -27.66], text: 'CHACO', o: prog(t, tPar + 0.9, 0.6), size: 20}]}
          />
          <YearRoll t={t} t0={tVein - 0.1} text="21.01.1990" x={150} y={170} size={110} align="left" mono />
        </AbsoluteFill>
      ) : null}
      {/* la noche del camino: patrullero, grúa, camión con el meteorito */}
      {t > tPol - 0.4 && t < tSeis + 0.3 ? (
        <AbsoluteFill style={{opacity: prog(t, tPol - 0.4, 0.4) * (1 - prog(t, tSeis, 0.4))}}>
          <NightRoad t={t} t0={tPol} tCam={c('En el camión')} />
          <Kicker14 t={t} t0={c('patente de Tucumán') - 0.2} t1={tDetn} text="Grúa con patente de Tucumán" x={130} y={130} color={K.glow} />
          {t > tDetn - 0.3 ? <Detenidos t={t} t0={tDetn} c={c} /> : null}
          <FilmLook t={t} k={0.8} />
        </AbsoluteFill>
      ) : null}
      {/* vuelve a su lugar; la causa queda en nada */}
      {t > tSeis - 0.4 ? (
        <AbsoluteFill style={{opacity: prog(t, tSeis - 0.4, 0.4)}}>
          <Photo14 src="ep14/img/elchaco_n.jpg" t={t} t0={tSeis - 0.4} from={{s: 1.15, x: 0, y: -30}} to={{s: 1.28, x: -30, y: -50}} dur={10} grade="film" dim={0.35} focus="50% 40%" credit="El Chaco · Scheihing Edgardo · CC BY 2.0" />
          <YearRoll t={t} t0={tSeis + 0.1} t1={tHaag - 0.1} text="27.01.1990" label="Vuelve a su lugar" x={150} y={190} size={100} align="left" mono />
          <CaseFile t={t} t0={tHaag - 0.2} tReb={tReb} tCausa={tCausa} />
          <FilmLook t={t} k={0.6} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
/** el camino de tierra de noche: balizas, la grúa, el camión con el meteorito */
const NightRoad: React.FC<{t: number; t0: number; tCam: number}> = ({t, t0, tCam}) => {
  const z = 1 + prog(t, tCam - 0.2, 1.2, easeInOut) * 0.6;
  const ph = Math.floor(t * 6) % 2;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #02040A 0%, #0A1022 55%, #120F0C 56%, #070605 100%)'}}>
      <NightSky t={t} o={0.6} milky={0.3} horizon={0} />
      <AbsoluteFill style={{background: ph ? 'radial-gradient(ellipse 50% 40% at 25% 62%, rgba(255,46,46,0.28) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(ellipse 50% 40% at 25% 62%, rgba(61,123,255,0.3) 0%, rgba(0,0,0,0) 70%)', opacity: prog(t, t0, 0.4)}} />
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={`translate(${960 - 960 * z + (z - 1) * -500},${540 - 540 * z + (z - 1) * -120}) scale(${z})`}>
          <path d="M0 640 L1920 600 L1920 1080 L0 1080 Z" fill="#100C09" />
          <path d="M300 700 C700 660 1300 650 1920 640" stroke="rgba(120,96,70,0.25)" strokeWidth={60} fill="none" />
          <g opacity={prog(t, t0 + 0.6, 0.5)}><CraneTruck x={1180} y={690} s={0.9} arm={0.25} lights={1} /></g>
          <g opacity={prog(t, t0 + 1.2, 0.5)}>
            <Truck x={1580} y={700} s={0.85} cargo={<path d="M-210 -120 C-200 -190 -120 -215 -40 -200 C20 -190 40 -150 30 -120 Z" fill="#4A4038" stroke="#8A6A4A" strokeWidth={2} />} />
          </g>
          <g opacity={prog(t, t0 + 1.8, 0.5)}><rect x={1820} y={640} width={150} height={52} rx={10} fill="#16181F" /></g>
          <g opacity={prog(t, t0 - 0.2, 0.4)}><PoliceCar x={520} y={712} s={1} t={t} /></g>
        </g>
      </svg>
      <Vignette k={0.6} />
    </AbsoluteFill>
  );
};
/** los tres detenidos: rótulos sin foto (solo Haag con nombre) */
const Detenidos: React.FC<{t: number; t0: number; c: (p: string, n?: number) => number}> = ({t, t0, c}) => {
  const items: [string, string, number][] = [
    ['Robert Haag', 'Coleccionista de meteoritos · Arizona', c('un coleccionista')],
    ['Un periodista', 'Estadounidense', c('un periodista')],
    ['Un hombre', 'De Buenos Aires', c('un hombre de Buenos Aires')],
  ];
  return (
    <AbsoluteFill style={{background: `rgba(3,4,8,${0.72 * prog(t, t0 - 0.3, 0.4)})`}}>
      <Kicker14 t={t} t0={t0} text="Los detenidos" x={130} y={180} color={K.red} />
      {items.map(([n, r, at], i) => {
        const p = prog(t, at - 0.1, 0.6);
        return (
          <div key={i} style={{position: 'absolute', left: 130 + i * 580, top: 330, width: 520, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
            <svg width={200} height={240}>
              <circle cx={100} cy={80} r={56} fill="#1D2130" />
              <path d="M10 240 C10 150 60 130 100 130 C140 130 190 150 190 240 Z" fill="#1D2130" />
            </svg>
            <div style={{...fr(52, 420, K.bone, 72, 50), fontStyle: i === 0 ? 'italic' : 'normal', marginTop: 12}}>{n}</div>
            <div style={{...ar(20, 600, K.mute, 85, 0.16), textTransform: 'uppercase', marginTop: 8}}>{r}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
/** expediente: procesado (1990), rebeldía (1992) y la causa que queda en nada; sin condena */
const CaseFile: React.FC<{t: number; t0: number; tReb: number; tCausa: number}> = ({t, t0, tReb, tCausa}) => {
  const o = fadeIO(t, t0, Infinity, 0.4);
  if (o <= 0) return null;
  const fade = prog(t, tCausa + 0.6, 1.0);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{background: 'rgba(3,4,8,0.6)'}} />
      <div style={{position: 'absolute', left: 1010, top: 520, width: 760, height: 640, transform: `translate(-50%,-50%) rotate(-2deg) scale(${0.95 + 0.05 * pop(t, t0, 1)})`, background: '#EDE6D6', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', padding: '46px 54px', opacity: 1 - fade * 0.45}}>
        <div style={{...jm(20, '#3A3226', 600, 0.14)}}>JUZGADO FEDERAL · RESISTENCIA</div>
        <div style={{...jm(30, '#1E1A14', 700, 0.04), marginTop: 18}}>EXPEDIENTE · METEORITO «EL CHACO»</div>
        <div style={{marginTop: 26}}><InkLines n={6} w={640} seed={33} color="rgba(30,26,20,0.35)" /></div>
        <div style={{...jm(22, '#1E1A14', 500, 0.04), marginTop: 18, lineHeight: 1.6}}>
          13.02.1990 · procesamiento<br />01.06.1992 · rebeldía de R. Haag
        </div>
      </div>
      <Stamp14 t={t} t0={t0 + 0.3} text="PROCESADO" x={900} y={470} size={58} rot={-8} />
      <Stamp14 t={t} t0={tReb + 0.6} text="EN REBELDÍA" x={1160} y={620} size={54} rot={6} />
      <Title14 t={t} t0={tCausa} text="La causa quedó en nada." size={84} x={960} y={930} italic w0={260} w1={520} />
      <div style={{position: 'absolute', left: 960, top: 1010, transform: 'translate(-50%,-50%)', ...ar(20, 650, K.mute, 85, 0.22), opacity: prog(t, tCausa + 0.8, 0.5)}}>NUNCA HUBO CONDENA</div>
    </AbsoluteFill>
  );
};

/* ================================================================== S07 · LA LEY, LA MUESTRA, LA VENTA Y GANCEDO */
export const S07: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s07', p, n);
  const tPero = c('Pero las ganas'), tDos = c('En dos mil doce'), tLeg = c('La Legislatura'), tMoq = c('Las comunidades'), tCanc = c('el viaje se canceló');
  const tHoy = c('Hoy cualquiera'), tAstr = c('un astrónomo'), tBajo = c('Y bajo la tierra'), tSep = c('En septiembre'), tTreinta = c('treinta toneladas');
  const tLlam = c('Lo llamaron'), tPes = c('Pesado en la misma');
  return (
    <AbsoluteFill style={{background: K.void}}>
      {/* la ley de 1990 */}
      {t < tPero + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tPero + 0.1, 0.3)}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 45%, #141A28 0%, #04060C 100%)'}} />
          <div style={{position: 'absolute', left: 960, top: 520, width: 900, transform: `translate(-50%,-50%) rotate(1deg) scale(${0.95 + 0.05 * pop(t, 0, 1)})`, background: '#F1EEE8', padding: '50px 60px', boxShadow: '0 30px 80px rgba(0,0,0,0.6)'}}>
            <div style={{...ar(20, 700, '#3A3A3A', 90, 0.24)}}>PROVINCIA DEL CHACO · 1990</div>
            <div style={{...fr(56, 520, '#111', 72, 0), marginTop: 18, lineHeight: 1.05}}>Prohibido sacar meteoritos de la provincia</div>
            <div style={{marginTop: 26}}><InkLines n={4} w={760} seed={41} color="rgba(20,20,20,0.3)" /></div>
          </div>
          <Stamp14 t={t} t0={c('por ley') + 0.1} text="LEY" x={1300} y={340} size={70} rot={-10} />
          <YearRibbon t={t} t0={0} t1={tPero + 0.3} year={1990} />
        </AbsoluteFill>
      ) : null}
      {/* 2012: el viaje a Alemania que no fue */}
      {t > tPero - 0.2 && t < tHoy + 0.3 ? (
        <AbsoluteFill style={{opacity: prog(t, tPero - 0.2, 0.4) * (1 - prog(t, tHoy, 0.35))}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 50%, #0D1424 0%, #03050A 100%)'}} />
          <WorldArc t={t} center={[-22, 8]} scale={480} from={PT['Campo del Cielo']} to={[9.49, 51.31]} p={prog(t, c('pidió llevarse') - 0.2, 1.6, easeInOut)} cut={prog(t, tCanc - 0.1, 0.4)} labels={['Campo del Cielo', 'Kassel, Alemania']} />
          <YearRoll t={t} t0={tDos - 0.1} t1={tMoq - 0.2} text="2012" x={130} y={170} size={120} align="left" mono />
          <Kicker14 t={t} t0={c('una de las muestras')} t1={tMoq - 0.2} text="documenta (13): muestra de arte" x={136} y={270} />
          <Stat14 t={t} t0={c('cien días') - 0.2} t1={tMoq - 0.2} x={136} y={760} value={100} label="El préstamo" suffix="días" size={120} />
          <Stamp14 t={t} t0={tLeg + 0.5} text="APROBADO" sub="LEGISLATURA DEL CHACO" x={1450} y={820} size={56} rot={-6} dark color={K.sky} />
          {t > tMoq - 0.3 ? (
            <AbsoluteFill style={{opacity: prog(t, tMoq - 0.3, 0.4)}}>
              <AbsoluteFill style={{background: 'rgba(3,4,10,0.55)'}} />
              <NightSky t={t} o={0.55} milky={1} horizon={0} />
              <Title14 t={t} t0={tMoq} text="Comunidades moqoit" size={120} y={430} italic w0={260} w1={520} />
              <div style={{position: 'absolute', left: 960, top: 560, transform: 'translate(-50%,-50%)', ...fr(38, 360, K.mute, 72, 50), fontStyle: 'italic', textAlign: 'center', opacity: prog(t, c('cosmovisión') - 0.4, 0.6)}}>para quienes ese lugar es parte central de su cosmovisión</div>
              <Stamp14 t={t} t0={tCanc + 0.1} text="SE OPUSIERON · VIAJE CANCELADO" x={960} y={760} size={50} rot={-3} dark color={K.ember} />
              <Source14 t={t} t0={tMoq + 0.4} text="Infobae (29/1/2012); blog del proyecto (31/1/2012)" />
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {/* la venta por internet */}
      {t > tHoy - 0.3 && t < tBajo + 0.3 ? (
        <AbsoluteFill style={{opacity: prog(t, tHoy - 0.3, 0.4) * (1 - prog(t, tBajo, 0.35))}}>
          <AbsoluteFill style={{background: '#0B0E16'}} />
          <Listings t={t} t0={tHoy + 0.3} />
          <AbsoluteFill style={{background: 'rgba(5,7,12,0.6)', opacity: prog(t, tAstr - 0.2, 0.5)}} />
          <Stat14 t={t} t0={tAstr + 0.8} x={960} y={420} value={10} label="Vendidas ilegalmente: al menos" suffix="toneladas" size={190} align="center" w={1400} color={K.red} />
          <Source14 t={t} t0={tAstr + 0.3} text="Mario Vesconi, Asoc. Chaqueña de Astronomía · Ministerio de Cultura (5/7/2022)" />
        </AbsoluteFill>
      ) : null}
      {/* Gancedo: el barro, el agua y el gigante */}
      {t > tBajo - 0.3 && t < tPes - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(t, tBajo - 0.3, 0.4) * (1 - prog(t, tPes - 0.5, 0.35))}}>
          <BuriedSection
            t={t} dy={mix(220, 120, prog(t, tSep, 3))}
            pit={{x: 960, w: 760, o: prog(t, c('cavando en el barro') - 0.3, 0.6), water: 0.2 + 0.25 * prog(t, c('con el agua') - 0.2, 1.6)}}
            masses={[{x: 960, y: mix(820, 690, prog(t, T_GIG - 0.6, 1.2, easeOut)), w: 420, h: 200, o: prog(t, T_GIG - 0.8, 0.6), glow: prog(t, T_GIG - 0.2, 0.4) * (1 - prog(t, T_GIG + 1.5, 2))}]}
          />
          <YearRoll t={t} t0={tSep - 0.1} t1={T_GIG} text="09.2016" x={150} y={150} size={110} align="left" mono />
          <AbsoluteFill style={{background: '#FFE3B8', opacity: clamp(1 - Math.abs(t - T_GIG) / 0.3) * 0.45}} />
          <Stat14 t={t} t0={tTreinta - 0.2} x={140} y={170} value={30800} label="Otro gigante" suffix="kg" size={160} dur={1.8} />
          <Title14 t={t} t0={tLlam} text="«Gancedo»" size={130} x={1780} y={210} align="right" italic w0={260} w1={540} />
        </AbsoluteFill>
      ) : null}
      {/* la misma balanza: Gancedo vs El Chaco */}
      {t > tPes - 0.5 ? (
        <AbsoluteFill style={{opacity: prog(t, tPes - 0.5, 0.4)}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 50%, #141824 0%, #04050A 100%)'}} />
          <Scales t={t} t0={tPes} />
          <Source14 t={t} t0={tPes + 0.4} text="Página/12 (13/9/2016); La Nación (18/7/2018)" />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
/** dos barras pesadas en la misma balanza; los 37 t de 1980 tachados */
const Scales: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const p = prog(t, t0 + 0.2, 1.4, easeInOut);
  const H = 520 / 31;
  const bar = (x: number, v: number, label: string, color: string, k: number) => (
    <g>
      <rect x={x - 110} y={880 - v * H * k} width={220} height={v * H * k} fill={color} rx={6} />
      <text x={x} y={930} textAnchor="middle" style={{...fr(46, 460, K.bone, 72, 0)} as React.CSSProperties}>{label}</text>
      <text x={x} y={860 - v * H * k} textAnchor="middle" opacity={k} style={{...jm(40, K.bone, 600, 0)} as React.CSSProperties}>{v.toLocaleString('es-AR', {maximumFractionDigits: 2})} t</text>
    </g>
  );
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={500} y1={880} x2={1420} y2={880} stroke="rgba(241,238,232,0.4)" strokeWidth={2} />
      {bar(760, 30.8, 'Gancedo', K.ember, p)}
      {bar(1160, 28.84, 'El Chaco', K.iron, p)}
      <g opacity={prog(t, t0 + 1.4, 0.5)}>
        <text x={1160} y={250} textAnchor="middle" style={{...jm(36, K.mute, 500, 0)} as React.CSSProperties}>37 t (1980)</text>
        <line x1={1060} y1={238} x2={1060 + 200 * prog(t, t0 + 1.7, 0.4)} y2={238} stroke={K.red} strokeWidth={5} />
      </g>
      <text x={960} y={150} textAnchor="middle" opacity={prog(t, t0, 0.5)} style={{...ar(26, 650, K.ember, 85, 0.3)} as React.CSSProperties}>PESADOS EN LA MISMA BALANZA</text>
    </svg>
  );
};

/* ================================================================== S08 · LA BÚSQUEDA */
const XIX_1 = smoothRoute([PT['Santiago del Estero'], [-63.4, -27.3], [-62.6, -27.2], [-62.0, -27.4], [-61.75, -27.62]], 0.12, 11);
const XIX_2 = smoothRoute([PT['Añatuya'], [-62.4, -28.1], [-62.0, -27.8], [-61.68, -27.7]], 0.1, 13);
export const S08: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s08', p, n);
  const tLa = c('La buscaron expediciones'), tCien = c('La buscaron científicos'), tAfi = c('La buscan aficionados'), tNo = c('Y no aparece');
  const tDur = c('Durante un tiempo'), tUna = c('una frontera trazada'), tPor = c('¿Por qué es tan'), tRef = c('Porque las referencias'), tRio = c('Porque el río');
  const tLong = c('Y porque en mil'), tPuede = c('Puede estar enterrada');
  const v: View = viewPath(t, [
    [0, {lon: -62.6, lat: -27.6, scale: 9500}],
    [tCien - 0.4, {lon: -61.66, lat: -27.56, scale: 52000}],
    [tDur - 0.2, {lon: -62.0, lat: -26.9, scale: 9000}],
    [tRio - 0.4, {lon: -62.8, lat: -27.9, scale: 9500}],
  ], 1.8);
  const mapOn = t > 1.6 && t < tPuede + 0.3;
  const grid = (() => {
    // líneas de vuelo del relevamiento magnético sobre el campo de cráteres
    const out: [number, number][][] = [];
    for (let i = 0; i < 14; i++) {
      const y = -27.63 + i * 0.012;
      out.push([[-61.8, y], [-61.48, y + 0.06]]);
    }
    return out;
  })();
  return (
    <AbsoluteFill style={{background: K.void}}>
      {t < 2.6 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, 2.0, 0.6)}}>
          <SlabShot t={t} cam={{pos: [6.4, 2.6, 8.4], look: [0, 0.2, 0], fov: 38}} mood="night" slabO={0} outline={1} grass={0.7} dim={0.15} />
          <Title14 t={t} t0={0.05} text="Pero de la mesa, nada." size={110} y={860} italic w0={260} w1={520} />
        </AbsoluteFill>
      ) : null}
      {mapOn ? (
        <AbsoluteFill style={{opacity: prog(t, 1.6, 0.6) * (1 - prog(t, tPuede, 0.4))}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 90% at 50% 50%, #0E1526 0%, #03050A 100%)'}} />
          <Map14
            t={t} view={v} style="modern" gridO={0.6} provO={0.8} riverO={t > tRio - 0.5 ? 1 : 0.5}
            border={{o: prog(t, tDur + 0.8, 0.4), p: prog(t, tDur + 1.4, 2.4, easeInOut), color: K.ember}}
            areas={[{ring: craterField(), o: 0.6 * prog(t, tLa, 0.6), stroke: 'rgba(255,154,60,0.7)', dash: '6 8'}]}
            routes={[
              {pts: XIX_1, p: prog(t, tLa + 0.3, 2.2, easeInOut), color: '#C9A06A', dash: '12 8', label: 'siglo XIX', labelAt: 0.35, head: false},
              {pts: XIX_2, p: prog(t, tLa + 0.8, 2.2, easeInOut), color: '#C9A06A', dash: '12 8', head: false},
              ...grid.map((g, i) => ({pts: g as [number, number][], p: prog(t, tCien + 0.4 + i * 0.07, 0.6), color: 'rgba(95,227,255,0.8)', dash: '2 0', width: 2, head: false})),
              ...[0, 1, 2, 3].map((i) => ({pts: searchTrack([-61.72 + i * 0.07, -27.6 + (i % 2) * 0.05], 0.035, 0.02, 6, i * 7 + 1), p: prog(t, tAfi + 0.2 + i * 0.25, 1.2), color: '#FFFFFF', dash: '3 3', width: 2, head: false})),
            ]}
            marks={[
              {at: [-61.7, -27.58], o: prog(t, tNo, 0.4) * (1 - prog(t, tDur - 0.3, 0.4)), kind: 'q', size: 1.6, pulse: 1},
              {at: [-61.71, -26.4], label: '¿Mesón de Fierro?', o: prog(t, tDur + 0.6, 0.5) * (1 - prog(t, tPor - 0.3, 0.3)), kind: 'q', size: 1.1, dx: 30, dy: -4},
            ]}
            regionLabels={[{at: [-62.6, -26.2], text: 'SANTIAGO DEL ESTERO', o: prog(t, tDur + 0.4, 0.6) * (1 - prog(t, tPor, 0.4)), size: 22}, {at: [-60.9, -26.2], text: 'CHACO', o: prog(t, tDur + 0.4, 0.6) * (1 - prog(t, tPor, 0.4)), size: 22}]}
          >
            {(proj) => (
              <g>
                {/* referencias del monte que desaparecen */}
                {t > tRef - 0.3 && t < tRio + 0.5
                  ? XIX_1.filter((_, i) => i % 7 === 3).map((q, i) => {
                      const p = proj(q) as [number, number];
                      const o = prog(t, tRef - 0.2 + i * 0.05, 0.3) * (1 - prog(t, tRef + 0.9 + i * 0.12, 0.6));
                      return o > 0 ? (
                        <g key={'tr' + i} transform={`translate(${p[0] + (i % 2 ? 24 : -24)},${p[1] - 20})`} opacity={o}>
                          <line x1={0} y1={14} x2={0} y2={0} stroke="#A9C49A" strokeWidth={2} />
                          <circle cx={0} cy={-6} r={11} fill="rgba(140,180,120,0.35)" stroke="#A9C49A" strokeWidth={1.6} />
                        </g>
                      ) : null;
                    })
                  : null}
                {/* cauce viejo del Salado (esquema): copia corrida que se desvanece */}
                {t > tRio - 0.3 ? (
                  <path
                    d={(geo as any).rios.Salado[0].map((q: [number, number], i: number) => {
                      const p = proj([q[0] - 0.25 * Math.sin(q[1] * 3) * prog(t, c('cambió de cauce') - 0.4, 1.2), q[1]]) as [number, number];
                      return `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
                    }).join(' ')}
                    fill="none" stroke="rgba(140,195,255,0.55)" strokeWidth={3} strokeDasharray="10 8" opacity={prog(t, tRio, 0.5)}
                  />
                ) : null}
                {/* banda de incertidumbre de la longitud */}
                {t > tLong - 0.3 ? (() => {
                  const a = proj([-62.4, -27.6]) as [number, number], b = proj([-60.9, -27.6]) as [number, number];
                  const k = prog(t, tLong, 0.8);
                  const sweep = Math.sin((t - tLong) * 1.6) * (b[0] - a[0]) * 0.18;
                  return (
                    <g opacity={k}>
                      <rect x={a[0] + sweep} y={0} width={b[0] - a[0]} height={1080} fill="rgba(255,154,60,0.12)" />
                      <line x1={a[0] + sweep} y1={0} x2={a[0] + sweep} y2={1080} stroke={K.ember} strokeWidth={2} strokeDasharray="8 8" />
                      <line x1={b[0] + sweep} y1={0} x2={b[0] + sweep} y2={1080} stroke={K.ember} strokeWidth={2} strokeDasharray="8 8" />
                    </g>
                  );
                })() : null}
              </g>
            )}
          </Map14>
          <Kicker14 t={t} t0={tLa} t1={tCien} text="Expediciones del siglo XIX" x={130} y={150} color="#C9A06A" />
          <Kicker14 t={t} t0={tCien} t1={tAfi} text="1960: magnetómetros" x={130} y={150} color={K.cyan} />
          <Kicker14 t={t} t0={tAfi} t1={tNo + 0.6} text="Hoy: detectores de metales" x={130} y={150} color={K.bone} />
          <Title14 t={t} t0={tNo} t1={tDur - 0.2} text="Y no aparece." size={110} y={900} italic w0={260} w1={520} />
          <Quote14 t={t} t0={tUna} t1={tPor - 0.3} text="una frontera trazada a partir de un punto que nadie sabía dónde estaba" x={960} y={900} w={1500} size={54} />
          <Source14 t={t} t0={tDur + 0.4} t1={tPor} text="Minniti Morgan, «El Mesón de Fierro. Apuntes para su historia»" />
          <Title14 t={t} t0={tPor} t1={tRef + 0.2} text="¿Por qué es tan difícil?" size={110} y={540} italic w0={260} w1={540} />
          <Reason t={t} t0={tRef} t1={tRio} n="1" text="Las referencias del monte desaparecieron" />
          <Reason t={t} t0={tRio} t1={tLong} n="2" text="El río Salado cambió de cauce" />
          <Reason t={t} t0={tLong} t1={tPuede} n="3" text="En 1783, medir la longitud era casi adivinar" />
        </AbsoluteFill>
      ) : null}
      {t > tPuede - 0.4 ? (
        <AbsoluteFill style={{opacity: prog(t, tPuede - 0.4, 0.5)}}>
          <BuriedSection t={t} dy={mix(0, 420, prog(t, tPuede, 3.5, easeInOut))} strata={0.8} years={prog(t, tPuede + 1.2, 2.2)}
            masses={[{x: 960, y: 1060, w: 360, h: 120, o: prog(t, tPuede + 0.6, 0.8), glow: 0.5 + 0.3 * Math.sin(t * 2.4), label: '¿el Mesón?'}]} />
          <div style={{position: 'absolute', left: 1500, top: 540, transform: 'translate(-50%,-50%)', textAlign: 'center', opacity: prog(t, c('dos siglos') - 0.2, 0.6)}}>
            <div style={{...fr(130, 380, K.bone, 144, 0), lineHeight: 1}}>243</div>
            <div style={{...ar(22, 650, K.ember, 85, 0.24), marginTop: 10}}>AÑOS DE TIERRA Y MONTE</div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
/** razón numerada abajo a la izquierda */
const Reason: React.FC<{t: number; t0: number; t1: number; n: string; text: string}> = ({t, t0, t1, n, text}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  if (o <= 0) return null;
  const p = prog(t, t0, 0.6);
  return (
    <div style={{position: 'absolute', left: 130, top: 860, display: 'flex', alignItems: 'baseline', gap: 26, opacity: o, transform: `translateY(${(1 - p) * 24}px)`}}>
      <span style={{...fr(110, 300, K.ember, 144, 0), lineHeight: 1}}>{n}</span>
      <span style={{...fr(54, 420, K.bone, 72, 50), fontStyle: 'italic', textShadow: '0 4px 20px rgba(0,0,0,0.8)'}}>{text}</span>
    </div>
  );
};

/* ================================================================== S09 · EL CIERRE */
export const S09: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s09', p, n);
  const tAh = c('Ahora, una pregunta'), tSi = c('Si mañana'), tTe = c('Te leo');
  return (
    <AbsoluteFill style={{background: K.void}}>
      <BuriedSection t={t} dy={mix(420, -300, prog(t, -0.5, 6.5, easeInOut))} strata={0.8} years={1}
        masses={[{x: 960, y: 1060, w: 360, h: 120, o: 1, glow: 0.6 + 0.3 * Math.sin(t * 2.4)}]} o={1 - prog(t, tAh - 0.5, 0.8)} />
      <Stat14 t={t} t0={c('más viejo') - 0.2} t1={tAh - 0.4} x={130} y={160} value={4500} label="Un hierro más viejo que cualquier roca de la Tierra" suffix="millones de años" size={120} dur={1.6} />
      {t > tAh - 0.8 ? (
        <AbsoluteFill style={{opacity: prog(t, tAh - 0.8, 0.8)}}>
          <NightSky t={t} milky={1.4} horizon={0.7} hColor="#22305A" dy={-(t - tAh) * 6} />
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            <path d={Array.from({length: 97}, (_, i) => `${i ? 'L' : 'M'}${i * 20} ${960 - Math.abs(Math.sin(i * 0.37) * Math.sin(i * 0.13)) * 90 - rnd(i) * 30}`).join(' ') + ' L1920 1080 L0 1080 Z'} fill="#03040A" style={{filter: 'url(#quill14)'}} />
          </svg>
          <Poll14 t={t} t0={tSi - 0.2} t1={TL.durations.s09 + 0.3} q="Si mañana alguien encuentra el Mesón de Fierro, ¿de quién es?" y={500}
            opts={[["Del que lo encuentra", c('¿Del que lo') - 0.1], ['Del Estado', c('del Estado') - 0.1], ['De los pueblos que cuidan ese cielo', c('o de los pueblos') - 0.1]]} />
          <Kicker14 t={t} t0={tTe} t1={TL.durations.s09 + 0.3} text="Te leo en los comentarios" x={960} y={960} align="center" />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ================================================================== PLACA FINAL */
/** placa final con el mismo esquema del canal: logo, suscripción y fuentes a la izquierda; a la derecha, los dos
    espacios para la pantalla final de YouTube */
export const EndCard14: React.FC<{t: number; total: number}> = ({t, total}) => {
  const fadeOut = prog(t, total - 0.6, 0.6);
  return (
    <AbsoluteFill style={{background: K.void}}>
      <NightSky t={t + 100} milky={1.2} horizon={0.5} dy={-t * 4} />
      <div style={{position: 'absolute', left: 230, top: 160, transform: `rotate(${Math.sin(t * 0.6) * 1.2}deg)`}}>
        <LogoMark size={300} t={t} t0={0.1} />
      </div>
      <div style={{position: 'absolute', left: 120, width: 560, top: 510, textAlign: 'center', ...fr(84, 560, '#fff', 144, 0, 0.04), opacity: prog(t, 0.5, 0.5)}}>CONTEXTO</div>
      <div style={{position: 'absolute', left: 210, top: 640, opacity: prog(t, 0.8, 0.3), transform: `scale(${pop(t, 0.8) * (1 + 0.025 * Math.sin(t * 4))})`}}>
        <div style={{width: 380, height: 84, background: K.fire, borderRadius: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', ...ar(34, 800, '#fff', 90, 0.1), boxShadow: '0 10px 30px rgba(255,106,26,0.45)'}}>SUSCRIBITE</div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 790, width: 780, opacity: prog(t, 1.2, 0.6), ...ar(15, 600, K.mute, 85, 0.08), lineHeight: 1.6}}>
        FUENTES: RUBÍN DE CELIS, PHILOSOPHICAL TRANSACTIONS 78 (1788) · MINNITI MORGAN, «EL MESÓN DE FIERRO. APUNTES PARA SU HISTORIA» · CASSIDY ET AL., SCIENCE 149 (1965) · FAIVOVICH Y GOLDBERG · MINISTERIO DE CULTURA (2022) · FM MANANTIAL · LA NACIÓN · PÁGINA/12 · INFOBAE · JAMES MONROE MUSEUM.
        <br />
        IMÁGENES: WIKIMEDIA COMMONS, NATIONAL GALLERY OF ART, THE METROPOLITAN MUSEUM OF ART. MAPAS: NATURAL EARTH. LOS DETENIDOS DE 1990 FUERON PROCESADOS; NUNCA HUBO CONDENA.
      </div>
      <div style={{position: 'absolute', left: 1010, top: 170, opacity: prog(t, 0.4, 0.5)}}>
        <div style={{...ar(24, 650, K.mute, 85, 0.3), marginBottom: 16}}>SEGUÍ MIRANDO</div>
        {[0, 1].map((i) => (
          <div key={i} style={{width: 760, height: 330, marginBottom: 40, borderRadius: 10, border: `3px solid rgba(255,255,255,${0.16 + 0.06 * Math.sin(t * 2 + i)})`, background: 'rgba(255,255,255,0.04)', transform: `translateX(${(1 - prog(t, 0.5 + i * 0.15, 0.6)) * 80}px)`}} />
        ))}
      </div>
      <AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};
